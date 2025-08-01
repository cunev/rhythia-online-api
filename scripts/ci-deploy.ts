import fs from "fs";
import * as git from "isomorphic-git";
import http from "isomorphic-git/http/node";
import path from "path";

// Set up the repository URL
const repoUrl = `https://${process.env.GIT_KEY}@github.com/cunev/rhythia-api.git`;

const sourceBranch = process.env.SOURCE_BRANCH!;
const targetBranch = process.env.TARGET_BRANCH!;

async function cloneBranch() {
  const dir = path.join("/tmp", "repo");

  try {
    // Ensure the directory is clean before cloning
    if (fs.existsSync(dir)) {
      fs.rmdirSync(dir, { recursive: true });
      console.log(`Deleted existing directory: ${dir}`);
    }

    // Clone the repository into a temporary directory
    await git.clone({
      fs,
      http,
      dir,
      url: repoUrl,
      ref: sourceBranch,
      singleBranch: true,
      depth: 1,
    });
    console.log(`Cloned ${sourceBranch} branch from remote repository.`);

    // Check out the source branch
    await git.checkout({ fs, dir, ref: sourceBranch });
    console.log(`Checked out to branch: ${sourceBranch}`);

    // Pull the latest changes from the source branch
    await git.pull({
      fs,
      http,
      dir,
      ref: sourceBranch,
      singleBranch: true,
      author: {
        name: process.env.GIT_USER,
        email: "you@example.com", // Replace with the actual email
      },
    });
    console.log(`Pulled latest changes from branch: ${sourceBranch}`);

    // Create and checkout the target branch from the source branch
    await git.branch({ fs, dir, ref: targetBranch });
    await git.checkout({ fs, dir, ref: targetBranch });
    console.log(`Created and checked out to branch: ${targetBranch}`);

    // Push the new branch to the remote repository
    await git.push({
      fs,
      http,
      dir,
      remote: "origin",
      ref: targetBranch,
      force: true,
      onAuth: () => ({
        username: process.env.GIT_KEY, // GitHub token or password
        password: "",
      }),
    });
    console.log(`Pushed new branch to remote: ${targetBranch}`);
  } catch (error) {
    console.error("Error performing Git operations:", error.message);
  }
}

cloneBranch();

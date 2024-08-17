import simpleGit from "simple-git";
export async function POST(request: Request) {
  const payload: any = await request.json();

  if (payload.ciSecret !== process.env.CI_SECRET) {
    return new Response(`Unauthorized`);
  }

  const git = simpleGit({
    baseDir: process.cwd(),
    binary: "git",
    maxConcurrentProcesses: 6,
    trimmed: false,
  });

  git.addConfig("user.name", process.env.GIT_USER!);
  git.addConfig("user.password", process.env.GIT_PASS!);

  const repoUrl = `https://${process.env.GIT_KEY}@github.com/cunev/rhythia-api.git`;

  const sourceBranch = "main";
  const targetBranch = "stage-testing";

  const branches = await git.branchLocal();

  if (branches.all.includes(targetBranch)) {
    console.log(`Branch ${targetBranch} already exists. Deleting it.`);
    // Delete the existing branch
    await git.branch(["-D", targetBranch]);
  }

  // Check out the source branch
  await git.checkout(sourceBranch);
  console.log(`Checked out to branch: ${sourceBranch}`);

  // Pull the latest changes from the source branch
  await git.pull(repoUrl, sourceBranch);
  console.log(`Pulled latest changes from branch: ${sourceBranch}`);

  await git.checkoutBranch(targetBranch, sourceBranch);
  console.log(`Created and checked out to branch: ${targetBranch}`);

  // Push the new branch to the remote repository
  await git.push(repoUrl, targetBranch);
  console.log(`Pushed new branch to remote: ${targetBranch}`);
  return new Response(`Pushed`);
}

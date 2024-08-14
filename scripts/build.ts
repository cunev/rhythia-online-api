import { zipFunctions } from "@netlify/zip-it-and-ship-it";
import { buildSync } from "esbuild";
import { readdirSync, rmSync } from "fs";
import path from "path";

const apis = readdirSync("./api");

// Build
for (const api of apis) {
  const filePath = path.join("./api", api);
  try {
    buildSync({
      entryPoints: [filePath],
      outfile: `./dist/${path.parse(filePath).name}/index.js`,
      platform: "node",
      format: "cjs",
      bundle: true,
    });
  } catch (error) {
    console.log(`SKIPPABLE ERROR: Can't build api ${filePath}`);
  }
}

// Zip
zipFunctions("dist", "dist", {
  archiveFormat: "zip",
}).then((e) => {
  const outs = readdirSync("./dist");
  for (const outfile of outs) {
    const filepath = path.join("./dist", outfile);
    if (!filepath.endsWith(".zip")) {
      rmSync(filepath, { recursive: true });
    }
  }
});

import { buildSync } from "esbuild";
import { readdirSync } from "fs";
import path from "path";

const apis = readdirSync("./api");

for (const api of apis) {
  const filePath = path.join("./api", api);
  buildSync({
    entryPoints: [filePath],
    outdir: "./dist",
    platform: "node",
    format: "cjs",
    bundle: true,
  });
}

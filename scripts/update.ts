import { $ } from "bun";
import { readFileSync, writeFileSync } from "fs";
const packageJson = JSON.parse(readFileSync("./package.json", "utf-8"));

const versions = packageJson.version.split(".");
versions[0] = Number(versions[0]) + 1;

packageJson.version = versions.join(".");

writeFileSync("./package.json", JSON.stringify(packageJson, null, 2));

const conf = readFileSync("./.cred", "utf-8");
await $`npm logout`.nothrow();
await $`npm set ${conf}`;
await $`npm publish`;

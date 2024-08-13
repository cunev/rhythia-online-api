import { $ } from "bun";
import { readdirSync, readFileSync, writeFileSync } from "fs";
import { lowerFirst, upperFirst } from "lodash";
import path from "path";
const packageJson = JSON.parse(readFileSync("./package.json", "utf-8"));

const versions = packageJson.version.split(".");
versions[0] = Number(versions[0]) + 1;

packageJson.version = versions.join(".");

writeFileSync("./package.json", JSON.stringify(packageJson, null, 2));

const apis = readdirSync("./api");

const exports: string[] = [];
exports.push(`import { handleApi } from "./handleApi"`);

for (const api of apis) {
  if (
    !readFileSync(path.join("./api", api), "utf-8").includes(
      "export const Schema"
    )
  ) {
    continue;
  }
  exports.push(`\n// ./api/${api} API`);

  const apiName = path.parse(api).name;
  exports.push(
    `import { Schema as ${upperFirst(apiName)} } from "./api/${apiName}"`
  );
  exports.push(
    `export { Schema as Schema${upperFirst(apiName)} } from "./api/${apiName}"`
  );

  exports.push(
    `export const ${lowerFirst(
      apiName
    )} = handleApi({url:"/api/${apiName}",...${upperFirst(apiName)}})`
  );
}
exports.push(`export { handleApi } from "./handleApi"`);

writeFileSync("./index.ts", exports.join("\n"));

const conf = readFileSync("./.cred", "utf-8");
await $`npm logout`.nothrow();
await $`npm config set ${conf.split("$").join("")} && yarn publish`;

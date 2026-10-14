/**
 * ─ Copy the reuse check ─
 *
 * Copies the reuse check into a project's `tools/`, each file stamped,
 * and writes a starting `tools/reuse.config.ts` when the project has
 * none; a config is the project's own and is never overwritten. With
 * `--check`, it copies nothing and fails when a copy is missing or
 * older than the plugin's.
 *
 * Usage: bun copy-reuse.ts <project> [--check]
 */

import { existsSync, mkdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { COPIED, isCurrent, stamped } from "./copies.js";

const STARTING_CONFIG = `import type { ReuseConfig } from "./reuse.js";

/** What the reuse check reads: the source it scans, the shared pieces, and the import rules. */
export default {
  sources: ["src"],
  // Empty until the first piece is shared; each row arrives with the piece it guards.
  table: [],
} satisfies ReuseConfig;
`;

const args = process.argv.slice(2);
const isCheck = args.includes("--check");
const project = args.find((arg) => !arg.startsWith("--"));
if (project === undefined) {
  console.error("copy-reuse: name the project. Usage: bun copy-reuse.ts <project> [--check]");
  process.exit(2);
}
const tools = join(resolve(project), "tools");

if (isCheck) {
  const stale: string[] = [];
  for (const name of COPIED) {
    const copy = join(tools, name);
    const source = await Bun.file(join(import.meta.dir, name)).text();
    if (!existsSync(copy) || !isCurrent(await Bun.file(copy).text(), source)) {
      stale.push(`tools/${name}`);
    }
  }
  if (stale.length > 0) {
    console.error(`copy-reuse: ${stale.join(", ")} differ from the plugin's; copy them again`);
    process.exit(1);
  }
  console.log(`copy-reuse: the ${COPIED.length} copies in ${tools} are current`);
} else {
  mkdirSync(tools, { recursive: true });
  for (const name of COPIED) {
    const source = await Bun.file(join(import.meta.dir, name)).text();
    await Bun.write(join(tools, name), stamped(source));
  }
  const config = join(tools, "reuse.config.ts");
  const wroteConfig = !existsSync(config);
  if (wroteConfig) {
    await Bun.write(config, STARTING_CONFIG);
  }
  console.log(
    `copy-reuse: copied ${COPIED.length} files into ${tools}` +
      (wroteConfig ? ", and a starting reuse.config.ts" : "; reuse.config.ts left as it was")
  );
}

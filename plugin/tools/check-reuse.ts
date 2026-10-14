/**
 * ─ The reuse check ─
 *
 * Refuses a second copy of what the project shares, and an import
 * across the project's rules. It reads `tools/reuse.config.ts`,
 * beside this file, reads the source the config names, and fails
 * with every problem it finds, a copy of itself edited by hand among
 * them. Run by `bun run check`.
 */

import { join } from "node:path";
import { COPIED, copyProblem } from "./copies.js";
import { configIn, textsUnder } from "./files.js";
import { importProblems } from "./imports.js";
import { countsTypes, DEFAULT_PATTERN, tableProblems } from "./reuse.js";

const ROOT = join(import.meta.dir, "..");

const config = await configIn(import.meta.dir);
const texts = await textsUnder(
  ROOT,
  config.sources,
  config.pattern ?? DEFAULT_PATTERN,
  config.files
);

// The tool checks itself first: a copy changed by hand is no longer the shared tool.
const copies: string[] = [];
for (const name of COPIED) {
  const problem = copyProblem(await Bun.file(join(import.meta.dir, name)).text());
  if (problem !== undefined) {
    copies.push(`tools/${name} ${problem}`);
  }
}

const problems = [
  ...copies,
  ...tableProblems(config.table, texts),
  ...importProblems(config.imports ?? [], texts, countsTypes(config)),
];
if (problems.length > 0) {
  console.error(
    "check-reuse: a copy of something shared, a row that no longer holds, or an import across a rule"
  );
  for (const problem of problems) {
    console.error(`  ${problem}`);
  }
  process.exit(1);
}
console.log(
  `check-reuse: ${texts.size} files hold no copy of the ${config.table.length} shared pieces, ` +
    `and no import crosses the ${(config.imports ?? []).length} import rules`
);

/**
 * ─ Build the catalogue ─
 *
 * Writes the project's catalogue of shared names, when its reuse
 * config has one: on in robust, off in light, either set apart. A
 * listed function or class with no doc comment fails the run, so the
 * sentence gets written. `--check` writes nothing and fails on a stale
 * catalogue; run by `bun run check`.
 */

import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { catalogueOf, DEFAULT_OUT } from "./catalogue.js";
import { configIn, textsUnder } from "./files.js";
import { catalogueSettings, DEFAULT_PATTERN } from "./reuse.js";

const ROOT = join(import.meta.dir, "..");
const COMMAND = "bun run catalogue";

const config = await configIn(import.meta.dir);
const settings = catalogueSettings(config);
if (settings === undefined) {
  console.log("build-catalogue: this project keeps no catalogue; the search is the catalogue");
  process.exit(0);
}

const texts = await textsUnder(ROOT, config.sources, config.pattern ?? DEFAULT_PATTERN);
for (const path of texts.keys()) {
  if (path.endsWith(".d.ts")) {
    texts.delete(path);
  }
}
const { text, missing } = catalogueOf(texts, config.sources, settings, COMMAND);
if (missing.length > 0) {
  console.error("build-catalogue: these shared names have no doc comment to list them by:");
  for (const name of missing) {
    console.error(`  ${name}`);
  }
  process.exit(1);
}

const out = settings.out ?? DEFAULT_OUT;
const file = Bun.file(join(ROOT, out));
if (process.argv.includes("--check")) {
  if (!(await file.exists()) || (await file.text()) !== text) {
    console.error(`build-catalogue: ${out} is stale; run \`${COMMAND}\``);
    process.exit(1);
  }
  console.log(`build-catalogue: ${out} is current`);
} else {
  mkdirSync(dirname(join(ROOT, out)), { recursive: true });
  await Bun.write(file, text);
  console.log(`build-catalogue: wrote ${out}`);
}

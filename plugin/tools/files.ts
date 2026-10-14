/**
 * ─ Files ─
 *
 * How the reuse tools read a project: its config, and every file under
 * a folder that a pattern matches, as forward-slash paths from the
 * project's root, in name order. One walker, so every tool sees the
 * same files in the same order on every system.
 */

import { existsSync } from "node:fs";
import { join } from "node:path";
import type { ReuseConfig } from "./reuse.js";

/**
 * Every file under `folder` that `pattern` matches, as paths from `root` with forward slashes, in
 * name order; none when the folder does not exist. Dot files are left out.
 */
export async function filesUnder(
  root: string,
  folder: string,
  pattern = "**/*"
): Promise<string[]> {
  const base = join(root, folder);
  if (!existsSync(base)) {
    return [];
  }
  const found = await Array.fromAsync(new Bun.Glob(pattern).scan({ cwd: base }));
  const prefix = folder.replaceAll("\\", "/").replace(/\/+$/, "");
  return found.map((path) => `${prefix}/${path.replaceAll("\\", "/")}`).sort();
}

/** The project's `reuse.config.ts`, from the folder `tools` that holds it beside the tools. */
export async function configIn(tools: string): Promise<ReuseConfig> {
  return ((await import(join(tools, "reuse.config.ts"))) as { default: ReuseConfig }).default;
}

/**
 * The text of every file under `folders` that `pattern` matches, and of each of `files`, by path
 * from `root`.
 */
export async function textsUnder(
  root: string,
  folders: readonly string[],
  pattern: string,
  files: readonly string[] = []
): Promise<Map<string, string>> {
  const texts = new Map<string, string>();
  for (const folder of folders) {
    for (const path of await filesUnder(root, folder, pattern)) {
      texts.set(path, await Bun.file(join(root, path)).text());
    }
  }
  for (const path of files) {
    texts.set(path, await Bun.file(join(root, path)).text());
  }
  return texts;
}

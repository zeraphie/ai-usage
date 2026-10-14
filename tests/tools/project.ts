// A throwaway project for the tool tests, with the reuse check copied in the way a project gets it.

import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const COPY = join(import.meta.dir, "..", "..", "plugin", "tools", "copy-reuse.ts");

/** What a command printed, and the code it ended with. */
export interface Ran {
  readonly code: number;
  readonly out: string;
}

/** Runs a Bun script with `args`, and returns what it printed and its exit code. */
export function runBun(script: string, ...args: string[]): Ran {
  const result = Bun.spawnSync([process.execPath, script, ...args]);
  return { code: result.exitCode, out: result.stdout.toString() + result.stderr.toString() };
}

/** Copies the reuse check into the project at `root`, as copy-reuse does for a real project. */
export function copyInto(root: string, ...args: string[]): Ran {
  return runBun(COPY, root, ...args);
}

/**
 * A new project in a temporary folder with `files` written into it, and the reuse check copied in
 * unless `copied` is false. A `tools/reuse.config.ts` among `files` replaces the starting one.
 */
export function makeProject(files: Record<string, string>, copied = true): string {
  const root = mkdtempSync(join(tmpdir(), "ai-usage-"));
  if (copied) {
    copyInto(root);
  }
  for (const [path, text] of Object.entries(files)) {
    mkdirSync(join(root, path, ".."), { recursive: true });
    writeFileSync(join(root, path), text);
  }
  return root;
}

/** Deletes a project made by `makeProject`. */
export function removeProject(root: string): void {
  rmSync(root, { recursive: true, force: true });
}

/**
 * ─ Copies ─
 *
 * The reuse check is copied into each project, so it runs the same in
 * a terminal and in CI. Each copy opens on a stamp: a line saying it
 * was copied, and a hash of what follows. A copy edited by hand no
 * longer matches its hash, and one older than the plugin's no longer
 * matches the plugin's file. Pure: it reads text, not disk.
 */

import { createHash } from "node:crypto";

/** The files a project's `tools/` gets, the plugin's names and the copy's. */
export const COPIED = [
  "files.ts",
  "reuse.ts",
  "imports.ts",
  "catalogue.ts",
  "copies.ts",
  "check-reuse.ts",
  "build-catalogue.ts",
];

const NOTICE = "// Copied from the ai-usage plugin; change it there and copy it again.";
const HASH = /^\/\/ sha256:([0-9a-f]{64})$/;

// Line endings are left out of the hash, so a checkout that turns LF into CRLF still matches.
function hashOf(body: string): string {
  return createHash("sha256").update(body.replaceAll("\r\n", "\n")).digest("hex");
}

/** `source` as a copy: the stamp, then the source as it is. */
export function stamped(source: string): string {
  return `${NOTICE}\n// sha256:${hashOf(source)}\n${source}`;
}

/**
 * What is wrong with a copy, or `undefined` when it is a true copy: no stamp, or a body that no
 * longer matches its hash.
 */
export function copyProblem(copy: string): string | undefined {
  const [notice, hash, ...rest] = copy.replaceAll("\r\n", "\n").split("\n");
  const found = HASH.exec(hash ?? "");
  if (notice !== NOTICE || found === null) {
    return "has no stamp; copy it again from the plugin";
  }
  return found[1] === hashOf(rest.join("\n"))
    ? undefined
    : "was changed by hand; change it in the plugin and copy it again";
}

/** Whether `copy` holds what the plugin's `source` holds now. */
export function isCurrent(copy: string, source: string): boolean {
  return copy.replaceAll("\r\n", "\n") === stamped(source).replaceAll("\r\n", "\n");
}

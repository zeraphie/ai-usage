import { expect, test } from "bun:test";
import { copyProblem, isCurrent, stamped } from "../../plugin/tools/copies.js";

const SOURCE = "export const a = 1;\n";

test("a stamped copy is a true copy", () => {
  expect(copyProblem(stamped(SOURCE))).toBeUndefined();
});

test("a copy with CRLF line endings is still a true copy", () => {
  expect(copyProblem(stamped(SOURCE).replaceAll("\n", "\r\n"))).toBeUndefined();
});

test("a copy changed by hand no longer matches its hash", () => {
  expect(copyProblem(`${stamped(SOURCE)}// mine\n`)).toContain("changed by hand");
});

test("a file with no stamp is not a copy", () => {
  expect(copyProblem(SOURCE)).toContain("no stamp");
});

test("a copy is current only while the plugin's file is unchanged", () => {
  expect(isCurrent(stamped(SOURCE), SOURCE)).toBe(true);
  expect(isCurrent(stamped(SOURCE), "export const a = 2;\n")).toBe(false);
});

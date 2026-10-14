import { expect, test } from "bun:test";
import {
  gitVerdict,
  hookAnswer,
  nameOf,
  playwrightVerdict,
  segmentsOf,
  wordsOf,
} from "../../plugin/hooks/guards.js";

const CAPPED = "C:/plugin/tools/capped.ts";

test("splits a line where a shell would, and reads a command's words", () => {
  expect(segmentsOf("a && b || c; d | e\nf")).toEqual(["a ", " b ", " c", " d ", " e", "f"]);
  expect(wordsOf(' CI=1 & "bunx" playwright test ')).toEqual(["bunx", "playwright", "test"]);
  expect(nameOf("C:\\bin\\Bunx.CMD")).toBe("bunx");
});

test("refuses Playwright run by name or through a runner, outside the capped runner", () => {
  for (const line of [
    "playwright test",
    "bunx playwright test -g story",
    "bun x playwright test",
    "npx @playwright/test",
    "cd app && pnpm exec playwright test",
  ]) {
    expect(playwrightVerdict(line, CAPPED).decision).toBe("deny");
  }
});

test("lets Playwright through the capped runner, and anything else, run", () => {
  expect(playwrightVerdict(`bun "${CAPPED}" bunx playwright test`, CAPPED).decision).toBe("allow");
  expect(playwrightVerdict("bun run test && bun x oxlint", CAPPED).decision).toBe("allow");
});

test("the refusal says how to run it capped", () => {
  const verdict = playwrightVerdict("bunx playwright test", CAPPED);
  expect(verdict.decision === "deny" && verdict.reason).toContain(`bun "${CAPPED}"`);
});

test("asks before a push, a new remote, or a new repo on GitHub", () => {
  for (const line of [
    "git push -u origin main",
    "git -C ../app push",
    "git add . && git commit -m 'feat: x' && git push",
    "git remote add origin git@github.com:zeraphie/x.git",
    "git remote set-url origin x",
    "gh repo create zeraphie/x --private",
  ]) {
    expect(gitVerdict(line).decision).toBe("ask");
  }
});

test("lets the rest of git run", () => {
  for (const line of [
    "git status",
    "git log --oneline",
    "git remote -v",
    "git commit -m 'feat: x'",
  ]) {
    expect(gitVerdict(line).decision).toBe("allow");
  }
});

test("refuses a commit with a trailer, however the message is written", () => {
  for (const line of [
    "git commit -m 'feat: x' -m 'Co-Authored-By: Claude <noreply@anthropic.com>'",
    "git commit -F - <<'EOF'\nfeat: x\n\nco-authored-by: someone\nEOF",
    "git commit --trailer 'Signed-off-by: Izzy'",
  ]) {
    expect(gitVerdict(line).decision).toBe("deny");
  }
});

test("a trailer outside a commit is not a commit", () => {
  expect(gitVerdict("echo 'Co-Authored-By: x' > notes.txt").decision).toBe("allow");
});

test("answers nothing for a command that may run, and a PreToolUse decision otherwise", () => {
  expect(hookAnswer({ decision: "allow" })).toBe("");
  expect(JSON.parse(hookAnswer({ decision: "ask", reason: "why" }))).toEqual({
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "ask",
      permissionDecisionReason: "why",
    },
  });
});

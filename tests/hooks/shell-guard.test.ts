import { expect, test } from "bun:test";
import { join } from "node:path";

const GUARD = join(import.meta.dir, "..", "..", "plugin", "hooks", "shell-guard.ts");

// Runs the guard on a tool call for `command`, with the plugin's settings in `env`.
function guard(command: string, env: Record<string, string> = {}): string {
  const result = Bun.spawnSync([process.execPath, GUARD], {
    stdin: new TextEncoder().encode(JSON.stringify({ tool_input: { command } })),
    env: { ...process.env, ...env },
  });
  return result.stdout.toString().trim();
}

const decisionOf = (answer: string): string =>
  (JSON.parse(answer) as { hookSpecificOutput: { permissionDecision: string } }).hookSpecificOutput
    .permissionDecision;

test("says nothing for a command that may run", () => {
  expect(guard("bun run check")).toBe("");
});

test("asks before a push", () => {
  expect(decisionOf(guard("git push"))).toBe("ask");
});

test("refuses an uncapped Playwright run, and names where the capped runner is", () => {
  const answer = guard("bunx playwright test");
  expect(decisionOf(answer)).toBe("deny");
  expect(answer).toContain("plugin/tools/capped.ts");
});

test("lets Playwright run when the cap is turned off", () => {
  expect(guard("bunx playwright test", { CLAUDE_PLUGIN_OPTION_CAP_PLAYWRIGHT: "false" })).toBe("");
});

test("lets a command through when it cannot read its input", () => {
  const result = Bun.spawnSync([process.execPath, GUARD], {
    stdin: new TextEncoder().encode("not json"),
  });
  expect(result.exitCode).toBe(0);
  expect(result.stdout.toString()).toBe("");
});

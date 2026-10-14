/**
 * ─ The shell guard ─
 *
 * A PreToolUse hook for the Bash and PowerShell tools. It reads the
 * tool call on stdin and answers only when a guard acts: the git guard
 * always, and the Playwright guard unless the plugin's `cap_playwright`
 * setting is off. A command that may run gets no answer, so the guard
 * costs nothing in context.
 */

import { join } from "node:path";
import { gitVerdict, hookAnswer, playwrightVerdict } from "./guards.js";

const CAPPED = join(import.meta.dir, "..", "tools", "capped.ts").replaceAll("\\", "/");
const isCapping = process.env["CLAUDE_PLUGIN_OPTION_CAP_PLAYWRIGHT"] !== "false";

const command = commandOf(await Bun.stdin.text());
const git = gitVerdict(command);
const verdict = git.decision === "allow" && isCapping ? playwrightVerdict(command, CAPPED) : git;
const answer = hookAnswer(verdict);
if (answer !== "") {
  console.log(answer);
}

// The command the tool would run. A guard that cannot read its input lets
// the command through: a broken guard must not stop all work.
function commandOf(text: string): string {
  try {
    const input = JSON.parse(text) as { tool_input?: { command?: unknown } };
    return typeof input.tool_input?.command === "string" ? input.tool_input.command : "";
  } catch {
    return "";
  }
}

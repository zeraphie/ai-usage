/**
 * ─ Guards ─
 *
 * What the shell guards refuse or ask about, read from a command line.
 * A line runs several commands, split where a shell would split them,
 * and each is read by its words: past any `NAME=value` settings and
 * PowerShell's `&`, with a program known by its bare name. Pure.
 */

/** What a guard says of a command: let it run, ask Izzy first, or refuse it, with why. */
export type Verdict =
  | { readonly decision: "allow" }
  | { readonly decision: "ask" | "deny"; readonly reason: string };

const ALLOW: Verdict = { decision: "allow" };

/** Each command a line runs on its own, split where a shell would split it. */
export function segmentsOf(line: string): string[] {
  return line.split(/&&|\|\||[;|\n]/);
}

/** The words of one command, without quotes, settings or PowerShell's `&`. */
export function wordsOf(segment: string): string[] {
  return segment
    .trim()
    .split(/\s+/)
    .map((word) => word.replace(/^["']|["']$/g, ""))
    .filter((word) => word !== "" && word !== "&" && !/^[A-Za-z_]\w*=/.test(word));
}

/** A program's bare name: no folder, no `.exe`, `.cmd` or `.ps1`, lower case. */
export function nameOf(word: string): string {
  const last = word.split(/[\\/]/).pop() ?? word;
  return last.replace(/\.(exe|cmd|ps1)$/i, "").toLowerCase();
}

// ── Playwright ──

// Programs that run another program named after them, and those that do
// it after a word: bun x, pnpm exec, yarn dlx.
const RUNNERS = new Set(["bunx", "npx", "pnpx", "node", "yarn"]);
const TWO_WORD_RUNNERS = new Set(["bun", "pnpm", "yarn"]);
const RUN_WORDS = new Set(["x", "exec", "dlx"]);

// Whether one command starts Playwright itself, by name or through a runner.
function startsPlaywright(segment: string): boolean {
  const words = wordsOf(segment);
  const [first, second] = words;
  if (first === undefined) {
    return false;
  }
  const program = nameOf(first);
  if (/^@?playwright$/.test(program)) {
    return true;
  }
  let rest: string[];
  if (TWO_WORD_RUNNERS.has(program) && RUN_WORDS.has(second ?? "")) {
    rest = words.slice(2);
  } else if (RUNNERS.has(program)) {
    rest = words.slice(1);
  } else {
    return false;
  }
  const target = rest.find((word) => !word.startsWith("-"));
  return target !== undefined && /playwright/i.test(target);
}

/**
 * Refuses a Playwright run that does not go through `capped`, the path of the plugin's
 * `capped.ts`, so a test run cannot take the whole machine.
 */
export function playwrightVerdict(line: string, capped: string): Verdict {
  const isUncapped = segmentsOf(line).some(
    (segment) => !/capped\.ts/.test(segment) && startsPlaywright(segment)
  );
  return isUncapped
    ? {
        decision: "deny",
        reason:
          "Playwright runs on this machine only through the capped runner, so a test run " +
          `cannot take the desktop: \`bun "${capped}" bunx playwright test ...\`. Ask Izzy ` +
          "before any run.",
      }
    : ALLOW;
}

// ── Git ──

// The words after `git` and its own options, such as `-C <path>` or `-c <key=value>`.
function gitWords(words: readonly string[]): string[] {
  const rest = words.slice(1);
  while (rest[0] !== undefined && rest[0].startsWith("-")) {
    const option = rest.shift();
    if (option === "-C" || option === "-c") {
      rest.shift();
    }
  }
  return rest;
}

const TRAILER = /\b(?:Co-Authored-By|Signed-off-by)\s*:|--trailer\b/i;

/**
 * Asks Izzy before anything leaves the machine (a push, a new remote, a new repo on GitHub), and
 * refuses a commit message with a trailer, which Izzy's commits never carry.
 */
export function gitVerdict(line: string): Verdict {
  let isCommit = false;
  for (const segment of segmentsOf(line)) {
    const words = wordsOf(segment);
    const program = nameOf(words[0] ?? "");
    if (program === "gh" && words[1] === "repo" && words[2] === "create") {
      return { decision: "ask", reason: "This makes a new repo on GitHub, which Izzy asks for." };
    }
    if (program !== "git") {
      continue;
    }
    const [command, sub] = gitWords(words);
    if (command === "push") {
      return { decision: "ask", reason: "A push leaves the machine; Izzy says when." };
    }
    if (command === "remote" && (sub === "add" || sub === "set-url")) {
      return { decision: "ask", reason: "A remote is Izzy's to add or change." };
    }
    isCommit ||= command === "commit";
  }
  // The message may run over several lines, so the whole line is read for it.
  if (isCommit && TRAILER.test(line)) {
    return {
      decision: "deny",
      reason:
        "Izzy's commits are a subject line only, with no Co-Authored-By or any other " +
        "trailer. Commit again without it.",
    };
  }
  return ALLOW;
}

/** A verdict as a PreToolUse hook's answer; nothing at all for a command that may run. */
export function hookAnswer(verdict: Verdict): string {
  if (verdict.decision === "allow") {
    return "";
  }
  return JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: verdict.decision,
      permissionDecisionReason: verdict.reason,
    },
  });
}

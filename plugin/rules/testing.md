---
paths:
  - "**/tests/**"
  - "**/*.{test,spec,e2e}.*"
---

# Testing

How a change proves itself, in every repo of Izzy's. A project's `.ai`
names its runner, where its tests live if not in `tests/`, and whether
it keeps stories.

## Logic tests, and a person for the rest

- **Logic tests** for pure logic, in the language it lives in. Test it
  hard: logic tests run in milliseconds and never lie.
- **Everything else is checked by a person**: in the browser, in the
  app, by ear. Nothing is pixel-tested, and no component gets a test of
  its own.
- A bug found by a person becomes a logic test where the logic is, or it
  stays a check for a person.
- Code bound to the DOM, a canvas or the GPU is never emulated, since a
  stand-in measures nothing real and its tests pass for nothing. Pull
  the logic into a pure module, test that, and let a person see it run.
- No mocks unless the test would hit a real external service. A function
  handed in, such as a fake clock or a refresh loop, is not a mock.

## How

- Tests live in a top-level `tests/` mirroring the source's folders, one
  file per module: `tests/camera/glide.test.ts` for
  `src/camera/glide.ts`. A project may put them beside the source
  instead, and says so in its `.ai`.
- A test's name says the scenario: `"keeps the world point under the
  cursor fixed while zooming"`.
- A test checks what the code holds or returns, an attribute, a state or
  an error's kind. It never checks wording a person reads, which
  changes while the outcome does not.
- Fixtures two test files share live in one shared fixtures file. A test
  file keeps a fixture of its own only while it is the one file that
  needs it.
- `bun run check` runs the tests in seconds. Keep it so.

## Stories, when a project keeps them

A project whose people do things with it end to end may keep stories,
and names `stories` in the `options` of its `.ai/base.json`. Then these
hold as well.

- **A story is one thing a person sets out to do**, and what they see
  along the way. Stories are the integration tests; a key press can be
  an outcome in a story, never a story.
- **The stories document** sits beside the design doc. `##` per
  feature, `###` per story, one outcome per line, nested lines for an
  outcome within an outcome. Headings are the ids; nothing is numbered.
  A story marked *(later)* is intended and not yet tested; the document
  never claims a test it does not have.
- **Every story starts from one known state**, the base, the same on a
  laptop and in CI. A story sets up nothing of its own: what it needs
  beyond the base it does in its first steps, as a person would. A
  story that would need two resets is two stories.
- **From story to test:** one spec per feature, one test per story
  titled with its heading, one step per outcome titled with the line
  word for word. Write the outcome line first, then the step. A
  regression is a new line in the story it belongs to.
- **A checker in `check` ties the document to the specs**: an outcome
  with no step, or a step with no outcome, fails.
- **Stories are the slow part.** On a person's own machine they run one
  at a time and held to a share of the machine, so it stays usable;
  the person at it decides when they run. While working, one story;
  before a commit, every story.
- **Frame and timing budgets are not stories.** They run on demand and
  report numbers a person reads.

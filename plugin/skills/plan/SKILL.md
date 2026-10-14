---
name: plan
description: Write the plan for a topic in Izzy's format - .plan/<topic>.plan.md, derived from the topic's ADR, with a checkbox per small step and a "Not doing" list. Use it when a topic's decisions are made and the work is ready to be planned, or when Izzy asks for a plan.
argument-hint: "[topic]"
---

# A plan

The plan comes after the decisions, never before: it derives from the
topic's ADR and adds no decision of its own. The format is in
`${CLAUDE_PLUGIN_ROOT}/rules/workflow.md`, under "The plan".

The topic is `$ARGUMENTS`, or the one the conversation is on.

## 1. Read what it rests on

Find the topic's files in `.plan/`: `<topic>.research.md`,
`<topic>.adr.md`, or the same names inside `.plan/<topic>/`. Read the
ADR whole, and the research where a step needs its facts.

- **No ADR yet**: the decisions come first. Say so, and offer to write
  them as an ADR from the conversation.
- **An open question the plan hangs on**: ask it, with its options,
  before writing. A question only a later step needs is named in that
  step instead, as asked before it.

## 2. Where it goes

`.plan/<topic>.plan.md`. When that makes the topic's files more than
its research, ADR and plan, the topic becomes a folder first: move its
files into `.plan/<topic>/` as `research.md`, `adr.md`, `plan.md` and
the rest, and fix the names they use for each other.

## 3. The steps

- **Small**: one step is one thing a person can check, in a sitting. A
  step that would need two explanations is two steps.
- **Each says what changes, and how it is checked or seen.** A step
  with nothing to see is folded into the step it serves.
- **In order of what rests on what**, and reuse first: the shared pieces
  before what uses them.
- **Grouped under `###` headings** when a plan runs past about ten steps.
- **Numbered**, each opening on a few words in bold.
- **Each names the decisions it carries**, as `(D3)`, so a step can be
  checked against its ADR. Shipped code never cites them.
- **A step that only moves code says so**, and moves only.

## 4. Not doing

List what is left out on purpose, each with why: what the ADR weighed
and did not choose, what was asked for later, what a step could easily
grow into. A plan with nothing left out is rare; look again.

## 5. The opening, and the hand-over

Open on `Decided with Izzy, <date>, from the ADR.` and two or three
sentences of what the plan builds and why. Then show Izzy the plan, and
wait: the first step starts when Izzy says.

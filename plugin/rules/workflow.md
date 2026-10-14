# Workflow

How work goes in every repo of Izzy's: the route a piece of work takes,
the files it leaves, and what happens after each step. A project's own
`.ai` adds what is its own; nothing here names a project.

## The route

Research, then decisions, then a plan, then one step at a time.

1. Substantial work starts as research and discussion. What was read
   and found goes in the topic's research file.
2. It lands in the topic's ADR as numbered decisions.
3. The plan derives from the ADR, a checkbox per step.
4. The steps are built one at a time, and Izzy says when the next one
   starts. Never auto-advance.

Small work, a question or one obvious edit, needs none of the files.

## When more is relevant

The rest of the base loads only when the work needs it. Style and
testing come with the files they are about. Two more are brought in by
what a change does:

- **Security.** A change that touches sign-in, tokens, secrets,
  cookies, personal data, payments, or anything a person or another
  system sends, is read against `{{rules}}/security.md` before it is
  reported, and the report suggests a security pass.
- **A stack.** A change that adds React, Lit, Tailwind or Astro to a
  repo adds its name to `stacks` in the project's `.ai/base.json`, in
  the same change, asked first like any other extra. The layer then
  loads from the next session on.

## Open decisions are Izzy's

An open decision is a question with options, one short line each. Never
pick for Izzy: never "I'd lean toward X" and ship. Facts that bear on
it go beside the options: which repos do it which way, what each costs.

## Scope

- Do exactly what the step says. Anything extra, a refactor, a nicer
  name, a new helper, more than the step needs, is a question, not
  something done on the way.
- If a step grows, stop and split it.
- A step that calls itself a move only moves code. Lines leave one file
  for another and imports follow. Nothing is renamed, reworded or tidied
  on the way.

## After each step

1. Tick the step's box, and write its Done note under it.
2. Run the formatter once, then the checks. Every check passes, or the
   report says which did not and why.
3. Explain what was done, how it works, and why this approach over the
   alternatives. Izzy owns the outcome and has to stand by every line,
   live, so the explanation is part of the deliverable, not a courtesy.
   A project may give a reason of its own beside this one.
4. End on the reuse reading.
5. Wait for Izzy.

## `.plan/`

Local-only and gitignored, in every repo. It holds the research, ADRs
and plans, and the reference images and files that go with them.

- **Named topic first**, so a topic's route reads in one place:
  `<topic>.research.md`, `<topic>.adr.md`, `<topic>.plan.md`.
- **A topic with more files than those three** becomes a folder:
  `<topic>/research.md`, `<topic>/adr.md`, `<topic>/plan.md`, and the
  rest beside them.
- **Nothing outside `.plan/` points into it.** Shipped code, comments
  and commits never name a plan, an ADR or a decision number: the files
  are local, so the pointer leads nowhere for anyone else.

## The ADR

```markdown
# ADR: <topic>

<What the decisions are for, and where they came from, in a sentence
or two.>

## Decisions

### D1. <The decision, in a few words>

- **Decided:** what was decided.
- **Why:** the reason.
- **Weighed:** what else was considered.
- **Cost:** what it costs, or "none to speak of".

## Open questions

### O1. <The question>

- a. <an option>
- b. <another>
```

Decisions are numbered so a plan or a review can name one. An open
question becomes a decision when Izzy answers it, with what was asked
kept under **Weighed**.

## The plan

```markdown
# Plan: <topic>

Decided with Izzy, <date>, from the ADR. <What, and why, in two or
three sentences.>

## Steps

- [ ] 1. **<A few words>.** <One small step: what changes, and how it
  is checked or seen.>
- [ ] 2. ...

## Not doing

- <What is left out on purpose, and why, so it does not creep back in.>
```

When a step is done, its box is ticked and a Done note goes under it:

```markdown
- [x] 1. **<A few words>.** <The step as it was planned.>
  - Done: <what was built and where, the small calls made, and what a
    later step needs to know.>
```

A plan may be picked up days or weeks later, so the Done notes carry
what happened. The step's own text stays as it was planned.

## The design doc

A project does not need one from the start. When it has one, it
describes what the repo has, for people to read: its features and how
they fit. It plans nothing; plans live in `.plan/`.

## The README

The README's prose is Izzy's. An agent proposes its structure and
supplies the facts, and does not write it.

## When there is something to look at

A project with a look to judge, a UI or anything visual, names `look`
in the `options` of its `.ai/base.json`, and this holds there: how a
thing looks or moves is Izzy's call. Offer the knobs, not the verdict.

# <Name> — CLAUDE.md

<What it is, in two or three sentences: what a person does with it, and
its stack.> The shared base (the workflow, reuse, style, testing and
security, and the stack layers named in `.ai/base.json`) comes from the
ai-usage plugin; this file holds only what is this project's own.
**<The remote and deploy rule: "Local until Izzy asks: never create a
remote, push or deploy unprompted." or the remote, and what a push
deploys.>**

## Why each step is explained

<Only when the project has a reason of its own beside the base's, such
as "the graphics are new ground". Otherwise leave this section out.>

## What exists

<Robust only: the catalogue, imported so a session starts knowing it.>

@CATALOGUE.md

## House rules

- <Each rule only this project holds to: its runtime dependency set, a
  budget, a rule of its domain. One line each, bold for the heading of
  a rule that needs a sentence after it.>

## Where things live

- <Each source folder and what kind of thing is in it, in the reuse
  rules' terms: a UI's layers, a domain, the vocabulary at the root.>
- <The import rules between them, as `tools/reuse.config.ts` holds
  them, in plain words.>

## Key paths

- `.ai/base.json`: the stack layers and options this project takes
- `tools/reuse.config.ts`: the reuse table and the import rules
- `.plan/`: local-only research, ADRs and plans (gitignored)
- <Each path a reader looks for first, with what it holds.>

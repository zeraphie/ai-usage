# ai-usage

ai-usage is a Claude Code plugin that gives every project the same shared base: the workflow,
reuse rules, style and testing rules, and the tools behind them. Each project keeps only a small
layer of its own in `.ai/`.

Needs [Bun](https://bun.sh) on your `PATH`. Inside Claude Code:

```
/plugin marketplace add zeraphie/ai-usage
/plugin install ai-usage@ai-usage
```

Start a new session, then run `/ai-usage:new-project` in a project's folder to put it on the base.

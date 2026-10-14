---
paths:
  - "**/*.astro"
---

# Astro

For a project that names `astro` in the `stacks` of its
`.ai/base.json`. Astro is Izzy's choice for a static site that needs
navigation.

- A page's `<script>` is a module that runs once per load. Its wiring
  is idempotent and safe to tear down.
- **Behind a client router, wiring is per visit.** The document outlives
  any one page, so a script that wires the DOM (lookups, listeners,
  timers, engines) does it through one per-visit helper that hands it an
  abort signal and runs its teardown on departure. Never
  `DOMContentLoaded`, `readyState` or module-level run-once wiring: they
  work on a full load and leave every return visit dead. Without a
  router, avoid capturing elements at module scope, so adding one later
  costs nothing.
- A library's elements navigate through one helper, never
  `window.location`, so the site's router can take over, and a URL
  write carries the existing `history.state` forward.
- `<style is:global>` for anything that must reach DOM made at runtime:
  scoped styles only see what the server rendered.
- Lit elements are client-only custom elements in Astro templates, with
  no server-rendered shadow DOM.
- Content collections are the source of truth for content, and a
  formatter leaves them alone, so ported text stays as it was.
- `check` includes `astro check` and a real build.

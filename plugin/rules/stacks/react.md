---
paths:
  - "**/*.tsx"
  - "**/*.jsx"
---

# React

For a project whose `.ai` names the React layer. The UI's folders follow
atomic design, as the reuse rules say.

- **React stays thin.** Components render state and forward intent. The
  logic lives in plain modules that never import React, so it is tested
  without React and extended without touching a component.
- Function components and hooks. A class is for what owns a lifetime
  and imperative state outside React, such as a camera, a canvas stage
  or an input binding, and a component holds it.
- A molecule takes props and sends events; it never reads a store. A
  component reads the stores. What an atom or a molecule needs from a
  domain comes in as a prop.
- Shared state, when it is needed: zustand, in slices with plain
  actions. No reducers.
- Something imperative, such as a canvas library, lives behind one ref.
  The component creates it in an effect and disposes of it in the
  effect's cleanup, so StrictMode's double mount tests the teardown.
- A request a component starts is cancelled when the component goes
  away, through an `AbortController` the effect's cleanup aborts.
- A component file is named for its component, in `PascalCase`:
  `StatusBadge.tsx`.
- The dev/prod switch is the bundler's own, such as
  `import.meta.env.DEV`.
- oxlint adds its `react` and `jsx-a11y` plugins.

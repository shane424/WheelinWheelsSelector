# Wheelin' Wheels Selector

A product-neutral, local-first decision maker for games, meals, chores, activities, or any options you can name. The default experience uses a group wheel followed by an option wheel, so the second result always belongs to the group selected by the first.

## Setup

Requirements: Node.js 20 or newer and npm.

```bash
npm install
npm run dev
```

Open the URL printed by Vite (normally `http://localhost:5173`). For a production bundle, run `npm run build`; run the test suite with `npm test`.

## Using the chooser

1. Select **Spin person** (the wording is retained for the seeded game example). The group result determines the contents of wheel two.
2. Select **Spin game**, or use **Spin both** to run both stages in sequence.
3. Replay both stages or re-spin only the option from the result card.

The labels are examples, not a restriction: rename groups to households, meal types, project phases, or anything else. Results are timestamped in the in-memory history. The latest 30 selections are shown, and history can be cleared.

## Spin modes

The gallery documents ten ways the same group/option model can be used:

1. **Sequential wheels** (implemented default): group, then one of that group's options.
2. **Linked wheels**: both wheels move together.
3. **Nested wheels**: an inner and outer wheel.
4. **Giant wheel**: flattened group/option combinations.
5. **Tournament**: bracket elimination.
6. **Slot reels**: independently stopping reels.
7. **Cascading**: multi-level decision trees.
8. **Group playoffs**: one option per group followed by a group final.
9. **Knockout spins**: repeatedly remove selected entries.
10. **Ranked pointers**: several pointers generate a ranked shortlist.

The gallery is visual and animated; sequential mode is the fully interactive chooser.

## Editing and local storage

The editor can add, rename, recolor, reorder, or delete any group and option. Changes save automatically to the browser's `localStorage` under `wheelin-config-v1`. **Reset defaults** restores the bundled example. **Export JSON** downloads the current configuration; **Import JSON** validates and loads one.

The import/export format is an array of group objects. IDs should be unique strings and labels preserve their exact spelling:

```json
[
  {
    "id": "dinner",
    "label": "Dinner",
    "color": "#ff6b6b",
    "options": [
      { "id": "dinner-tacos", "label": "Tacos", "color": "#ff6b6b" }
    ]
  }
]
```

Malformed JSON, missing group IDs or labels, and missing option arrays are reported as invalid rather than replacing the current configuration. Empty group lists and groups with no options have explicit empty states.

## Selection and animation

The wheel derives equal segment angles from any positive option count. The selected index is obtained before animation with `crypto.getRandomValues` and unbiased rejection sampling when the Web Crypto API exists, with `Math.random` as a compatibility fallback. Animation then adds multiple rotations and aligns the selected segment's center with the fixed top pointer; it never changes the result. An active wheel rejects duplicate spins. A single option works normally, while an empty wheel is disabled.

## Accessibility

- Each wheel is a native button operable with **Enter** or **Space**, with a visible focus ring.
- A persistent top pointer does not rely on color to communicate the selection.
- Idle, spinning, selected, empty, and invalid states have plain text equivalents.
- Results are announced through a polite live region and also displayed in plain text.
- Controls use accessible names, and disabled actions remain visibly distinct.
- `prefers-reduced-motion: reduce` removes decorative animation and resolves wheel movement immediately.

## Tests

`npm test` covers secure selection bounds, group/option mapping, empty and single inputs, deterministic alignment, validation states, sequential and linked interactions, configuration editing, keyboard activation, reduced motion, and local persistence. Weighted selection is intentionally not supported: each option has an equal chance.

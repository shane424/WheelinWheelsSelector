# Wheelin' Wheels Selector

[![CI](https://github.com/shane424/WheelinWheelsSelector/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/shane424/WheelinWheelsSelector/actions/workflows/ci.yml)

A product-neutral, local-first decision maker for games, meals, chores, activities, or any options you can name. The currently interactive default experience uses a sequential group wheel followed by an option wheel, so the second result always belongs to the group selected by the first.

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

The labels are examples, not a restriction: rename groups to households, meal types, project phases, or anything else. Results are timestamped and saved locally. The latest 30 valid selections are retained across browser sessions; older and malformed stored records are discarded automatically. History can be exported as JSON or CSV, and **Clear** also clears the persisted history.

## Spin modes

All eighteen formats are implemented and selectable from the gallery. They use the same editable configuration and choose their result before animation begins.

- **Wheel formats:** sequential, linked, nested, and one giant flattened wheel.
- **Multi-round formats:** tournament brackets, group playoffs, knockout elimination, ranked results, and cascading paths show their intermediate selections.
- **Physical formats:** Plinko, skee-ball, pachinko, marble racing, darts, dice, cards, raffle, and slot reels each have a distinct animated board or object.

Every mode honors configured relative weights. Wheel segment areas also represent relative weights, with a text legend so even very small segments remain legible.

## Editing and local storage

The editor can add, rename, recolor, reorder, or delete any group and option. Changes save automatically to the browser's `localStorage` under `wheelin-config-v2`; selection history uses the separately versioned `wheelin-history-v1` key. The configuration key was incremented so existing installations receive the corrected bundled game lists automatically. **Reset defaults** restores the bundled example. **Export JSON** downloads the current configuration; **Import JSON** validates and loads one.

The import/export format includes configuration metadata and an array of group objects. Singular nouns default to `group` and `option` for legacy configurations; the bundled games example uses `person` and `game`. IDs should be unique strings and labels preserve their exact spelling:

```json
{
  "metadata": { "groupNoun": "category", "optionNoun": "meal" },
  "groups": [
  {
    "id": "dinner",
    "label": "Dinner",
    "color": "#ff6b6b",
    "weight": 2,
    "options": [
      { "id": "dinner-tacos", "label": "Tacos", "color": "#ff6b6b", "weight": 1 }
    ]
  }
  ]
}
```

The editor exposes both singular labels, and uses them for spin controls, stage instructions, and accessible wheel names. The optional numeric `weight` field must be finite and greater than zero. Higher values increase relative probability: an entry weighted 2 is twice as likely as one weighted 1. Files and saved configurations without weights remain compatible and load with weight 1. Malformed JSON, missing group or option IDs or labels, invalid weights, and missing option arrays are reported as invalid rather than replacing the current configuration. Empty group lists and groups with no options have explicit empty states.

## Selection and animation

The wheel derives segment angles from each entry's share of the total weight. The selected index is obtained before animation by mapping a uniformly distributed 32-bit value from `crypto.getRandomValues` onto cumulative weight boundaries, with `Math.random` as a compatibility fallback. Animation then adds multiple rotations and aligns the selected segment's center with the fixed top pointer; it never changes the result. An active wheel rejects duplicate spins. A single option works normally, while an empty wheel is disabled.

## Accessibility

- Each wheel is a native button operable with **Enter** or **Space**, with a visible focus ring.
- A persistent top pointer does not rely on color to communicate the selection.
- Idle, spinning, selected, empty, and invalid states have plain text equivalents.
- Results are announced through a polite live region and also displayed in plain text.
- Controls use accessible names, and disabled actions remain visibly distinct.
- `prefers-reduced-motion: reduce` removes decorative animation and resolves wheel movement immediately.

## Tests

`npm test` covers secure selection bounds, group/option mapping, empty and single inputs, deterministic alignment, validation states, sequential and linked interactions, configuration editing, keyboard activation, reduced motion, and local persistence. Tests also cover weighted statistical boundaries, deterministic injected random values, invalid weights, and backward-compatible imports.

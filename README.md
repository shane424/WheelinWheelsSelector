# Wheelin' Wheels Selector

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

Mode status has one of three explicit meanings:

- **Implemented** (`implemented`) means a complete, interactive mechanic that simulates the named format.
- **Interactive preview** (`preview`) means a simplified interactive visualization that chooses a valid result, but does not yet fully simulate the named mechanic.
- **Concept** (`concept`) is reserved for a noninteractive design card with no play action.

The source currently contains three specialized, implemented mechanics: the sequential two-wheel flow, nested rings, and a giant flattened wheel. All other entries use the generic preview component, which preselects a result using the format's selection routine and then animates a glyph and selection summary. No current entry is concept-only.

| Mode | Source status | Rendered behavior |
| --- | --- | --- |
| Sequential wheels | Implemented | Specialized two-stage wheel: spin a group, then an option belonging to it; **Spin both** chains the stages. |
| Linked wheels | Interactive preview | Generic preview preselects a related group and option and displays them in sequence; it does not render or spin two linked wheels. |
| Nested wheels | Implemented | Specialized outer and inner wheel mechanic; the group result populates and starts the option ring. |
| Giant wheel | Implemented | Specialized wheel containing every eligible group/option pair. |
| Tournament | Interactive preview | Generic preview computes bracket winners and summarizes each round; no bracket is rendered. |
| Slot reels | Interactive preview | Generic preview selects a related group and option and lists both; no reels are simulated. |
| Cascading choices | Interactive preview | Generic preview samples the available group-to-option path; it is not an arbitrary interactive decision tree. |
| Group playoffs | Interactive preview | Generic preview samples one finalist per group and a winner, then summarizes the finalists; no playoff interface is rendered. |
| Knockout | Interactive preview | Generic preview computes eliminations and shows their labels; it does not play rounds interactively. |
| Ranked pointers | Interactive preview | Generic preview samples up to three unique choices and lists their rank order; no pointers are rendered. |
| Plinko | Interactive preview | Generic preview preselects a choice and animates the mode glyph; there are no pins or puck physics. |
| Skee-ball | Interactive preview | Generic preview preselects a choice and animates the mode glyph; there is no roll or target simulation. |
| Pachinko | Interactive preview | Generic preview preselects a choice and animates the mode glyph; there are no peg or ball physics. |
| Marble racing | Interactive preview | Generic preview preselects a choice and animates the mode glyph; no race is simulated. |
| Dice | Interactive preview | Generic preview preselects a choice and animates a die glyph; it does not map or roll custom faces. |
| Cards | Interactive preview | Generic preview preselects a choice and animates a card glyph; it does not simulate a shuffled deck. |
| Raffle | Interactive preview | Generic preview preselects a choice and animates a ticket glyph; it does not simulate a ticket pool. |
| Darts | Interactive preview | Generic preview preselects a choice and animates the mode glyph; no board regions or throw are simulated. |

Interactive selections honor configured relative weights. Wheel segment areas also represent relative weights, with a text legend so even very small segments remain legible.

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

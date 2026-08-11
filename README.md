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

The labels are examples, not a restriction: rename groups to households, meal types, project phases, or anything else. Results are timestamped in the in-memory history. The latest 30 selections are shown, and history can be cleared.

## Spin modes

The gallery documents how the same group/option data model could support additional choice-making formats beyond the playable default:

1. **Sequential wheels** (`implemented`, **Playable**): group, then one of that group's options.
2. **Linked wheels** (`implemented`, **Playable**): one control runs an automatic two-stage spin: it selects the group first and then spins only that group's options.
3. **Nested wheels** (`planned`, **Preview**): an inner and outer wheel.
4. **Giant wheel** (`concept`, **Concept**, **Uses weights**): flattened group/option combinations.
5. **Tournament** (`concept`, **Concept**, **Uses weights**): bracket elimination.
6. **Slot reels** (`concept`, **Concept**): independently stopping reels.
7. **Cascading** (`concept`, **Concept**): multi-level decision trees.
8. **Group playoffs** (`concept`, **Concept**, **Uses weights**): one option per group followed by a group final.
9. **Knockout spins** (`concept`, **Concept**): repeatedly remove selected entries.
10. **Ranked pointers** (`concept`, **Concept**, **Uses weights**): several pointers generate a ranked shortlist.
11. **Plinko board** (`concept`, **Concept**, **Uses weights**): a puck drops through pins into weighted outcome slots.
12. **Skee-ball** (`concept`, **Concept**, **Uses weights**): rolls land in targets mapped to choices or point tiers.
13. **Pachinko** (`concept`, **Concept**, **Uses weights**): a ball bounces through pegs into choice pockets.
14. **Marble race** (`concept`, **Concept**): lanes decide by the first finisher.
15. **Dice table** (`concept`, **Concept**, **Uses weights**): dice totals or custom faces map to choices.
16. **Card draw** (`concept`, **Concept**, **Uses weights**): a shuffled deck provides group and option cards.
17. **Raffle** (`concept`, **Concept**, **Uses weights**): tickets are drawn from an entry pool.
18. **Dart board** (`concept`, **Concept**, **Uses weights**): target regions represent available choices.

Every playable mode honors configured weights. Wheel segment areas also represent relative weights, with a text legend so even very small segments remain legible.

## Editing and local storage

The editor can add, rename, recolor, reorder, or delete any group and option. Changes save automatically to the browser's `localStorage` under `wheelin-config-v1`. **Reset defaults** restores the bundled example. **Export JSON** downloads the current configuration; **Import JSON** validates and loads one.

The import/export format is an array of group objects. IDs should be unique strings and labels preserve their exact spelling:

```json
[
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
```

The optional numeric `weight` field must be finite and greater than zero. Higher values increase relative probability: an entry weighted 2 is twice as likely as one weighted 1. Files and saved configurations without weights remain compatible and load with weight 1. Malformed JSON, missing group or option IDs or labels, invalid weights, and missing option arrays are reported as invalid rather than replacing the current configuration. Empty group lists and groups with no options have explicit empty states.

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

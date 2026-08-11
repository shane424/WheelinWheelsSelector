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

The gallery documents a broader catalog of choice-making formats. Sequential wheels remain the implemented default: pick a group, then one of that group's options. Linked wheels and nested wheels are shown as equal-odds formats, while the rest of the catalog demonstrates mechanics that can map option weights to higher probability.

Each mode card includes a short description, a **Uses weights** or **Equal odds** badge, the way weights affect probability, and an example use case. The gallery is visual and animated; sequential mode is the fully interactive chooser.

## Weighted choice mechanics

Weights increase the number of paths, spaces, copies, or target area assigned to an option. A weight of 3 should generally be represented as about three times as many winning chances as a weight of 1, though the exact expression depends on the mechanic:

| Mechanic | How weights map to probability |
| --- | --- |
| **Plinko board** | Heavier options receive larger bottom bins or repeated bins, so more puck paths finish there. |
| **Skee-ball target board** | Heavier options get bigger rings, wider pockets, or easier landing areas. |
| **Pachinko/peg board** | Bucket widths or repeated buckets increase the number of peg-board paths assigned to heavier options. |
| **Marble race** | Weights become lane advantages, more shortcuts, or repeated marbles racing for the same option. |
| **Dice table** | Larger ranges of dice totals are mapped to heavier options. |
| **Card draw** | Higher-weight options get duplicate cards in the deck. |
| **Bag draw/raffle tickets** | Higher-weight options get more tickets or slips in the bag. |
| **Spinner with weighted slices** | Segment size is proportional to option weight, matching the wheel metaphor with larger slices. |
| **Weighted bracket seeding** | Higher weights receive byes, easier matchups, or multiple bracket entries. |
| **Token drop/carnival coin pusher** | Wider scoring trays are assigned to heavier options. |
| **Prize claw/grab bag** | More copies of weighted options are placed in the prize pool. |
| **Slot-machine reels** | Heavier options are repeated more often on each reel. |
| **Dart board/target toss** | Larger target zones are assigned to heavier options. |
| **Random walk/map path** | More map branches lead to weighted outcomes, increasing the chance a walk reaches them. |
| **Bingo/tumbler balls** | More balls are labeled for heavier options. |

The current interactive selector still resolves equal-odds sequential wheels; these weighted mechanics describe future-friendly display formats for configurations that include weights.

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

`npm test` covers secure selection bounds, group/option mapping, empty and single inputs, deterministic alignment, validation states, sequential and linked interactions, configuration editing, keyboard activation, reduced motion, and local persistence. The implemented chooser currently gives each available option an equal chance; weighted mechanics are documented as catalog formats for future weighted configurations.

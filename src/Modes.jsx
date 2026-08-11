const modes = [
  {
    icon: '① → ②',
    title: 'Sequential wheels',
    description: "Pick a group, then an option from only that group.",
    usesWeights: false,
    weightBehavior: 'The implemented default currently gives every available group and option equal odds.',
    exampleUseCase: 'Choose a household first, then an equal-odds chore for that household.',
    implementedDefault: true
  },
  {
    icon: '◎ ◎',
    title: 'Linked wheels',
    description: 'Spin group and option wheels at the same time.',
    usesWeights: false,
    weightBehavior: 'Each wheel can stay balanced when the goal is a simultaneous equal-odds reveal.',
    exampleUseCase: 'Pair a player and challenge without favoring either wheel.'
  },
  {
    icon: '◉',
    title: 'Nested wheels',
    description: 'Inner and outer rings reveal a paired choice.',
    usesWeights: false,
    weightBehavior: 'Rings can remain evenly divided when both parts of the paired choice should be fair.',
    exampleUseCase: 'Pick an activity category and an equal chance modifier together.'
  },
  {
    icon: '▾▾▾',
    title: 'Plinko board',
    description: 'Drop a puck through pins into bottom bins assigned to options.',
    usesWeights: true,
    weightBehavior: 'Heavier options get larger bins or repeated bottom bins so more puck paths land there.',
    exampleUseCase: 'Let dinner choices with stronger preferences occupy extra landing slots.'
  },
  {
    icon: '◎◌●',
    title: 'Skee-ball target board',
    description: 'Land a ball in rings, pockets, or target zones labeled with choices.',
    usesWeights: true,
    weightBehavior: 'Heavier options use bigger rings, wider pockets, or higher-probability landing areas.',
    exampleUseCase: 'Make favorite party games appear in the easiest scoring zones.'
  },
  {
    icon: '⋱⋮⋰',
    title: 'Pachinko/peg board',
    description: 'Send a ball through a peg field into option buckets.',
    usesWeights: true,
    weightBehavior: 'Bucket widths or repeated buckets expand the number of paths that resolve to heavier options.',
    exampleUseCase: 'Weight prize categories while keeping the reveal physical and playful.'
  },
  {
    icon: '●⇢●',
    title: 'Marble race',
    description: 'Race marbles through lanes, ramps, and obstacles until one option wins.',
    usesWeights: true,
    weightBehavior: 'Weights become lane advantages, shortcut frequency, or repeated marbles for the same option.',
    exampleUseCase: 'Give highly requested movie picks more racers or better track positions.'
  },
  {
    icon: '⚂ + ⚄',
    title: 'Dice table',
    description: 'Roll dice and look up the result in a table of outcomes.',
    usesWeights: true,
    weightBehavior: 'Larger ranges of dice totals map to heavier options, increasing their hit rate.',
    exampleUseCase: 'Assign common chores to narrow ranges and preferred rewards to wider ranges.'
  },
  {
    icon: '▭▭▭',
    title: 'Card draw',
    description: 'Draw from a shuffled deck where cards point to choices.',
    usesWeights: true,
    weightBehavior: 'Duplicate cards represent higher-weight options, so they appear more often in the deck.',
    exampleUseCase: 'Add extra cards for restaurants everyone likes most.'
  },
  {
    icon: '◍◍◍',
    title: 'Bag draw/raffle tickets',
    description: 'Pull a ticket, token, or slip from a shared pool.',
    usesWeights: true,
    weightBehavior: 'More tickets are added for higher-weight options, matching classic raffle probability.',
    exampleUseCase: 'Let each family member add tickets to weight weekend activities.'
  },
  {
    icon: '◌',
    title: 'Spinner with weighted slices',
    description: 'Spin a wheel whose slices are sized by option weight.',
    usesWeights: true,
    weightBehavior: 'This is the current wheel behavior adapted to proportional segments for weighted choices.',
    exampleUseCase: 'Turn preference scores into visibly larger wheel slices.'
  },
  {
    icon: '🏆',
    title: 'Weighted bracket seeding',
    description: 'Run choices through a bracket with seeded advantages.',
    usesWeights: true,
    weightBehavior: 'Higher weights receive byes, easier matchups, or multiple entries in the bracket.',
    exampleUseCase: 'Favor top candidate games while still allowing an underdog upset.'
  },
  {
    icon: '◒▥',
    title: 'Token drop/carnival coin pusher',
    description: 'Drop tokens toward scoring trays that map to options.',
    usesWeights: true,
    weightBehavior: 'Heavier options get wider scoring trays so more token positions count for them.',
    exampleUseCase: 'Choose prize tiers with popular picks assigned to bigger trays.'
  },
  {
    icon: '🕹?',
    title: 'Prize claw/grab bag',
    description: 'Grab from a pool of visible or hidden prize copies.',
    usesWeights: true,
    weightBehavior: 'Weighted options place more copies in the prize pool, increasing grab chances.',
    exampleUseCase: 'Stock a mystery bag with more copies of crowd-approved snacks.'
  },
  {
    icon: '▥',
    title: 'Slot-machine reels',
    description: 'Stop reels that contain repeated choice symbols.',
    usesWeights: true,
    weightBehavior: 'Heavier options are repeated more often on reels, so reel stops favor them.',
    exampleUseCase: 'Weight recurring meeting topics without showing a conventional wheel.'
  },
  {
    icon: '◎➶',
    title: 'Dart board/target toss',
    description: 'Throw at a board with regions assigned to choices.',
    usesWeights: true,
    weightBehavior: 'Larger target zones are assigned to heavier options.',
    exampleUseCase: 'Let high-priority tasks occupy bigger bullseye-adjacent areas.'
  },
  {
    icon: '↱↲↳',
    title: 'Random walk/map path',
    description: 'Move through a branching map until an outcome node is reached.',
    usesWeights: true,
    weightBehavior: 'More branches lead to weighted outcomes, raising the chance a walk reaches them.',
    exampleUseCase: 'Explore a themed adventure map that still honors preference weights.'
  },
  {
    icon: '●●●',
    title: 'Bingo/tumbler balls',
    description: 'Draw numbered or labeled balls from a tumbler.',
    usesWeights: true,
    weightBehavior: 'More balls are assigned to heavier options, just like repeated raffle entries.',
    exampleUseCase: 'Weight classroom prompts while preserving a familiar bingo draw.'
  }
];

export function Modes() {
  return (
    <section className="modes" aria-labelledby="modes-title">
      <span className="eyebrow">WEIGHTED WAYS TO DECIDE</span>
      <h2 id="modes-title">Choice-making formats</h2>
      <p className="muted">The same configuration can power equal-odds picks or weighted mechanics where larger weights receive more chances to win.</p>
      <div className="mode-grid">
        {modes.map((mode, index) => (
          <article className={`mode-card ${mode.implementedDefault ? 'active' : ''}`} key={mode.title}>
            <div className={`mode-demo demo-${index}`} aria-hidden="true">
              <span>{mode.icon}</span>
            </div>
            <div>
              <div className="mode-card-heading">
                <h3>{mode.title} {mode.implementedDefault && <em>DEFAULT</em>}</h3>
                <span className={`weight-badge ${mode.usesWeights ? 'weighted' : 'equal'}`}>
                  {mode.usesWeights ? 'Uses weights' : 'Equal odds'}
                </span>
              </div>
              <p>{mode.description}</p>
              <p className="weight-behavior"><strong>Weights:</strong> {mode.weightBehavior}</p>
              <p className="example-use"><strong>Example:</strong> {mode.exampleUseCase}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

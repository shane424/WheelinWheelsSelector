const statusLabels = {
  implemented: 'Playable now',
  planned: 'Playable now',
  concept: 'Concept',
};

const modes = [
  { icon: '① → ②', name: 'Sequential wheels', description: 'Pick a group, then an option from only that group.', status: 'implemented' },
  { icon: '◎ ◎', name: 'Linked wheels', description: 'Spin group and option wheels from one control; the option spin follows the selected group.', status: 'planned' },
  { icon: '◉', name: 'Nested wheels', description: 'Inner and outer rings reveal a paired choice.', status: 'concept' },
  { icon: '✹', name: 'Giant wheel', description: 'Every group-and-option pairing on one wheel.', status: 'concept', usesWeights: true },
  { icon: '🏆', name: 'Tournament', description: 'Choices compete through an elimination bracket.', status: 'concept', usesWeights: true },
  { icon: '▥', name: 'Slot reels', description: 'Group and option reels stop in sequence.', status: 'concept' },
  { icon: '⌄⌄⌄', name: 'Cascading', description: 'Make a choice at each level of a decision tree.', status: 'concept' },
  { icon: '◌ ◌ ◉', name: 'Group playoffs', description: 'Spin each group’s option, then choose a group.', status: 'concept', usesWeights: true },
  { icon: '✕ ◯', name: 'Knockout spins', description: 'Remove each selection until one remains.', status: 'concept' },
  { icon: 'Ⅰ Ⅱ Ⅲ', name: 'Ranked pointers', description: 'Multiple pointers produce a ranked shortlist.', status: 'concept', usesWeights: true },
  { icon: '⫶', name: 'Plinko board', description: 'Drop a puck through pins into weighted outcome slots.', status: 'concept', usesWeights: true },
  { icon: '⛳', name: 'Skee-ball', description: 'Roll toward targets that map to groups, options, or point tiers.', status: 'concept', usesWeights: true },
  { icon: '◍', name: 'Pachinko', description: 'Let a ball bounce through pegs into choice pockets.', status: 'concept', usesWeights: true },
  { icon: '● ↘', name: 'Marble race', description: 'Marbles race through lanes until the first finisher chooses.', status: 'concept' },
  { icon: '⚂', name: 'Dice table', description: 'Map dice totals or custom faces to choices.', status: 'concept', usesWeights: true },
  { icon: '🂠', name: 'Card draw', description: 'Draw from a shuffled deck of group and option cards.', status: 'concept', usesWeights: true },
  { icon: '🎟', name: 'Raffle', description: 'Pull a ticket from an entry pool built from the same options.', status: 'concept', usesWeights: true },
  { icon: '◎', name: 'Dart board', description: 'Throw at target regions that represent available choices.', status: 'concept', usesWeights: true },
];

export function Modes(){return <section className="modes" aria-labelledby="modes-title"><span className="eyebrow">WAYS TO DECIDE</span><h2 id="modes-title">Spin modes</h2><p className="muted">The default sequential wheel is interactive now; the gallery also maps the same configuration to future formats.</p><div className="mode-grid">{modes.map((m,i)=><article className={`mode-card ${m.status==='implemented'?'active':''}`} key={m.name}><div className={`mode-demo demo-${i}`} aria-hidden="true"><span>{m.icon}</span></div><div><h3>{m.name} {m.status==='implemented'&&<em>DEFAULT</em>}</h3><div className="mode-badges"><span className={`mode-badge ${m.status}`}>{statusLabels[m.status]}</span>{m.usesWeights&&<span className="mode-badge weight">Uses weights</span>}</div><p>{m.description}</p></div></article>)}</div></section>}

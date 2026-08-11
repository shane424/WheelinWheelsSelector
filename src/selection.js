import { secureWeightedIndex } from './model';
const choose = (items, indexer) => indexer ? indexer(items.length) : secureWeightedIndex(items);

export const pairsFromGroups = groups => (groups ?? []).flatMap(group =>
  (group.options ?? []).map(option => ({
    id: `${group.id}:${option.id}`, label: `${group.label} · ${option.label}`,
    group, option, color: option.color || group.color, weight: (group.weight ?? 1) * (option.weight ?? 1),
  })));

export function takeRandom(items, count = 1, indexer) {
  const pool = [...items];
  const picked = [];
  while (pool.length && picked.length < count) picked.push(pool.splice(choose(pool, indexer), 1)[0]);
  return picked;
}

export function knockout(items, indexer) {
  const remaining = [...items]; const eliminated = [];
  while (remaining.length > 1) eliminated.push(remaining.splice(choose(remaining, indexer), 1)[0]);
  return { winner: remaining[0] ?? null, eliminated };
}

export function groupPlayoffs(groups, indexer) {
  const finalists = (groups ?? []).filter(group => group.options?.length).map(group => {
    const option = group.options[choose(group.options, indexer)];
    return { id: `${group.id}:${option.id}`, label: `${group.label} · ${option.label}`,
      group, option, color: option.color || group.color, weight: (group.weight ?? 1) * (option.weight ?? 1) };
  });
  return { finalists, winner: finalists[choose(finalists, indexer)] ?? null };
}

export function tournament(items, indexer) {
  let round = [...items]; const rounds = [];
  while (round.length > 1) {
    const next = []; const matches = [];
    for (let i = 0; i < round.length; i += 2) {
      const entrants = round.slice(i, i + 2);
      const winner = entrants.length === 1 ? entrants[0] : entrants[choose(entrants, indexer)];
      matches.push({ entrants, winner }); next.push(winner);
    }
    rounds.push(matches); round = next;
  }
  return { winner: round[0] ?? null, rounds };
}

export function cascade(nodes, indexer) {
  const path = []; let current = nodes;
  while (Array.isArray(current) && current.length) {
    const selected = current[choose(current, indexer)]; path.push(selected);
    current = selected.children ?? selected.options;
  }
  return path;
}

export const historyRecord = (mode, candidate, details = {}) => ({
  mode, group: candidate?.group?.label ?? '', option: candidate?.option?.label ?? candidate?.label ?? '',
  groupId: candidate?.group?.id ?? null, optionId: candidate?.option?.id ?? candidate?.id ?? null,
  selections: details.selections ?? [], time: new Date().toISOString(),
});

import { secureIndex } from './model';

export const pairsFromGroups = groups => (groups ?? []).flatMap(group =>
  (group.options ?? []).map(option => ({
    id: `${group.id}:${option.id}`, label: `${group.label} · ${option.label}`,
    group, option, color: option.color || group.color,
  })));

export function takeRandom(items, count = 1, indexer = secureIndex) {
  const pool = [...items];
  const picked = [];
  while (pool.length && picked.length < count) picked.push(pool.splice(indexer(pool.length), 1)[0]);
  return picked;
}

export function knockout(items, indexer = secureIndex) {
  const remaining = [...items]; const eliminated = [];
  while (remaining.length > 1) eliminated.push(remaining.splice(indexer(remaining.length), 1)[0]);
  return { winner: remaining[0] ?? null, eliminated };
}

export function groupPlayoffs(groups, indexer = secureIndex) {
  const finalists = (groups ?? []).filter(group => group.options?.length).map(group => {
    const option = group.options[indexer(group.options.length)];
    return { id: `${group.id}:${option.id}`, label: `${group.label} · ${option.label}`,
      group, option, color: option.color || group.color };
  });
  return { finalists, winner: finalists[indexer(finalists.length)] ?? null };
}

export function tournament(items, indexer = secureIndex) {
  let round = [...items]; const rounds = [];
  while (round.length > 1) {
    const next = []; const matches = [];
    for (let i = 0; i < round.length; i += 2) {
      const entrants = round.slice(i, i + 2);
      const winner = entrants.length === 1 ? entrants[0] : entrants[indexer(2)];
      matches.push({ entrants, winner }); next.push(winner);
    }
    rounds.push(matches); round = next;
  }
  return { winner: round[0] ?? null, rounds };
}

export function cascade(nodes, indexer = secureIndex) {
  const path = []; let current = nodes;
  while (Array.isArray(current) && current.length) {
    const selected = current[indexer(current.length)]; path.push(selected);
    current = selected.children ?? selected.options;
  }
  return path;
}

export const historyRecord = (mode, candidate, details = {}) => ({
  mode, group: candidate?.group?.label ?? '', option: candidate?.option?.label ?? candidate?.label ?? '',
  groupId: candidate?.group?.id ?? null, optionId: candidate?.option?.id ?? candidate?.id ?? null,
  selections: details.selections ?? [], time: new Date().toISOString(),
});

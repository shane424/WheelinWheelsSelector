export const STORAGE_KEY = 'wheelin-config-v1';
export const HISTORY_STORAGE_KEY = 'wheelin-history-v1';
export const HISTORY_LIMIT = 30;
export const DEFAULT_TERMINOLOGY = Object.freeze({ groupNoun: 'group', optionNoun: 'option' });
export const SEEDED_TERMINOLOGY = Object.freeze({ groupNoun: 'person', optionNoun: 'game' });
const makeOptions = (owner, color, labels) => labels.map((label, i) => ({ id: `${owner}-${i}`, label, color, weight: 1 }));
export const DEFAULT_GROUPS = [
  { id: 'shane', label: 'Shane', color: '#ff6b6b', weight: 1, options: makeOptions('shane', '#ff6b6b', ['Rocket League', 'Fortnite', 'Minecraft', 'Overwatch 2']) },
  { id: 'alex', label: 'Alex', color: '#4dd4ac', weight: 1, options: makeOptions('alex', '#4dd4ac', ['Apex Legends', 'Valorant', 'Helldivers 2', 'Sea of Thieves']) },
  { id: 'jason', label: 'Jason', color: '#6c8cff', weight: 1, options: makeOptions('jason', '#6c8cff', ['Call of Duty', 'Diablo IV', 'Destiny 2', 'Fall Guys']) },
  { id: 'hutch', label: 'Hutch', color: '#f7c948', weight: 1, options: makeOptions('hutch', '#f7c948', ['Grand Theft Auto V', 'Halo Infinite', 'Party Animals', 'Golf With Your Friends']) },
];
export const cloneDefaults = () => structuredClone(DEFAULT_GROUPS);
export const normalizeTerminology = metadata => ({
  groupNoun: String(metadata?.groupNoun ?? DEFAULT_TERMINOLOGY.groupNoun).trim() || DEFAULT_TERMINOLOGY.groupNoun,
  optionNoun: String(metadata?.optionNoun ?? DEFAULT_TERMINOLOGY.optionNoun).trim() || DEFAULT_TERMINOLOGY.optionNoun,
});
export const cloneDefaultConfig = () => ({ metadata: { ...SEEDED_TERMINOLOGY }, groups: cloneDefaults() });
export function secureIndex(length, cryptoObject = globalThis.crypto) {
  if (!Number.isInteger(length) || length < 1) return null;
  if (!cryptoObject?.getRandomValues) return Math.floor(Math.random() * length);
  const limit = Math.floor(0x100000000 / length) * length;
  const value = new Uint32Array(1);
  do cryptoObject.getRandomValues(value); while (value[0] >= limit);
  return value[0] % length;
}
export const validWeight = weight => typeof weight === 'number' && Number.isFinite(weight) && weight > 0;
export function secureWeightedIndex(items, cryptoObject = globalThis.crypto) {
  const weights = items?.map(item => typeof item === 'number' ? item : item && typeof item === 'object' ? item.weight ?? 1 : item);
  if (!weights?.length || weights.some(weight => !validWeight(weight))) return null;
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  if (!Number.isFinite(total)) return null;
  const values = new Uint32Array(1);
  const random = cryptoObject?.getRandomValues
    ? (cryptoObject.getRandomValues(values), values[0] / 0x100000000)
    : Math.random();
  const target = random * total;
  let boundary = 0;
  for (let index = 0; index < weights.length; index++) {
    boundary += weights[index];
    if (target < boundary) return index;
  }
  return weights.length - 1;
}
export const weightedSegments = items => {
  const total = items.reduce((sum, item) => sum + (item.weight ?? 1), 0);
  let start = 0;
  return items.map(item => {
    const end = start + (item.weight ?? 1) * 360 / total;
    const segment = { start, end, center: (start + end) / 2 };
    start = end;
    return segment;
  });
};
export const segmentCenter = (index, count) => count ? (index + .5) * (360 / count) : 0;
export const alignedRotation = (current, index, count, turns = 5) => {
  if (!count) return current;
  const normalized = ((current % 360) + 360) % 360;
  const target = (360 - segmentCenter(index, count)) % 360;
  return current + turns * 360 + ((target - normalized + 360) % 360);
};
export const alignedWeightedRotation = (current, items, index, turns = 5) => {
  if (!items.length || index == null) return current;
  const normalized = ((current % 360) + 360) % 360;
  const target = (360 - weightedSegments(items)[index].center) % 360;
  return current + turns * 360 + ((target - normalized + 360) % 360);
};
export const optionsForGroup = (groups, id) => groups.find(g => g.id === id)?.options ?? [];
export const configState = groups => !Array.isArray(groups) ? 'invalid' : !groups.length ? 'empty' : groups.some(g => !g?.id || !String(g.label).trim() || !Array.isArray(g.options) || (g.weight !== undefined && !validWeight(g.weight)) || g.options.some(option => !option?.id || !String(option.label).trim() || (option.weight !== undefined && !validWeight(option.weight)))) ? 'invalid' : 'ready';
export const normalizeConfig = groups => groups.map(group => ({ ...group, weight: group.weight ?? 1, options: group.options.map(option => ({ ...option, weight: option.weight ?? 1 })) }));
export function parseConfig(text) {
  return parseConfiguration(text).groups;
}
export function normalizeConfiguration(value) {
  const groups = Array.isArray(value) ? value : value?.groups;
  return { metadata: normalizeTerminology(Array.isArray(value) ? undefined : value?.metadata), groups: normalizeConfig(groups) };
}
export function parseConfiguration(text) {
  const value = JSON.parse(text);
  const groups = Array.isArray(value) ? value : value?.groups;
  if (configState(groups) === 'invalid') throw new Error('Groups and options need labels. Weights must be finite numbers greater than zero.');
  return normalizeConfiguration(value);
}

export const isHistoryRecord = record => record !== null
  && typeof record === 'object'
  && typeof record.group === 'string'
  && typeof record.option === 'string'
  && record.option.trim().length > 0
  && typeof record.mode === 'string'
  && record.mode.trim().length > 0
  && typeof record.time === 'string'
  && !Number.isNaN(Date.parse(record.time));

export function parseHistory(text) {
  if (!text) return [];
  try {
    const records = JSON.parse(text);
    return Array.isArray(records) ? records.filter(isHistoryRecord).slice(0, HISTORY_LIMIT) : [];
  } catch {
    return [];
  }
}

export const historyExportRecords = records => records.map(({ group, option, mode, time }) => ({
  group, option, mode, timestamp: new Date(time).toISOString(),
}));

const csvCell = value => `"${String(value).replaceAll('"', '""')}"`;
export function exportHistory(records, format = 'json') {
  const values = historyExportRecords(records);
  if (format === 'csv') {
    return ['group,option,mode,timestamp', ...values.map(value =>
      [value.group, value.option, value.mode, value.timestamp].map(csvCell).join(','),
    )].join('\n');
  }
  return JSON.stringify(values, null, 2);
}

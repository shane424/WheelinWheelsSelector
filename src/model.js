export const STORAGE_KEY = 'wheelin-config-v1';
export const DEFAULT_GROUPS = [
  { id: 'shane', label: 'Shane', color: '#ff6b6b', options: ['Rocket League', 'Fortnite', 'Minecraft', 'Overwatch 2'].map((label, i) => ({ id: `shane-${i}`, label, color: '#ff6b6b' })) },
  { id: 'alex', label: 'Alex', color: '#4dd4ac', options: ['Apex Legends', 'Valorant', 'Helldivers 2', 'Sea of Thieves'].map((label, i) => ({ id: `alex-${i}`, label, color: '#4dd4ac' })) },
  { id: 'jason', label: 'Jason', color: '#6c8cff', options: ['Call of Duty', 'Diablo IV', 'Destiny 2', 'Fall Guys'].map((label, i) => ({ id: `jason-${i}`, label, color: '#6c8cff' })) },
  { id: 'hutch', label: 'Hutch', color: '#f7c948', options: ['Grand Theft Auto V', 'Halo Infinite', 'Party Animals', 'Golf With Your Friends'].map((label, i) => ({ id: `hutch-${i}`, label, color: '#f7c948' })) }
];
export const cloneDefaults = () => structuredClone(DEFAULT_GROUPS);
export function secureIndex(length, cryptoObject = globalThis.crypto) {
  if (!Number.isInteger(length) || length < 1) return null;
  if (!cryptoObject?.getRandomValues) return Math.floor(Math.random() * length);
  const limit = Math.floor(0x100000000 / length) * length;
  const value = new Uint32Array(1);
  do cryptoObject.getRandomValues(value); while (value[0] >= limit);
  return value[0] % length;
}
export const segmentCenter = (index, count) => count ? (index + .5) * (360 / count) : 0;
export const alignedRotation = (current, index, count, turns = 5) => {
  if (!count) return current;
  const normalized = ((current % 360) + 360) % 360;
  const target = (360 - segmentCenter(index, count)) % 360;
  return current + turns * 360 + ((target - normalized + 360) % 360);
};
export const optionsForGroup = (groups, id) => groups.find(g => g.id === id)?.options ?? [];
export const configState = groups => !Array.isArray(groups) ? 'invalid' : !groups.length ? 'empty' : groups.some(g => !g?.id || !String(g.label).trim() || !Array.isArray(g.options)) ? 'invalid' : 'ready';
export function parseConfig(text) {
  const value = JSON.parse(text);
  if (configState(value) === 'invalid') throw new Error('Groups need a label and an options list.');
  return value;
}

import { describe,expect,it,vi } from 'vitest';import{alignedRotation,configState,DEFAULT_GROUPS,optionsForGroup,secureIndex,selectableGroups,STORAGE_KEY}from'./model';
describe('selection model',()=>{
 it('provides the corrected default game lists under a new storage schema',()=>{
  expect(STORAGE_KEY).toBe('wheelin-config-v2');
  expect(Object.fromEntries(DEFAULT_GROUPS.map(group=>[group.id,group.options.map(option=>option.label)]))).toEqual({
   shane:['Battleship','Sorry','Bingo','Dungeon Draft','Sun Tzu'],
   alex:['Backgammon','Roulette','Drillers','Dominant Species','Wingspan'],
   jason:['Risk','Candy Land','Civolution','Beast','Fort','Entropy'],
   hutch:['Mega Spell Wars','Small World','Magic: The Gathering','The Witcher'],
  });
  for(const group of DEFAULT_GROUPS) {
   expect(group.weight).toBe(1);
   group.options.forEach((option,index)=>expect(option).toMatchObject({id:`${group.id}-${index}`,color:group.color,weight:1}));
  }
 });
 it('returns null for empty and a valid selection bound otherwise',()=>{expect(secureIndex(0)).toBeNull();for(let i=0;i<40;i++)expect(secureIndex(4)).toBeGreaterThanOrEqual(0),expect(secureIndex(4)).toBeLessThan(4)});
 it('maps a group only to its own options',()=>expect(optionsForGroup([{id:'a',options:[1]},{id:'b',options:[2]}],'b')).toEqual([2]));
 it('handles empty and single option inputs',()=>{expect(optionsForGroup([],'x')).toEqual([]);expect(secureIndex(1)).toBe(0);expect(configState([])).toBe('empty')});
 it('rejects invalid configurations',()=>expect(configState([{id:'a',label:'',options:[]}])).toBe('invalid'));
 it('returns only groups containing named, valid options',()=>{
  const groups=[{id:'full',label:'Full',options:[{id:'valid',label:'Choice'},{id:'blank',label:'  '}]},{id:'empty',label:'Empty',options:[]}];
  expect(selectableGroups(groups)).toEqual([{id:'full',label:'Full',options:[{id:'valid',label:'Choice'}]}]);
  expect(configState(groups)).toBe('ready');
  expect(selectableGroups([{id:'blank',label:'Blank',options:[{id:'option',label:'  '}]}])).toEqual([]);
 });
 it('aligns a chosen segment center at the fixed pointer',()=>{const angle=alignedRotation(27,2,5,5);expect(angle).toBeGreaterThan(1800);expect(((angle+(2.5*72))%360+360)%360).toBeCloseTo(0)});
 it('uses supplied crypto randomness deterministically',()=>{const crypto={getRandomValues:vi.fn(a=>{a[0]=7;return a})};expect(secureIndex(3,crypto)).toBe(1)});
});

describe('weighted selection',()=>{
 const cryptoAt=value=>({getRandomValues(array){array[0]=value;return array}});
 it('uses cumulative boundaries with injected secure random values',async()=>{
  const {secureWeightedIndex}=await import('./model');
  expect(secureWeightedIndex([1,3],cryptoAt(0))).toBe(0);
  expect(secureWeightedIndex([1,3],cryptoAt(0x3fffffff))).toBe(0);
  expect(secureWeightedIndex([1,3],cryptoAt(0x40000000))).toBe(1);
  expect(secureWeightedIndex([1,3],cryptoAt(0xffffffff))).toBe(1);
 });
 it('rejects invalid weights and totals',async()=>{
  const {secureWeightedIndex}=await import('./model');
  for(const weights of [[0],[-1],['1'],[NaN],[Infinity],[Number.MAX_VALUE,Number.MAX_VALUE]]) expect(secureWeightedIndex(weights,cryptoAt(0))).toBeNull();
 });
 it('normalizes legacy imports and rejects invalid imported weights',async()=>{
  const {parseConfig}=await import('./model');
  const legacy='[{"id":"g","label":"Group","options":[{"id":"o","label":"Option"}]}]';
  expect(parseConfig(legacy)[0]).toMatchObject({weight:1,options:[{weight:1}]});
  for(const weight of [0,-1,'nope']) expect(()=>parseConfig(JSON.stringify([{id:'g',label:'Group',weight,options:[]}]))).toThrow(/Weights/);
 });
 it('loads terminology metadata and gives legacy configurations neutral nouns',async()=>{
  const {parseConfiguration}=await import('./model');
  const group={id:'g',label:'Group',options:[]};
  expect(parseConfiguration(JSON.stringify({metadata:{groupNoun:'category',optionNoun:'meal'},groups:[group]})).metadata).toEqual({groupNoun:'category',optionNoun:'meal'});
  expect(parseConfiguration(JSON.stringify([group])).metadata).toEqual({groupNoun:'group',optionNoun:'option'});
 });
 it('places weighted segment centers on their statistical ranges',async()=>{
  const {weightedSegments,alignedWeightedRotation}=await import('./model');
  expect(weightedSegments([{weight:1},{weight:3}])).toEqual([{start:0,end:90,center:45},{start:90,end:360,center:225}]);
  expect((alignedWeightedRotation(0,[{weight:1},{weight:3}],1,0)+225)%360).toBe(0);
 });
});

describe('history export',()=>{
 it('exports the public record fields as JSON and CSV with ISO timestamps',async()=>{
  const {exportHistory}=await import('./model');
  const records=[{group:'Friends, Inc.',option:'Say "yes"',mode:'sequential',time:'2026-08-11T12:34:56.000Z',groupId:'private'}];
  expect(JSON.parse(exportHistory(records,'json'))).toEqual([{group:'Friends, Inc.',option:'Say "yes"',mode:'sequential',timestamp:'2026-08-11T12:34:56.000Z'}]);
  expect(exportHistory(records,'csv')).toBe('group,option,mode,timestamp\n"Friends, Inc.","Say ""yes""","sequential","2026-08-11T12:34:56.000Z"');
 });
});

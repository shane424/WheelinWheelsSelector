import { describe,expect,it } from 'vitest';
import { cascade,groupPlayoffs,historyRecord,knockout,pairsFromGroups,takeRandom,tournament } from './selection';
const groups=[{id:'a',label:'A',options:[{id:'1',label:'One'},{id:'2',label:'Two'}]},{id:'b',label:'B',options:[{id:'3',label:'Three'}]}];
const first=()=>0;
describe('shared mode selection mechanics',()=>{
 it('flattens every group and option for the giant wheel',()=>expect(pairsFromGroups(groups).map(x=>x.label)).toEqual(['A · One','A · Two','B · Three']));
 it('knockout removes one candidate per round',()=>{const result=knockout(pairsFromGroups(groups),first);expect(result.eliminated).toHaveLength(2);expect(result.winner.label).toBe('B · Three')});
 it('ranked sampling has no replacement',()=>{const result=takeRandom(pairsFromGroups(groups),3,first);expect(new Set(result.map(x=>x.id)).size).toBe(3)});
 it('group playoffs selects a finalist from each group and a winning group',()=>{const result=groupPlayoffs(groups,first);expect(result.finalists).toHaveLength(2);expect(result.winner.label).toBe('A · One')});
 it('group playoffs skips empty and blank-only groups and has no winner when all are empty',()=>{
  const incomplete=[...groups,{id:'empty',label:'Empty',options:[]},{id:'blank',label:'Blank',options:[{id:'x',label:' '}]}];
  expect(groupPlayoffs(incomplete,first).finalists.map(x=>x.group.id)).toEqual(['a','b']);
  expect(groupPlayoffs(incomplete.slice(2),first)).toEqual({finalists:[],winner:null});
 });
 it('generates tournament rounds down to one winner',()=>{const result=tournament(pairsFromGroups(groups),first);expect(result.rounds).toHaveLength(2);expect(result.winner.label).toBe('A · One')});
 it('walks arbitrary nested cascading configuration',()=>{const path=cascade([{label:'A',children:[{label:'B',children:[{label:'C'}]}]}],first);expect(path.map(x=>x.label)).toEqual(['A','B','C'])});
 it('normalizes every result for shared history',()=>expect(historyRecord('cards',pairsFromGroups(groups)[0])).toMatchObject({mode:'cards',group:'A',option:'One',groupId:'a',optionId:'1',selections:[]}));
});

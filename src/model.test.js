import { describe,expect,it,vi } from 'vitest';import{alignedRotation,configState,optionsForGroup,secureIndex}from'./model';
describe('selection model',()=>{
 it('returns null for empty and a valid selection bound otherwise',()=>{expect(secureIndex(0)).toBeNull();for(let i=0;i<40;i++)expect(secureIndex(4)).toBeGreaterThanOrEqual(0),expect(secureIndex(4)).toBeLessThan(4)});
 it('maps a group only to its own options',()=>expect(optionsForGroup([{id:'a',options:[1]},{id:'b',options:[2]}],'b')).toEqual([2]));
 it('handles empty and single option inputs',()=>{expect(optionsForGroup([],'x')).toEqual([]);expect(secureIndex(1)).toBe(0);expect(configState([])).toBe('empty')});
 it('rejects invalid configurations',()=>expect(configState([{id:'a',label:'',options:[]}])).toBe('invalid'));
 it('aligns a chosen segment center at the fixed pointer',()=>{const angle=alignedRotation(27,2,5,5);expect(angle).toBeGreaterThan(1800);expect(((angle+(2.5*72))%360+360)%360).toBeCloseTo(0)});
 it('uses supplied crypto randomness deterministically',()=>{const crypto={getRandomValues:vi.fn(a=>{a[0]=7;return a})};expect(secureIndex(3,crypto)).toBe(1)});
});

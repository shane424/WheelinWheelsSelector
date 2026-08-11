import React from 'react';
import { describe,expect,it,vi } from 'vitest';
import { fireEvent,render,screen,waitFor } from '@testing-library/react';
import { MODE_METADATA,Modes,SelectionMode } from './Modes';
const groups=[{id:'a',label:'A',color:'#f00',options:[{id:'1',label:'One'},{id:'2',label:'Two'}]},{id:'b',label:'B',color:'#0f0',options:[{id:'3',label:'Three'}]}];
describe('mode components',()=>{
 it('drives every gallery card from playable metadata and returns to default',()=>{render(<Modes groups={groups} onResult={()=>{}} reducedMotion/>);expect(screen.getAllByText('Try this mode')).toHaveLength(MODE_METADATA.length);fireEvent.click(screen.getAllByText('Try this mode')[4]);expect(screen.getByRole('heading',{name:'Tournament',level:2})).toBeTruthy();fireEvent.click(screen.getByText('Return to default'));expect(screen.getByRole('heading',{name:'Sequential wheels',level:2})).toBeTruthy()});
 for(const mode of MODE_METADATA.filter(x=>!['sequential','nested'].includes(x.id))){
  it(`${mode.name} produces a normalized result`,async()=>{const result=vi.fn();render(<SelectionMode mode={mode} groups={groups} onResult={result} reducedMotion/>);const button=screen.getByRole('button',{name:mode.kind==='wheel'?new RegExp(`${mode.name} wheel`):`Play ${mode.name}`});fireEvent.click(button);await waitFor(()=>expect(result).toHaveBeenCalled());expect(result.mock.calls[0][0]).toMatchObject({mode:mode.id,groupId:expect.any(String),optionId:expect.any(String),selections:expect.any(Array),time:expect.any(String)})});
 }
 it('sequential wheels preserve the group-to-option relationship',async()=>{const result=vi.fn();render(<SelectionMode mode={MODE_METADATA[0]} groups={groups} onResult={result} reducedMotion/>);fireEvent.click(screen.getByText('Spin both'));await waitFor(()=>expect(result).toHaveBeenCalled());expect(groups.find(g=>g.id===result.mock.calls[0][0].groupId).options.some(o=>o.id===result.mock.calls[0][0].optionId)).toBe(true)});
 it('nested wheels rotate outer and inner rings independently',async()=>{const result=vi.fn();render(<SelectionMode mode={MODE_METADATA[2]} groups={groups} onResult={result} reducedMotion/>);fireEvent.click(screen.getByText('Rotate both rings'));await waitFor(()=>expect(result).toHaveBeenCalled());expect(screen.getByRole('button',{name:/Outer ring/})).toBeTruthy();expect(screen.getByRole('button',{name:/Inner ring/})).toBeTruthy()});
 it('honors disabled state',()=>{render(<SelectionMode mode={MODE_METADATA[4]} groups={groups} onResult={()=>{}} reducedMotion disabled/>);expect(screen.getByText('Play Tournament').disabled).toBe(true)});
});

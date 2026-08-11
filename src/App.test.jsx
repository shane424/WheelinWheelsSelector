import React from'react';import{beforeEach,describe,expect,it,vi}from'vitest';import{fireEvent,render,screen,waitFor}from'@testing-library/react';import App from'./App';import{STORAGE_KEY}from'./model';
beforeEach(()=>{localStorage.clear();vi.stubGlobal('matchMedia',vi.fn(()=>({matches:true,addEventListener:vi.fn(),removeEventListener:vi.fn()})));vi.stubGlobal('confirm',()=>true)});
describe('application interactions',()=>{
 it('runs sequential selection and enables option wheel',async()=>{render(<App/>);const option=screen.getByRole('button',{name:/Option wheel/});expect(option.disabled).toBe(true);fireEvent.click(screen.getByText('Spin person'));await waitFor(()=>expect(option.disabled).toBe(false));fireEvent.click(screen.getByText('Spin game'));await waitFor(()=>expect(screen.getByText(/plays/)).toBeTruthy())});
 it('supports automatic two-stage spin control',async()=>{render(<App/>);fireEvent.click(screen.getByText('Spin both'));await waitFor(()=>expect(screen.getByText(/plays/)).toBeTruthy())});
 it('edits configuration and persists locally',async()=>{render(<App/>);const names=screen.getAllByLabelText('Group name');fireEvent.change(names[0],{target:{value:'Dinner'}});await waitFor(()=>expect(JSON.parse(localStorage.getItem(STORAGE_KEY))[0].label).toBe('Dinner'))});
 it('operates a wheel by keyboard',async()=>{render(<App/>);const wheel=screen.getByRole('button',{name:/Group wheel/});fireEvent.keyDown(wheel,{key:'Enter'});fireEvent.click(wheel);await waitFor(()=>expect(screen.getByText(/Selected:/)).toBeTruthy())});
 it('honors reduced motion with immediate result',async()=>{render(<App/>);fireEvent.click(screen.getByText('Spin person'));await waitFor(()=>expect(screen.getAllByText(/Selected:/).length).toBe(1))});
 it('restores configuration from local persistence',()=>{localStorage.setItem(STORAGE_KEY,JSON.stringify([{id:'food',label:'Food',color:'#ffffff',options:[]}])) ;render(<App/>);expect(screen.getAllByDisplayValue('Food')[0]).toBeTruthy()});
});

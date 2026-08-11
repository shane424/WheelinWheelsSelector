import { useEffect, useState } from 'react';
import { Editor } from './Editor'; import { Modes } from './Modes';
import { cloneDefaults, configState, normalizeConfig, STORAGE_KEY } from './model';
function load(){try{const saved=JSON.parse(localStorage.getItem(STORAGE_KEY));return saved?normalizeConfig(saved):cloneDefaults()}catch{return cloneDefaults()}}
export default function App(){
 const [groups,setGroups]=useState(load); const [history,setHistory]=useState([]); const state=configState(groups);
 const reducedMotion=globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches??false;
 useEffect(()=>localStorage.setItem(STORAGE_KEY,JSON.stringify(groups)),[groups]);
 const addResult=record=>setHistory(items=>[record,...items].slice(0,30));
 return <><header><a className="brand" href="#main"><span>W</span> WHEELIN'</a><nav><a href="#chooser">Chooser</a><a href="#modes-title">Modes</a><a href="#editor-title">Editor</a></nav></header><main id="main">
 <section className="hero"><div><span className="eyebrow">ANY CHOICE. ZERO OVERTHINKING.</span><h1>Let the wheels<br/><i>decide.</i></h1><p>Games, meals, chores, adventures—add anything, then use an automatic two-stage spin to choose a group and one of its options.</p><a className="primary" href="#chooser">Start spinning ↓</a></div><div className="hero-orbit" aria-hidden="true"><div>SPIN</div><span>?</span></div></section>
 {state!=='ready'&&<div className={`notice ${state==='invalid'?'invalid':''}`}><b>{state==='empty'?'No groups yet.':'Configuration needs attention.'}</b> Use the editor to add named groups with options.</div>}
 <Modes groups={groups} onResult={addResult} reducedMotion={reducedMotion} disabled={state!=='ready'}/><Editor groups={groups} setGroups={setGroups}/>
 <section className="history panel"><div className="section-heading"><div><span className="eyebrow">RECENT PICKS</span><h2>Selection history</h2></div>{history.length>0&&<button onClick={()=>setHistory([])}>Clear</button>}</div>{!history.length?<p className="muted">No selections yet. Your last 30 results will appear here.</p>:<ol>{history.map((x,i)=><li key={x.time+i}><b>{x.group||x.mode}</b><span>{x.option}</span><time dateTime={x.time}>{new Date(x.time).toLocaleString()}</time></li>)}</ol>}</section>
 </main><footer><b>WHEELIN'</b><span>Built for decisions of every kind.</span></footer></>;
}

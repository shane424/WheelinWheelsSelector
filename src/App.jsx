import { useEffect, useState } from 'react';
import { Editor } from './Editor'; import { Modes } from './Modes';
import { cloneDefaultConfig, configState, exportHistory, HISTORY_LIMIT, HISTORY_STORAGE_KEY, normalizeConfiguration, parseHistory, selectableGroups, STORAGE_KEY } from './model';
function load(){try{const saved=JSON.parse(localStorage.getItem(STORAGE_KEY));return saved?normalizeConfiguration(saved):cloneDefaultConfig()}catch{return cloneDefaultConfig()}}
const loadHistory = () => parseHistory(localStorage.getItem(HISTORY_STORAGE_KEY));
const downloadHistory = (history, format) => {
 const type=format==='csv'?'text/csv':'application/json'; const a=document.createElement('a');
 a.href=URL.createObjectURL(new Blob([exportHistory(history,format)],{type})); a.download=`wheelin-history.${format}`; a.click(); URL.revokeObjectURL(a.href);
};
export default function App(){
 const [config,setConfig]=useState(load); const [history,setHistory]=useState(loadHistory); const {groups,metadata}=config; const state=configState(groups);
 const eligibleGroups=selectableGroups(groups); const skippedGroups=state==='ready'?groups.length-eligibleGroups.length:0;
 const skippedCount=['Zero','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten'][skippedGroups]??String(skippedGroups);
 const setGroups=groups=>setConfig(value=>({...value,groups:typeof groups==='function'?groups(value.groups):groups}));
 const setMetadata=metadata=>setConfig(value=>({...value,metadata:typeof metadata==='function'?metadata(value.metadata):metadata}));
 const reducedMotion=globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches??false;
 useEffect(()=>localStorage.setItem(STORAGE_KEY,JSON.stringify(config)),[config]);
 useEffect(()=>localStorage.setItem(HISTORY_STORAGE_KEY,JSON.stringify(history)),[history]);
 const addResult=record=>setHistory(items=>[record,...items].slice(0,HISTORY_LIMIT));
 return <><header><a className="brand" href="#main"><span>W</span> WHEELIN'</a><nav><a href="#chooser">Chooser</a><a href="#modes-title">Modes</a><a href="#editor-title">Editor</a></nav></header><main id="main">
 <section className="hero"><div><span className="eyebrow">ANY CHOICE. ZERO OVERTHINKING.</span><h1>Let the wheels<br/><i>decide.</i></h1><p>Games, meals, chores, adventures—add anything, then use an automatic two-stage spin to choose a group and one of its options.</p><a className="primary" href="#chooser">Start spinning ↓</a></div><div className="hero-orbit" aria-hidden="true"><div>SPIN</div><span>?</span></div></section>
 {state!=='ready'&&<div className={`notice ${state==='invalid'?'invalid':''}`}><b>{state==='empty'?'No groups yet.':'Configuration needs attention.'}</b> Use the editor to add named groups with options.</div>}
 {skippedGroups>0&&<div className="notice" role="status"><b>{skippedCount} {skippedGroups===1?'group':'groups'} without options {skippedGroups===1?'was':'were'} skipped.</b> Add a named option to include {skippedGroups===1?'it':'them'} in selections.</div>}
 <Modes groups={groups} terminology={metadata} onResult={addResult} reducedMotion={reducedMotion} disabled={state!=='ready'||!eligibleGroups.length}/><Editor groups={groups} setGroups={setGroups} terminology={metadata} setTerminology={setMetadata}/>
 <section className="history panel"><div className="section-heading"><div><span className="eyebrow">RECENT PICKS</span><h2>Selection history</h2></div>{history.length>0&&<div className="history-actions"><button onClick={()=>downloadHistory(history,'json')}>Export JSON</button><button onClick={()=>downloadHistory(history,'csv')}>Export CSV</button><button onClick={()=>setHistory([])}>Clear</button></div>}</div>{!history.length?<p className="muted">No selections yet. Your last 30 results will appear here.</p>:<ol>{history.map((x,i)=><li key={x.time+i}><b>{x.group||x.mode}</b><span>{x.option}</span><time dateTime={x.time}>{new Date(x.time).toLocaleString()}</time></li>)}</ol>}</section>
 </main><footer><b>WHEELIN'</b><span>Built for decisions of every kind.</span></footer></>;
}

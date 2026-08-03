import { useEffect, useRef, useState } from 'react';
import { Wheel } from './Wheel'; import { Editor } from './Editor'; import { Modes } from './Modes';
import { cloneDefaults, configState, optionsForGroup, STORAGE_KEY } from './model';
function load(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY))||cloneDefaults()}catch{return cloneDefaults()}}
export default function App(){
 const [groups,setGroups]=useState(load); const [chosenGroup,setChosenGroup]=useState(null); const [result,setResult]=useState(null); const [history,setHistory]=useState([]); const groupWheel=useRef(); const optionWheel=useRef(); const pendingBoth=useRef(false);
 useEffect(()=>localStorage.setItem(STORAGE_KEY,JSON.stringify(groups)),[groups]);
 useEffect(()=>{if(chosenGroup&&!groups.some(g=>g.id===chosenGroup.id)){setChosenGroup(null);setResult(null)}},[groups,chosenGroup]);
 const options=chosenGroup?optionsForGroup(groups,chosenGroup.id):[]; const state=configState(groups);
 const chooseGroup=g=>{setChosenGroup(g);setResult(null); if(pendingBoth.current)setTimeout(()=>optionWheel.current?.spin(),50)};
 const chooseOption=o=>{const record={group:chosenGroup.label,option:o.label,time:new Date().toISOString()};setResult(record);setHistory(h=>[record,...h].slice(0,30));pendingBoth.current=false};
 const spinBoth=()=>{if(groupWheel.current?.state==='spinning'||optionWheel.current?.state==='spinning')return;pendingBoth.current=true;groupWheel.current?.spin()};
 return <><header><a className="brand" href="#main"><span>W</span> WHEELIN'</a><nav><a href="#chooser">Chooser</a><a href="#modes-title">Modes</a><a href="#editor-title">Editor</a></nav></header><main id="main">
 <section className="hero"><div><span className="eyebrow">ANY CHOICE. ZERO OVERTHINKING.</span><h1>Let the wheels<br/><i>decide.</i></h1><p>Games, meals, chores, adventures—add anything, spin, and get moving.</p><a className="primary" href="#chooser">Start spinning ↓</a></div><div className="hero-orbit" aria-hidden="true"><div>SPIN</div><span>?</span></div></section>
 <section id="chooser" className="chooser panel"><div className="section-heading"><div><span className="eyebrow">DEFAULT MODE · SEQUENTIAL</span><h2>First who. Then what.</h2></div><span className={`status-pill ${state}`}>● {state}</span></div>
 {state==='invalid'?<div className="notice invalid"><b>Configuration needs attention.</b> Give every group a name and an options list in the editor.</div>:state==='empty'?<div className="notice"><b>No groups yet.</b> Add a group in the editor to start deciding.</div>:<><div className="wheel-stage"><div><span className="step">01 · GROUP</span><Wheel ref={groupWheel} items={groups} label="Group wheel" onSelect={chooseGroup}/></div><div className="stage-arrow">→</div><div><span className="step">02 · OPTION</span><Wheel ref={optionWheel} items={options} label="Option wheel" onSelect={chooseOption} disabled={!chosenGroup}/></div></div>
 <div className="spin-controls"><button className="primary" onClick={()=>groupWheel.current?.spin()}>Spin person</button><button className="primary alt" disabled={!chosenGroup||!options.length} onClick={()=>optionWheel.current?.spin()}>Spin game</button><button className="outline" onClick={spinBoth}>Spin both</button></div></>}
 <div className={`result-card ${result?'show':''}`} aria-live="polite">{result?<><span>THE WHEELS HAVE SPOKEN</span><h3>{result.group} <i>plays</i> {result.option}</h3><div><button onClick={spinBoth}>↻ Replay both</button><button onClick={()=>optionWheel.current?.spin()}>Re-spin option</button></div></>:<><span>YOUR RESULT WILL APPEAR HERE</span><p>Spin both wheels to make a selection.</p></>}</div>
 </section><Modes/><Editor groups={groups} setGroups={setGroups}/>
 <section className="history panel"><div className="section-heading"><div><span className="eyebrow">RECENT PICKS</span><h2>Selection history</h2></div>{history.length>0&&<button onClick={()=>setHistory([])}>Clear</button>}</div>{!history.length?<p className="muted">No selections yet. Your last 30 results will appear here.</p>:<ol>{history.map((x,i)=><li key={x.time+i}><b>{x.group}</b><span>{x.option}</span><time dateTime={x.time}>{new Date(x.time).toLocaleString()}</time></li>)}</ol>}</section>
 </main><footer><b>WHEELIN'</b><span>Built for decisions of every kind.</span></footer></>;
}

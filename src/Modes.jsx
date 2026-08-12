import { useEffect, useMemo, useRef, useState } from 'react';
import { Wheel } from './Wheel';
import { cascade, groupPlayoffs, historyRecord, knockout, pairsFromGroups, takeRandom, tournament } from './selection';
import { normalizeTerminology, secureWeightedIndex, selectableGroups } from './model';
const defaultTerminology = { groupNoun:'group', optionNoun:'option' };
const title = value => value.charAt(0).toUpperCase()+value.slice(1);

export const MODE_METADATA = [
  { id:'sequential', icon:'① → ②', name:'Sequential wheels', description:'Pick a group, then an option from only that group.', kind:'sequential', status:'implemented' },
  { id:'linked', icon:'◎ ◎', name:'Linked wheels', description:'One control runs an automatic two-stage spin: group first, then an option from that group.', kind:'slots', status:'implemented' },
  { id:'nested', icon:'◉', name:'Nested wheels', description:'Independently rotating inner and outer rings reveal a paired choice.', kind:'nested', status:'implemented' },
  { id:'giant', icon:'✹', name:'Giant wheel', description:'Every group-and-option pairing on one wheel.', kind:'wheel', status:'implemented' },
  { id:'tournament', icon:'🏆', name:'Tournament', description:'Choices compete through a generated elimination bracket.', kind:'tournament', status:'implemented' },
  { id:'slots', icon:'▥', name:'Slot reels', description:'Group and its related option reels stop in sequence.', kind:'slots', status:'implemented' },
  { id:'cascading', icon:'⌄⌄⌄', name:'Cascading choices', description:'Make a choice at each level of an arbitrary decision tree.', kind:'cascade', status:'implemented' },
  { id:'playoffs', icon:'◌ ◌ ◉', name:'Group playoffs', description:'Select one option from every group, then select the winning group.', kind:'playoffs', status:'implemented' },
  { id:'knockout', icon:'✕ ◯', name:'Knockout', description:'Remove one randomly selected candidate per round until one remains.', kind:'knockout', status:'implemented' },
  { id:'ranked', icon:'Ⅰ Ⅱ Ⅲ', name:'Ranked pointers', description:'Sample a unique ranked shortlist without replacement.', kind:'ranked', status:'implemented' },
  { id:'plinko', icon:'⫶', name:'Plinko', description:'Drop a puck through pins into an outcome slot.', kind:'plinko', status:'implemented' },
  { id:'skeeball', icon:'⛳', name:'Skee-ball', description:'Roll toward a target mapped to a configured choice.', kind:'skeeball', status:'implemented' },
  { id:'pachinko', icon:'◍', name:'Pachinko', description:'Bounce a ball through pegs into a choice pocket.', kind:'pachinko', status:'implemented' },
  { id:'marbles', icon:'● ↘', name:'Marble racing', description:'Race the configured choices to a selected winner.', kind:'marbles', status:'implemented' },
  { id:'dice', icon:'⚂', name:'Dice', description:'Roll a weighted custom face mapped to each configured choice.', kind:'dice', status:'implemented' },
  { id:'cards', icon:'🂠', name:'Cards', description:'Draw from a shuffled deck of the configured choices.', kind:'cards', status:'implemented' },
  { id:'raffle', icon:'🎟', name:'Raffle', description:'Pull one ticket from the configured choices.', kind:'raffle', status:'implemented' },
  { id:'darts', icon:'◎', name:'Darts', description:'Throw at weighted target regions representing available choices.', kind:'darts', status:'implemented' },
];

export const STATUS_LABELS = { implemented:'Implemented', preview:'Interactive preview', concept:'Concept' };
export const STATUS_MEANINGS = {
  implemented:'Complete interactive mechanic that simulates the named mode.',
  preview:'Interactive simplified visualization that selects a result without fully simulating the named mechanic.',
  concept:'Noninteractive design card only.',
};

function Result({ record }) {
  return <div className={`result-card ${record ? 'show' : ''}`} aria-live="polite">
    {record ? <><span>THE MODE HAS SPOKEN</span><h3>{record.group && <>{record.group} <i>—</i> </>}{record.option}</h3></>
      : <><span>YOUR RESULT WILL APPEAR HERE</span><p>Play this mode to make a selection.</p></>}
  </div>;
}

function Sequential({ groups, onResult, reducedMotion, disabled, terminology=defaultTerminology }) {
  const [group,setGroup]=useState(null); const [record,setRecord]=useState(null); const groupRef=useRef(); const optionRef=useRef(); const pending=useRef(false); const combinedActive=useRef(false);
  const chooseGroup=value=>{setGroup(value);if(pending.current)setTimeout(()=>{if(!optionRef.current?.spin()){pending.current=false;combinedActive.current=false}},reducedMotion?0:30)};
  const chooseOption=option=>{const candidate={group,option};const value=historyRecord('sequential',candidate);pending.current=false;combinedActive.current=false;setRecord(value);onResult(value)};
  const spinBoth=()=>{if(combinedActive.current||groupRef.current?.state==='spinning'||optionRef.current?.state==='spinning')return;combinedActive.current=true;pending.current=true;if(!groupRef.current?.spin()){pending.current=false;combinedActive.current=false}};
  useEffect(()=>setGroup(current=>{
    const next=current&&groups.find(candidate=>candidate.id===current.id);
    if(!next){pending.current=false;combinedActive.current=false;}
    return next??null;
  }),[groups]);
  const {groupNoun,optionNoun}=normalizeTerminology(terminology);
  return <><p className="muted">First {groupNoun}. Then {optionNoun}.</p><div className="wheel-stage"><div><span className="step">01 · {groupNoun.toUpperCase()}</span><Wheel ref={groupRef} items={groups} onSelect={chooseGroup} disabled={disabled} reducedMotion={reducedMotion} label={`${title(groupNoun)} wheel`}/></div><div className="stage-arrow">→</div><div><span className="step">02 · {optionNoun.toUpperCase()}</span><Wheel ref={optionRef} items={group?.options ?? []} onSelect={chooseOption} disabled={disabled||!group} reducedMotion={reducedMotion} label={`${title(optionNoun)} wheel`}/></div></div><div className="spin-controls"><button className="primary" onClick={()=>groupRef.current?.spin()} disabled={disabled}>Spin {groupNoun}</button><button className="primary alt" onClick={()=>optionRef.current?.spin()} disabled={disabled||!group}>Spin {optionNoun}</button><button className="outline" onClick={spinBoth} disabled={disabled}>Spin both</button></div><Result record={record}/></>;
}

function Giant({ pairs, onResult, reducedMotion, disabled, mode }) {
  const [record,setRecord]=useState(null);
  return <><Wheel items={pairs} label={`${mode.name} wheel`} disabled={disabled} reducedMotion={reducedMotion} onSelect={item=>{const value=historyRecord(mode.id,item);setRecord(value);onResult(value)}}/><Result record={record}/></>;
}

function Concept({ mode }) {
  return <div className="notice"><p><strong>{mode.name}</strong> is a noninteractive design concept.</p></div>;
}

function Mechanic({ mode, groups, pairs, onResult, reducedMotion, disabled }) {
  const [record,setRecord]=useState(null); const [display,setDisplay]=useState([]); const [playing,setPlaying]=useState(false); const timer=useRef();
  useEffect(()=>()=>clearTimeout(timer.current),[]);
  const play=()=>{
    if(disabled||playing||!pairs.length)return;
    let candidate; let selections=[];
    if(mode.kind==='knockout'){const value=knockout(pairs);candidate=value.winner;selections=[...value.eliminated.map(x=>`✕ ${x.label}`),`★ ${value.winner.label}`];}
    else if(mode.kind==='ranked'){const value=takeRandom(pairs,Math.min(3,pairs.length));candidate=value[0];selections=value.map((x,i)=>`${i+1}. ${x.label}`);}
    else if(mode.kind==='playoffs'){const value=groupPlayoffs(groups);candidate=value.winner;selections=value.finalists.map(x=>`${x===value.winner?'★':'○'} ${x.label}`);}
    else if(mode.kind==='tournament'){const value=tournament(pairs);candidate=value.winner;selections=value.rounds.map((round,i)=>`Round ${i+1}: ${round.map(match=>match.winner.label).join(' · ')}`);}
    else if(mode.kind==='cascade'){
      const tree=groups.map(g=>({...g,children:g.options?.map(o=>({...o,group:g,option:o}))})); const path=cascade(tree); candidate=path.at(-1); selections=path.map(x=>x.label);
    } else if(mode.kind==='slots'){
      const group=groups.filter(g=>g.options?.length)[secureWeightedIndex(groups.filter(g=>g.options?.length))]; const option=group.options[secureWeightedIndex(group.options)]; candidate={id:`${group.id}:${option.id}`,label:`${group.label} · ${option.label}`,group,option}; selections=[group.label,option.label];
    } else {candidate=pairs[secureWeightedIndex(pairs)];selections=[candidate.label];}
    const value=historyRecord(mode.id,candidate,{selections});
    setPlaying(true); setDisplay(selections); // outcome is fixed before visual animation begins
    clearTimeout(timer.current); timer.current=setTimeout(()=>{setRecord(value);setPlaying(false);onResult(value)},reducedMotion?0:700);
  };
  return <><ModeVisual mode={mode} display={display} playing={playing}/><div className="spin-controls"><button className="primary" onClick={play} disabled={disabled||playing||!pairs.length}>Play {mode.name}</button></div><Result record={record}/></>;
}

function ModeVisual({mode,display,playing}) {
  const glyph=mode.id==='dice'?'⚄':mode.id==='cards'?'🂠':mode.id==='raffle'?'🎟':mode.icon;
  const special=['plinko','pachinko','skeeball','darts','marbles','slots','dice','cards','raffle'].includes(mode.kind);
  return <div className={`mechanic mechanic-${mode.kind} ${playing?'playing':''}`} data-testid={`${mode.id}-visual`} aria-label={`${mode.name} animation`}>
    {(mode.kind==='plinko'||mode.kind==='pachinko')&&<div className={`peg-board ${mode.kind}`}><div className="peg-grid">{Array.from({length:22},(_,i)=><i key={i}/>)}</div><b>●</b><footer><span/><span/><span/><span/></footer></div>}
    {mode.kind==='skeeball'&&<div className="skee-machine"><div className="score-rings"><i>100</i><i>50</i><i>25</i></div><div className="skee-lane"><b>●</b></div></div>}
    {mode.kind==='darts'&&<div className="dart-cabinet"><div className="dart-target"><b>➳</b></div><small>WHEELIN' DARTS</small></div>}
    {mode.kind==='marbles'&&<div className="race-track">{[0,1,2].map(i=><div key={i}><em>Lane {i+1}</em><i>●</i><b>⚑</b></div>)}</div>}
    {mode.kind==='slots'&&<div className="slot-machine"><header>LUCKY PICK</header><div>{[display[0]||'GROUP',display[1]||'OPTION'].map((x,i)=><span key={i}>{x}</span>)}</div><b>●</b></div>}
    {mode.kind==='dice'&&<div className="dice-table"><strong>{glyph}</strong><i/><i/></div>}
    {mode.kind==='cards'&&<div className="card-table"><i/><i/><strong>{glyph}</strong></div>}
    {mode.kind==='raffle'&&<div className="raffle-drum"><span>● ● ●</span><strong>{glyph}</strong></div>}
    {!special&&<strong>{glyph}</strong>}
    {mode.kind!=='slots'&&<VisualResults kind={mode.kind} display={display}/>}
  </div>;
}

function VisualResults({kind,display}) {
  if(!display.length)return <div className="mechanic-empty">Press play to set everything in motion</div>;
  const label=kind==='tournament'?'BRACKET':kind==='knockout'?'ELIMINATION BOARD':kind==='playoffs'?'FINALISTS':kind==='ranked'?'PODIUM':kind==='cascade'?'DECISION PATH':'RESULT';
  return <section className={`mechanic-results results-${kind}`}><small>{label}</small><div>{display.map((x,i)=><span key={`${x}-${i}`} data-place={i+1}>{x}</span>)}</div></section>;
}

function Nested({ groups, pairs, onResult, reducedMotion, disabled, mode }) {
  const groupRef=useRef(); const optionRef=useRef(); const [group,setGroup]=useState(null); const [record,setRecord]=useState(null);
  const play=()=>groupRef.current?.spin();
  const selectedGroup=g=>{setGroup(g);setTimeout(()=>optionRef.current?.spin(),reducedMotion?0:30)};
  useEffect(()=>setGroup(current=>current ? groups.find(candidate=>candidate.id===current.id)??null : null),[groups]);
  return <><div className="nested-rings"><Wheel ref={groupRef} items={groups} label="Outer ring" onSelect={selectedGroup} disabled={disabled} reducedMotion={reducedMotion}/><Wheel ref={optionRef} items={group?.options??[]} label="Inner ring" onSelect={option=>{const value=historyRecord(mode.id,{group,option});setRecord(value);onResult(value)}} disabled={disabled||!group} reducedMotion={reducedMotion} size="small"/></div><div className="spin-controls"><button className="primary" onClick={play} disabled={disabled}>Rotate both rings</button></div><Result record={record}/></>;
}

export function SelectionMode({ mode, groups, onResult, reducedMotion=false, disabled=false, terminology=defaultTerminology }) {
  const eligibleGroups=useMemo(()=>selectableGroups(groups),[groups]);
  const pairs=useMemo(()=>pairsFromGroups(eligibleGroups),[eligibleGroups]);
  const selectionDisabled=disabled||!eligibleGroups.length;
  if(mode.status==='concept')return <Concept mode={mode}/>;
  if(mode.id==='sequential')return <Sequential groups={eligibleGroups} {...{onResult,reducedMotion,terminology}} disabled={selectionDisabled}/>;
  if(mode.kind==='wheel')return <Giant {...{pairs,onResult,reducedMotion,mode}} disabled={selectionDisabled}/>;
  if(mode.kind==='nested')return <Nested groups={eligibleGroups} {...{pairs,onResult,reducedMotion,mode}} disabled={selectionDisabled}/>;
  return <Mechanic groups={eligibleGroups} {...{mode,pairs,onResult,reducedMotion}} disabled={selectionDisabled}/>;
}

export function Modes({ groups, onResult, reducedMotion=false, disabled=false, terminology=defaultTerminology }) {
  const [activeId,setActiveId]=useState('sequential'); const active=MODE_METADATA.find(m=>m.id===activeId)??MODE_METADATA[0];
  const nouns=normalizeTerminology(terminology);
  const activate=id=>{setActiveId(id);setTimeout(()=>document.querySelector('#chooser')?.scrollIntoView?.({behavior:reducedMotion?'auto':'smooth'}),0)};
  return <><section id="chooser" className="chooser panel" aria-labelledby="chooser-title"><div className="section-heading"><div><span className="eyebrow">ACTIVE MODE · {active.name.toUpperCase()}</span><h2 id="chooser-title">{active.name}</h2><p className="muted">{active.id==='sequential'?`Pick the ${nouns.groupNoun}, then the ${nouns.optionNoun} from only that ${nouns.groupNoun}.`:active.description}</p></div>{active.id!=='sequential'&&<button className="outline" onClick={()=>setActiveId('sequential')}>Return to default</button>}</div><SelectionMode key={active.id} mode={active} {...{groups,onResult,reducedMotion,disabled,terminology:nouns}}/></section>
  <section className="modes" aria-labelledby="modes-title"><span className="eyebrow">WAYS TO DECIDE</span><h2 id="modes-title">Spin modes</h2><p className="muted">Every format uses the same configured choices and honors their relative weights.</p><div className="mode-grid">{MODE_METADATA.map((m,i)=><article className={`mode-card ${m.id===active.id?'active':''}`} key={m.id}><div className={`mode-demo demo-${i}`} aria-hidden="true"><span>{m.icon}</span></div><div><h3>{m.name} {m.id==='sequential'&&<em>DEFAULT</em>}</h3><div className="mode-badges"><span className={`mode-badge ${m.status??'concept'}`}>{STATUS_LABELS[m.status??'concept']}</span></div><p>{m.description}</p>{m.status!=='concept'&&<button className="text-button" onClick={()=>activate(m.id)} aria-pressed={m.id===active.id}>{m.status==='preview'?'Try interactive preview':'Play this mode'}</button>}</div></article>)}</div></section></>;
}

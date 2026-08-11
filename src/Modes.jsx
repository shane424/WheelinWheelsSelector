import { useEffect, useMemo, useRef, useState } from 'react';
import { Wheel } from './Wheel';
import { cascade, groupPlayoffs, historyRecord, knockout, pairsFromGroups, takeRandom, tournament } from './selection';
import { secureIndex } from './model';

export const MODE_METADATA = [
  { id:'sequential', icon:'① → ②', name:'Sequential wheels', description:'Pick a group, then an option from only that group.', kind:'sequential' },
  { id:'linked', icon:'◎ ◎', name:'Linked wheels', description:'Spin group and option wheels from one control; the option follows the selected group.', kind:'slots' },
  { id:'nested', icon:'◉', name:'Nested wheels', description:'Independently rotating inner and outer rings reveal a paired choice.', kind:'nested' },
  { id:'giant', icon:'✹', name:'Giant wheel', description:'Every group-and-option pairing on one wheel.', kind:'wheel' },
  { id:'tournament', icon:'🏆', name:'Tournament', description:'Choices compete through a generated elimination bracket.', kind:'tournament' },
  { id:'slots', icon:'▥', name:'Slot reels', description:'Group and its related option reels stop in sequence.', kind:'slots' },
  { id:'cascading', icon:'⌄⌄⌄', name:'Cascading choices', description:'Make a choice at each level of an arbitrary decision tree.', kind:'cascade' },
  { id:'playoffs', icon:'◌ ◌ ◉', name:'Group playoffs', description:'Select one option from every group, then select the winning group.', kind:'playoffs' },
  { id:'knockout', icon:'✕ ◯', name:'Knockout', description:'Remove one randomly selected candidate per round until one remains.', kind:'knockout' },
  { id:'ranked', icon:'Ⅰ Ⅱ Ⅲ', name:'Ranked pointers', description:'Sample a unique ranked shortlist without replacement.', kind:'ranked' },
  { id:'plinko', icon:'⫶', name:'Plinko', description:'Drop a puck through pins into an outcome slot.', kind:'motion' },
  { id:'skeeball', icon:'⛳', name:'Skee-ball', description:'Roll toward a target mapped to a configured choice.', kind:'motion' },
  { id:'pachinko', icon:'◍', name:'Pachinko', description:'Bounce a ball through pegs into a choice pocket.', kind:'motion' },
  { id:'marbles', icon:'● ↘', name:'Marble racing', description:'Race the configured choices to a selected winner.', kind:'motion' },
  { id:'dice', icon:'⚂', name:'Dice', description:'Roll a fair custom face mapped to each configured choice.', kind:'alternate' },
  { id:'cards', icon:'🂠', name:'Cards', description:'Draw from a shuffled deck of the configured choices.', kind:'alternate' },
  { id:'raffle', icon:'🎟', name:'Raffle', description:'Pull one ticket from the configured choices.', kind:'alternate' },
  { id:'darts', icon:'◎', name:'Darts', description:'Throw at equal target regions representing available choices.', kind:'motion' },
];

function Result({ record }) {
  return <div className={`result-card ${record ? 'show' : ''}`} aria-live="polite">
    {record ? <><span>THE MODE HAS SPOKEN</span><h3>{record.group && <>{record.group} <i>plays</i> </>}{record.option}</h3></>
      : <><span>YOUR RESULT WILL APPEAR HERE</span><p>Play this mode to make a selection.</p></>}
  </div>;
}

function Sequential({ groups, onResult, reducedMotion, disabled }) {
  const [group,setGroup]=useState(null); const [record,setRecord]=useState(null); const groupRef=useRef(); const optionRef=useRef(); const pending=useRef(false);
  const chooseGroup=value=>{setGroup(value);if(pending.current)setTimeout(()=>optionRef.current?.spin(),reducedMotion?0:30)};
  const chooseOption=option=>{const candidate={group,option};const value=historyRecord('sequential',candidate);setRecord(value);onResult(value)};
  const spinBoth=()=>{pending.current=true;groupRef.current?.spin()};
  return <><div className="wheel-stage"><div><span className="step">01 · GROUP</span><Wheel ref={groupRef} items={groups} onSelect={chooseGroup} disabled={disabled} reducedMotion={reducedMotion} label="Group wheel"/></div><div className="stage-arrow">→</div><div><span className="step">02 · OPTION</span><Wheel ref={optionRef} items={group?.options ?? []} onSelect={chooseOption} disabled={disabled||!group} reducedMotion={reducedMotion} label="Option wheel"/></div></div><div className="spin-controls"><button className="primary" onClick={()=>groupRef.current?.spin()} disabled={disabled}>Spin person</button><button className="primary alt" onClick={()=>optionRef.current?.spin()} disabled={disabled||!group}>Spin game</button><button className="outline" onClick={spinBoth} disabled={disabled}>Spin both</button></div><Result record={record}/></>;
}

function Giant({ pairs, onResult, reducedMotion, disabled, mode }) {
  const [record,setRecord]=useState(null);
  return <><Wheel items={pairs} label={`${mode.name} wheel`} disabled={disabled} reducedMotion={reducedMotion} onSelect={item=>{const value=historyRecord(mode.id,item);setRecord(value);onResult(value)}}/><Result record={record}/></>;
}

function Mechanic({ mode, groups, pairs, onResult, reducedMotion, disabled }) {
  const [record,setRecord]=useState(null); const [display,setDisplay]=useState([]); const [playing,setPlaying]=useState(false); const timer=useRef();
  useEffect(()=>()=>clearTimeout(timer.current),[]);
  const play=()=>{
    if(disabled||playing||!pairs.length)return;
    let candidate; let selections=[];
    if(mode.kind==='knockout'){const value=knockout(pairs);candidate=value.winner;selections=value.eliminated.map(x=>x.label);}
    else if(mode.kind==='ranked'){const value=takeRandom(pairs,Math.min(3,pairs.length));candidate=value[0];selections=value.map(x=>x.label);}
    else if(mode.kind==='playoffs'){const value=groupPlayoffs(groups);candidate=value.winner;selections=value.finalists.map(x=>x.label);}
    else if(mode.kind==='tournament'){const value=tournament(pairs);candidate=value.winner;selections=value.rounds.map(round=>round.map(match=>match.winner.label).join(' / '));}
    else if(mode.kind==='cascade'){
      const tree=groups.map(g=>({...g,children:g.options?.map(o=>({...o,group:g,option:o}))})); const path=cascade(tree); candidate=path.at(-1); selections=path.map(x=>x.label);
    } else if(mode.kind==='slots'){
      const group=groups.filter(g=>g.options?.length)[secureIndex(groups.filter(g=>g.options?.length).length)]; const option=group.options[secureIndex(group.options.length)]; candidate={id:`${group.id}:${option.id}`,label:`${group.label} · ${option.label}`,group,option}; selections=[group.label,option.label];
    } else {candidate=pairs[secureIndex(pairs.length)];selections=[candidate.label];}
    const value=historyRecord(mode.id,candidate,{selections});
    setPlaying(true); setDisplay(selections); // outcome is fixed before visual animation begins
    clearTimeout(timer.current); timer.current=setTimeout(()=>{setRecord(value);setPlaying(false);onResult(value)},reducedMotion?0:700);
  };
  const glyph=mode.id==='dice'?'⚄':mode.id==='cards'?'🂠':mode.id==='raffle'?'🎟':mode.icon;
  return <><div className={`mechanic mechanic-${mode.kind} ${playing?'playing':''}`} data-testid={`${mode.id}-visual`} aria-hidden="true"><strong>{glyph}</strong><div>{display.map((x,i)=><span key={`${x}-${i}`}>{x}</span>)}</div></div><div className="spin-controls"><button className="primary" onClick={play} disabled={disabled||playing||!pairs.length}>Play {mode.name}</button></div><Result record={record}/></>;
}

function Nested({ groups, pairs, onResult, reducedMotion, disabled, mode }) {
  const groupRef=useRef(); const optionRef=useRef(); const [group,setGroup]=useState(null); const [record,setRecord]=useState(null);
  const play=()=>groupRef.current?.spin();
  const selectedGroup=g=>{setGroup(g);setTimeout(()=>optionRef.current?.spin(),reducedMotion?0:30)};
  return <><div className="nested-rings"><Wheel ref={groupRef} items={groups} label="Outer ring" onSelect={selectedGroup} disabled={disabled} reducedMotion={reducedMotion}/><Wheel ref={optionRef} items={group?.options??[]} label="Inner ring" onSelect={option=>{const value=historyRecord(mode.id,{group,option});setRecord(value);onResult(value)}} disabled={disabled||!group} reducedMotion={reducedMotion} size="small"/></div><div className="spin-controls"><button className="primary" onClick={play} disabled={disabled}>Rotate both rings</button></div><Result record={record}/></>;
}

export function SelectionMode({ mode, groups, onResult, reducedMotion=false, disabled=false }) {
  const pairs=useMemo(()=>pairsFromGroups(groups),[groups]);
  if(mode.id==='sequential')return <Sequential {...{groups,onResult,reducedMotion,disabled}}/>;
  if(mode.kind==='wheel')return <Giant {...{pairs,onResult,reducedMotion,disabled,mode}}/>;
  if(mode.kind==='nested')return <Nested {...{groups,pairs,onResult,reducedMotion,disabled,mode}}/>;
  return <Mechanic {...{mode,groups,pairs,onResult,reducedMotion,disabled}}/>;
}

export function Modes({ groups, onResult, reducedMotion=false, disabled=false }) {
  const [activeId,setActiveId]=useState('sequential'); const active=MODE_METADATA.find(m=>m.id===activeId)??MODE_METADATA[0];
  const activate=id=>{setActiveId(id);setTimeout(()=>document.querySelector('#chooser')?.scrollIntoView?.({behavior:reducedMotion?'auto':'smooth'}),0)};
  return <><section id="chooser" className="chooser panel" aria-labelledby="chooser-title"><div className="section-heading"><div><span className="eyebrow">ACTIVE MODE · {active.name.toUpperCase()}</span><h2 id="chooser-title">{active.name}</h2><p className="muted">{active.description}</p></div>{active.id!=='sequential'&&<button className="outline" onClick={()=>setActiveId('sequential')}>Return to default</button>}</div><SelectionMode key={active.id} mode={active} {...{groups,onResult,reducedMotion,disabled}}/></section>
  <section className="modes" aria-labelledby="modes-title"><span className="eyebrow">WAYS TO DECIDE</span><h2 id="modes-title">Spin modes</h2><p className="muted">Every format uses the same configured choices and equal random selection.</p><div className="mode-grid">{MODE_METADATA.map((m,i)=><article className={`mode-card ${m.id===active.id?'active':''}`} key={m.id}><div className={`mode-demo demo-${i}`} aria-hidden="true"><span>{m.icon}</span></div><div><h3>{m.name} {m.id==='sequential'&&<em>DEFAULT</em>}</h3><p>{m.description}</p><button className="text-button" onClick={()=>activate(m.id)} aria-pressed={m.id===active.id}>Try this mode</button></div></article>)}</div></section></>;
}

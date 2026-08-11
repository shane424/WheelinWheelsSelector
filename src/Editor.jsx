import { useRef, useState } from 'react';
import { cloneDefaults, parseConfig } from './model';
const uid = prefix => `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
const weightHelp = 'Weight controls how likely this option is to be selected. A weight of 3 is three times as likely as a weight of 1. A weight of 0 keeps the option visible but prevents it from being selected.';
export function Editor({ groups, setGroups }) {
  const [message,setMessage] = useState(''); const file = useRef();
  const updateGroup = (i, patch) => setGroups(groups.map((g,n)=>n===i?{...g,...patch}:g));
  const move = (list, from, to) => { const next=[...list]; const [x]=next.splice(from,1); next.splice(to,0,x); return next; };
  const addGroup = () => setGroups([...groups,{id:uid('group'),label:'New group',color:'#b877f2',options:[]}]);
  const addOption = i => updateGroup(i,{options:[...groups[i].options,{id:uid('option'),label:'New option',color:groups[i].color,weight:1}]});
  const updateOption = (gi, oi, patch) => updateGroup(gi,{options:groups[gi].options.map((o,n)=>n===oi?{...o,...patch}:o)});
  const importFile = async e => { try { setGroups(parseConfig(await e.target.files[0].text())); setMessage('Configuration imported.'); } catch(err) { setMessage(`Import failed: ${err.message}`); } e.target.value=''; };
  const exportFile = () => { const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([JSON.stringify(groups,null,2)],{type:'application/json'})); a.download='wheelin-configuration.json'; a.click(); URL.revokeObjectURL(a.href); setMessage('Configuration exported.'); };
  return <section className="editor panel" aria-labelledby="editor-title"><div className="section-heading"><div><span className="eyebrow">MAKE IT YOURS</span><h2 id="editor-title">Wheel editor</h2></div><button className="primary small" onClick={addGroup}>＋ Add group</button></div>
    <p className="muted">Every name, color, option, and selection weight is yours to change. Your edits save automatically on this device.</p>
    <p className="muted weight-helper" id="weight-help">{weightHelp}</p>
    <div className="group-list">{groups.map((group,gi)=><article className="group-card" key={group.id}>
      <div className="edit-row"><input aria-label={`${group.label} color`} type="color" value={group.color} onChange={e=>updateGroup(gi,{color:e.target.value})}/><input aria-label="Group name" value={group.label} onChange={e=>updateGroup(gi,{label:e.target.value})}/><div className="row-actions"><button aria-label={`Move ${group.label} up`} disabled={!gi} onClick={()=>setGroups(move(groups,gi,gi-1))}>↑</button><button aria-label={`Move ${group.label} down`} disabled={gi===groups.length-1} onClick={()=>setGroups(move(groups,gi,gi+1))}>↓</button><button className="danger" aria-label={`Delete ${group.label}`} onClick={()=>setGroups(groups.filter((_,i)=>i!==gi))}>×</button></div></div>
      <div className="options">{group.options.map((option,oi)=><div className="option-row" key={option.id}><span className="drag">⋮⋮</span><input aria-label={`Option in ${group.label}`} value={option.label} onChange={e=>updateOption(gi,oi,{label:e.target.value})}/><label className="weight-field" title={weightHelp}><span>Weight</span><input type="number" min="0" step="1" inputMode="numeric" aria-label={`Weight for ${option.label} in ${group.label}`} aria-describedby="weight-help" value={option.weight ?? 1} onChange={e=>updateOption(gi,oi,{weight:Math.max(0, Math.floor(Number(e.target.value) || 0))})}/></label><span className="weight-note" title={weightHelp}>ⓘ</span><button aria-label={`Move ${option.label} up`} disabled={!oi} onClick={()=>updateGroup(gi,{options:move(group.options,oi,oi-1)})}>↑</button><button aria-label={`Move ${option.label} down`} disabled={oi===group.options.length-1} onClick={()=>updateGroup(gi,{options:move(group.options,oi,oi+1)})}>↓</button><button className="danger" aria-label={`Delete ${option.label}`} onClick={()=>updateGroup(gi,{options:group.options.filter((_,n)=>n!==oi)})}>×</button></div>)}</div>
      <button className="text-button" onClick={()=>addOption(gi)}>＋ Add option</button>
    </article>)}</div>
    <div className="config-controls"><button onClick={()=>{if(confirm('Reset all groups and options?'))setGroups(cloneDefaults())}}>↻ Reset defaults</button><button onClick={()=>file.current.click()}>⇧ Import JSON</button><button onClick={exportFile}>⇩ Export JSON</button><input ref={file} hidden type="file" accept="application/json,.json" onChange={importFile}/></div><p role="status" className="muted">{message}</p>
  </section>;
}

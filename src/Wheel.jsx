import { forwardRef, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { alignedWeightedRotation, secureIndex, secureWeightedIndex, weightedSegments } from './model';

const palette = ['#ff6b6b','#f7c948','#4dd4ac','#6c8cff','#b877f2','#ff8f5c','#43b7d4'];
export const Wheel = forwardRef(function Wheel({ items = [], label = 'Selection wheel', onSelect, disabled = false, duration = 2400, size = 'large', reducedMotion, weightedDisplay = true }, ref) {
  const [rotation, setRotation] = useState(0); const [state, setState] = useState('idle'); const [result, setResult] = useState(''); const timer = useRef();
  const safe = items.filter(item => item && String(item.label).trim());
  const segments = useMemo(() => weightedDisplay ? weightedSegments(safe) : weightedSegments(safe.map(item => ({ ...item, weight: 1 }))), [safe, weightedDisplay]);
  const background = useMemo(() => safe.length ? `conic-gradient(${safe.map((item,i) => `${item.color || palette[i%palette.length]} ${segments[i].start}deg ${segments[i].end}deg`).join(',')})` : '#292744', [safe, segments]);
  const spin = () => {
    if (state === 'spinning' || disabled || !safe.length) return false;
    const index = secureWeightedIndex(safe); const chosen = safe[index];
    const reduced = reducedMotion ?? (globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false); const ms = reduced ? 0 : duration;
    const next = alignedWeightedRotation(rotation, weightedDisplay ? safe : safe.map(item => ({ ...item, weight: 1 })), index, reduced ? 0 : 5 + secureIndex(3));
    setState('spinning'); setResult(''); setRotation(next); clearTimeout(timer.current);
    timer.current = setTimeout(() => { setState('selected'); setResult(chosen.label); onSelect?.(chosen, index); }, ms); return true;
  };
  useImperativeHandle(ref, () => ({ spin, state }), [state, safe, rotation]);
  const status = !safe.length ? 'empty' : state;
  return <div className={`wheel-unit ${size}`} data-state={status}><div className="wheel-wrap"><div className="pointer" aria-hidden="true" />
    <button className="wheel" type="button" aria-label={`${label}. ${safe.length ? 'Press Enter or Space to spin.' : 'No options available.'}`} disabled={disabled || !safe.length || state==='spinning'} onClick={spin} style={{background, transform:`rotate(${rotation}deg)`, transitionDuration: state==='spinning' ? `${reducedMotion ? 0 : duration}ms` : '0ms'}}>
      {safe.map((item,i) => <span key={item.id ?? i} className="segment-label" style={{transform:`rotate(${segments[i].center}deg) translateY(-41%)`}}><b style={{transform:`rotate(-${segments[i].center + rotation}deg)`}}>{item.label}</b></span>)}<i className="hub" />
    </button></div><p className="wheel-state">{status === 'empty' ? 'Add an option to begin' : status === 'spinning' ? 'Spinning…' : status === 'selected' ? `Selected: ${result}` : 'Ready to spin'}</p>
    <ul className="wheel-legend" aria-label={`${label} weighted choices`}>{safe.map((item,i)=><li key={item.id??i}><i style={{background:item.color||palette[i%palette.length]}} />{item.label} <span>weight {item.weight??1}</span></li>)}</ul>
    <span className="sr-only" role="status" aria-live="polite">{result && `${label} selected ${result}`}</span></div>;
});

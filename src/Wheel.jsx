import { forwardRef, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { alignedRotation, secureIndex, weightedIndex } from './model';

const palette = ['#ff6b6b','#f7c948','#4dd4ac','#6c8cff','#b877f2','#ff8f5c','#43b7d4'];
export const Wheel = forwardRef(function Wheel({ items = [], label = 'Selection wheel', onSelect, disabled = false, duration = 2400, size = 'large' }, ref) {
  const [rotation, setRotation] = useState(0);
  const [state, setState] = useState('idle');
  const [result, setResult] = useState('');
  const timer = useRef();
  const safe = items.filter(item => item && String(item.label).trim());
  const background = useMemo(() => safe.length ? `conic-gradient(${safe.map((item,i) => `${item.color || palette[i%palette.length]} ${i*360/safe.length}deg ${(i+1)*360/safe.length}deg`).join(',')})` : '#292744', [safe]);
  const spin = () => {
    if (state === 'spinning' || disabled || !safe.length) return false;
    const index = weightedIndex(safe);
    if (index === null) return false;
    const chosen = safe[index]; // selection is fixed before visual animation starts
    const reduced = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    const ms = reduced ? 0 : duration;
    const next = alignedRotation(rotation, index, safe.length, reduced ? 0 : 5 + secureIndex(3));
    setState('spinning'); setResult(''); setRotation(next);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => { setState('selected'); setResult(chosen.label); onSelect?.(chosen, index); }, ms);
    return true;
  };
  useImperativeHandle(ref, () => ({ spin, state }), [state, safe, rotation]);
  const status = !safe.length ? 'empty' : state;
  return <div className={`wheel-unit ${size}`} data-state={status}>
    <div className="wheel-wrap">
      <div className="pointer" aria-hidden="true" />
      <button className="wheel" type="button" aria-label={`${label}. ${safe.length ? 'Press Enter or Space to spin.' : 'No options available.'}`} disabled={disabled || !safe.length || state==='spinning'} onClick={spin} style={{background, transform:`rotate(${rotation}deg)`, transitionDuration: state==='spinning' ? `${duration}ms` : '0ms'}}>
        {safe.map((item,i) => <span key={item.id ?? i} className="segment-label" style={{transform:`rotate(${(i+.5)*360/safe.length}deg) translateY(-41%)`}}><b style={{transform:`rotate(-${(i+.5)*360/safe.length + rotation}deg)`}}>{item.label}</b></span>)}
        <i className="hub" />
      </button>
    </div>
    <p className="wheel-state">{status === 'empty' ? 'Add an option to begin' : status === 'spinning' ? 'Spinning…' : status === 'selected' ? `Selected: ${result}` : 'Ready to spin'}</p>
    <span className="sr-only" role="status" aria-live="polite">{result && `${label} selected ${result}`}</span>
  </div>;
});

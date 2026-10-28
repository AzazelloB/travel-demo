import { useEffect, useMemo, useRef, useState } from 'react';
import { Crosshair, MapPin, Minus, Plus, X } from 'lucide-react';
import type { Content } from '../shared/types';
import { copy } from '../shared/types';
import { useStore } from './store';
interface Props { places: Content[]; selected?: string; onSelect?: (id: string) => void; route?: boolean; groups?: Content[][]; editable?: boolean; onMove?: (id: string, lat: number, lng: number) => void | Promise<unknown>; onAdd?: (lat: number, lng: number) => void; regional?: boolean }
export function TravelMap({ places, selected, onSelect, route, groups, editable, onMove, onAdd, regional }: Props) {
  const { lang } = useStore();
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [adding, setAdding] = useState(false);
  const [moving, setMoving] = useState<{ id: string; lat: number; lng: number } | null>(null);
  const drag = useRef<{ id?: string; x: number; y: number; ox: number; oy: number; moved: boolean } | null>(null);
  const svg = useRef<SVGSVGElement>(null);
  const bounds = useMemo(() => {
    if (regional || !places.length) return { minLng: 14, maxLng: 24.5, minLat: 48.6, maxLat: 55.5 };
    const lngs = places.map(p => p.lng || 0), lats = places.map(p => p.lat || 0);
    const dx = Math.max(...lngs) - Math.min(...lngs), dy = Math.max(...lats) - Math.min(...lats);
    return { minLng: Math.min(...lngs) - Math.max(dx * .35, .015), maxLng: Math.max(...lngs) + Math.max(dx * .35, .015), minLat: Math.min(...lats) - Math.max(dy * .35, .015), maxLat: Math.max(...lats) + Math.max(dy * .35, .015) };
  }, [places, regional]);
  const xy = (p: Content) => ({ x: 70 + (((moving?.id === p.id ? moving.lng : p.lng) || 0) - bounds.minLng) / (bounds.maxLng - bounds.minLng) * 660, y: 450 - (((moving?.id === p.id ? moving.lat : p.lat) || 0) - bounds.minLat) / (bounds.maxLat - bounds.minLat) * 390 });
  useEffect(() => {
    const place = places.find(p => p.id === selected);
    if (place) { const point = xy(place); setOffset({ x: (400 - point.x) * zoom, y: (240 - point.y) * zoom }); }
  }, [selected]);
  function coordinates(clientX: number, clientY: number) {
    const matrix = svg.current!.getScreenCTM();
    const point = new DOMPoint(clientX, clientY).matrixTransform(matrix!.inverse());
    return { x: (point.x - offset.x - 400) / zoom + 400, y: (point.y - offset.y - 260) / zoom + 260 };
  }
  function geo(x: number, y: number) { return { lng: bounds.minLng + (x - 70) / 660 * (bounds.maxLng - bounds.minLng), lat: bounds.minLat + (450 - y) / 390 * (bounds.maxLat - bounds.minLat) }; }
  const focused = places.find(p => p.id === selected);
  return <div className={`travel-map ${adding ? 'adding' : ''}`}>
    <svg ref={svg} viewBox="0 0 800 520" aria-label="Interactive illustrated map" role="group" onPointerDown={e => { if ((e.target as Element).closest('[data-marker]')) return; svg.current!.setPointerCapture(e.pointerId); drag.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y, moved: false }; }} onPointerMove={e => {
      if (!drag.current) return;
      if (Math.abs(e.clientX - drag.current.x) + Math.abs(e.clientY - drag.current.y) > 5) drag.current.moved = true;
      if (!drag.current.id) { const scale = 800 / svg.current!.getBoundingClientRect().width; setOffset({ x: drag.current.ox + (e.clientX - drag.current.x) * scale, y: drag.current.oy + (e.clientY - drag.current.y) * scale }); }
      else { const p = coordinates(e.clientX, e.clientY); const g = geo(p.x, p.y); setMoving({ id: drag.current.id, ...g }); }
    }} onPointerUp={e => {
      if (drag.current?.id && editable && drag.current.moved) { const p = coordinates(e.clientX, e.clientY); const g = geo(p.x, p.y); Promise.resolve(onMove?.(drag.current.id, g.lat, g.lng)).finally(() => setMoving(null)); }
      else if (adding && !drag.current?.moved) { const p = coordinates(e.clientX, e.clientY); const g = geo(p.x, p.y); onAdd?.(g.lat, g.lng); setAdding(false); }
      drag.current = null;
    }}>
      <defs><pattern id="mapgrid" width="45" height="45" patternUnits="userSpaceOnUse"><path d="M45 0H0V45" fill="none" stroke="#decbe4" strokeWidth=".5"/></pattern><pattern id="trees" width="90" height="80" patternUnits="userSpaceOnUse"><path d="m23 20-7 13h14z m40 30-7 13h14z" fill="#c49bc9" opacity=".4"/></pattern></defs>
      <rect width="800" height="520" fill="#f5eaf5"/>
      <g transform={`translate(${offset.x} ${offset.y}) translate(400 260) scale(${zoom}) translate(-400 -260)`}>
        <rect x="-1500" y="-1500" width="3800" height="3500" fill="url(#mapgrid)"/>
        {regional ? <><path d="M20 40Q200 140 350 70T800 20V-100H0Z" fill="#e3d4ed"/><path d="M130 115 240 140 350 112 440 80 522 112 630 133 676 228 644 300 701 390 600 461 485 432 418 473 300 432 215 395 175 300 111 220Z" fill="#fff8fc" stroke="#d6bfdb" strokeWidth="2"/><path d="M450 95Q520 200 430 270T430 440" fill="none" stroke="#d4bfdf" strokeWidth="6"/><text x="250" y="80">BALTIC SEA</text><text x="365" y="290" className="country-label">POLAND</text><text x="75" y="330">GERMANY</text><text x="520" y="495">SLOVAKIA</text><text x="640" y="440">UKRAINE</text></> : <><path d="M-50 400Q200 250 350 320T850 140" fill="none" stroke="#e3cdea" strokeWidth="150"/><rect width="800" height="520" fill="url(#trees)"/><path d="M0 150Q210 80 310 230T850 360" fill="none" stroke="#d5bee4" strokeWidth="12"/><path d="M-20 270Q210 170 400 340T830 390M150 -20Q260 220 600 550" fill="none" stroke="#fffafd" strokeWidth="8"/><path d="M-20 270Q210 170 400 340T830 390M150 -20Q260 220 600 550" fill="none" stroke="#d5bfdb" strokeWidth="2" strokeDasharray="5 6"/></>}
        {route && (groups || [places]).map((line, i) => <g key={i} opacity={selected && !line.some(p => p.id === selected) ? .3 : 1}><polyline points={line.map(p => { const q = xy(p); return `${q.x},${q.y}`; }).join(' ')} fill="none" stroke="#fff8fc" strokeWidth="9" strokeLinejoin="round"/><polyline points={line.map(p => { const q = xy(p); return `${q.x},${q.y}`; }).join(' ')} fill="none" stroke={selected && line.some(p => p.id === selected) ? '#8d3a91' : '#b95cae'} strokeWidth="4" strokeDasharray="8 6" strokeLinejoin="round"/></g>)}
        {places.map(p => { const q = xy(p); return <g key={p.id} data-marker="true" tabIndex={0} role="button" aria-label={copy(p.title, lang)} className="map-marker" transform={`translate(${q.x} ${q.y})`} onPointerDown={e => { e.stopPropagation(); if (editable) { svg.current!.setPointerCapture(e.pointerId); drag.current = { id: p.id, x: e.clientX, y: e.clientY, ox: 0, oy: 0, moved: false }; } }} onClick={() => onSelect?.(p.id)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onSelect?.(p.id); }}><title>{copy(p.title, lang)}</title><circle r={selected === p.id ? 15 : 11} fill={selected === p.id ? '#b95cae' : '#8d4b9a'} stroke="#fff8fc" strokeWidth="4"/><circle r="3" fill="white"/>{regional && <text y="29" textAnchor="middle">{copy(p.title, lang)}</text>}</g>; })}
      </g>
    </svg>
    <div className="map-controls"><button aria-label="Zoom in" onClick={() => setZoom(z => Math.min(5, z + .4))}><Plus size={17}/></button><button aria-label="Zoom out" onClick={() => setZoom(z => Math.max(.6, z - .4))}><Minus size={17}/></button><button aria-label="Reset map" onClick={() => { setZoom(1); setOffset({ x: 0, y: 0 }); }}><Crosshair size={17}/></button>{editable && onAdd && <button className={adding ? 'active' : ''} title="Add a place: click the map" onClick={() => setAdding(!adding)}><MapPin size={17}/></button>}</div>
    <span className="map-caption">{adding ? 'Click the map to add a place' : 'Illustrated map · drag to explore'}</span>
    {focused && <div className="map-preview"><img src={focused.image} alt=""/><div><strong>{copy(focused.title, lang)}</strong><small>{focused.category || focused.region || 'Route stop'}</small></div><button aria-label="Close map preview" onClick={() => onSelect?.('')}><X size={16}/></button></div>}
  </div>;
}

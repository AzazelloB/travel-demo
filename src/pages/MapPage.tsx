import { geoNaturalEarth1, geoPath } from 'd3-geo';
import type { FeatureCollection, Geometry } from 'geojson';
import { Clock3, Minus, Plus } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { feature } from 'topojson-client';
import type { GeometryCollection, Topology } from 'topojson-specification';
import world from 'world-atlas/countries-110m.json';
import { copy } from '../../shared/types';
import { useStore } from '../context/Store';
import { Dropdown } from '../ui/Dropdown';

const topology = world as unknown as Topology<{ countries: GeometryCollection }>;
const countries = feature(
  topology,
  topology.objects.countries,
) as unknown as FeatureCollection<Geometry>;
const projection = geoNaturalEarth1().scale(190).translate([500, 270]);
const path = geoPath(projection);
const palette = [
  '#d88ebd',
  '#bc93db',
  '#e9a9cf',
  '#a78ad2',
  '#e994b4',
  '#c9a2e4',
  '#dc9fd4',
  '#b699df',
];
const regions = [
  { id: 'europe', en: 'Europe', pl: 'Europa', center: [14, 50], zoom: 3.8 },
  { id: 'world', en: 'World', pl: 'Świat', center: [0, 20], zoom: 1 },
  { id: 'americas', en: 'Americas', pl: 'Ameryki', center: [-85, 20], zoom: 1.8 },
  { id: 'asia', en: 'Asia', pl: 'Azja', center: [95, 35], zoom: 2 },
  { id: 'africa', en: 'Africa', pl: 'Afryka', center: [20, 5], zoom: 2 },
  { id: 'oceania', en: 'Oceania', pl: 'Oceania', center: [135, -25], zoom: 2 },
];
function view(region: (typeof regions)[number]) {
  const [x, y] = projection(region.center as [number, number])!;
  return { zoom: region.zoom, x: 500 - x * region.zoom, y: 270 - y * region.zoom };
}
const initial = view(regions[0]);
export function WorldMap() {
  const { content, lang } = useStore();
  const [zoom, setZoom] = useState(initial.zoom);
  const [offset, setOffset] = useState({ x: initial.x, y: initial.y });
  const [region, setRegion] = useState('europe');
  const [selected, setSelected] = useState('');
  const [pinned, setPinned] = useState(false);
  const [previewPosition, setPreviewPosition] = useState({
    x: 0,
    y: 0,
    width: 300,
    bridgeY: 0,
    side: 'right',
  });
  const [closing, setClosing] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<SVGSVGElement>(null);
  const transform = useRef({ zoom: initial.zoom, x: initial.x, y: initial.y });
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{
    distance: number;
    zoom: number;
    x: number;
    y: number;
    centerX: number;
    centerY: number;
  } | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const destinations = content.filter(
    (c) => c.kind === 'destination' && c.published && c.lat != null && c.lng != null,
  );
  const active = destinations.find((c) => c.id === selected);
  const tours = content.filter(
    (c) => c.kind === 'trip' && c.published && c.destinationId === active?.id,
  );
  const show = (id: string, marker: SVGGElement) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    const bounds = container.current!.getBoundingClientRect();
    const target = marker.getBoundingClientRect();
    const _px = target.left + target.width / 2 - bounds.left;
    const py = target.top + target.height / 2 - bounds.top;
    const markerLeft = target.left - bounds.left,
      markerRight = target.right - bounds.left;
    const desiredWidth = Math.min(bounds.width <= 600 ? 230 : 300, bounds.width - 28);
    const availableRight = Math.max(0, bounds.width - 14 - markerRight - 12);
    const availableLeft = Math.max(0, markerLeft - 12 - 14);
    const side =
      availableRight >= desiredWidth || availableRight >= availableLeft ? 'right' : 'left';
    const width = Math.min(desiredWidth, side === 'right' ? availableRight : availableLeft);
    const height = Math.min(bounds.width <= 600 ? 325 : 390, bounds.height - 28);
    const x = side === 'right' ? markerRight + 12 : markerLeft - width - 12;
    const y = Math.max(14, Math.min(bounds.height - height - 14, py - 40));
    setPreviewPosition({
      x,
      y,
      width,
      side,
      bridgeY: Math.max(0, Math.min(height - 32, py - y - 16)),
    });
    setClosing(false);
    setSelected(id);
  };
  useEffect(() => {
    const close = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (closeTimer.current) clearTimeout(closeTimer.current);
        setPinned(false);
        setSelected('');
      }
    };
    window.addEventListener('keydown', close);
    return () => {
      window.removeEventListener('keydown', close);
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);
  const setView = useCallback((next: { zoom: number; x: number; y: number }) => {
    transform.current = next;
    setZoom(next.zoom);
    setOffset({ x: next.x, y: next.y });
  }, []);
  const svgPoint = useCallback((clientX: number, clientY: number) => {
    const m = map.current?.getScreenCTM();
    return m ? new DOMPoint(clientX, clientY).matrixTransform(m.inverse()) : new DOMPoint(500, 270);
  }, []);
  const zoomAt = useCallback(
    (factor: number, x: number, y: number) => {
      const current = transform.current;
      const next = Math.max(1, Math.min(12, current.zoom * factor));
      const ratio = next / current.zoom;
      setView({ zoom: next, x: x - (x - current.x) * ratio, y: y - (y - current.y) * ratio });
    },
    [setView],
  );
  useEffect(() => {
    const svg = map.current;
    if (!svg) return;
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      const point = svgPoint(e.clientX, e.clientY);
      zoomAt(Math.exp(-e.deltaY * 0.0015), point.x, point.y);
      setSelected('');
      setPinned(false);
    };
    svg.addEventListener('wheel', wheel, { passive: false });
    return () => svg.removeEventListener('wheel', wheel);
  }, [zoomAt, svgPoint]);
  const leave = () => {
    if (!pinned) {
      if (closeTimer.current) clearTimeout(closeTimer.current);
      setClosing(true);
      closeTimer.current = setTimeout(() => {
        setSelected('');
        setClosing(false);
      }, 120);
    }
  };
  const enterPreview = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setClosing(false);
  };
  const changeZoom = (factor: number) => zoomAt(factor, 500, 270);
  return (
    <div className="relative h-full overflow-hidden bg-water" ref={container}>
      <svg
        ref={map}
        className="block size-full cursor-grab touch-none active:cursor-grabbing"
        viewBox="0 0 1000 540"
        preserveAspectRatio="xMidYMid slice"
        aria-label={
          lang === 'pl' ? 'Mapa świata z kierunkami podróży' : 'World map with destinations'
        }
        role="group"
        onPointerDown={(e) => {
          if ((e.target as Element).closest('[data-destination]')) return;
          e.currentTarget.setPointerCapture(e.pointerId);
          pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
          if (pointers.current.size === 1) {
            drag.current = {
              x: e.clientX,
              y: e.clientY,
              ox: transform.current.x,
              oy: transform.current.y,
            };
          }
          if (pointers.current.size === 2) {
            const [a, b] = [...pointers.current.values()];
            const midpoint = svgPoint((a.x + b.x) / 2, (a.y + b.y) / 2);
            pinch.current = {
              distance: Math.hypot(a.x - b.x, a.y - b.y),
              ...transform.current,
              centerX: midpoint.x,
              centerY: midpoint.y,
            };
            drag.current = null;
          }
          setPinned(false);
          setSelected('');
        }}
        onPointerMove={(e) => {
          if (!pointers.current.has(e.pointerId)) return;
          pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
          if (pointers.current.size >= 2 && pinch.current) {
            const [a, b] = [...pointers.current.values()];
            const midpoint = svgPoint((a.x + b.x) / 2, (a.y + b.y) / 2);
            const start = pinch.current;
            const next = Math.max(
              1,
              Math.min(
                12,
                (start.zoom * Math.hypot(a.x - b.x, a.y - b.y)) / Math.max(start.distance, 1),
              ),
            );
            const ratio = next / start.zoom;
            setView({
              zoom: next,
              x: midpoint.x - (start.centerX - start.x) * ratio,
              y: midpoint.y - (start.centerY - start.y) * ratio,
            });
          } else if (drag.current) {
            const rect = e.currentTarget.getBoundingClientRect();
            const scale = Math.min(1000 / rect.width, 540 / rect.height);
            setView({
              zoom: transform.current.zoom,
              x: drag.current.ox + (e.clientX - drag.current.x) * scale,
              y: drag.current.oy + (e.clientY - drag.current.y) * scale,
            });
          }
        }}
        onPointerUp={(e) => {
          pointers.current.delete(e.pointerId);
          pinch.current = null;
          if (pointers.current.size === 1) {
            const p = [...pointers.current.values()][0];
            drag.current = { x: p.x, y: p.y, ox: transform.current.x, oy: transform.current.y };
          } else drag.current = null;
        }}
        onPointerCancel={(e) => {
          pointers.current.delete(e.pointerId);
          pinch.current = null;
          drag.current = null;
        }}
      >
        <rect width="1000" height="540" fill="#f8e9f2" />
        <g transform={`translate(${offset.x} ${offset.y}) scale(${zoom})`}>
          {countries.features.map((country, i) => (
            <path
              key={String(country.id)}
              d={path(country) || ''}
              fill={palette[i % palette.length]}
              stroke="#fff9fc"
              strokeWidth="1.2"
              strokeLinejoin="round"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          ))}
          {destinations.map((d) => {
            const point = projection([d.lng!, d.lat!]);
            if (!point) return null;
            return (
              <g
                data-destination="true"
                key={d.id}
                role="button"
                tabIndex={0}
                aria-label={copy(d.title, lang)}
                transform={`translate(${point[0]} ${point[1]})`}
                onPointerEnter={(e) => {
                  if (e.pointerType !== 'touch') {
                    setPinned(false);
                    show(d.id, e.currentTarget);
                  }
                }}
                onPointerLeave={leave}
                onFocus={(e) => {
                  show(d.id, e.currentTarget);
                }}
                onBlur={leave}
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.matchMedia('(hover: none)').matches && pinned && selected === d.id) {
                    setPinned(false);
                    setSelected('');
                  } else {
                    setPinned(window.matchMedia('(hover: none)').matches);
                    show(d.id, e.currentTarget);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setPinned(true);
                    show(d.id, e.currentTarget);
                  }
                }}
                className="cursor-pointer hover:[&>circle:first-child]:fill-accent focus-visible:outline-none focus-visible:[&>circle:first-child]:stroke-primary-dark"
              >
                <circle r={8 / zoom} fill="#a748a3" stroke="#fff9fc" strokeWidth={2 / zoom} />
                <circle r={2 / zoom} fill="white" />
              </g>
            );
          })}
        </g>
      </svg>
      <div className="absolute bottom-6 right-6 flex items-center gap-1.5 rounded-2xl bg-white p-1.5 shadow-lg max-sm:bottom-3 max-sm:right-3 [&>button]:size-10 [&>button]:rounded-xl [&>button]:text-primary [&>button]:hover:bg-lilac">
        <Dropdown
          className="block"
          label="Region"
          value={region}
          options={regions.map((r) => ({ value: r.id, label: r[lang] }))}
          upward
          onChange={(value) => {
            const r = regions.find((r) => r.id === value)!;
            const v = view(r);
            setRegion(r.id);
            setView(v);
            setSelected('');
            setPinned(false);
          }}
        />
        <button type="button" aria-label="Zoom in" onClick={() => changeZoom(1.3)}>
          <Plus />
        </button>
        <button type="button" aria-label="Zoom out" onClick={() => changeZoom(1 / 1.3)}>
          <Minus />
        </button>
      </div>
      {active && (
        <div
          key={active.id}
          className={`absolute z-10 w-75 max-w-preview animate-preview-in transition duration-100 [&.closing]:translate-y-1 [&.closing]:opacity-0 before:absolute before:top-bridge before:h-8 before:w-7 data-[side=right]:before:-left-7 data-[side=left]:before:-right-7 ${closing ? 'closing' : ''}`}
          data-side={previewPosition.side}
          style={
            {
              left: previewPosition.x,
              top: previewPosition.y,
              width: previewPosition.width,
              '--bridge-y': `${previewPosition.bridgeY}px`,
            } as React.CSSProperties
          }
          onPointerEnter={enterPreview}
          onPointerLeave={leave}
          onFocus={enterPreview}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node)) leave();
          }}
        >
          <div className="relative w-full overflow-hidden rounded-2xl bg-white shadow-xl [&>img]:h-40 max-sm:[&>img]:h-28 [&_h2]:mb-4 [&_h2]:mt-1.5 [&_h2]:text-4xl max-sm:[&_h2]:text-3xl">
            <img src={active.image} alt="" />
            <div className="p-5 max-sm:p-4 [&>a]:flex [&>a]:items-center [&>a]:justify-between [&>a]:rounded-xl [&>a]:bg-lilac [&>a]:px-3 [&>a]:py-3 [&>a]:text-sm [&>a]:font-bold [&>a]:text-primary [&>a]:hover:bg-surface">
              <span className="block text-xs font-bold uppercase tracking-widest text-muted">
                {active.region}
              </span>
              <h2>{copy(active.title, lang)}</h2>
              {tours.length ? (
                <div className="mb-4 grid grid-cols-stats items-start gap-3 border-t border-line pt-3 [&>div]:flex [&>div]:flex-col [&>div]:gap-1 [&_span]:text-2xs [&_span]:font-bold [&_span]:uppercase [&_span]:tracking-widest [&_span]:text-muted [&_strong]:flex [&_strong]:min-h-7 [&_strong]:items-center [&_strong]:gap-1.5 [&_strong]:whitespace-nowrap [&_strong]:text-base [&_strong]:font-bold">
                  <div className="">
                    <span>{lang === 'pl' ? 'CZAS' : 'DURATION'}</span>
                    <strong>
                      <Clock3 size={17} />
                      {tours[0].duration} {lang === 'pl' ? 'dni' : 'days'}
                    </strong>
                  </div>
                  <div className="items-end [&_strong]:text-2xl [&_strong]:text-accent">
                    <span>{lang === 'pl' ? 'OD' : 'FROM'}</span>
                    <strong>
                      {tours[0].price?.toLocaleString(lang === 'pl' ? 'pl-PL' : 'en-GB')} zł
                    </strong>
                  </div>
                </div>
              ) : (
                <p className="mb-4 text-sm text-muted">
                  {lang === 'pl' ? 'Wycieczki wkrótce' : 'Tours coming soon'}
                </p>
              )}
              <Link to={tours[0] ? `/trips/${tours[0].slug}` : `/destinations/${active.slug}`}>
                {lang === 'pl' ? 'Zobacz wycieczki' : 'Explore tours'}{' '}
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import * as maplibregl from 'maplibre-gl';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import 'maplibre-gl/dist/maplibre-gl.css';
import { routeMapStyle } from './routeMapStyle';
import { registerLandmarkIcons } from './landmarkIcons';

maplibregl.setWorkerUrl(workerUrl);

import './RouteMap.css';
import { Footprints, MapPin, Plus, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { type Content, copy, type Lang, type RouteMapPath, type RouteMapPoint, type RouteStep } from '../../../shared/types';

interface Props {
  places: Content[];
  details?: Record<string, RouteStep>;
  paths?: RouteMapPath[];
  points?: RouteMapPoint[];
  selected: string;
  onSelect: (id: string) => void;
  editable: boolean;
  onMove: (id: string, lat: number, lng: number) => void;
  onAdd: (lat: number, lng: number) => void;
  lang: Lang;
}

export function RouteMap({ places, details, paths = [], points = [], selected, onSelect, editable, onMove, onAdd, lang }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markers = useRef(new Map<string, { marker: maplibregl.Marker; open: () => void }>());
  const activePopup = useRef<maplibregl.Popup | null>(null);
  const callbacks = useRef({ onSelect, onMove, onAdd });
  callbacks.current = { onSelect, onMove, onAdd };
  const addingRef = useRef(false);
  const [adding, setAdding] = useState(false);
  const data = JSON.stringify({ places, details });
  const overlayData = JSON.stringify({ points, paths, stops: places.map(({ lng, lat }) => [lng, lat]) });

  useEffect(() => {
    if (!container.current) return;
    const instance = new maplibregl.Map({
      container: container.current,
      style: routeMapStyle,
      center: [12.49, 41.89],
      zoom: 14,
      attributionControl: { compact: true },
      dragRotate: false,
      pitchWithRotate: false,
    });
    map.current = instance;
    registerLandmarkIcons(instance);
    instance.scrollZoom.disable();
    instance.touchZoomRotate.disableRotation();
    instance.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    instance.on('click', (event: maplibregl.MapMouseEvent) => {
      if (!addingRef.current) return;
      callbacks.current.onAdd(event.lngLat.lat, event.lngLat.lng);
      addingRef.current = false;
      setAdding(false);
    });
    return () => {
      instance.remove();
      instance.getContainer().style.removeProperty('min-height');
      map.current = null;
    };
  }, []);

  useEffect(() => {
    const instance = map.current;
    if (!instance) return;
    const { places: current, details: stepDetails }: { places: Content[]; details?: Record<string, RouteStep> } = JSON.parse(data);
    const located = current.filter(
      (place) =>
        place.lat != null &&
        place.lng != null &&
        Number.isFinite(place.lat) &&
        Number.isFinite(place.lng),
    );
    const updateLabels = () => {
      const source = instance.getSource('route-stops') as maplibregl.GeoJSONSource | undefined;
      source?.setData({
        type: 'FeatureCollection',
        features: located.map((place) => ({
          type: 'Feature',
          properties: { name: copy(place.title, lang) },
          geometry: { type: 'Point', coordinates: [place.lng!, place.lat!] },
        })),
      });
    };
    if (instance.getSource('route-stops')) updateLabels();
    else instance.once('load', updateLabels);
    const created: { marker: maplibregl.Marker; popup: maplibregl.Popup }[] = [];
    markers.current.clear();
    let closeTimer: ReturnType<typeof setTimeout> | undefined;
    let pinned: maplibregl.Popup | null = null;
    const cancelClose = () => clearTimeout(closeTimer);
    const queueClose = (popup: maplibregl.Popup) => {
      cancelClose();
      if (pinned !== popup) closeTimer = setTimeout(() => popup.remove(), 120);
    };
    for (const [index, place] of located.entries()) {
      const detail = stepDetails?.[place.id];
      const element = document.createElement('button');
      element.type = 'button';
      element.className =
        'route-stop-marker size-10 rounded-full border-4 border-white bg-primary-dark font-sans text-base font-bold text-white shadow-lg transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';
      element.textContent = String(index + 1);
      element.setAttribute('aria-label', copy(place.title, lang));
      const marker = new maplibregl.Marker({ element, draggable: editable })
        .setLngLat([place.lng!, place.lat!])
        .addTo(instance);
      const popup = document.createElement('div');
      popup.className = 'w-md max-w-full overflow-hidden rounded-2xl';
      const image = document.createElement('img');
      image.src = place.image;
      image.alt = '';
      image.className = 'h-56 w-full object-cover';
      const body = document.createElement('div');
      body.className = 'p-5';
      const title = document.createElement('strong');
      title.className = 'min-w-0 font-display text-2xl font-bold leading-tight text-ink';
      title.textContent = copy(place.title, lang);
      const note = document.createElement('span');
      note.className = 'absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-bold text-primary';
      const minutes = detail?.minutes || place.duration;
      if (minutes) {
        const clock = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        clock.setAttribute('viewBox', '0 0 24 24');
        clock.setAttribute('width', '16');
        clock.setAttribute('height', '16');
        clock.setAttribute('fill', 'none');
        clock.setAttribute('stroke', 'currentColor');
        clock.setAttribute('stroke-width', '2');
        clock.setAttribute('aria-hidden', 'true');
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', '12');
        circle.setAttribute('cy', '12');
        circle.setAttribute('r', '10');
        const hands = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        hands.setAttribute('d', 'M12 6v6l4 2');
        clock.appendChild(circle);
        clock.appendChild(hands);
        note.appendChild(clock);
        note.appendChild(document.createTextNode(`${minutes} min`));
      }
      const description = document.createElement('p');
      description.className = 'mt-2 text-sm leading-relaxed text-muted';
      description.textContent = new DOMParser().parseFromString(copy(detail?.description || place.description, lang), 'text/html').body.textContent;
      const mapsLink = document.createElement('a');
      mapsLink.href = `https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`;
      mapsLink.target = '_blank';
      mapsLink.rel = 'noopener noreferrer';
      mapsLink.className = 'inline-flex size-10 shrink-0 items-center justify-center rounded-full text-primary transition-colors hover:bg-lilac';
      const mapsLabel = lang === 'pl' ? 'Otwórz w Google Maps' : 'Open in Google Maps';
      mapsLink.setAttribute('aria-label', mapsLabel);
      mapsLink.title = mapsLabel;
      const mapsIcon = document.createElement('span');
      mapsIcon.className = 'route-map-google-icon';
      mapsIcon.setAttribute('aria-hidden', 'true');
      mapsLink.appendChild(mapsIcon);
      const heading = document.createElement('div');
      heading.className = 'flex items-center justify-between gap-3';
      heading.appendChild(title);
      heading.appendChild(mapsLink);
      body.appendChild(heading);
      body.appendChild(description);
      if (detail?.admission) {
        const admission = document.createElement('p');
        admission.className = 'mt-3 text-sm font-bold text-primary';
        admission.textContent = copy(detail.admission, lang);
        body.appendChild(admission);
      }
      if (detail?.hours) {
        const hours = document.createElement('p');
        hours.className = 'mt-2 text-xs leading-relaxed text-muted';
        hours.textContent = copy(detail.hours, lang);
        body.appendChild(hours);
      }
      const imageWrap = document.createElement('div');
      imageWrap.className = 'relative';
      imageWrap.appendChild(image);
      if (minutes) imageWrap.appendChild(note);
      popup.appendChild(imageWrap);
      popup.appendChild(body);
      const preview = new maplibregl.Popup({
        closeButton: false,
        offset: 20,
        maxWidth: 'min(448px, calc(100% - 32px))',
        className: 'route-map-popup',
        focusAfterOpen: false,
      }).setDOMContent(popup);
      const open = () => {
        cancelClose();
        if (activePopup.current !== preview) activePopup.current?.remove();
        activePopup.current = preview;
        for (const other of created) if (other.popup !== preview) other.popup.remove();
        preview.setLngLat(marker.getLngLat());
        if (!preview.isOpen()) preview.addTo(instance);
        // Leave enough room above or below a marker for the complete popup.
        const mapElement = instance.getContainer();
        const requiredHeight = popup.offsetHeight * 2 + 48;
        if (requiredHeight > mapElement.clientHeight) {
          mapElement.style.minHeight = `${requiredHeight}px`;
          instance.resize();
        }
      };
      popup.addEventListener('pointerenter', cancelClose);
      popup.addEventListener('pointerleave', () => queueClose(preview));
      popup.addEventListener('focusin', cancelClose);
      popup.addEventListener('focusout', (event) => {
        if (!popup.contains(event.relatedTarget as Node)) queueClose(preview);
      });
      element.addEventListener('pointerenter', (event) => {
        if (event.pointerType !== 'touch') open();
      });
      element.addEventListener('pointerleave', () => queueClose(preview));
      element.addEventListener('focus', open);
      element.addEventListener('blur', () => queueClose(preview));
      element.addEventListener('click', (event) => {
        event.stopPropagation();
        callbacks.current.onSelect(place.id);
        open();
        pinned = preview;
      });
      preview.on('close', () => {
        if (pinned === preview) pinned = null;
      });
      marker.on('dragend', () => {
        const point = marker.getLngLat();
        callbacks.current.onMove(place.id, point.lat, point.lng);
      });
      created.push({ marker, popup: preview });
      markers.current.set(place.id, { marker, open });
    }
    if (located.length) {
      const bounds = new maplibregl.LngLatBounds();
      for (const place of located) bounds.extend([place.lng!, place.lat!]);
      instance.fitBounds(bounds, { padding: 32, maxZoom: 15, duration: 0 });
    }
    // Separate neighbouring stop badges (e.g. a museum and its square) without
    // changing their geographic coordinates or making hover move the hitbox.
    const spreadNearby = () => {
      const assigned = new Set<number>();
      located.forEach((place, index) => {
        if (assigned.has(index)) return;
        const point = instance.project([place.lng!, place.lat!]);
        const group = located.flatMap((other, otherIndex) => {
          if (assigned.has(otherIndex)) return [];
          const projected = instance.project([other.lng!, other.lat!]);
          return Math.hypot(point.x - projected.x, point.y - projected.y) < 44 ? [otherIndex] : [];
        });
        group.forEach((member, position) => {
          assigned.add(member);
          created[member].marker.setOffset([(position - (group.length - 1) / 2) * 44, 0]);
        });
      });
    };
    spreadNearby();
    instance.on('moveend', spreadNearby);
    instance.on('resize', spreadNearby);
    return () => {
      cancelClose();
      instance.off('load', updateLabels);
      instance.off('moveend', spreadNearby);
      instance.off('resize', spreadNearby);
      for (const item of created) {
        item.popup.remove();
        item.marker.remove();
      }
      markers.current.clear();
    };
  }, [data, editable, lang]);

  useEffect(() => {
    const instance = map.current;
    if (!instance) return;
    const overlay: { points: RouteMapPoint[]; paths: RouteMapPath[]; stops: [number | null, number | null][] } = JSON.parse(overlayData);
    const update = () => {
      const pathSource = instance.getSource('route-path') as maplibregl.GeoJSONSource | undefined;
      pathSource?.setData({
        type: 'FeatureCollection',
        features: overlay.paths.map((path) => ({ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: path.coordinates } })),
      });
      const pointSource = instance.getSource('route-context') as maplibregl.GeoJSONSource | undefined;
      pointSource?.setData({
        type: 'FeatureCollection',
        features: overlay.points.map((point) => ({ type: 'Feature', properties: { name: copy(point.title, lang) }, geometry: { type: 'Point', coordinates: point.coordinates } })),
      });
    };
    if (instance.getSource('route-path')) update();
    else instance.once('load', update);
    const created: { marker: maplibregl.Marker; popup: maplibregl.Popup }[] = [];
    const timers = new Set<ReturnType<typeof setTimeout>>();
    for (const point of overlay.points) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `size-8 border-2 border-white font-sans text-xs font-bold shadow-md transition-colors hover:bg-lilac ${point.kind === 'metro' ? 'rounded-lg bg-ink text-white hover:text-ink' : 'rounded-full bg-white text-primary'}`;
      button.setAttribute('aria-label', copy(point.title, lang));
      if (point.kind === 'metro') button.textContent = 'M';
      else {
        const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        icon.setAttribute('viewBox', '0 0 24 24');
        icon.setAttribute('width', '17');
        icon.setAttribute('height', '17');
        icon.setAttribute('fill', 'none');
        icon.setAttribute('stroke', 'currentColor');
        icon.setAttribute('stroke-width', '2');
        icon.setAttribute('stroke-linecap', 'round');
        icon.setAttribute('stroke-linejoin', 'round');
        icon.setAttribute('aria-hidden', 'true');
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', point.kind === 'start'
          ? 'M3 10l9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z M9 21v-8h6v8'
          : 'M4 3v6a2 2 0 0 0 4 0V3 M6 3v18 M20 3c-4 0-6 8-2 9h2 M20 3v18');
        icon.appendChild(path);
        button.appendChild(icon);
      }
      const body = document.createElement('div');
      body.className = 'w-72 max-w-full p-5';
      const title = document.createElement('strong');
      title.className = 'min-w-0 font-display text-xl text-ink';
      title.textContent = copy(point.title, lang);
      const description = document.createElement('p');
      description.className = 'mt-2 text-sm leading-relaxed text-muted';
      description.textContent = copy(point.description, lang);
      const link = document.createElement('a');
      link.href = `https://www.google.com/maps/search/?api=1&query=${point.coordinates[1]},${point.coordinates[0]}`;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.className = 'inline-flex size-10 shrink-0 items-center justify-center rounded-full text-primary transition-colors hover:bg-lilac';
      const label = lang === 'pl' ? 'Otwórz w Google Maps' : 'Open in Google Maps';
      link.setAttribute('aria-label', label);
      link.title = label;
      const icon = document.createElement('span');
      icon.className = 'route-map-google-icon';
      icon.setAttribute('aria-hidden', 'true');
      link.appendChild(icon);
      const heading = document.createElement('div');
      heading.className = 'flex items-center justify-between gap-3';
      heading.appendChild(title);
      heading.appendChild(link);
      body.appendChild(heading);
      body.appendChild(description);
      const popup = new maplibregl.Popup({ closeButton: false, offset: 22, maxWidth: 'min(288px, calc(100% - 32px))', className: 'route-map-popup', focusAfterOpen: false })
        .setLngLat(point.coordinates).setDOMContent(body);
      const marker = new maplibregl.Marker({ element: button }).setLngLat(point.coordinates).addTo(instance);
      let pinned = false;
      let timer: ReturnType<typeof setTimeout> | undefined;
      const cancelClose = () => { clearTimeout(timer); if (timer) timers.delete(timer); };
      const open = () => {
        cancelClose();
        if (activePopup.current !== popup) activePopup.current?.remove();
        activePopup.current = popup;
        if (!popup.isOpen()) popup.addTo(instance);
      };
      const close = () => {
        cancelClose();
        if (!pinned) {
          timer = setTimeout(() => { popup.remove(); if (timer) timers.delete(timer); }, 120);
          timers.add(timer);
        }
      };
      button.addEventListener('pointerenter', (event) => { if (event.pointerType !== 'touch') open(); });
      button.addEventListener('pointerleave', close);
      button.addEventListener('focus', open);
      button.addEventListener('blur', close);
      button.addEventListener('click', (event) => { event.stopPropagation(); callbacks.current.onSelect(''); open(); pinned = true; });
      body.addEventListener('pointerenter', cancelClose);
      body.addEventListener('pointerleave', close);
      body.addEventListener('focusin', cancelClose);
      body.addEventListener('focusout', (event) => { if (!body.contains(event.relatedTarget as Node)) close(); });
      popup.on('close', () => { pinned = false; });
      created.push({ marker, popup });
    }
    const bounds = new maplibregl.LngLatBounds();
    for (const [lng, lat] of overlay.stops) if (lng != null && lat != null) bounds.extend([lng, lat]);
    for (const point of overlay.points) bounds.extend(point.coordinates);
    for (const path of overlay.paths) for (const coordinate of path.coordinates) bounds.extend(coordinate);
    if (!bounds.isEmpty()) instance.fitBounds(bounds, { padding: 70, maxZoom: 15.5, duration: 0 });
    return () => {
      instance.off('load', update);
      for (const timer of timers) clearTimeout(timer);
      for (const item of created) { item.popup.remove(); item.marker.remove(); }
    };
  }, [overlayData, lang]);

  useEffect(() => {
    for (const [id, entry] of markers.current) {
      const button = entry.marker.getElement();
      button.setAttribute('aria-pressed', String(id === selected));
      button.style.backgroundColor = id === selected ? 'var(--color-accent)' : '';
      button.style.zIndex = id === selected ? '2' : '1';
    }
    if (!selected || !map.current) return;
    const marker = markers.current.get(selected);
    if (marker) {
      map.current.panTo(marker.marker.getLngLat());
      marker.open();
    }
  }, [selected]);

  return (
    <div className="relative isolate overflow-hidden rounded-2xl border border-line bg-surface">
      <div
        ref={container}
        role="group"
        className="h-224 w-full md:h-240"
        aria-label={lang === 'pl' ? 'Mapa trasy' : 'Route map'}
      />
      {(paths.length > 0 || points.length > 0) && (
        <div className="pointer-events-none absolute left-4 top-4 flex max-w-preview flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl bg-white/95 px-4 py-3 text-xs font-semibold text-ink shadow-sm">
          <span className="flex items-center gap-2"><span className="h-1 w-6 rounded-full bg-accent" /><Footprints size={14} />{lang === 'pl' ? 'Trasa piesza' : 'Walking itinerary'}</span>
          {points.some((point) => point.kind === 'metro') && <span className="flex items-center gap-2"><span className="flex size-5 items-center justify-center rounded bg-ink text-white">M</span>Metro</span>}
          {points.some((point) => point.kind === 'start') && <span className="flex items-center gap-1"><MapPin size={14} />{lang === 'pl' ? 'Twój punkt początkowy' : 'Your starting point'}</span>}
        </div>
      )}
      {editable && (
        <button
          type="button"
          className="absolute left-3 top-3 z-400 flex min-h-10 items-center gap-2 rounded-xl bg-white px-3 text-sm font-bold text-primary shadow-md hover:bg-lilac"
          onClick={() => {
            addingRef.current = !addingRef.current;
            setAdding(addingRef.current);
          }}
        >
          {adding ? <X size={16} /> : <Plus size={16} />}
          {adding
            ? lang === 'pl'
              ? 'Anuluj'
              : 'Cancel'
            : lang === 'pl'
              ? 'Dodaj miejsce'
              : 'Add place'}
        </button>
      )}
      {adding && (
        <div className="pointer-events-none absolute bottom-9 left-3 z-400 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-ink shadow-md">
          <MapPin size={14} className="mr-1 inline" />
          {lang === 'pl' ? 'Kliknij mapę, aby dodać miejsce' : 'Click the map to add a place'}
        </div>
      )}
    </div>
  );
}

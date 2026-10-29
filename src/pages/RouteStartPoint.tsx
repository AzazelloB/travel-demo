import { ArrowUpRight, Check, House, MapPin, Search, X } from 'lucide-react';
import { type FormEvent, useEffect, useId, useRef, useState } from 'react';
import type { Lang, MapCoordinate } from '../../shared/types';
import { findStartingPlaces, type StartingPlace } from '../lib/geocoding';
import { Button } from '../ui/Button';

export function RouteStartPoint({ center, selected, onSelect, lang }: {
  center: MapCoordinate;
  selected: StartingPlace | null;
  onSelect: (place: StartingPlace | null) => void;
  lang: Lang;
}) {
  const words = (en: string, pl: string) => lang === 'pl' ? pl : en;
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<StartingPlace[]>([]);
  const [searching, setSearching] = useState(false);
  const [message, setMessage] = useState('');
  const request = useRef<AbortController | null>(null);
  const messageId = useId();
  useEffect(() => () => request.current?.abort(), []);
  const directions = new URLSearchParams({
    api: '1', travelmode: 'transit', destination: [...center].reverse().join(','),
    origin: selected ? selected.coordinates.slice().reverse().join(',') : query.trim(),
  });

  async function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (searching) return;
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setSearching(true);
    setResults([]);
    setMessage('');
    try {
      const matches = await findStartingPlaces(query, center, lang, controller.signal);
      if (controller.signal.aborted) return;
      setResults(matches);
      setMessage(matches.length
        ? words('Choose the matching place to add it to your map.', 'Wybierz właściwe miejsce, aby dodać je do mapy.')
        : words('No nearby matches. Try a street address or use Google Maps directions below.', 'Brak miejsc w okolicy. Wpisz adres ulicy lub skorzystaj z dojazdu w Google Maps poniżej.'));
    } catch {
      if (!controller.signal.aborted) setMessage(words('Place search is unavailable. You can still get transport directions below.', 'Wyszukiwanie miejsc jest niedostępne. Nadal możesz sprawdzić dojazd poniżej.'));
    } finally {
      if (!controller.signal.aborted) setSearching(false);
    }
  }

  return (
    <div className="mt-5 max-w-2xl">
      <form onSubmit={search} className="flex flex-col items-start gap-3 sm:flex-row sm:items-end">
        <label className="w-full flex-1 text-xs">
          {words('Your hotel or starting point', 'Twój hotel lub punkt początkowy')}
          <input value={query} onChange={(event) => setQuery(event.target.value)}
            required minLength={2} maxLength={200} aria-describedby={message ? messageId : undefined}
            placeholder={words('Hotel name or street address', 'Nazwa hotelu lub adres ulicy')} />
        </label>
        <Button type="submit" variant="secondary" disabled={searching}>
          <Search size={16} />{searching ? words('Searching…', 'Wyszukiwanie…') : words('Find on map', 'Znajdź na mapie')}
        </Button>
      </form>
      <p id={messageId} role="status" className="mt-2 text-xs text-muted">{message}</p>
      {results.length > 0 && (
        <ul className="mt-3 overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
          {results.map((place) => (
            <li key={place.coordinates.join(',')} className="border-b border-line last:border-0">
              <button type="button" onClick={() => {
                onSelect(place);
                setQuery(place.label);
                setResults([]);
                setMessage(words('Starting point added to the map.', 'Punkt początkowy dodany do mapy.'));
              }} className="flex w-full justify-start gap-3 p-4 text-left transition-colors hover:bg-surface">
                <MapPin size={18} className="text-primary" />
                <span><span className="block text-sm font-bold">{place.label}</span><span className="mt-1 block text-xs text-muted">{place.address}</span></span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {selected && (
        <div className="mt-3 flex items-center gap-3 rounded-xl bg-surface py-2 pl-4 pr-2">
          <House size={18} className="text-primary" />
          <span className="min-w-0 flex-1"><span className="block text-sm font-bold">{selected.label}</span><span className="block text-xs text-muted">{selected.address}</span></span>
          <Check size={16} className="text-primary" />
          <button type="button" className="size-10 shrink-0 rounded-full text-primary hover:bg-lilac"
            aria-label={words('Remove starting point', 'Usuń punkt początkowy')}
            onClick={() => { onSelect(null); setQuery(''); setMessage(''); setResults([]); }}><X size={17} /></button>
        </div>
      )}
      {(selected || query.trim().length >= 2) && (
        <a href={`https://www.google.com/maps/dir/?${directions}`} target="_blank" rel="noreferrer"
          className="mt-2 inline-flex min-h-10 items-center gap-2 rounded-xl px-2 text-sm font-semibold text-primary transition-colors hover:bg-lilac">
          {words('Transport directions', 'Sprawdź dojazd')}<ArrowUpRight size={15} />
        </a>
      )}
    </div>
  );
}

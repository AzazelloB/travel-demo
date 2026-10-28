import * as Slider from '@radix-ui/react-slider';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { type Content, canEdit, copy } from '../../shared/types';
import { AddButton } from '../components/ContentTools';
import { ContentEditor, newContent } from '../components/editor/ContentEditor';
import { ListingCard } from '../components/ListingCard';
import { useStore } from '../context/Store';
import { useWords } from '../hooks/useWords';
import { money, sortOrder } from '../lib/content';
import { buttonStyles } from '../ui/Button';
import { Dropdown } from '../ui/Dropdown';
import { Empty } from '../ui/Empty';

export function Listing({ kind }: { kind: 'destination' | 'trip' }) {
  const { content, lang, editing, user } = useStore();
  const words = useWords();
  const location = useLocation();
  const [query, setQuery] = useState(new URLSearchParams(location.search).get('q') || ''),
    [region, setRegion] = useState(''),
    [minDuration, setMinDuration] = useState(0),
    [duration, setDuration] = useState<number | null>(null),
    [minBudget, setMinBudget] = useState(0),
    [budget, setBudget] = useState<number | null>(null),
    [sort, setSort] = useState('recommended'),
    [editor, setEditor] = useState<Content | null>(null);
  const destinations = content.filter(
    (c) => c.kind === 'destination' && (c.published || canEdit(user.role)),
  );
  const tours = content.filter((c) => c.kind === 'trip' && (c.published || canEdit(user.role)));
  const maxDuration = Math.max(1, ...tours.map((c) => c.duration || 0));
  const maxPrice = Math.max(
    100,
    Math.ceil(Math.max(0, ...tours.map((c) => c.price || 0)) / 100) * 100,
  );
  const items = content
    .filter((c) => {
      const destination = destinations.find((d) => d.id === c.destinationId);
      return (
        c.kind === kind &&
        (c.published || canEdit(user.role)) &&
        `${copy(c.title, lang)} ${copy(c.description, lang)} ${copy(destination?.title, lang)} ${destination?.region || ''}`
          .toLowerCase()
          .includes(query.toLowerCase()) &&
        (!region || (kind === 'destination' ? c.region === region : c.destinationId === region)) &&
        (c.duration || 0) >= minDuration &&
        (duration === null || (c.duration || 0) <= duration) &&
        (c.price || 0) >= minBudget &&
        (budget === null || (c.price || 0) <= budget)
      );
    })
    .sort((a, b) =>
      sort === 'price'
        ? (a.price || 0) - (b.price || 0)
        : sort === 'duration'
          ? (a.duration || 0) - (b.duration || 0)
          : sortOrder(a, b),
    );
  const locations = [
    ...new Set(destinations.map((c) => c.region).filter((r): r is string => !!r)),
  ].map((r) => ({ value: r, label: r }));
  return (
    <div className="mx-auto w-full max-w-content px-6 md:px-9 xl:px-14 min-h-screen pb-20 pt-14 max-sm:pt-9">
      {kind === 'destination' && (
        <h1 className="mb-8 text-6xl">{words('Destinations.', 'Kierunki.')}</h1>
      )}
      <div className="grid gap-5 rounded-2xl border border-line bg-surface p-5 lg:grid-cols-3 lg:items-center lg:gap-8">
        <label className="relative flex-row items-center gap-2">
          <Search size={20} className="absolute left-4 text-muted" />
          <input
            aria-label={words('Search tours', 'Szukaj wycieczek')}
            className="pl-12"
            placeholder={words('Search tours…', 'Szukaj wycieczek…')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        {kind === 'destination' ? (
          <Dropdown
            label={words('Region', 'Region')}
            value={region}
            options={[
              { value: '', label: words('All regions', 'Wszystkie regiony') },
              ...locations,
            ]}
            onChange={setRegion}
          />
        ) : (
          <>
            <RangeFilter
              label={words('Duration', 'Czas')}
              minLabel={words('Minimum duration', 'Minimalny czas')}
              maxLabel={words('Maximum duration', 'Maksymalny czas')}
              minValue={Math.min(minDuration, maxDuration)}
              maxValue={Math.min(duration ?? maxDuration, maxDuration)}
              max={maxDuration}
              step={1}
              format={(value) => `${value} ${words('days', 'dni')}`}
              onMinChange={(value) => {
                setMinDuration(value);
                if (value > (duration ?? maxDuration)) setDuration(value);
              }}
              onMaxChange={(value) => {
                setDuration(value >= maxDuration ? null : value);
                if (value < minDuration) setMinDuration(value);
              }}
            />
            <RangeFilter
              label={words('Price', 'Cena')}
              minLabel={words('Minimum price', 'Minimalna cena')}
              maxLabel={words('Maximum price', 'Maksymalna cena')}
              minValue={Math.min(minBudget, maxPrice)}
              maxValue={Math.min(budget ?? maxPrice, maxPrice)}
              max={maxPrice}
              step={100}
              format={money}
              onMinChange={(value) => {
                setMinBudget(value);
                if (value > (budget ?? maxPrice)) setBudget(value);
              }}
              onMaxChange={(value) => {
                setBudget(value >= maxPrice ? null : value);
                if (value < minBudget) setMinBudget(value);
              }}
            />
          </>
        )}
      </div>
      <div className="flex items-center justify-between gap-4 py-5 text-sm font-semibold text-muted">
        <span>
          {items.length}{' '}
          {kind === 'destination'
            ? words('destinations', 'kierunków')
            : words('tours', 'wycieczek')}
          {editing && ' · includes drafts'}
        </span>
        <div className="flex items-center gap-4">
          <AddButton kind={kind} onClick={() => setEditor(newContent(kind))} />
          {kind === 'trip' && (
            <Dropdown
              label={words('Sort', 'Sortuj')}
              value={sort}
              options={[
                { value: 'recommended', label: words('Featured order', 'Kolejność') },
                { value: 'price', label: words('Lowest price', 'Najniższa cena') },
                { value: 'duration', label: words('Shortest duration', 'Najkrótszy czas') },
              ]}
              onChange={setSort}
            />
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          return (
            <div key={item.id}>
              <ListingCard item={item} />
              {editing && (
                <button
                  type="button"
                  className="inline-flex items-center gap-3 py-1.5 text-sm font-medium text-primary hover:text-accent"
                  onClick={() => setEditor(item)}
                >
                  Edit {kind}
                </button>
              )}
            </div>
          );
        })}
      </div>
      {!items.length && (
        <Empty title={words('No tours found.', 'Nie znaleziono wycieczek.')}>
          <button
            type="button"
            className={buttonStyles({ variant: 'secondary' })}
            onClick={() => {
              setQuery('');
              setRegion('');
              setMinDuration(0);
              setDuration(null);
              setMinBudget(0);
              setBudget(null);
            }}
          >
            {words('Clear filters', 'Wyczyść filtry')}
          </button>
        </Empty>
      )}
      {editor && <ContentEditor item={editor} onClose={() => setEditor(null)} />}
    </div>
  );
}

function RangeFilter({
  label,
  minLabel,
  maxLabel,
  minValue,
  maxValue,
  max,
  step,
  format,
  onMinChange,
  onMaxChange,
}: {
  label: string;
  minLabel: string;
  maxLabel: string;
  minValue: number;
  maxValue: number;
  max: number;
  step: number;
  format: (value: number) => string;
  onMinChange: (value: number) => void;
  onMaxChange: (value: number) => void;
}) {
  return (
    <fieldset className="min-w-0 space-y-3 px-1">
      <legend className="text-sm font-bold text-ink">{label}</legend>
      <div className="flex justify-between gap-3 text-sm font-semibold text-primary">
        <span>{format(minValue)}</span>
        <span>{format(maxValue)}</span>
      </div>
      <Slider.Root
        className="relative flex h-5 w-full touch-none select-none items-center"
        min={0}
        max={max}
        step={step}
        value={[minValue, maxValue]}
        onValueChange={([min, upper]) => {
          if (min !== minValue) onMinChange(min);
          if (upper !== maxValue) onMaxChange(upper);
        }}
      >
        <Slider.Track className="relative h-1.5 grow rounded-full bg-lilac">
          <Slider.Range className="absolute h-full rounded-full bg-primary" />
        </Slider.Track>
        <Slider.Thumb
          aria-label={minLabel}
          aria-valuetext={format(minValue)}
          className="block size-5 cursor-grab rounded-full border-2 border-primary bg-white shadow-sm transition-colors duration-150 hover:bg-lilac active:cursor-grabbing active:bg-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        />
        <Slider.Thumb
          aria-label={maxLabel}
          aria-valuetext={format(maxValue)}
          className="block size-5 cursor-grab rounded-full border-2 border-primary bg-white shadow-sm transition-colors duration-150 hover:bg-lilac active:cursor-grabbing active:bg-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        />
      </Slider.Root>
    </fieldset>
  );
}

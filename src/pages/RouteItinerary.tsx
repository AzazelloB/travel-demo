import {
  ArrowDown, ArrowUpRight, Check, ChevronDown, Clock3, Download, Footprints,
  Info, MapPin, Navigation, ShieldCheck, Ticket, TrainFront, Utensils, Wallet,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { type Content, copy, type Lang, type RoutePlan, type RouteMapPoint } from '../../shared/types';
import { RouteMap } from '../components/maps/RouteMap';
import { useStore } from '../context/Store';
import { downloadGuide, localGuide } from '../lib/offline';
import { Button } from '../ui/Button';
import type { StartingPlace } from '../lib/geocoding';
import { RouteStartPoint } from './RouteStartPoint';

const control = 'inline-flex min-h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-primary transition-colors hover:bg-lilac';

function euro(value: number, lang: Lang) {
  return new Intl.NumberFormat(lang === 'pl' ? 'pl-PL' : 'en-IE', {
    style: 'currency', currency: 'EUR', maximumFractionDigits: value % 1 ? 2 : 0,
  }).format(value);
}

function clock(minutes: number) {
  return `${String(Math.floor(minutes / 60) % 24).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
}

function duration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  return `${hours ? `${hours} h` : ''}${hours && minutes % 60 ? ' ' : ''}${minutes % 60 ? `${minutes % 60} min` : ''}`;
}

function SourceLink({ plan, id, lang }: { plan: RoutePlan; id?: string; lang: Lang }) {
  const source = plan.sources.find((entry) => entry.id === id);
  return source ? (
    <a href={source.url} target="_blank" rel="noreferrer" className={control}>
      {lang === 'pl' ? 'Oficjalne informacje' : 'Official information'} <ArrowUpRight size={14} />
    </a>
  ) : null;
}

export function RouteItinerary({ route, stops, lang, selected, onSelect }: {
  route: Content & { plan: RoutePlan };
  stops: Content[];
  lang: Lang;
  selected: string;
  onSelect: (id: string) => void;
}) {
  const { user, online, notice } = useStore();
  const { plan } = route;
  const words = (en: string, pl: string) => lang === 'pl' ? pl : en;
  const [dayId, setDayId] = useState(plan.days[0].id);
  const [skipped, setSkipped] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [startingPlace, setStartingPlace] = useState<StartingPlace | null>(null);
  const mapSection = useRef<HTMLElement>(null);
  const day = plan.days.find((entry) => entry.id === dayId) || plan.days[0];
  const activeSteps = day.steps.filter((step) => !skipped.includes(step.id));
  const [startHour, startMinute] = day.startTime.split(':').map(Number);
  let minute = startHour * 60 + startMinute;
  const schedule = activeSteps.map((step, index) => {
    const start = minute;
    const transfer = index < activeSteps.length - 1 ? step.transfer : undefined;
    minute += step.minutes + (transfer?.minutes || 0);
    return { step, start, transfer };
  });
  const totalMinutes = minute - startHour * 60 - startMinute;
  const dayStops = activeSteps.flatMap((step) => {
    const place = stops.find((stop) => stop.id === step.placeId);
    return place ? [place] : [];
  });
  const details = Object.fromEntries(activeSteps.filter((step) => step.placeId).map((step) => [step.placeId!, step]));
  const activeIds = new Set(activeSteps.map((step) => step.id));
  const mapPoints: RouteMapPoint[] = (day.map?.points || []).filter((point) => !point.stepId || activeIds.has(point.stepId));
  for (const point of mapPoints) activeIds.add(point.id);
  const mapPaths = (day.map?.paths || []).filter((path) =>
    activeIds.has(path.from) && activeIds.has(path.to) && (!path.whenSkipped || skipped.includes(path.whenSkipped)),
  );
  if (startingPlace) mapPoints.push({
    id: 'user-start', kind: 'start', title: { en: startingPlace.label, pl: startingPlace.label },
    description: {
      en: `${startingPlace.address}. Your chosen starting point. Use transport directions to plan the connection to the first visit.`,
      pl: `${startingPlace.address}. Twój punkt początkowy. Sprawdź dojazd do pierwszego miejsca przyciskiem powyżej.`,
    },
    coordinates: startingPlace.coordinates,
  });
  const costs = plan.costs.filter((cost) => !cost.optionalStepId || !skipped.includes(cost.optionalStepId));
  const totalMin = costs.reduce((sum, cost) => sum + cost.min, 0);
  const totalMax = costs.reduce((sum, cost) => sum + cost.max, 0);
  const checkedDate = new Date(`${plan.checkedAt}T12:00:00`).toLocaleDateString(lang === 'pl' ? 'pl-PL' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  useEffect(() => {
    let active = true;
    if (route.tripId) localGuide(user.id, route.tripId).then((guide) => {
      if (active) setSaved(!!guide);
    }).catch(() => { /* Saving remains available if browser storage cannot be read. */ });
    return () => { active = false; };
  }, [route.tripId, user.id]);

  async function saveOffline() {
    if (!route.tripId) return;
    setSaving(true);
    try {
      const { missed } = await downloadGuide(user.id, route.tripId);
      setSaved(true);
      notice(missed
        ? words('Plan saved. Some photos could not be downloaded. The map needs internet.', 'Plan zapisany. Części zdjęć nie udało się pobrać. Mapa wymaga internetu.')
        : words('Plan and photos saved on this device. The map needs internet.', 'Plan i zdjęcia zapisane na urządzeniu. Mapa wymaga internetu.'));
    } catch (error) {
      notice((error as Error).message);
    } finally { setSaving(false); }
  }

  function showOnMap(placeId: string) {
    onSelect(placeId);
    mapSection.current?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
  }

  return (
    <>
      <div className="grid gap-7 py-9 md:grid-cols-3 md:py-12">
        <p className="max-w-3xl text-lg leading-relaxed text-ink/80 md:col-span-2">{copy(plan.introduction, lang)}</p>
        <div className="flex items-start md:justify-end">
          <Button variant="secondary" disabled={saving || !online || !route.tripId} onClick={saveOffline}>
            {saved ? <Check size={17} /> : <Download size={17} />}
            {saving ? words('Saving…', 'Zapisywanie…') : saved ? words('Update saved plan', 'Aktualizuj zapisany plan') : words('Save for offline', 'Zapisz offline')}
          </Button>
        </div>
      </div>

      <div className="mb-12 grid grid-cols-2 gap-5 rounded-3xl border border-line bg-white p-6 sm:grid-cols-4 md:p-8">
        <div><Clock3 className="mb-3 text-accent" size={22} /><p className="text-xl font-bold">{plan.days.length} {words('days', 'dni')}</p><p className="mt-1 text-sm text-muted">{words('Use either day independently', 'Każdy dzień jest niezależny')}</p></div>
        <div><Footprints className="mb-3 text-accent" size={22} /><p className="text-xl font-bold">~{plan.days.reduce((sum, entry) => sum + entry.walkingKm, 0)} km</p><p className="mt-1 text-sm text-muted">{words('Across both days, including sites', 'Łącznie, ze zwiedzaniem obiektów')}</p></div>
        <div><Wallet className="mb-3 text-accent" size={22} /><p className="text-xl font-bold">{euro(totalMin, lang)}–{euro(totalMax, lang)}</p><p className="mt-1 text-sm text-muted">{words('Estimated per adult, both days', 'Szacunek na osobę, oba dni')}</p></div>
        <div><Ticket className="mb-3 text-accent" size={22} /><p className="text-xl font-bold">{words('Book ahead', 'Rezerwuj wcześniej')}</p><p className="mt-1 text-sm text-muted">{words('Colosseum timed admission', 'Koloseum na określoną godzinę')}</p></div>
      </div>

      <section aria-labelledby="itinerary-heading">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-5">
          <h2 id="itinerary-heading" className="text-4xl">{words('Your itinerary', 'Twój plan')}</h2>
          <a href="#route-preparation" className={control}><ShieldCheck size={17} />{words('Before you go', 'Przed wyjściem')}<ChevronDown size={16} /></a>
        </div>
        <div className="mb-7 grid gap-3 sm:grid-cols-2" role="group" aria-label={words('Choose a day', 'Wybierz dzień')}>
          {plan.days.map((entry, index) => (
            <button key={entry.id} type="button" aria-pressed={day.id === entry.id}
              onClick={() => { setDayId(entry.id); onSelect(''); }}
              className={`flex items-center justify-start gap-4 rounded-2xl border p-5 text-left transition-colors ${day.id === entry.id ? 'border-primary bg-primary text-white shadow-md' : 'border-line bg-white hover:border-primary/50 hover:bg-surface'}`}>
              <span className={`flex size-12 shrink-0 items-center justify-center rounded-xl font-display text-2xl ${day.id === entry.id ? 'bg-white/20' : 'bg-surface text-primary'}`}>{index + 1}</span>
              <span><span className="block text-xs font-semibold opacity-75">{words('Day', 'Dzień')} {index + 1}</span><span className="mt-1 block text-base font-bold">{copy(entry.title, lang)}</span></span>
            </button>
          ))}
        </div>

        <div className="mb-7 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted">
          <span className="flex items-center gap-2 font-bold text-ink"><Clock3 size={17} />{day.startTime}–{clock(minute)} <span className="font-normal text-muted">· {duration(totalMinutes)}</span></span>
          <span className="flex items-center gap-2"><Footprints size={17} />{words('Allow', 'Zaplanuj')} ~{day.walkingKm} km</span>
          <span>{words('Times are suggested; allow extra for queues.', 'Godziny orientacyjne; dolicz czas na kolejki.')}</span>
        </div>
        <p className="mb-6 text-lg text-ink/80">{copy(day.summary, lang)}</p>
        {day.notice && <div className="mb-8 flex items-start gap-3 rounded-2xl bg-surface px-5 py-4 text-sm leading-relaxed"><Info size={19} className="mt-0.5 text-primary" /><p>{copy(day.notice, lang)}</p></div>}

        <div className="mb-8 flex gap-4 rounded-2xl border border-line bg-white p-5 sm:p-6">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-lilac text-primary"><TrainFront size={20} /></span>
          <div className="min-w-0 flex-1"><h3 className="text-xl">{words('Getting to the start', 'Dojazd na początek')}</h3><p className="mt-2 max-w-4xl text-sm leading-relaxed text-ink/75">{copy(day.arrival, lang)}</p>
            {dayStops[0]?.lat != null && dayStops[0]?.lng != null && (
              <RouteStartPoint center={[dayStops[0].lng, dayStops[0].lat]} selected={startingPlace} onSelect={setStartingPlace} lang={lang} />
            )}
          </div>
        </div>

        <div className="grid items-start gap-8 xl:grid-cols-3">
          <ol className="min-w-0 xl:col-span-2">
            {schedule.map(({ step, start, transfer }) => {
              const place = stops.find((stop) => stop.id === step.placeId);
              const meal = step.kind === 'meal';
              return (
                <li key={step.id}>
                  <div className="mb-3 flex items-center gap-3 text-sm font-bold text-primary"><span className="rounded-lg bg-lilac px-3 py-1.5 tabular-nums">{clock(start)}</span><span className="h-px flex-1 bg-line" /><span className="flex items-center gap-1.5 font-medium text-muted"><Clock3 size={14} />{duration(step.minutes)}</span></div>
                  <article className={`overflow-hidden rounded-3xl border shadow-sm transition-colors ${selected === step.placeId ? 'border-primary' : 'border-line'} ${meal ? 'bg-surface' : 'bg-white'}`}>
                    <div className="flex flex-col sm:flex-row">
                      {place && <button type="button" onClick={() => showOnMap(place.id)} aria-label={`${words('Show on map:', 'Pokaż na mapie:')} ${copy(place.title, lang)}`} className="group relative h-52 w-full shrink-0 overflow-hidden bg-lilac sm:h-auto sm:min-h-52 sm:w-52">
                        <img src={place.image} alt={copy(place.title, lang)} loading="lazy" className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-primary"><MapPin size={13} />{words('On the map', 'Na mapie')}</span>
                      </button>}
                      <div className="min-w-0 flex-1 p-5 sm:p-6">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="text-2xl">{meal && <Utensils className="mr-2 inline text-primary" size={20} />}{copy(place?.title || step.title, lang)}</h3>
                          {step.optional && <span className="rounded-full bg-surface px-3 py-1 text-xs font-semibold text-primary">{words('Optional', 'Opcjonalnie')}</span>}
                        </div>
                        <p className="mt-3 text-sm leading-relaxed text-ink/75">{copy(step.description, lang)}</p>
                        {step.admission && <p className="mt-4 flex items-start gap-2 text-sm font-semibold text-primary"><Ticket size={16} className="mt-0.5" />{copy(step.admission, lang)}</p>}
                      </div>
                    </div>
                    {(step.hours || step.booking) && <details className="group border-t border-line">
                      <summary className="flex min-h-12 list-none items-center justify-between gap-3 px-5 py-3 text-sm font-semibold text-primary transition-colors hover:bg-surface sm:px-6 [&::-webkit-details-marker]:hidden">{words('Opening hours & visiting details', 'Godziny i szczegóły wizyty')}<ChevronDown size={16} className="transition-transform group-open:rotate-180" /></summary>
                      <div className="space-y-4 px-5 pb-5 sm:px-6">
                        {step.hours && <div className="flex gap-3 text-sm"><Clock3 size={17} className="mt-0.5 text-muted" /><p>{copy(step.hours, lang)}</p></div>}
                        {step.booking && <div className="flex gap-3 text-sm"><Ticket size={17} className="mt-0.5 text-muted" /><p>{copy(step.booking, lang)}</p></div>}
                        <SourceLink plan={plan} id={step.sourceId} lang={lang} />
                      </div>
                    </details>}
                  </article>
                  {transfer && <div className="relative ml-5 border-l-2 border-dashed border-line py-5 pl-6 sm:ml-7">
                    <span className="absolute -left-3 top-5 flex size-6 items-center justify-center rounded-full bg-canvas text-primary"><Footprints size={16} /></span>
                    <p className="text-xs font-bold text-primary">{transfer.minutes} min {words('walk', 'pieszo')} · {transfer.distance}</p>
                    <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted">{copy(transfer.description, lang)}</p>
                  </div>}
                </li>
              );
            })}
          </ol>

          <aside className="space-y-5 xl:sticky xl:top-6">
            <div className="rounded-3xl bg-surface p-6 sm:p-7">
              <Navigation size={25} className="mb-4 text-primary" />
              <h3 className="text-2xl">{words('Make it your day', 'Dzień po Twojemu')}</h3>
              <p className="mt-3 text-sm text-ink/75">{words('Keep the booked visit fixed. Everything else is a suggested pace, with room for breaks.', 'Trzymaj się godziny rezerwacji. Pozostałe godziny to propozycja tempa, z miejscem na przerwy.')}</p>
              {plan.days.flatMap((entry) => entry.steps).filter((step) => step.optional).map((step) => {
                const place = stops.find((stop) => stop.id === step.placeId);
                return <label key={step.id} className="mt-5 flex cursor-pointer flex-row items-center justify-between gap-4 rounded-xl bg-white p-4">
                  <span><span className="block font-bold">{copy(place?.title || step.title, lang)}</span><span className="mt-1 block text-xs font-normal text-muted">{duration(step.minutes)} · {words('optional visit', 'wizyta opcjonalna')}</span></span>
                  <input type="checkbox" checked={!skipped.includes(step.id)} className="size-5 shrink-0 cursor-pointer" onChange={(event) => {
                    setSkipped((current) => event.target.checked ? current.filter((id) => id !== step.id) : [...current, step.id]);
                    if (selected === step.placeId) onSelect('');
                  }} />
                </label>;
              })}
              <a href="#day-map" className={`${control} mt-4 px-0`}><MapPin size={16} />{words('See this day on the map', 'Zobacz dzień na mapie')}<ArrowDown size={15} /></a>
            </div>
            <div className="rounded-3xl border border-line p-6 sm:p-7">
              <Footprints size={25} className="mb-4 text-primary" />
              <h3 className="text-2xl">{words('Terrain & accessibility', 'Teren i dostępność')}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink/75">{copy(plan.accessibility, lang)}</p>
            </div>
          </aside>
        </div>

        <div className="my-8 flex gap-4 rounded-2xl border border-line bg-white p-5 sm:p-6">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-lilac text-primary"><TrainFront size={20} /></span>
          <div><h3 className="text-xl">{words('Getting back', 'Powrót')}</h3><p className="mt-2 max-w-4xl text-sm leading-relaxed text-ink/75">{copy(day.shorterDeparture && day.steps.some((step) => skipped.includes(step.id)) ? day.shorterDeparture : day.departure, lang)}</p></div>
        </div>
      </section>

      <section ref={mapSection} id="day-map" className="scroll-mt-6 pt-6" aria-labelledby="day-map-heading">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><h2 id="day-map-heading" className="text-3xl">{words('On the map', 'Na mapie')}</h2><span className="text-sm text-muted">{words('Select a place for details and directions', 'Wybierz miejsce, aby zobaczyć szczegóły i dojazd')}</span></div>
        <RouteMap places={dayStops} details={details} paths={mapPaths} points={mapPoints} lang={lang} selected={selected} onSelect={onSelect} editable={false} onMove={() => {}} onAdd={() => {}} />
      </section>

      <section id="route-preparation" className="mt-16 scroll-mt-6 grid items-start gap-8 lg:grid-cols-2">
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-line sm:p-8">
          <div className="mb-6 flex items-center gap-3"><Wallet size={24} className="text-primary" /><h2 className="text-3xl">{words('What to budget', 'Zaplanuj budżet')}</h2></div>
          <p className="mb-6 text-sm text-muted">{words('Per adult for both days, paying standard admission.', 'Na osobę dorosłą, za oba dni, przy biletach normalnych.')}</p>
          <dl className="divide-y divide-line">
            {costs.map((cost) => (
              <div key={cost.label.en} className="grid grid-cols-stats gap-x-4 py-4 first:pt-0">
                <dt className="text-sm font-bold">{copy(cost.label, lang)}</dt>
                <dd className="text-sm font-bold text-primary">
                  {cost.min === cost.max ? euro(cost.min, lang) : `${euro(cost.min, lang)}–${euro(cost.max, lang)}`}
                </dd>
                <dd className="col-span-2 mt-1.5 text-xs leading-relaxed text-muted">
                  {copy(cost.note, lang)}
                </dd>
              </div>
            ))}
          </dl>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-3 rounded-2xl bg-surface p-5"><span className="text-sm font-semibold">{words('Estimated total', 'Szacunkowo łącznie')}</span><strong className="text-3xl text-primary">{euro(totalMin, lang)}–{euro(totalMax, lang)}</strong></div>
          <p className="mt-4 text-xs leading-relaxed text-muted">{words('Accommodation, dinner, guides and special exhibitions are extra. Food and transport are allowances, not quotes. Child, student and concession rates may differ.', 'Nocleg, kolacja, przewodnik i wystawy specjalne są dodatkowo płatne. Posiłki i przejazdy to szacunki, nie oferta cenowa. Dzieciom i osobom uprawnionym mogą przysługiwać ulgi.')}</p>
        </div>
        <div className="py-2 sm:px-3">
          <h2 className="mb-6 text-3xl">{words('Before you go', 'Przed wyjściem')}</h2>
          <div className="space-y-6">{plan.preparation.map((item) => <div key={item.title.en} className="flex gap-4">
            <ShieldCheck size={21} className="mt-1 text-accent" /><div><h3 className="font-sans text-base font-bold tracking-normal">{copy(item.title, lang)}</h3><p className="mt-2 text-sm leading-relaxed text-ink/75">{copy(item.description, lang)}</p>{item.sourceId && <SourceLink plan={plan} id={item.sourceId} lang={lang} />}</div>
          </div>)}</div>
        </div>
      </section>

      <section className="mt-14" aria-labelledby="alternatives-heading">
        <h2 id="alternatives-heading" className="mb-6 text-3xl">{words('If plans change', 'Gdy plany się zmienią')}</h2>
        <div className="grid gap-4 md:grid-cols-3">{plan.alternatives.map((item) => <article key={item.title.en} className="rounded-2xl border border-line p-6"><h3 className="text-xl">{copy(item.title, lang)}</h3><p className="mt-3 text-sm leading-relaxed text-ink/75">{copy(item.description, lang)}</p></article>)}</div>
      </section>

      <details className="mt-10 rounded-2xl border border-line bg-surface/50">
        <summary className="flex min-h-14 list-none items-center justify-between gap-4 px-5 py-4 text-sm font-semibold [&::-webkit-details-marker]:hidden"><span>{words('Information checked', 'Informacje sprawdzone')} {checkedDate} · {words('Sources & updates', 'Źródła i aktualizacje')}</span><ChevronDown size={17} /></summary>
        <div className="border-t border-line p-5"><p className="mb-3 text-sm text-muted">{words('Opening hours, closures and prices can change. Follow the official links for your travel dates. Walking distances and transfer times are planning estimates.', 'Godziny, zamknięcia i ceny mogą się zmieniać. Sprawdź oficjalne strony dla swojego terminu. Odległości i czasy przejść są orientacyjne.')}</p><div className="flex flex-wrap gap-2">{plan.sources.map((source) => <a key={source.id} href={source.url} target="_blank" rel="noreferrer" className={control}>{source.label}<ArrowUpRight size={14} /></a>)}</div></div>
      </details>
    </>
  );
}

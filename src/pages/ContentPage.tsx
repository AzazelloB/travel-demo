import { ChevronLeft, ChevronRight, Clock3, ImagePlus, MapPin } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { type Content, copy } from '../../shared/types';
import { Community } from '../components/Community';
import { AddButton, ContentTools, OrderButtons, Relations } from '../components/ContentTools';
import { ContentEditor, newContent } from '../components/editor/ContentEditor';
import { InlineCopy } from '../components/editor/InlineCopy';
import { Gallery } from '../components/Gallery';
import { TravelMap } from '../components/maps/TravelMap';
import { Card } from '../components/TourCard';
import { TourEnquiry } from '../components/TourEnquiry';
import { useStore } from '../context/Store';
import { useContentDetail } from '../hooks/useContentDetail';
import { useSeo } from '../hooks/useSeo';
import { useWords } from '../hooks/useWords';
import { money, pathTo, routeDuration, sortOrder } from '../lib/content';
import { buttonStyles } from '../ui/Button';
import { SectionHead } from '../ui/SectionHead';
import { NotFound } from './NotFoundPage';

export function Detail({ kind }: { kind: 'destination' | 'trip' | 'place' }) {
  const { slug } = useParams();
  const { content, lang, editing, save, notice } = useStore();
  const words = useWords();
  const item = content.find((c) => c.kind === kind && c.slug === slug);
  const [selected, setSelected] = useState(''),
    [enquiry, setEnquiry] = useState(false),
    [editor, setEditor] = useState<Content | null>(null);
  useSeo(item);
  const ready = useContentDetail(item?.id);
  if (!item) return <NotFound />;
  if (!ready)
    return (
      <div role="status" className="mx-auto max-w-content px-6 py-16 text-muted">
        {words('Loading details…', 'Ładowanie szczegółów…')}
      </div>
    );
  const destination = content.find((c) => c.id === item.destinationId);
  const routes = (item.routeIds || [])
    .map((id) => content.find((c) => c.id === id))
    .filter((c): c is Content => !!c);
  return (
    <>
      {kind !== 'trip' && (
        <div className="mx-auto w-full max-w-content px-6 md:px-9 xl:px-14 pt-9 [&_h1]:max-w-5xl [&_h1]:pb-8 [&_h1]:text-display max-sm:[&_h1]:text-5xl">
          <div className="mb-9 flex flex-wrap items-center gap-3 text-xs font-semibold text-muted [&_a]:inline-flex [&_a]:items-center [&_a]:gap-2 [&_a]:text-primary [&_a]:hover:text-accent">
            <Link
              to={
                kind === 'place' ? '/map' : `/${kind === 'destination' ? 'destinations' : 'trips'}`
              }
            >
              {kind === 'destination'
                ? words('Destinations', 'Kierunki')
                : kind === 'place'
                  ? words('Map', 'Mapa')
                  : words('Tours', 'Wycieczki')}
            </Link>
            <span>/</span>
            {destination && (
              <>
                <Link to={pathTo(destination)}>{copy(destination.title, lang)}</Link>
                <span>/</span>
              </>
            )}
            <span>{copy(item.title, lang)}</span>
          </div>
          <ContentTools item={item} />
          {
            <div className="mb-3 flex items-center gap-2 font-sans text-xs font-semibold uppercase tracking-widest text-muted">
              {kind === 'destination' ? item.region : item.category}
            </div>
          }
          <InlineCopy item={item} />
        </div>
      )}
      <div className="mx-auto w-full max-w-content px-6 md:px-9 xl:px-14">
        {kind === 'trip' ? (
          <>
            {editing && (
              <div className="pt-6">
                <ContentTools item={item} />
              </div>
            )}
            <TourHero key={item.id} item={item} onEdit={() => setEditor(item)} />
          </>
        ) : (
          <>
            <div className="relative h-cover overflow-hidden rounded-3xl max-md:h-80 max-sm:h-64 [&_img]:h-full [&>.button]:absolute [&>.button]:bottom-5 [&>.button]:right-5">
              <img src={item.image} alt={copy(item.title, lang)} />
              {editing && (
                <button
                  type="button"
                  className={buttonStyles({ variant: 'light', size: 'sm' })}
                  onClick={() => setEditor(item)}
                >
                  <ImagePlus size={16} />
                  Change cover
                </button>
              )}
            </div>
            <Gallery item={item} />
          </>
        )}
        <div
          className={`grid grid-cols-detail gap-16 pb-20 pt-10 max-lg:gap-8 max-md:flex max-md:flex-col [&.destination-layout]:grid-cols-1 [&>div]:min-w-0 ${kind === 'destination' ? 'destination-layout' : ''}`}
        >
          <div>
            <InlineCopy
              item={item}
              field="description"
              rich
              as="div"
              className="max-w-3xl text-base leading-relaxed text-ink/80 [&_p]:mb-5 [&_p:first-child]:text-lg [&_p:first-child]:leading-relaxed [&_h2]:mb-4 [&_h2]:mt-10 [&_h2]:text-3xl [&_h2]:leading-tight [&_h2]:text-ink [&_h3]:mb-3 [&_h3]:mt-8 [&_h3]:text-2xl [&_h3]:text-ink [&_ul]:mb-5 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6 [&_ul]:marker:text-accent [&_ol]:mb-5 [&_ol]:list-decimal [&_ol]:pl-6 [&_a]:text-primary [&_a]:rounded [&_a]:bg-lilac/60 [&_a]:px-1 [&_a]:font-semibold [&_a:hover]:bg-lilac [&_strong]:text-ink"
            />
            {kind === 'destination' && (
              <section className="mt-12">
                <SectionHead title={words('Trips around here.', 'Podróże w okolicy.')}>
                  <AddButton kind="trip" onClick={() => setEditor(newContent('trip', item))} />
                </SectionHead>
                <div className="grid grid-cols-1 gap-7 md:grid-cols-3 [&.two]:max-w-4xl [&.two]:md:grid-cols-2 two">
                  {content
                    .filter((c) => c.kind === 'trip' && c.destinationId === item.id)
                    .sort(sortOrder)
                    .map((c) => (
                      <div key={c.id}>
                        <Card item={c} />
                        {editing && (
                          <button
                            type="button"
                            className="inline-flex items-center gap-3 py-1.5 text-sm font-medium text-primary hover:text-accent"
                            onClick={() =>
                              save({ ...c, destinationId: undefined }).catch((e) =>
                                notice(e.message),
                              )
                            }
                          >
                            Remove association
                          </button>
                        )}
                      </div>
                    ))}
                </div>
                {editing && (
                  <label className="mt-6 max-w-md">
                    Associate an existing trip
                    <select
                      value=""
                      onChange={(e) => {
                        const trip = content.find((c) => c.id === e.target.value);
                        if (trip)
                          save({ ...trip, destinationId: item.id }).catch((e) => notice(e.message));
                      }}
                    >
                      <option value="">Choose a trip</option>
                      {content
                        .filter((c) => c.kind === 'trip' && c.destinationId !== item.id)
                        .map((c) => (
                          <option key={c.id} value={c.id}>
                            {copy(c.title, lang)}
                          </option>
                        ))}
                    </select>
                  </label>
                )}
              </section>
            )}
            {kind === 'trip' && (
              <>
                <section className="mt-12">
                  <SectionHead title={words('Routes.', 'Trasy.')} />
                  <div className="grid gap-3">
                    {routes.map((route, i) => {
                      const routeStops = (route.stopIds || [])
                        .map((id) => content.find((entry) => entry.id === id))
                        .filter((entry): entry is Content => !!entry);
                      return (
                        <div key={route.id}>
                          <Link
                            to={pathTo(route)}
                            className="group block overflow-hidden rounded-3xl border border-line bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:border-accent/40 hover:shadow-xl"
                          >
                            <div className="flex max-sm:flex-col">
                              <div className="relative min-h-36 w-48 shrink-0 self-stretch overflow-hidden bg-lilac max-sm:h-44 max-sm:w-full">
                                <img
                                  src={route.image}
                                  alt=""
                                  className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                <span className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-bold text-primary">
                                  <Clock3 size={13} />
                                  {routeDuration(route.duration, lang)}
                                </span>
                              </div>
                              <div className="min-w-0 flex-1 px-6 py-5">
                                <h3 className="text-2xl leading-tight transition-colors group-hover:text-accent">
                                  {copy(route.title, lang)}
                                </h3>
                                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink/75">
                                  {copy(route.description, lang)
                                    .split(/<\/p>/i)[0]
                                    .replace(/<[^>]*>/g, ' ')
                                    .replace(/\s+/g, ' ')
                                    .trim()}
                                </p>
                              </div>
                            </div>
                            {routeStops.length > 0 && (
                              <div className="flex flex-wrap items-center gap-2 border-t border-line bg-surface/50 px-5 py-3">
                                {routeStops.slice(0, 3).map((stop) => (
                                  <span
                                    key={stop.id}
                                    className="flex items-center gap-2 rounded-full bg-white pr-3 text-xs font-semibold text-ink"
                                  >
                                    <img
                                      src={stop.image}
                                      alt=""
                                      className="size-8 rounded-full object-cover"
                                    />
                                    {copy(stop.title, lang)}
                                  </span>
                                ))}
                                {routeStops.length > 3 && (
                                  <span className="px-1 text-xs font-bold text-primary">
                                    +{routeStops.length - 3}
                                  </span>
                                )}
                              </div>
                            )}
                          </Link>
                          {editing && (
                            <OrderButtons
                              index={i}
                              ids={item.routeIds || []}
                              onChange={(ids) =>
                                save({ ...item, routeIds: ids }).catch((e) => notice(e.message))
                              }
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <Relations
                    parent={item}
                    field="routeIds"
                    childKind="route"
                    onCreate={() => setEditor(newContent('route', item))}
                  />
                  {!routes.length && (
                    <p className="text-muted">
                      {words('No routes added yet.', 'Brak dodanych tras.')}
                    </p>
                  )}
                </section>
                <Community target={item} />
              </>
            )}
            {kind === 'place' && (
              <>
                <TravelMap
                  places={[item]}
                  selected={selected}
                  onSelect={setSelected}
                  editable={editing}
                  onMove={(_, lat, lng) =>
                    save({ ...item, lat, lng }).catch((e) => notice(e.message))
                  }
                  onAdd={(lat, lng) => save({ ...item, lat, lng }).catch((e) => notice(e.message))}
                />
                <div className="mt-3 flex items-center gap-2 text-xs text-muted">
                  <MapPin size={15} />
                  {item.lat?.toFixed(5)}, {item.lng?.toFixed(5)}
                  {editing && ' · drag the marker or click + marker to set coordinates'}
                </div>
                <section className="mt-12">
                  <SectionHead title={words('On these routes.', 'Na tych trasach.')} />
                  {content
                    .filter((c) => c.kind === 'route' && c.stopIds?.includes(item.id))
                    .map((c) => (
                      <Link
                        className="flex items-center justify-between border-b border-line py-4 text-sm hover:text-accent"
                        key={c.id}
                        to={pathTo(c)}
                      >
                        {copy(c.title, lang)}
                      </Link>
                    ))}
                </section>
                <Community target={item} />
              </>
            )}
          </div>
          {kind === 'trip' && (
            <aside className="sticky top-6 self-start overflow-hidden rounded-3xl border border-line bg-white shadow-sm max-md:static max-md:order-first max-md:w-full">
              <div className="p-6 sm:p-7">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-muted">
                      {words('Starting at', 'Cena od')}
                    </p>
                    <p className="mt-1 text-4xl font-bold tracking-tight text-primary">
                      {money(item.price)}
                    </p>
                    <p className="mt-1 text-xs text-muted">{words('per person', 'za osobę')}</p>
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-lilac px-4 py-2 text-sm font-bold text-primary">
                    <Clock3 size={16} />
                    {item.duration} {words('days', 'dni')}
                  </div>
                </div>
                <button
                  type="button"
                  className={buttonStyles({ fullWidth: true, className: 'mt-7' })}
                  disabled={!item.published}
                  onClick={() => setEnquiry(true)}
                >
                  {words('Enquire about this tour', 'Zapytaj o wycieczkę')}
                </button>
                <p className="mt-4 text-sm leading-relaxed text-muted">
                  {words(
                    'Tell us your dates and what you have in mind. We’ll work out the details and prepare your quote.',
                    'Podaj preferowany termin i swoje oczekiwania. Ustalimy szczegóły i przygotujemy wycenę.',
                  )}
                </p>
              </div>
              <div className="border-t border-line bg-surface px-6 py-5 sm:px-7">
                <p className="text-sm font-bold text-ink">
                  {words('We can help arrange', 'Pomożemy zorganizować')}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-muted">
                  {words(
                    'Accommodation, transport and activities to suit your trip.',
                    'Noclegi, transport i atrakcje dopasowane do Twojej podróży.',
                  )}
                </p>
              </div>
            </aside>
          )}
          {kind === 'place' && (
            <aside className="sticky top-6 self-start rounded-2xl border border-line bg-surface p-7 max-md:static max-md:order-first max-md:w-full [&>svg]:mb-4 [&>svg]:text-accent [&_h3]:mb-6 [&_h3]:text-3xl [&_ul]:mt-5 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-3 [&_ul]:border-t [&_ul]:border-line [&_ul]:pt-5 [&_ul]:text-xs [&_ul]:text-muted [&_li]:flex [&_li]:items-center [&_li]:gap-2 [&_li>svg]:text-accent [&>small]:mt-4 [&>small]:text-center [&>small]:text-2xs">
              <MapPin size={25} />
              <h3>{words('Before you go.', 'Przed wizytą.')}</h3>
              <div className="flex flex-col gap-4 text-sm [&>div]:flex [&>div]:justify-between [&>div]:gap-2 [&_span]:text-muted [&_strong]:font-semibold [&_strong]:capitalize">
                <div>
                  <span>{words('Visit duration', 'Czas wizyty')}</span>
                  <strong>{item.duration} min</strong>
                </div>
                <div>
                  <span>{words('Estimated cost', 'Szacowany koszt')}</span>
                  <strong>{money(item.budget)}</strong>
                </div>
                <div>
                  <span>{words('Category', 'Kategoria')}</span>
                  <strong>{item.category}</strong>
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>
      {enquiry && <TourEnquiry trip={item} onClose={() => setEnquiry(false)} />}
      {editor && <ContentEditor item={editor} onClose={() => setEditor(null)} />}
    </>
  );
}

function TourHero({ item, onEdit }: { item: Content; onEdit: () => void }) {
  const { editing } = useStore();
  const words = useWords();
  const images = [...new Set([item.image, ...item.gallery].filter(Boolean))];
  const [index, setIndex] = useState(0);
  const current = index % images.length;
  return (
    <div className="relative mt-6 h-cover overflow-hidden rounded-3xl bg-ink max-md:h-80 max-sm:h-72">
      <div
        className="flex h-full transition-transform duration-500 ease-out motion-reduce:transition-none"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {images.map((image) => (
          <img key={image} className="h-full w-full shrink-0 object-cover" src={image} alt="" />
        ))}
      </div>
      <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-ink/90 via-ink/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-7 text-white sm:p-10 md:p-12">
        <InlineCopy
          item={item}
          className="max-w-4xl text-5xl text-white sm:text-6xl md:text-display"
        />
      </div>
      {images.length > 1 && (
        <div className="absolute right-6 top-6 flex items-center gap-2 sm:right-8 sm:top-8">
          <button
            type="button"
            aria-label={words('Previous photo', 'Poprzednie zdjęcie')}
            onClick={() => setIndex(current - 1)}
            disabled={current === 0}
            className="disabled:opacity-40 disabled:cursor-default grid size-11 place-items-center rounded-full bg-white/90 text-ink transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <ChevronLeft size={20} />
          </button>
          <span
            className="rounded-full bg-ink/60 px-3 py-2 text-sm font-bold text-white"
            aria-live="polite"
          >
            {current + 1} / {images.length}
          </span>
          <button
            type="button"
            aria-label={words('Next photo', 'Następne zdjęcie')}
            onClick={() => setIndex(current + 1)}
            disabled={current === images.length - 1}
            className="disabled:opacity-40 disabled:cursor-default grid size-11 place-items-center rounded-full bg-white/90 text-ink transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
      {editing && (
        <button
          type="button"
          className={buttonStyles({
            variant: 'light',
            size: 'sm',
            className: 'absolute bottom-6 right-6',
          })}
          onClick={onEdit}
        >
          <ImagePlus size={16} />
          {words('Edit photos', 'Edytuj zdjęcia')}
        </button>
      )}
    </div>
  );
}

import { ArrowLeft, Clock3, Footprints, GripVertical, MapPin } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { type Content, copy } from '../../shared/types';
import { ContentTools, OrderButtons, Relations } from '../components/ContentTools';
import { ContentEditor, newContent } from '../components/editor/ContentEditor';
import { InlineCopy } from '../components/editor/InlineCopy';
import { Gallery } from '../components/Gallery';
import { RouteCard } from '../components/RouteCard';
import { RouteMap, type RouteMapSelection } from '../components/maps/RouteMap';
import { useStore } from '../context/Store';
import { useContentDetail } from '../hooks/useContentDetail';
import { useSeo } from '../hooks/useSeo';
import { useWords } from '../hooks/useWords';
import { pathTo, routeDuration } from '../lib/content';
import { localGuide } from '../lib/offline';
import { NotFound } from './NotFoundPage';
import { RouteItinerary } from './RouteItinerary';

export function RouteDetail() {
  const { slug } = useParams();
  const { content, lang, editing, save, notice, user, online, hydrate } = useStore();
  const words = useWords();
  const route = content.find((c) => c.kind === 'route' && c.slug === slug);
  const [selection, setSelection] = useState<RouteMapSelection>({ id: '' });
  const [editor, setEditor] = useState<Content | null>(null);
  const selected = selection.id;
  // Each selection requests focus, including a repeat selection of the same place.
  const setSelected = useCallback((id: string) => setSelection({ id }), []);
  useSeo(route);
  const ready = useContentDetail(route?.id);
  useEffect(() => {
    if (route?.tripId && !online)
      localGuide(user.id, route.tripId)
        .then((g) => {
          if (g) hydrate(g);
        })
        .catch((e) => notice(e.message));
  }, [route?.tripId, user.id, online, hydrate, notice]);
  if (!route) return <NotFound />;
  if (!ready)
    return (
      <div role="status" className="mx-auto max-w-content px-6 py-16 text-muted">
        {words('Loading details…', 'Ładowanie szczegółów…')}
      </div>
    );
  const trip = content.find((c) => c.id === route.tripId),
    stops = (route.stopIds || [])
      .map((id) => content.find((c) => c.id === id))
      .filter((c): c is Content => !!c);
  const otherRoutes = (trip?.routeIds || [])
    .filter((id) => id !== route.id)
    .map((id) => content.find((entry) => entry.id === id))
    .filter((entry): entry is Content => !!entry);
  return (
    <div className="mx-auto w-full max-w-content px-6 pb-20 pt-8 md:px-9 xl:px-14">
      <div className="mb-6 flex items-center justify-between gap-4">
        <Link
          to={trip ? pathTo(trip) : '/routes'}
          className="inline-flex min-h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-primary transition-colors hover:bg-lilac"
        >
          <ArrowLeft size={16} />
          {trip ? copy(trip.title, lang) : words('All routes', 'Wszystkie trasy')}
        </Link>
        <ContentTools item={route} />
      </div>
      <div className="relative flex min-h-80 items-end overflow-hidden rounded-3xl bg-primary-dark md:min-h-120">
        <img src={route.image} alt="" className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-0 bg-linear-to-t from-ink/90 via-ink/30 to-transparent" />
        <div className="relative w-full p-7 text-white md:p-12">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-white/80">
            {words('Route', 'Trasa')}
          </p>
          <InlineCopy item={route} className="text-5xl text-white md:text-7xl" />
          <div className="mt-5 flex flex-wrap gap-2 text-sm font-semibold">
            {route.duration && (
              <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2">
                <Clock3 size={16} />
                {routeDuration(route.duration, lang)}
              </span>
            )}
            {route.transport && (
              <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2">
                <Footprints size={16} />
                {route.transport === 'walking' ? words('On foot', 'Pieszo') : route.transport}
              </span>
            )}
          </div>
        </div>
      </div>
      {route.plan && !editing ? (
        <RouteItinerary key={route.id} route={{ ...route, plan: route.plan }} stops={stops} lang={lang} selection={selection} onSelect={setSelected} />
      ) : <>
      <div className="max-w-4xl py-10 md:py-14">
        <InlineCopy
          item={route}
          field="description"
          rich
          as="div"
          className="text-base leading-relaxed text-muted [&_p]:mb-4 [&_h2]:mb-3 [&_h2]:mt-9 [&_h2]:text-3xl [&_h2]:text-ink [&_h3]:my-4 [&_h3]:text-ink [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_a]:font-semibold [&_a]:text-primary [&_a:hover]:text-accent [&_strong]:text-ink"
        />
      </div>
      <div>
        {editing && (
        <div>
          {stops.map((stop, i) => (
            <article
              key={stop.id}
              className={`group mb-4 overflow-hidden rounded-2xl border bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${selected === stop.id ? 'border-accent' : 'border-line'}`}
              draggable={editing}
              onDragStart={(e) => e.dataTransfer.setData('text/plain', stop.id)}
              onDragOver={(e) => {
                if (editing) e.preventDefault();
              }}
              onDrop={(e) => {
                e.preventDefault();
                const ids = [...(route.stopIds || [])],
                  from = ids.indexOf(e.dataTransfer.getData('text/plain'));
                if (from < 0) return;
                ids.splice(i, 0, ids.splice(from, 1)[0]);
                save({ ...route, stopIds: ids }).catch((e) => notice(e.message));
              }}
            >
              <div className="flex gap-5 p-4 sm:p-5">
                <img
                  src={stop.image}
                  alt=""
                  loading="lazy"
                  className="h-28 w-28 shrink-0 rounded-xl object-cover sm:h-32 sm:w-36"
                />
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-muted">
                    {editing && <GripVertical size={15} />}
                    {stop.duration ? (
                      <>
                        <Clock3 size={14} /> {stop.duration} min
                      </>
                    ) : null}
                  </div>
                  <h3 className="text-2xl text-ink">{copy(stop.title, lang)}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {copy(stop.description, lang).replace(/<[^>]*>/g, '')}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      className="inline-flex min-h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-primary transition-colors hover:bg-lilac"
                      onClick={() => setSelected(stop.id)}
                    >
                      <MapPin size={16} />
                      {words('Show on map', 'Pokaż na mapie')}
                    </button>
                    {stop.lat != null && stop.lng != null && (
                      <a
                        className="inline-flex min-h-10 items-center rounded-xl px-3 text-sm font-semibold text-primary transition-colors hover:bg-lilac"
                        href={`https://www.google.com/maps/search/?api=1&query=${stop.lat},${stop.lng}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {words('Open in Google Maps', 'Otwórz w Google Maps')}
                      </a>
                    )}
                  </div>
                </div>
              </div>
              {editing && (
                <div className="flex justify-end px-5 pb-2">
                  <OrderButtons
                    ids={route.stopIds || []}
                    index={i}
                    onChange={(ids) =>
                      save({ ...route, stopIds: ids }).catch((e) => notice(e.message))
                    }
                  />
                </div>
              )}
            </article>
          ))}
          <Relations
            parent={route}
            field="stopIds"
            childKind="place"
            onCreate={() => setEditor(newContent('place', route))}
          />
        </div>
        )}
        <div>
          <RouteMap
            places={stops}
            lang={lang}
            selection={selection}
            onSelect={setSelected}
            editable={editing}
            onMove={(id, lat, lng) => {
              const p = content.find((c) => c.id === id);
              if (p) save({ ...p, lat, lng }).catch((e) => notice(e.message));
            }}
            onAdd={(lat, lng) => setEditor({ ...newContent('place', route), lat, lng })}
          />
        </div>
      </div>
      </>}
      <Gallery item={route} />
      {otherRoutes.length > 0 && (
        <section className="mt-8 border-t border-line pt-10">
          <h2 className="mb-6 text-3xl">{words('Other routes', 'Inne trasy')}</h2>
          <div className="flex gap-4 overflow-x-auto pb-5 pt-2">
            {otherRoutes.map((sibling) => (
              <div key={sibling.id} className="w-72 shrink-0">
                <RouteCard route={sibling} content={content} lang={lang} compact />
              </div>
            ))}
          </div>
        </section>
      )}
      {editor && (
        <ContentEditor
          item={editor}
          onClose={() => setEditor(null)}
          onSaved={(c) => {
            if (c.kind === 'place')
              save({ ...route, stopIds: [...(route.stopIds || []), c.id] }).catch((e) =>
                notice(e.message),
              );
          }}
        />
      )}
    </div>
  );
}

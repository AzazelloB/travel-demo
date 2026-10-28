import { ArrowLeft, Clock3, Footprints, GripVertical, LockKeyhole, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { type Content, copy } from '../../shared/types';
import { ContentTools, OrderButtons, Relations } from '../components/ContentTools';
import { ContentEditor, newContent } from '../components/editor/ContentEditor';
import { InlineCopy } from '../components/editor/InlineCopy';
import { Gallery } from '../components/Gallery';
import { TravelMap } from '../components/maps/TravelMap';
import { useStore } from '../context/Store';
import { useContentDetail } from '../hooks/useContentDetail';
import { useSeo } from '../hooks/useSeo';
import { useWords } from '../hooks/useWords';
import { money, pathTo, routeDuration } from '../lib/content';
import { localGuide } from '../lib/offline';
import { SectionHead } from '../ui/SectionHead';
import { NotFound } from './NotFoundPage';

export function RouteDetail() {
  const { slug } = useParams();
  const { content, lang, editing, save, notice, user, online, hydrate } = useStore();
  const words = useWords();
  const route = content.find((c) => c.kind === 'route' && c.slug === slug);
  const [selected, setSelected] = useState(''),
    [editor, setEditor] = useState<Content | null>(null);
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
  const access = true;
  const siblings = trip?.routeIds || [],
    index = siblings.indexOf(route.id);
  return (
    <div className="mx-auto w-full max-w-content px-6 md:px-9 xl:px-14 pb-20 pt-9 [&>.inline-copy_h1]:mb-7 [&>.inline-copy_h1]:text-display max-sm:[&>.inline-copy_h1]:text-5xl">
      <div className="mb-9 flex flex-wrap items-center gap-3 text-xs font-semibold text-muted [&_a]:inline-flex [&_a]:items-center [&_a]:gap-2 [&_a]:text-primary [&_a]:hover:text-accent">
        {trip && (
          <Link to={pathTo(trip)}>
            <ArrowLeft size={14} />
            {copy(trip.title, lang)}
          </Link>
        )}
        <span>/</span>
        <span>{words('Route', 'Trasa')}</span>
      </div>
      <ContentTools item={route} />
      <div className="mb-5 flex flex-wrap gap-2 [&_span]:flex [&_span]:items-center [&_span]:gap-2 [&_span]:rounded-lg [&_span]:bg-surface [&_span]:px-3 [&_span]:py-2 [&_span]:text-xs [&_span]:font-bold [&_span]:capitalize [&_span]:text-primary">
        <span>
          <Footprints size={15} />
          {route.transport}
        </span>
        <span>
          <Clock3 size={15} />
          {routeDuration(route.duration, lang)}
        </span>
        <span>{money(route.budget)}</span>
      </div>
      <InlineCopy item={route} />
      <div className="mb-7 h-80 overflow-hidden rounded-3xl max-sm:h-56 [&_img]:h-full">
        <img src={route.image} alt={copy(route.title, lang)} />
      </div>
      {access ? (
        <InlineCopy
          item={route}
          field="description"
          rich
          as="div"
          className="text-sm leading-loose text-muted [&_p]:mb-4 [&_h2]:my-5 [&_h2]:text-ink [&_h3]:my-4 [&_h3]:text-ink [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_a]:text-primary [&_a]:rounded [&_a]:bg-lilac/60 [&_a]:px-1 [&_a]:font-semibold [&_a:hover]:bg-lilac [&_strong]:text-ink mb-8 max-w-4xl text-base"
        />
      ) : (
        <div className="mb-9 flex items-center gap-3 rounded-xl border border-line bg-surface p-5 [&_p]:text-sm">
          <LockKeyhole size={19} />
          <p>
            {words(
              'The full route notes are included with the tour.',
              'Szczegółowe opisy tras znajdziesz w opisie wycieczki.',
            )}
          </p>
          {trip && (
            <Link
              className="inline-flex min-h-10 items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-primary transition-colors hover:bg-lilac hover:text-primary-dark"
              to={pathTo(trip)}
            >
              {words('View tour', 'Zobacz wycieczkę')}
            </Link>
          )}
        </div>
      )}
      <div className="grid grid-cols-2 items-start gap-9 max-md:grid-cols-1">
        <div className="">
          <SectionHead title={words('Stops.', 'Przystanki.')} />
          {stops.map((stop, i) => (
            <article
              key={stop.id}
              className={`mb-3 rounded-2xl border border-line bg-white p-5 transition-colors [&.selected]:border-accent [&.selected]:ring-1 [&.selected]:ring-accent [&>p]:mt-4 [&>p]:text-sm [&>p]:text-muted ${selected === stop.id ? 'selected' : ''}`}
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
              <button
                type="button"
                className="w-full justify-start gap-3 p-0 text-left [&>img]:h-20 [&>img]:w-20 [&>img]:rounded-lg [&>div]:flex-1 [&_h3]:mb-2 [&_h3]:text-2xl [&>svg:last-child]:text-accent"
                onClick={() => setSelected(stop.id)}
              >
                {editing && <GripVertical size={15} />}
                <img src={stop.image} alt="" />
                <div>
                  <span className="mb-3 flex items-center gap-2 font-sans text-xs font-semibold uppercase tracking-widest text-muted">
                    {stop.category}
                  </span>
                  <h3>{copy(stop.title, lang)}</h3>
                  <span className="flex items-center gap-2 text-xs text-muted">
                    {stop.duration} min · {money(stop.budget)}
                  </span>
                </div>
                <MapPin size={17} />
              </button>
              {access && <p>{copy(stop.description, lang).replace(/<[^>]*>/g, '')}</p>}
              <div className="mt-3 flex items-center justify-between">
                <Link
                  className="inline-flex min-h-10 items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-primary transition-colors hover:bg-lilac hover:text-primary-dark"
                  to={pathTo(stop)}
                >
                  {words('Place details', 'Szczegóły miejsca')}
                </Link>
                {editing && (
                  <OrderButtons
                    ids={route.stopIds || []}
                    index={i}
                    onChange={(ids) =>
                      save({ ...route, stopIds: ids }).catch((e) => notice(e.message))
                    }
                  />
                )}
              </div>
            </article>
          ))}
          <Relations
            parent={route}
            field="stopIds"
            childKind="place"
            onCreate={() => setEditor(newContent('place', route))}
          />
        </div>
        <div className="sticky top-6 max-md:relative max-md:row-start-1 [&_.travel-map>svg]:min-h-90">
          <TravelMap
            places={stops}
            selected={selected}
            onSelect={setSelected}
            route
            editable={editing}
            onMove={(id, lat, lng) => {
              const p = content.find((c) => c.id === id);
              if (p) save({ ...p, lat, lng }).catch((e) => notice(e.message));
            }}
            onAdd={(lat, lng) => setEditor({ ...newContent('place', route), lat, lng })}
          />
          <div className="mt-3 flex items-center justify-center gap-2 text-xs text-muted">
            <Footprints size={15} />
            {words(
              'Illustrated route · check local conditions before travel.',
              'Trasa poglądowa · sprawdź warunki przed podróżą.',
            )}
          </div>
        </div>
      </div>
      <Gallery item={route} />
      <div className="mt-8 flex items-center justify-between border-t border-line pt-10">
        {index > 0 && content.find((c) => c.id === siblings[index - 1]) ? (
          <Link
            className="inline-flex min-h-10 items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-primary transition-colors hover:bg-lilac hover:text-primary-dark"
            to={pathTo(content.find((c) => c.id === siblings[index - 1])!)}
          >
            <ArrowLeft size={16} />
            {words('Previous route', 'Poprzednia trasa')}
          </Link>
        ) : (
          <span />
        )}
        {index < siblings.length - 1 && content.find((c) => c.id === siblings[index + 1]) && (
          <Link
            className="inline-flex min-h-10 items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-primary transition-colors hover:bg-lilac hover:text-primary-dark"
            to={pathTo(content.find((c) => c.id === siblings[index + 1])!)}
          >
            {words('Next route', 'Następna trasa')}
          </Link>
        )}
      </div>
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

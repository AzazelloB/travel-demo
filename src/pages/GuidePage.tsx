import { ArrowLeft, Check } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { cleanHtml } from '../../shared/html';
import { type Content, copy, type Guide } from '../../shared/types';
import { TravelMap } from '../components/maps/TravelMap';
import { useStore } from '../context/Store';
import { useWords } from '../hooks/useWords';
import { money, pathTo, routeDuration } from '../lib/content';
import { loadGuide } from '../lib/offline';
import { buttonStyles } from '../ui/Button';
import { Empty } from '../ui/Empty';

export function GuidePage() {
  const { id } = useParams();
  const { user, lang, online, hydrate, notice } = useStore();
  const words = useWords();
  const [guide, setGuide] = useState<Guide | null>(null),
    [error, setError] = useState('');
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const g = await loadGuide(user.id, id!, online);
        if (!g) throw new Error('This route has not been downloaded on this device.');
        if (alive) {
          setGuide(g);
          setError('');
          hydrate(g);
        }
      } catch (e) {
        if (alive) setError((e as Error).message);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id, user.id, online, hydrate]);
  if (error)
    return (
      <Empty title={error}>
        <Link className={buttonStyles({ variant: 'secondary' })} to="/routes">
          {words('Routes', 'Trasy')}
        </Link>
      </Empty>
    );
  if (!guide)
    return (
      <div className="flex min-h-screen items-center justify-center gap-3 text-sm text-muted">
        <span className="inline-block size-4 animate-spin rounded-full border-2 border-line border-t-primary" />
        Opening your route…
      </div>
    );
  return (
    <div className="mx-auto w-full max-w-content px-6 md:px-9 xl:px-14 max-w-5xl pb-20 pt-9 [&_h1]:mb-7 [&_h1]:text-display">
      <Link
        className="inline-flex min-h-10 items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-primary transition-colors hover:bg-lilac hover:text-primary-dark"
        to="/routes"
      >
        <ArrowLeft size={15} />
        {words('Routes', 'Trasy')}
      </Link>
      <div className="mb-3 mt-10 flex items-center gap-2 text-xs text-primary">
        <Check size={14} />
        {online
          ? words('Free route', 'Bezpłatna trasa')
          : words('Reading offline', 'Czytasz offline')}
      </div>
      <h1>{copy(guide.trip.title, lang)}</h1>
      <img className="mb-7 h-90 rounded-2xl max-sm:h-64" src={guide.trip.image} alt="" />
      <div
        className="text-sm leading-loose text-muted [&_p]:mb-4 [&_h2]:my-5 [&_h2]:text-ink [&_h3]:my-4 [&_h3]:text-ink [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_a]:text-primary [&_a]:rounded [&_a]:bg-lilac/60 [&_a]:px-1 [&_a]:font-semibold [&_a:hover]:bg-lilac [&_strong]:text-ink"
        dangerouslySetInnerHTML={{ __html: cleanHtml(copy(guide.trip.description, lang)) }}
      />
      {guide.routes.map((r) => (
        <section className="border-b border-line py-10" key={r.id}>
          <div className="mb-6 flex items-center justify-between gap-5 max-sm:flex-col max-sm:items-start [&_h2]:text-4xl">
            <div>
              <span className="mb-3 flex items-center gap-2 font-sans text-xs font-semibold uppercase tracking-widest text-muted">
                {routeDuration(r.duration, lang)} · {r.transport} · {money(r.budget)}
              </span>
              <h2>{copy(r.title, lang)}</h2>
            </div>
            <Link
              className="inline-flex min-h-10 items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-primary transition-colors hover:bg-lilac hover:text-primary-dark"
              to={pathTo(r)}
            >
              {words('Route view', 'Widok trasy')}
            </Link>
          </div>
          <div
            className="text-sm leading-loose text-muted [&_p]:mb-4 [&_h2]:my-5 [&_h2]:text-ink [&_h3]:my-4 [&_h3]:text-ink [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_a]:text-primary [&_a]:rounded [&_a]:bg-lilac/60 [&_a]:px-1 [&_a]:font-semibold [&_a:hover]:bg-lilac [&_strong]:text-ink"
            dangerouslySetInnerHTML={{ __html: cleanHtml(copy(r.description, lang)) }}
          />
          <TravelMap
            places={(r.stopIds || [])
              .map((s) => guide.places.find((p) => p.id === s))
              .filter((p): p is Content => !!p)}
            route
          />
          {(r.stopIds || []).map((s) => {
            const place = guide.places.find((p) => p.id === s);
            return place ? (
              <article
                className="flex gap-5 border-t border-line py-6 max-sm:flex-col [&>img]:h-40 [&>img]:w-40 [&>img]:rounded-xl max-sm:[&>img]:h-52 max-sm:[&>img]:w-full [&_h3]:mb-2 [&_h3]:text-3xl [&_span]:text-xs [&_span]:text-muted"
                key={s}
              >
                <img src={place.image} alt="" loading="lazy" />
                <div>
                  <h3>{copy(place.title, lang)}</h3>
                  <span>
                    {place.duration} min · {money(place.budget)}
                  </span>
                  <div
                    className="text-sm leading-loose text-muted [&_p]:mb-4 [&_h2]:my-5 [&_h2]:text-ink [&_h3]:my-4 [&_h3]:text-ink [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_a]:text-primary [&_a]:rounded [&_a]:bg-lilac/60 [&_a]:px-1 [&_a]:font-semibold [&_a:hover]:bg-lilac [&_strong]:text-ink"
                    dangerouslySetInnerHTML={{ __html: cleanHtml(copy(place.description, lang)) }}
                  />
                </div>
              </article>
            ) : null;
          })}
        </section>
      ))}
      <button
        type="button"
        className="inline-flex min-h-10 items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-primary transition-colors hover:bg-lilac hover:text-primary-dark"
        onClick={() => notice('Use Routes to update or remove your download.')}
      >
        {words('Manage offline download in Routes', 'Zarządzaj pobraniem w Trasach')}
      </button>
    </div>
  );
}

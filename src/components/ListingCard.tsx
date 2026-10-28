import { Clock3, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { type Content, copy } from '../../shared/types';
import { useStore } from '../context/Store';
import { useWords } from '../hooks/useWords';
import { money, pathTo } from '../lib/content';

export function ListingCard({ item }: { item: Content }) {
  const { content, lang } = useStore();
  const words = useWords();
  const kind = item.kind;
  const destinations = content.filter((entry) => entry.kind === 'destination');
  const destination = destinations.find((d) => d.id === item.destinationId);
  const routeCount = (item.routeIds || []).filter((id) =>
    content.some((route) => route.id === id && route.published),
  ).length;
  const routeWord =
    lang === 'pl'
      ? {
          zero: 'tras',
          one: 'trasa',
          two: 'trasy',
          few: 'trasy',
          many: 'tras',
          other: 'trasy',
        }[new Intl.PluralRules('pl').select(routeCount)] || 'tras'
      : routeCount === 1
        ? 'route'
        : 'routes';
  return (
    <Link
      to={pathTo(item)}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:border-accent/40 hover:shadow-xl"
    >
      <div className="relative h-64 overflow-hidden bg-lilac [&>img]:h-full [&>img]:transition-transform [&>img]:duration-500 group-hover:[&>img]:scale-105 group-focus-visible:[&>img]:scale-105">
        <img src={item.image} alt="" loading="lazy" />
        {kind === 'trip' && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-ink/85 via-ink/30 to-transparent"
          />
        )}
        {kind === 'trip' && (
          <div className="absolute bottom-4 left-5 flex items-baseline gap-2 text-white">
            <span className="text-xs font-semibold">{words('From', 'Od')}</span>
            <strong className="text-3xl font-bold tracking-tight">{money(item.price)}</strong>
          </div>
        )}
        {!item.published && (
          <span className="absolute right-3 top-3 rounded-md bg-amber-200 px-2 py-1 text-xs text-amber-900">
            Draft
          </span>
        )}
        {kind === 'trip' && (
          <span className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-sm font-bold text-primary shadow-sm">
            <Clock3 size={14} />
            {item.duration} {words('days', 'dni')}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-6 [&_h2]:mb-3 [&_h2]:mt-3 [&_h2]:text-3xl [&_h2]:leading-tight [&_p]:text-sm [&_p]:text-muted">
        <span className="flex min-h-4 items-center gap-1 text-xs font-bold uppercase tracking-wider text-muted">
          <MapPin size={13} />
          {kind === 'destination' ? item.region : copy(destination?.title, lang)}
        </span>
        <h2>{copy(item.title, lang)}</h2>
        {kind === 'trip' && (
          <p className="mb-6 line-clamp-3 leading-relaxed">
            {copy(item.description, lang)
              .replace(/<[^>]*>/g, ' ')
              .replace(/\s+/g, ' ')
              .trim()}
          </p>
        )}
        {kind === 'trip' ? (
          <span className="mt-auto flex items-center justify-between border-t border-line pt-4 text-sm font-bold text-primary transition-colors group-hover:text-accent">
            <span>{words('View tour', 'Zobacz wycieczkę')}</span>
            <span className="rounded-full bg-surface px-3 py-1 text-xs font-semibold text-muted">
              {routeCount} {routeWord}
            </span>
          </span>
        ) : (
          <p>{copy(item.description, lang).replace(/<[^>]*>/g, '')}</p>
        )}
      </div>
    </Link>
  );
}

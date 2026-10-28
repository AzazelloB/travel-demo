import { Clock3, Footprints, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { type Content, copy } from '../../shared/types';
import { useStore } from '../context/Store';
import { useWords } from '../hooks/useWords';
import { money, pathTo } from '../lib/content';

export function Card({ item }: { item: Content }) {
  const { lang } = useStore();
  const words = useWords();
  return (
    <Link to={pathTo(item)} className="group block">
      <div className="relative h-60 overflow-hidden rounded-2xl bg-lilac [&>img]:h-full [&>img]:transition-transform [&>img]:duration-500 group-hover:[&>img]:scale-105">
        <img src={item.image} alt={copy(item.title, lang)} loading="lazy" />
        {!item.published && (
          <span className="absolute right-3 top-3 rounded-md bg-amber-200 px-2 py-1 text-xs text-amber-900">
            Draft
          </span>
        )}
        {item.kind === 'trip' && (
          <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-canvas/95 px-3 py-1.5 text-xs text-ink">
            <Footprints size={13} />
            {words('Tour', 'Wycieczka')}
          </span>
        )}
      </div>
      <div className="pt-5 [&_h3]:mb-3 [&_h3]:text-3xl [&_p]:text-sm [&_p]:text-muted">
        {item.kind === 'trip' && (
          <div className="mb-3 flex items-center gap-2 font-sans text-xs font-semibold uppercase tracking-widest text-muted">
            <MapPin size={12} />
            {item.destinationId?.replace(/-/g, ' ')}
          </div>
        )}
        <h3>{copy(item.title, lang)}</h3>
        {item.kind === 'destination' ? (
          <p>{copy(item.description, lang).replace(/<[^>]*>/g, '')}</p>
        ) : (
          <>
            <div className="flex flex-wrap gap-4 text-xs text-muted [&>span]:flex [&>span]:items-center [&>span]:gap-1.5">
              <span>
                <Clock3 size={14} />
                {item.duration}{' '}
                {item.kind === 'trip' ? words('days', 'dni') : words('hours', 'godz.')}
              </span>
              <span>
                {words('Budget', 'Budżet')} {money(item.budget)}
              </span>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-line pt-4 text-xs text-muted [&_strong]:text-xl [&_strong]:font-bold [&_strong]:text-accent">
              <span>{words('Tour', 'Wycieczka')}</span>
              <strong>{money(item.price)}</strong>
            </div>
          </>
        )}
      </div>
    </Link>
  );
}

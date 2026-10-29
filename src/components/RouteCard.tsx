import { Clock3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { type Content, copy, type Lang } from '../../shared/types';
import { pathTo, routeDuration } from '../lib/content';

export function RouteCard({ route, content, lang, compact = false }: { route: Content; content: Content[]; lang: Lang; compact?: boolean }) {
  const routeStops = (route.stopIds || [])
    .map((id) => content.find((entry) => entry.id === id))
    .filter((entry): entry is Content => !!entry);
  if (compact) {
    return (
      <Link to={pathTo(route)} className="group block h-full overflow-hidden rounded-3xl border border-line bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:border-accent/40 hover:shadow-xl">
        <div className="relative h-40 overflow-hidden bg-lilac">
          <img src={route.image} alt="" className="size-full object-cover transition-transform duration-500 group-hover:scale-105" />
          <span className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-bold text-primary">
            <Clock3 size={13} /> {routeDuration(route.duration, lang)}
          </span>
        </div>
        <div className="px-4 py-4">
          <h3 className="text-2xl leading-tight transition-colors group-hover:text-accent">{copy(route.title, lang)}</h3>
        </div>
        {routeStops.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 border-t border-line bg-surface/50 px-4 py-3">
            {routeStops.slice(0, 2).map((stop) => (
              <span key={stop.id} className="flex items-center gap-2 rounded-full bg-white pr-3 text-xs font-semibold text-ink">
                <img src={stop.image} alt="" className="size-8 rounded-full object-cover" />
                {copy(stop.title, lang)}
              </span>
            ))}
            {routeStops.length > 2 && <span className="px-1 text-xs font-bold text-primary">+{routeStops.length - 2}</span>}
          </div>
        )}
      </Link>
    );
  }
  return (
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
  );
}

import { Check, Download, MapPin, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { copy } from '../../shared/types';
import { useStore } from '../context/Store';
import { useWords } from '../hooks/useWords';
import { pathTo, routeDuration } from '../lib/content';
import { downloadGuide, localGuide } from '../lib/offline';
import { buttonStyles } from '../ui/Button';
import { Empty } from '../ui/Empty';

export function MyRoutes() {
  const { user, content, lang, online, notice, hydrate } = useStore();
  const words = useWords();
  const navigate = useNavigate();
  const [downloads, setDownloads] = useState<Record<string, string>>({}),
    [busy, setBusy] = useState('');
  const routes = content.filter((c) => c.kind === 'route' && c.published && c.tripId);
  const load = useCallback(async () => {
    const tripIds = [
      ...new Set(
        content
          .filter((c) => c.kind === 'route' && c.published && c.tripId)
          .map((route) => route.tripId!),
      ),
    ];
    const entries = await Promise.all(
      tripIds.map(async (id) => [id, (await localGuide(user.id, id))?.downloadedAt || '']),
    );
    setDownloads(Object.fromEntries(entries));
  }, [content, user.id]);
  useEffect(() => {
    load().catch((e) => notice(e.message));
  }, [load, notice]);
  async function download(tripId: string) {
    setBusy(tripId);
    try {
      const { missed } = await downloadGuide(user.id, tripId);
      await load();
      notice(
        missed
          ? 'Route downloaded. Some images could not be cached.'
          : 'Routes downloaded for offline use.',
      );
    } catch (e) {
      notice((e as Error).message);
    } finally {
      setBusy('');
    }
  }
  return (
    <div className="mx-auto w-full max-w-content px-6 md:px-9 xl:px-14 min-h-screen pb-20 pt-14 [&_.page-intro]:pt-0 [&_.owned-grid]:lg:grid-cols-3">
      <div className="page-intro mb-8 pt-14 [&_h1]:text-6xl max-sm:pt-9 max-sm:[&_h1]:text-5xl">
        <h1>{words('Routes.', 'Trasy.')}</h1>
      </div>
      {!routes.length ? (
        <Empty title={words('No routes available yet.', 'Nie ma jeszcze dostępnych tras.')}>
          <Link className={buttonStyles()} to="/trips">
            {words('Explore tours', 'Zobacz wycieczki')}
          </Link>
        </Empty>
      ) : (
        <div className="owned-grid grid grid-cols-1 gap-6 sm:grid-cols-2">
          {routes.map((route) => {
            const trip = content.find((c) => c.id === route.tripId);
            const downloaded = downloads[route.tripId!];
            return (
              <article
                className="flex flex-col overflow-hidden rounded-2xl border border-line bg-white [&>img]:h-52 [&>div]:flex [&>div]:flex-1 [&>div]:flex-col [&>div]:p-6 [&_h2]:mb-3 [&_h2]:text-3xl [&_p]:text-sm [&_p]:text-muted [&_.owned-actions]:mt-auto [&_.owned-actions]:pt-5"
                key={route.id}
              >
                <img src={route.image} alt="" />
                <div>
                  <span
                    className={`mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted [&.downloaded]:text-primary ${downloaded ? 'downloaded' : ''}`}
                  >
                    {downloaded ? <Check size={13} /> : <MapPin size={13} />}{' '}
                    {downloaded
                      ? words('Available offline', 'Dostępna offline')
                      : copy(trip?.title, lang)}
                  </span>
                  <h2>{copy(route.title, lang)}</h2>
                  <p>
                    {route.stopIds?.length || 0} {words('places', 'miejsc')} ·{' '}
                    {routeDuration(route.duration, lang)}
                  </p>
                  {downloaded && (
                    <small>
                      {words('Downloaded', 'Pobrano')}{' '}
                      {new Date(downloaded).toLocaleDateString(lang)}
                    </small>
                  )}
                  <div className="owned-actions mt-5 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      className={buttonStyles({ size: 'sm' })}
                      onClick={async () => {
                        try {
                          if (!online) {
                            const routeBundle = await localGuide(user.id, route.tripId!);
                            if (!routeBundle)
                              throw new Error('Download this route before going offline.');
                            hydrate(routeBundle);
                          }
                          navigate(pathTo(route));
                        } catch (e) {
                          notice((e as Error).message);
                        }
                      }}
                    >
                      {words('Open route', 'Otwórz trasę')}
                    </button>
                    <button
                      type="button"
                      className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl text-primary transition-colors hover:bg-lilac"
                      disabled={!online || busy === route.tripId}
                      title={downloaded ? 'Update download' : 'Download offline'}
                      onClick={() => download(route.tripId!)}
                    >
                      {busy === route.tripId ? (
                        <span className="inline-block size-4 animate-spin rounded-full border-2 border-line border-t-primary" />
                      ) : (
                        <Download size={18} />
                      )}
                    </button>
                    {downloaded && (
                      <button
                        type="button"
                        className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl text-primary transition-colors hover:bg-lilac"
                        title="Remove local download"
                        onClick={async () => {
                          await localGuide(user.id, route.tripId!, 'delete');
                          await caches.delete(`roam-guide-images-${user.id}-${route.tripId}`);
                          await load();
                          notice('Local download removed.');
                        }}
                      >
                        <Trash2 size={17} />
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
      <div className="mt-12 flex gap-5 rounded-2xl border border-line bg-surface p-7 [&>svg]:text-accent [&_h3]:mb-2 [&_h3]:text-2xl [&_p]:text-sm [&_p]:text-muted">
        <Download size={22} />
        <div>
          <h3>{words('Routes offline.', 'Trasy offline.')}</h3>
          <p>
            {words(
              'Download while connected to save a tour’s routes, places, descriptions and images on this device.',
              'Pobierz trasy po połączeniu z internetem, aby zapisać miejsca, opisy i zdjęcia na urządzeniu.',
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

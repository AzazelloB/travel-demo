import schema from '../migrations/0001_initial.sql?raw';
import mediaSchema from '../migrations/0002_media_indexes.sql?raw';
import {
  agencyPage,
  europeDestinations,
  europeTours,
  peruContent,
  romeRouteDefaults,
  romeRoutes,
  seed,
} from '../shared/seed';
import { type Content, canEdit, canModerate, type Identity, roles } from '../shared/types';
import {
  contactSchema,
  contentSchema,
  moderationSchema,
  purchaseSchema,
  roleSchema,
  submissionSchema,
} from '../shared/validation';
import { visibleContent } from './content';
import { body, fail } from './http';
import { cleanupUploads, mediaRefs, mediaUrls, removeMedia, serveMedia, upload } from './media';
import { listSubmissions } from './submissions';

interface Env {
  DB: D1Database;
  MEDIA: R2Bucket;
  ASSETS: Fetcher;
}
const guest: Identity = { id: 'guest', name: 'Guest', role: 'Guest' };
let ready: Promise<void> | undefined;
const json = (data: unknown, status = 200, headers: Record<string, string> = {}) =>
  Response.json(data, { status, headers: { 'Cache-Control': 'no-store', ...headers } });
const uid = () => crypto.randomUUID();
async function init(env: Env) {
  if (!ready)
    ready = (async () => {
      // The same idempotent migration works locally and on a fresh D1 binding.
      for (const sql of `${schema};${mediaSchema}`
        .split(';')
        .map((s) => s.trim())
        .filter(Boolean))
        await env.DB.prepare(sql).run();
      if (!(await env.DB.prepare("SELECT value FROM app_meta WHERE key='seed-v1'").first())) {
        await env.DB.batch([
          ...seed.map((c) =>
            env.DB.prepare('INSERT OR IGNORE INTO content VALUES (?, ?, ?)').bind(
              c.id,
              c.kind,
              JSON.stringify(c),
            ),
          ),
          ...roles
            .filter((r) => r !== 'Guest')
            .map((r) =>
              env.DB.prepare('INSERT OR IGNORE INTO users VALUES (?, ?, ?)').bind(
                `demo-${r.toLowerCase()}`,
                `${r} traveler`,
                r,
              ),
            ),
          env.DB.prepare("INSERT OR IGNORE INTO app_meta VALUES ('seed-v1','done')"),
        ]);
      }
      if (
        !(await env.DB.prepare("SELECT value FROM app_meta WHERE key='seed-europe-v1'").first())
      ) {
        await env.DB.batch([
          ...europeDestinations.map((c) =>
            env.DB.prepare('INSERT OR IGNORE INTO content VALUES (?, ?, ?)').bind(
              c.id,
              c.kind,
              JSON.stringify(c),
            ),
          ),
          env.DB.prepare("INSERT OR IGNORE INTO app_meta VALUES ('seed-europe-v1','done')"),
        ]);
      }
      if (
        !(await env.DB.prepare(
          "SELECT value FROM app_meta WHERE key='seed-europe-tours-v1'",
        ).first())
      ) {
        await env.DB.batch([
          ...europeTours.map((c) =>
            env.DB.prepare('INSERT OR IGNORE INTO content VALUES (?, ?, ?)').bind(
              c.id,
              c.kind,
              JSON.stringify(c),
            ),
          ),
          env.DB.prepare("INSERT OR IGNORE INTO app_meta VALUES ('seed-europe-tours-v1','done')"),
        ]);
      }
      if (
        !(await env.DB.prepare(
          "SELECT value FROM app_meta WHERE key='demo-tour-prices-v1'",
        ).first())
      ) {
        const prices: [string, number, number][] = [
          ['tatras-weekend', 39, 1290],
          ['krakow-weekend', 29, 890],
          ['baltic-weekend', 35, 1190],
          ['bieszczady-weekend', 29, 990],
        ];
        await env.DB.batch([
          ...prices.map(([id, oldPrice, price]) =>
            env.DB.prepare(
              "UPDATE content SET data=json_set(data, '$.price', ?) WHERE id=? AND json_extract(data, '$.price')=?",
            ).bind(price, id, oldPrice),
          ),
          env.DB.prepare("INSERT OR IGNORE INTO app_meta VALUES ('demo-tour-prices-v1','done')"),
        ]);
      }
      if (
        !(await env.DB.prepare("SELECT value FROM app_meta WHERE key='seed-agency-v1'").first())
      ) {
        await env.DB.batch([
          env.DB.prepare('INSERT OR IGNORE INTO content VALUES (?, ?, ?)').bind(
            agencyPage.id,
            agencyPage.kind,
            JSON.stringify(agencyPage),
          ),
          env.DB.prepare("INSERT OR IGNORE INTO app_meta VALUES ('seed-agency-v1','done')"),
        ]);
      }
      if (
        !(await env.DB.prepare("SELECT value FROM app_meta WHERE key='agency-copy-v2'").first())
      ) {
        const changes = [
          ['$.title.en', 'Tours from a team in Switzerland.', agencyPage.title.en],
          ['$.title.pl', 'Wycieczki z zespołem w Szwajcarii.', agencyPage.title.pl],
          [
            '$.description.en',
            '<p>We organise tours across Europe and beyond, with practical planning and support before and during your trip.</p>',
            agencyPage.description.en,
          ],
          [
            '$.description.pl',
            '<p>Organizujemy wycieczki po Europie i poza nią. Pomagamy w planowaniu oraz wspieramy przed wyjazdem i w jego trakcie.</p>',
            agencyPage.description.pl,
          ],
        ];
        await env.DB.batch([
          ...changes.map(([path, original, updated]) =>
            env.DB.prepare(
              'UPDATE content SET data=json_set(data, ?, ?) WHERE id=? AND json_extract(data, ?)=?',
            ).bind(path, updated, 'agency', path, original),
          ),
          env.DB.prepare("INSERT OR IGNORE INTO app_meta VALUES ('agency-copy-v2','done')"),
        ]);
      }
      if (
        !(await env.DB.prepare("SELECT value FROM app_meta WHERE key='agency-copy-v3'").first())
      ) {
        const changes = [
          ['$.title.en', 'Tours organised for you.', agencyPage.title.en],
          ['$.title.pl', 'Wycieczki zorganizowane dla Ciebie.', agencyPage.title.pl],
          [
            '$.description.en',
            '<p>We plan the itinerary, arrange accommodation and provide support before and during your trip.</p>',
            agencyPage.description.en,
          ],
          [
            '$.description.pl',
            '<p>Planujemy trasę, organizujemy noclegi i zapewniamy wsparcie przed podróżą oraz w jej trakcie.</p>',
            agencyPage.description.pl,
          ],
        ];
        await env.DB.batch([
          ...changes.map(([path, original, updated]) =>
            env.DB.prepare(
              'UPDATE content SET data=json_set(data, ?, ?) WHERE id=? AND json_extract(data, ?)=?',
            ).bind(path, updated, 'agency', path, original),
          ),
          env.DB.prepare("INSERT OR IGNORE INTO app_meta VALUES ('agency-copy-v3','done')"),
        ]);
      }
      if (!(await env.DB.prepare("SELECT value FROM app_meta WHERE key='seed-peru-v1'").first())) {
        await env.DB.batch([
          ...peruContent.map((c) =>
            env.DB.prepare('INSERT OR IGNORE INTO content VALUES (?, ?, ?)').bind(
              c.id,
              c.kind,
              JSON.stringify(c),
            ),
          ),
          env.DB.prepare("INSERT OR IGNORE INTO app_meta VALUES ('seed-peru-v1','done')"),
        ]);
      }
      if (
        !(await env.DB.prepare("SELECT value FROM app_meta WHERE key='lisbon-photo-v1'").first())
      ) {
        await env.DB.batch([
          env.DB.prepare('UPDATE content SET data=replace(data, ?, ?) WHERE id IN (?, ?)').bind(
            'photo-1555881400-74d7acaacd8b',
            'photo-1744580162134-b9b64645f7c8',
            'lisbon',
            'lisbon-tour',
          ),
          env.DB.prepare("INSERT OR IGNORE INTO app_meta VALUES ('lisbon-photo-v1','done')"),
        ]);
      }
      if (
        !(await env.DB.prepare(
          "SELECT value FROM app_meta WHERE key='country-tour-names-v1'",
        ).first())
      ) {
        const updates = europeTours.flatMap((tour, index) => {
          const destination = europeDestinations[index];
          return [
            env.DB.prepare(
              "UPDATE content SET data=json_set(data, '$.title.en', ?) WHERE id=? AND json_extract(data, '$.title.en')=?",
            ).bind(tour.title.en, tour.id, `${destination.title.en} city tour`),
            env.DB.prepare(
              "UPDATE content SET data=json_set(data, '$.title.pl', ?) WHERE id=? AND json_extract(data, '$.title.pl')=?",
            ).bind(tour.title.pl, tour.id, `Wycieczka: ${destination.title.pl}`),
          ];
        });
        await env.DB.batch([
          ...updates,
          env.DB.prepare("INSERT OR IGNORE INTO app_meta VALUES ('country-tour-names-v1','done')"),
        ]);
      }
      if (
        !(await env.DB.prepare(
          "SELECT value FROM app_meta WHERE key='rome-tour-details-v1'",
        ).first())
      ) {
        const rome = europeTours.find((tour) => tour.id === 'rome-tour')!;
        await env.DB.batch([
          env.DB.prepare(
            "UPDATE content SET data=json_set(data, '$.title', json(?), '$.description', json(?), '$.gallery', json(?), '$.routeIds', json(?)) WHERE id='rome-tour' AND json_extract(data, '$.title.en') IN ('Italy', 'Rome city tour')",
          ).bind(
            JSON.stringify(rome.title),
            JSON.stringify(rome.description),
            JSON.stringify(rome.gallery),
            JSON.stringify(rome.routeIds),
          ),
          ...romeRoutes.map((entry) =>
            env.DB.prepare('INSERT OR IGNORE INTO content VALUES (?, ?, ?)').bind(
              entry.id,
              entry.kind,
              JSON.stringify(entry),
            ),
          ),
          env.DB.prepare("INSERT OR IGNORE INTO app_meta VALUES ('rome-tour-details-v1','done')"),
        ]);
      }
      if (
        !(await env.DB.prepare(
          "SELECT value FROM app_meta WHERE key='rome-description-v2'",
        ).first())
      ) {
        const rome = europeTours.find((tour) => tour.id === 'rome-tour')!;
        await env.DB.batch([
          env.DB.prepare(
            "UPDATE content SET data=json_set(data, '$.description', json(?)) WHERE id='rome-tour' AND json_extract(data, '$.description.en')=?",
          ).bind(
            JSON.stringify(rome.description),
            '<p>Explore Rome over three days, from the Colosseum and Roman Forum to the streets and piazzas of the historic centre.</p><p>We can help arrange flights, accommodation and local transfers around your dates and budget. The itinerary leaves room for meals and independent exploring; entry requirements and final inclusions are discussed before booking.</p>',
          ),
          env.DB.prepare("INSERT OR IGNORE INTO app_meta VALUES ('rome-description-v2','done')"),
        ]);
      }
      if (
        !(await env.DB.prepare(
          "SELECT value FROM app_meta WHERE key='rome-description-v3'",
        ).first())
      ) {
        const rome = europeTours.find((tour) => tour.id === 'rome-tour')!;
        await env.DB.batch([
          env.DB.prepare(
            "UPDATE content SET data=json_set(data, '$.description', json(?)) WHERE id='rome-tour' AND json_extract(data, '$.description.en')=?",
          ).bind(
            JSON.stringify(rome.description),
            '<p>Spend three days in Rome exploring its ancient landmarks, neighbourhoods and historic centre. We organise the practical details around your dates and budget, and discuss the plan with you before you book.</p><h2>The itinerary</h2><p>Visit the <strong>Colosseum and Roman Forum</strong>, then walk through the historic centre to the Pantheon and Trevi Fountain. The routes include time for meals, travel between stops and exploring independently.</p><h3>Getting around</h3><p>Much of the centre is best explored on foot. We can help plan airport transfers and local transport, taking your accommodation and mobility needs into account.</p><h2>Before you travel</h2><p>We can discuss flights and accommodation options, and help you understand entry requirements. The final itinerary, hotel, transport and any attraction tickets are confirmed with you before booking.</p><h3>Budget and inclusions</h3><p>The listed tour price is a starting point. Your final quote depends on your dates, accommodation and chosen arrangements. Meals and personal spending should also be considered.</p>',
          ),
          env.DB.prepare("INSERT OR IGNORE INTO app_meta VALUES ('rome-description-v3','done')"),
        ]);
      }
      if (
        !(await env.DB.prepare("SELECT value FROM app_meta WHERE key='rome-routes-v2'").first())
      ) {
        const rome = europeTours.find((tour) => tour.id === 'rome-tour')!;
        const newEntries = romeRoutes.filter((entry) =>
          [
            'rome-vatican-route',
            'rome-trastevere-route',
            'rome-vatican-museums',
            'rome-st-peters',
            'rome-trastevere',
            'rome-janiculum',
          ].includes(entry.id),
        );
        await env.DB.batch([
          ...newEntries.map((entry) =>
            env.DB.prepare('INSERT OR IGNORE INTO content VALUES (?, ?, ?)').bind(
              entry.id,
              entry.kind,
              JSON.stringify(entry),
            ),
          ),
          env.DB.prepare(
            "UPDATE content SET data=json_set(data, '$.routeIds', json(?)) WHERE id='rome-tour' AND json_extract(data, '$.routeIds')=json(?)",
          ).bind(
            JSON.stringify(rome.routeIds),
            JSON.stringify(['rome-ancient-route', 'rome-centre-route']),
          ),
          env.DB.prepare("INSERT OR IGNORE INTO app_meta VALUES ('rome-routes-v2','done')"),
        ]);
      }
      if (
        !(await env.DB.prepare("SELECT value FROM app_meta WHERE key='rome-journey-v3'").first())
      ) {
        const rome = europeTours.find((tour) => tour.id === 'rome-tour')!;
        const ancient = romeRoutes.find((entry) => entry.id === 'rome-ancient-route')!;
        const trastevere = romeRoutes.find((entry) => entry.id === 'rome-trastevere-route')!;
        const additional = romeRoutes.filter((entry) =>
          [
            'rome-tivoli-route',
            'rome-tivoli',
            'rome-villa-este',
            'rome-stay',
            'rome-capitoline',
          ].includes(entry.id),
        );
        const oldGallery = JSON.stringify(rome.gallery.slice(0, 3));
        const oldDescription = {
          en: rome.description.en
            .replace('This five-day tour', 'This three-day tour')
            .replace(
              'Beyond the centre, explore the Vatican Museums and Trastevere, then take a day trip to Tivoli for the gardens and fountains of Villa d’Este. ',
              '',
            ),
          pl: rome.description.pl.replace('Ta pięciodniowa wycieczka', 'Ta trzydniowa wycieczka'),
        };
        await env.DB.batch([
          ...additional.map((entry) =>
            env.DB.prepare('INSERT OR IGNORE INTO content VALUES (?, ?, ?)').bind(
              entry.id,
              entry.kind,
              JSON.stringify(entry),
            ),
          ),
          env.DB.prepare(
            "UPDATE content SET data=json_set(data, '$.title', json(?), '$.duration', ?, '$.description', json(?)) WHERE id='rome-tour' AND json_extract(data, '$.title.en')='Three days in Rome' AND json_extract(data, '$.description.en')=?",
          ).bind(
            JSON.stringify(rome.title),
            rome.duration,
            JSON.stringify(rome.description),
            oldDescription.en,
          ),
          env.DB.prepare(
            "UPDATE content SET data=json_set(data, '$.gallery', json(?)) WHERE id='rome-tour' AND json_extract(data, '$.gallery')=json(?)",
          ).bind(JSON.stringify(rome.gallery), oldGallery),
          env.DB.prepare(
            "UPDATE content SET data=json_set(data, '$.routeIds', json(?)) WHERE id='rome-tour' AND json_extract(data, '$.routeIds')=json(?)",
          ).bind(
            JSON.stringify(rome.routeIds),
            JSON.stringify([
              'rome-ancient-route',
              'rome-centre-route',
              'rome-vatican-route',
              'rome-trastevere-route',
            ]),
          ),
          env.DB.prepare(
            "UPDATE content SET data=? WHERE id=? AND json_extract(data, '$.description.en')=?",
          ).bind(
            JSON.stringify(ancient),
            ancient.id,
            '<p>Explore the Colosseum and Roman Forum, with time to walk between the sites.</p>',
          ),
          env.DB.prepare(
            "UPDATE content SET data=json_set(data, '$.image', ?) WHERE id=? AND json_extract(data, '$.image')=?",
          ).bind(trastevere.image, trastevere.id, rome.gallery[2]),
          ...['rome-vatican-museums', 'rome-trastevere', 'rome-janiculum'].map((id) => {
            const entry = romeRoutes.find((item) => item.id === id)!;
            return env.DB.prepare(
              "UPDATE content SET data=json_set(data, '$.image', ?) WHERE id=? AND json_extract(data, '$.description.en')=?",
            ).bind(entry.image, id, '<p>A stop on the Rome itinerary.</p>');
          }),
          env.DB.prepare("INSERT OR IGNORE INTO app_meta VALUES ('rome-journey-v3','done')"),
        ]);
      }
      if (
        !(await env.DB.prepare(
          "SELECT value FROM app_meta WHERE key='rome-tivoli-copy-v1'",
        ).first())
      ) {
        const rome = europeTours.find((tour) => tour.id === 'rome-tour')!;
        const previous = rome.description.en.replace(
          'Beyond the centre, explore the Vatican Museums and Trastevere, then take a day trip to Tivoli for the gardens and fountains of Villa d’Este. ',
          '',
        );
        await env.DB.batch([
          env.DB.prepare(
            "UPDATE content SET data=json_set(data, '$.description', json(?)) WHERE id='rome-tour' AND json_extract(data, '$.description.en')=?",
          ).bind(JSON.stringify(rome.description), previous),
          env.DB.prepare("INSERT OR IGNORE INTO app_meta VALUES ('rome-tivoli-copy-v1','done')"),
        ]);
      }
      if (
        !(await env.DB.prepare(
          "SELECT value FROM app_meta WHERE key='rome-independent-routes-v1'",
        ).first())
      ) {
        const rome = europeTours.find((tour) => tour.id === 'rome-tour')!;
        const previous = rome.description.en
          .replace(
            'Our three-day tour brings those pieces together in a plan shaped around your dates and interests.',
            'This five-day tour brings those pieces together in a plan that leaves you time to enjoy them.',
          )
          .replace(
            'You can also explore the Vatican Museums, Trastevere or Tivoli with our free route guides. Each is an independent plan: choose the ones that interest you and discuss how they could fit your trip.',
            'Beyond the centre, explore the Vatican Museums and Trastevere, then take a day trip to Tivoli for the gardens and fountains of Villa d’Este. The routes bring the sights together in a manageable order, so you can spend less time working out how to get between them and more time seeing the city.',
          );
        const routeUpdates = romeRouteDefaults
          .filter((entry) => entry.kind === 'route')
          .map((old) => {
            const updated = romeRoutes.find((entry) => entry.id === old.id)!;
            return env.DB.prepare(
              "UPDATE content SET data=json_set(data, '$.description', json(?), '$.stopIds', json(?), '$.duration', ?) WHERE id=? AND json_extract(data, '$.description.en')=? AND json_extract(data, '$.stopIds')=json(?)",
            ).bind(
              JSON.stringify(updated.description),
              JSON.stringify(updated.stopIds),
              updated.duration,
              updated.id,
              old.description.en,
              JSON.stringify(old.stopIds),
            );
          });
        const existingIds = new Set(romeRouteDefaults.map((entry) => entry.id));
        await env.DB.batch([
          ...romeRoutes
            .filter((entry) => !existingIds.has(entry.id))
            .map((entry) =>
              env.DB.prepare('INSERT OR IGNORE INTO content VALUES (?, ?, ?)').bind(
                entry.id,
                entry.kind,
                JSON.stringify(entry),
              ),
            ),
          ...routeUpdates,
          env.DB.prepare(
            "UPDATE content SET data=json_set(data, '$.title', json(?), '$.duration', ?, '$.description', json(?)) WHERE id='rome-tour' AND json_extract(data, '$.title.en')='Rome and Tivoli' AND json_extract(data, '$.description.en')=?",
          ).bind(
            JSON.stringify(rome.title),
            rome.duration,
            JSON.stringify(rome.description),
            previous,
          ),
          env.DB.prepare(
            "INSERT OR IGNORE INTO app_meta VALUES ('rome-independent-routes-v1','done')",
          ),
        ]);
      }
      if (
        !(await env.DB.prepare(
          "SELECT value FROM app_meta WHERE key='rome-route-notes-v1'",
        ).first())
      ) {
        const updated = romeRoutes.filter((entry) => entry.kind === 'place');
        await env.DB.batch([
          ...updated.map((entry) =>
            env.DB.prepare(
              "UPDATE content SET data=json_set(data, '$.description', json(?)) WHERE id=? AND json_extract(data, '$.description.en')=?",
            ).bind(
              JSON.stringify(entry.description),
              entry.id,
              '<p>A stop on the Rome itinerary.</p>',
            ),
          ),
          env.DB.prepare(
            "UPDATE content SET data=json_set(data, '$.title', json(?)) WHERE id='rome-tivoli-route' AND json_extract(data, '$.title.en')='A day in Tivoli'",
          ).bind(
            JSON.stringify(romeRoutes.find((entry) => entry.id === 'rome-tivoli-route')!.title),
          ),
          env.DB.prepare("INSERT OR IGNORE INTO app_meta VALUES ('rome-route-notes-v1','done')"),
        ]);
      }
      if (
        !(await env.DB.prepare(
          "SELECT value FROM app_meta WHERE key='rome-traveller-photos-v1'",
        ).first())
      ) {
        const examples = [
          [
            'rome-traveller-photo-1',
            'https://images.unsplash.com/photo-1594404147062-ec7297a2a28d?auto=format&fit=crop&w=1200&q=85',
            'A walk through Trastevere',
          ],
          [
            'rome-traveller-photo-2',
            'https://images.unsplash.com/photo-1529154036614-a60975f5c760?auto=format&fit=crop&w=1200&q=85',
            'An afternoon at Trevi Fountain',
          ],
          [
            'rome-traveller-photo-3',
            'https://images.unsplash.com/photo-1584737513111-db1a50cf0c69?auto=format&fit=crop&w=1200&q=85',
            'Lunch in Trastevere',
          ],
          [
            'rome-traveller-photo-4',
            'https://images.unsplash.com/photo-1654612533611-d4f18261d444?auto=format&fit=crop&w=1200&q=85',
            'The gardens at Villa d’Este',
          ],
        ];
        await env.DB.batch([
          env.DB.prepare('INSERT OR IGNORE INTO users VALUES (?, ?, ?)').bind(
            'demo-photo-traveller',
            'Demo traveller',
            'User',
          ),
          ...examples.map(([id, image, caption], index) =>
            env.DB.prepare('INSERT OR IGNORE INTO submissions VALUES (?, ?, ?, ?, ?, ?, ?)').bind(
              id,
              'demo-photo-traveller',
              'rome-tour',
              image,
              caption,
              'approved',
              `2026-01-0${index + 1}T12:00:00Z`,
            ),
          ),
          env.DB.prepare(
            "INSERT OR IGNORE INTO app_meta VALUES ('rome-traveller-photos-v1','done')",
          ),
        ]);
      }
      if (
        !(await env.DB.prepare(
          "SELECT value FROM app_meta WHERE key='rome-traveller-stories-v1'",
        ).first())
      ) {
        const stories = [
          [
            'rome-traveller-photo-1',
            'demo-photo-anna',
            'We wandered through Trastevere in the late afternoon, stopping for coffee before exploring the little streets around the piazza.',
          ],
          [
            'rome-traveller-photo-2',
            'demo-photo-marek',
            'We came across the Trevi Fountain on our walk through the centre. It was busy, but seeing the details up close was worth the stop.',
          ],
          [
            'rome-traveller-photo-3',
            'demo-photo-anna',
            'A long lunch in Trastevere after a morning of walking. We picked a small place nearby and took our time over the pasta.',
          ],
          [
            'rome-traveller-photo-4',
            'demo-photo-marek',
            'The fountains and terraces at Villa d’Este were a lovely change of pace after the city. Allow plenty of time for the gardens.',
          ],
        ];
        const extra = [
          [
            'rome-traveller-photo-5',
            'demo-photo-anna',
            'https://images.unsplash.com/photo-1677623428681-3149246bfa42?auto=format&fit=crop&w=1200&q=85',
            'One of the quieter streets we found while exploring Trastevere. Comfortable shoes were definitely a good idea.',
          ],
          [
            'rome-traveller-video-1',
            'demo-photo-marek',
            'https://videos.pexels.com/video-files/5911596/5911596-hd_1920_1080_30fps.mp4',
            'A short look around the Colosseum. We spent longer here than expected, then walked on to the Forum.',
          ],
        ];
        await env.DB.batch([
          env.DB.prepare('INSERT OR IGNORE INTO users VALUES (?, ?, ?)').bind(
            'demo-photo-anna',
            'Anna',
            'User',
          ),
          env.DB.prepare('INSERT OR IGNORE INTO users VALUES (?, ?, ?)').bind(
            'demo-photo-marek',
            'Marek',
            'User',
          ),
          ...stories.map(([id, userId, caption]) =>
            env.DB.prepare(
              "UPDATE submissions SET user_id=?, caption=? WHERE id=? AND user_id='demo-photo-traveller'",
            ).bind(userId, caption, id),
          ),
          ...extra.map(([id, userId, image, caption], index) =>
            env.DB.prepare('INSERT OR IGNORE INTO submissions VALUES (?, ?, ?, ?, ?, ?, ?)').bind(
              id,
              userId,
              'rome-tour',
              image,
              caption,
              'approved',
              `2026-01-0${index + 5}T12:00:00Z`,
            ),
          ),
          env.DB.prepare(
            "INSERT OR IGNORE INTO app_meta VALUES ('rome-traveller-stories-v1','done')",
          ),
        ]);
      }
      if (
        !(await env.DB.prepare(
          "SELECT value FROM app_meta WHERE key='rome-multimedia-posts-v1'",
        ).first())
      ) {
        const groups = [
          ['rome-traveller-photo-1', 'rome-traveller-photo-3', 'rome-traveller-photo-5'],
          ['rome-traveller-video-1', 'rome-traveller-photo-2', 'rome-traveller-photo-4'],
        ];
        for (const ids of groups) {
          const posts = await Promise.all(
            ids.map((id) =>
              env.DB.prepare('SELECT image FROM submissions WHERE id=?')
                .bind(id)
                .first<{ image: string }>(),
            ),
          );
          if (posts.every(Boolean)) {
            await env.DB.batch([
              ...posts.map((post, position) =>
                env.DB.prepare('INSERT OR IGNORE INTO submission_media VALUES (?, ?, ?)').bind(
                  ids[0],
                  position,
                  post!.image,
                ),
              ),
              ...ids
                .slice(1)
                .map((id) => env.DB.prepare('DELETE FROM submissions WHERE id=?').bind(id)),
            ]);
          }
        }
        await env.DB.prepare(
          "INSERT OR IGNORE INTO app_meta VALUES ('rome-multimedia-posts-v1','done')",
        ).run();
      }
      if (
        !(await env.DB.prepare(
          "SELECT value FROM app_meta WHERE key='rome-multimedia-captions-v1'",
        ).first())
      ) {
        await env.DB.batch([
          env.DB.prepare('UPDATE submissions SET caption=? WHERE id=? AND user_id=?').bind(
            'We spent the afternoon wandering through Trastevere, stopping for coffee and a long lunch before exploring the quieter streets around the piazza. Comfortable shoes were a good idea!',
            'rome-traveller-photo-1',
            'demo-photo-anna',
          ),
          env.DB.prepare('UPDATE submissions SET caption=? WHERE id=? AND user_id=?').bind(
            'A few moments from our trip: the Colosseum, an afternoon at the Trevi Fountain and the gardens at Villa d’Este. The gardens were a lovely change of pace after the busy city.',
            'rome-traveller-video-1',
            'demo-photo-marek',
          ),
          env.DB.prepare(
            "INSERT OR IGNORE INTO app_meta VALUES ('rome-multimedia-captions-v1','done')",
          ),
        ]);
      }
      if (!(await env.DB.prepare("SELECT value FROM app_meta WHERE key='media-refs-v1'").first())) {
        const records = await all(env);
        const submissions = (
          await env.DB.prepare('SELECT * FROM submissions').all<{
            id: string;
            image: string;
            status: string;
          }>()
        ).results;
        const attachments = (
          await env.DB.prepare('SELECT submission_id,url FROM submission_media').all<{
            submission_id: string;
            url: string;
          }>()
        ).results;
        await env.DB.batch([
          ...records.flatMap((c) => mediaRefs(env, 'content', c.id, mediaUrls(c), c.published)),
          ...submissions.flatMap((post) =>
            mediaRefs(
              env,
              'submission',
              post.id,
              [
                post.image,
                ...attachments
                  .filter((file) => file.submission_id === post.id)
                  .map((file) => file.url),
              ],
              post.status === 'approved',
            ),
          ),
          env.DB.prepare("INSERT OR IGNORE INTO app_meta VALUES ('media-refs-v1','done')"),
        ]);
      }
    })().catch((error) => {
      ready = undefined;
      throw error;
    });
  await ready;
}
async function identity(request: Request, env: Env): Promise<Identity> {
  const session = /(?:^|;\s*)roam_session=([^;]+)/.exec(request.headers.get('Cookie') || '')?.[1];
  if (!session) return guest;
  const user = await env.DB.prepare(
    'SELECT u.id,u.name,u.role FROM users u JOIN sessions s ON s.user_id=u.id WHERE s.id=? AND s.expires_at>?',
  )
    .bind(session, Date.now())
    .first<Identity>();
  return user || guest;
}
const requireUser = (u: Identity) => {
  if (u.role === 'Guest') fail(401, 'Choose a demo account to continue.');
};
const requireEditor = (u: Identity) => {
  if (!canEdit(u.role)) fail(403, 'Editor or Admin access is required.');
};
async function all(env: Env) {
  return (await env.DB.prepare('SELECT data FROM content').all<{ data: string }>()).results.map(
    (r) => JSON.parse(r.data) as Content,
  );
}
async function owned(env: Env, user: Identity, tripId: string) {
  if (user.role === 'Guest') return false;
  return !!(await env.DB.prepare(
    "SELECT id FROM purchases WHERE user_id=? AND trip_id=? AND status='success' LIMIT 1",
  )
    .bind(user.id, tripId)
    .first());
}
async function event(env: Env, user: Identity, action: string, detail: string) {
  console.log(JSON.stringify({ action, userId: user.id, detail }));
  await env.DB.prepare('INSERT INTO events VALUES (?,?,?,?,?)')
    .bind(uid(), user.id, action, detail, new Date().toISOString())
    .run();
}
export default {
  async scheduled(_event: ScheduledController, env: Env) {
    await init(env);
    await cleanupUploads(env);
  },
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/api/')) return env.ASSETS.fetch(request);
    try {
      if (!['GET', 'HEAD'].includes(request.method) && request.headers.get('Origin') !== url.origin)
        fail(403, 'Cross-origin writes are not allowed.');
      await init(env);
      const user = await identity(request, env);
      const path = url.pathname.slice(5).split('/');
      const method = request.method;
      if (path[0] === 'session' && method === 'GET') return json(user);
      if (path[0] === 'session' && method === 'POST') {
        const { role } = await body(request, roleSchema);
        if (!roles.includes(role)) fail(400, 'Unknown role.');
        const prior = /(?:^|;\s*)roam_session=([^;]+)/.exec(
          request.headers.get('Cookie') || '',
        )?.[1];
        if (prior) await env.DB.prepare('DELETE FROM sessions WHERE id=?').bind(prior).run();
        const session = uid();
        const next =
          role === 'Guest'
            ? guest
            : await env.DB.prepare('SELECT * FROM users WHERE id=?')
                .bind(`demo-${role.toLowerCase()}`)
                .first<Identity>();
        if (!next) fail(404, 'Demo identity is unavailable.');
        if (role !== 'Guest')
          await env.DB.prepare('INSERT INTO sessions VALUES (?,?,?)')
            .bind(session, next!.id, Date.now() + 30 * 86400000)
            .run();
        return json(next, 200, {
          'Set-Cookie': `roam_session=${role === 'Guest' ? '' : session}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${role === 'Guest' ? 0 : 2592000}${url.protocol === 'https:' ? '; Secure' : ''}`,
        });
      }
      if (path[0] === 'content' && method === 'GET') {
        if (path[1]) {
          const [item] = await visibleContent(env.DB, user, { ids: [path[1]] });
          if (!item) fail(404, 'Content not found.');
          const routes = await visibleContent(env.DB, user, { ids: item.routeIds || [] });
          const places = await visibleContent(env.DB, user, {
            ids: [
              ...new Set([
                ...routes.flatMap((route) => route.stopIds || []),
                ...(item.stopIds || []),
              ]),
            ],
          });
          return json([item, ...routes, ...places]);
        }
        const offset = Number(url.searchParams.get('offset') || 0);
        if (!Number.isSafeInteger(offset) || offset < 0) fail(400, 'Invalid page offset.');
        const catalog = url.searchParams.has('catalog');
        const visible = await visibleContent(env.DB, user, { offset });
        const items = visible.slice(0, 100).map((c) => {
          if (!catalog || canEdit(user.role) || c.kind === 'page') return c;
          const excerpt = (html: string) =>
            html
              .split(/<\/p>/i)[0]
              .replace(/<[^>]*>/g, ' ')
              .replace(/\s+/g, ' ')
              .trim()
              .slice(0, 600);
          return {
            ...c,
            description: { en: excerpt(c.description.en), pl: excerpt(c.description.pl) },
          };
        });
        return json({ items, nextOffset: visible.length > 100 ? offset + 100 : null });
      }
      if (path[0] === 'content' && ['PUT', 'POST'].includes(method)) {
        requireEditor(user);
        const input = await body(request, contentSchema);
        const records = await all(env);
        if (
          records.some((c) => c.id !== input.id && c.kind === input.kind && c.slug === input.slug)
        )
          fail(409, 'This slug is already in use.');
        if (method === 'PUT' && !records.some((c) => c.id === path[1]))
          fail(404, 'Content not found.');
        const content = { ...input, id: method === 'POST' ? uid() : path[1] };
        for (const [key, kind] of [
          ['destinationId', 'destination'],
          ['tripId', 'trip'],
        ] as const)
          if (content[key] && !records.some((c) => c.id === content[key] && c.kind === kind))
            fail(400, `Invalid ${kind} relationship.`);
        for (const [key, kind] of [
          ['routeIds', 'route'],
          ['stopIds', 'place'],
        ] as const)
          if (
            content[key] &&
            (!Array.isArray(content[key]) ||
              content[key]!.some((id) => !records.some((c) => c.id === id && c.kind === kind)))
          )
            fail(400, `Invalid ${kind} relationship.`);
        if (content.kind === 'route' && content.tripId) {
          const parent = records.find((c) => c.id === content.tripId)!;
          if (parent.destinationId !== content.destinationId)
            fail(400, 'The route and trip must share a destination.');
        }
        const updates = new Map<string, Content>();
        const previous = records.find((c) => c.id === content.id);
        if (previous && previous.kind !== content.kind)
          fail(400, 'A record’s content type cannot be changed.');
        if (content.kind === 'route') {
          for (const parent of records.filter((c) => c.kind === 'trip')) {
            const ids = (parent.routeIds || []).filter((id) => id !== content.id);
            if (parent.id === content.tripId) ids.push(content.id);
            // Keep an existing route in its current position.
            const routeIds =
              parent.id === content.tripId && parent.routeIds?.includes(content.id)
                ? parent.routeIds
                : ids;
            if (JSON.stringify(routeIds) !== JSON.stringify(parent.routeIds || []))
              updates.set(parent.id, { ...parent, routeIds });
          }
        }
        if (content.kind === 'trip') {
          for (const child of records.filter((c) => c.kind === 'route')) {
            if (content.routeIds?.includes(child.id)) {
              updates.set(child.id, {
                ...child,
                tripId: content.id,
                destinationId: content.destinationId,
              });
              if (child.tripId && child.tripId !== content.id) {
                const old = updates.get(child.tripId) || records.find((c) => c.id === child.tripId);
                if (old)
                  updates.set(old.id, {
                    ...old,
                    routeIds: old.routeIds?.filter((id) => id !== child.id),
                  });
              }
            } else if (child.tripId === content.id)
              updates.set(child.id, { ...child, tripId: undefined });
          }
        }
        updates.set(content.id, content);
        await env.DB.batch(
          [...updates.values()].flatMap((c) => [
            env.DB.prepare(
              'INSERT INTO content VALUES (?,?,?) ON CONFLICT(id) DO UPDATE SET kind=excluded.kind,data=excluded.data',
            ).bind(c.id, c.kind, JSON.stringify(c)),
            ...mediaRefs(env, 'content', c.id, mediaUrls(c), c.published),
          ]),
        );
        await event(env, user, 'content.saved', content.id);
        return json({ item: content, updated: [...updates.values()] });
      }
      if (path[0] === 'content' && method === 'DELETE') {
        requireEditor(user);
        if (['home', 'about', 'agency'].includes(path[1]))
          fail(400, 'This page cannot be deleted.');
        const records = await all(env);
        if (records.some((c) => c.destinationId === path[1] || c.tripId === path[1]))
          fail(409, 'Remove or reassign related content first.');
        if (
          await env.DB.prepare('SELECT id FROM purchases WHERE trip_id=? LIMIT 1')
            .bind(path[1])
            .first()
        )
          fail(409, 'Purchased trips must be unpublished rather than deleted.');
        await env.DB.batch([
          env.DB.prepare('DELETE FROM content WHERE id=?').bind(path[1]),
          env.DB.prepare("DELETE FROM media_refs WHERE ref_type='content' AND ref_id=?").bind(
            path[1],
          ),
          ...records
            .filter((c) => c.routeIds?.includes(path[1]) || c.stopIds?.includes(path[1]))
            .map((c) =>
              env.DB.prepare('UPDATE content SET data=? WHERE id=?').bind(
                JSON.stringify({
                  ...c,
                  routeIds: c.routeIds?.filter((id) => id !== path[1]),
                  stopIds: c.stopIds?.filter((id) => id !== path[1]),
                }),
                c.id,
              ),
            ),
        ]);
        await event(env, user, 'content.deleted', path[1]);
        return json({ ok: true });
      }
      if (path[0] === 'purchases' && method === 'GET') {
        requireUser(user);
        const query =
          user.role === 'Admin'
            ? env.DB.prepare('SELECT * FROM purchases ORDER BY created_at DESC')
            : env.DB.prepare(
                'SELECT * FROM purchases WHERE user_id=? ORDER BY created_at DESC',
              ).bind(user.id);
        return json(
          (await query.all()).results.map((p) => ({
            id: p.id,
            userId: p.user_id,
            tripId: p.trip_id,
            amount: p.amount,
            status: p.status,
            method: p.method,
            createdAt: p.created_at,
          })),
        );
      }
      if (path[0] === 'purchases' && method === 'POST') {
        requireUser(user);
        const { tripId, method: paymentMethod, outcome } = await body(request, purchaseSchema);
        const trip = (await all(env)).find(
          (c) => c.id === tripId && c.kind === 'trip' && c.published,
        );
        if (!trip) fail(404, 'Published trip not found.');
        if (
          !['Card', 'BLIK', 'Przelewy24'].includes(paymentMethod) ||
          !['success', 'failed', 'cancelled'].includes(outcome)
        )
          fail(400, 'Invalid simulation options.');
        if (await owned(env, user, tripId)) fail(409, 'This tour has already been booked.');
        const purchase = {
          id: uid(),
          userId: user.id,
          tripId,
          amount: trip!.price || 0,
          status: outcome,
          method: paymentMethod,
          createdAt: new Date().toISOString(),
        };
        await env.DB.prepare('INSERT INTO purchases VALUES (?,?,?,?,?,?,?)')
          .bind(
            purchase.id,
            user.id,
            tripId,
            purchase.amount,
            outcome,
            paymentMethod,
            purchase.createdAt,
          )
          .run();
        await event(env, user, `payment.${outcome}`, purchase.id);
        return json(purchase);
      }
      if (path[0] === 'purchases' && method === 'PATCH') {
        if (user.role !== 'Admin') fail(403, 'Admin access is required.');
        await env.DB.prepare(
          "UPDATE purchases SET status='refunded' WHERE id=? AND status='success'",
        )
          .bind(path[1])
          .run();
        await event(env, user, 'payment.refunded', path[1]);
        return json({ ok: true });
      }
      if (path[0] === 'guides' && method === 'GET') {
        const records = await all(env);
        const trip = records.find(
          (c) => c.id === path[1] && c.kind === 'trip' && (c.published || canEdit(user.role)),
        );
        if (!trip) fail(404, 'Route not found.');
        const routes = (trip!.routeIds || [])
          .map((id) => records.find((c) => c.id === id && (c.published || canEdit(user.role))))
          .filter((c): c is Content => !!c);
        const ids = new Set(routes.flatMap((r) => r.stopIds || []));
        return json({
          trip,
          routes,
          places: records.filter((c) => ids.has(c.id) && (c.published || canEdit(user.role))),
        });
      }
      if (path[0] === 'media' && method === 'POST') {
        requireUser(user);
        return json(await upload(request, env, user.id), 201);
      }
      if (path[0] === 'media' && method === 'GET' && !path[1]) {
        requireEditor(user);
        const offset = Number(url.searchParams.get('offset') || 0);
        if (!Number.isSafeInteger(offset) || offset < 0) fail(400, 'Invalid page offset.');
        const search = (url.searchParams.get('q') || '').slice(0, 200).toLowerCase();
        const rows = (
          await env.DB.prepare(
            "SELECT * FROM media WHERE mime LIKE 'image/%' AND instr(lower(name),?)>0 ORDER BY created_at DESC,id DESC LIMIT 25 OFFSET ?",
          )
            .bind(search, offset)
            .all()
        ).results;
        return json({
          items: rows.slice(0, 24).map((m) => ({
            id: m.id,
            url: `/api/media/${m.id}`,
            name: m.name,
            mime: m.mime,
            userId: m.user_id,
            createdAt: m.created_at,
          })),
          nextOffset: rows.length > 24 ? offset + 24 : null,
        });
      }
      if (path[0] === 'media' && path[1] && method === 'GET') {
        const media = await env.DB.prepare('SELECT * FROM media WHERE id=?')
          .bind(path[1])
          .first<{ user_id: string }>();
        if (!media) fail(404, 'Media not found.');
        const publicUse = !!(await env.DB.prepare(
          'SELECT 1 FROM media_refs WHERE media_id=? AND public=1 LIMIT 1',
        )
          .bind(path[1])
          .first());
        if (
          !publicUse &&
          !canEdit(user.role) &&
          !canModerate(user.role) &&
          media!.user_id !== user.id
        )
          fail(403, 'This media is private.');
        return serveMedia(request, env, path[1], url.searchParams.has('thumb'), publicUse);
      }
      if (path[0] === 'media' && method === 'DELETE') {
        requireUser(user);
        const media = await env.DB.prepare('SELECT user_id FROM media WHERE id=?')
          .bind(path[1])
          .first<{ user_id: string }>();
        if (!media || (media.user_id !== user.id && !canEdit(user.role)))
          fail(403, 'You can only remove your own unused uploads.');
        await removeMedia(env, path[1]);
        return json({ ok: true });
      }
      if (path[0] === 'submissions' && method === 'GET') {
        return json(await listSubmissions(url, env.DB, user));
      }
      if (path[0] === 'submissions' && method === 'POST') {
        requireUser(user);
        const data = await body(request, submissionSchema);
        const images = data.images;
        if (
          !Array.isArray(images) ||
          images.length < 1 ||
          images.length > 6 ||
          images.some(
            (url) => typeof url !== 'string' || !/^\/api\/media\/[a-zA-Z0-9-]+$/.test(url),
          )
        )
          fail(400, 'Choose between 1 and 6 uploaded files.');
        if (
          !(await all(env)).some(
            (c) => c.id === data.targetId && c.published && ['trip', 'place'].includes(c.kind),
          )
        )
          fail(400, 'Choose a published place or trip.');
        for (const image of images) {
          if (
            !(await env.DB.prepare('SELECT id FROM media WHERE id=? AND user_id=?')
              .bind(image.split('/').pop(), user.id)
              .first())
          )
            fail(403, 'You can only submit your own uploads.');
        }
        if (!data.caption?.trim() || data.caption.length > 1000)
          fail(400, 'Add a caption of up to 1,000 characters.');
        const submissionId = uid();
        await env.DB.batch([
          env.DB.prepare('INSERT INTO submissions VALUES (?,?,?,?,?,?,?)').bind(
            submissionId,
            user.id,
            data.targetId,
            images[0],
            data.caption.trim(),
            'pending',
            new Date().toISOString(),
          ),
          ...images.map((image, index) =>
            env.DB.prepare('INSERT INTO submission_media VALUES (?, ?, ?)').bind(
              submissionId,
              index,
              image,
            ),
          ),
          ...mediaRefs(env, 'submission', submissionId, images, false),
        ]);
        await event(env, user, 'submission.created', data.targetId);
        return json({ ok: true }, 201);
      }
      if (path[0] === 'submissions' && method === 'PATCH') {
        if (!canModerate(user.role)) fail(403, 'Moderator or Admin access is required.');
        const { status } = await body(request, moderationSchema);
        if (!['approved', 'rejected'].includes(status)) fail(400, 'Invalid moderation status.');
        await env.DB.batch([
          env.DB.prepare('UPDATE submissions SET status=? WHERE id=?').bind(status, path[1]),
          env.DB.prepare(
            "UPDATE media_refs SET public=? WHERE ref_type='submission' AND ref_id=?",
          ).bind(status === 'approved' ? 1 : 0, path[1]),
        ]);
        await event(env, user, `submission.${status}`, path[1]);
        return json({ ok: true });
      }
      if (path[0] === 'users') {
        if (user.role !== 'Admin') fail(403, 'Admin access is required.');
        if (method === 'GET')
          return json((await env.DB.prepare('SELECT * FROM users').all()).results);
        if (method === 'PATCH') {
          const { role } = await body(request, roleSchema);
          if (!roles.includes(role) || role === 'Guest') fail(400, 'Invalid account role.');
          if (path[1] === user.id)
            fail(400, 'Use the demo account selector to switch your own role.');
          await env.DB.prepare('UPDATE users SET role=? WHERE id=?').bind(role, path[1]).run();
          await event(env, user, 'user.role_changed', path[1]);
          return json({ ok: true });
        }
      }
      if (path[0] === 'contact' && method === 'POST') {
        const data = await body(request, contactSchema);
        if (
          !data.name?.trim() ||
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email || '') ||
          !data.message?.trim()
        )
          fail(400, 'Complete all contact fields.');
        return json({ ok: true, simulated: true });
      }
      return json({ error: 'Not found.' }, 404);
    } catch (error) {
      if (error instanceof Response) return error;
      console.error('request.error', error);
      return json({ error: 'The request could not be completed. Please try again.' }, 500);
    }
  },
};

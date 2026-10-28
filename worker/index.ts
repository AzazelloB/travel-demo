import schema from '../migrations/0001_initial.sql?raw';
import { seed, agencyPage, europeDestinations, europeTours, peruContent } from '../shared/seed';
import { canEdit, canModerate, roles, type Content, type Identity, type Role } from '../shared/types';
import { cleanHtml } from '../shared/html';
interface Env { DB: D1Database; MEDIA: R2Bucket; ASSETS: Fetcher }
const guest: Identity = { id: 'guest', name: 'Guest', role: 'Guest' };
let ready: Promise<void> | undefined;
const fail = (status: number, message: string): never => { throw new Response(JSON.stringify({ error: message }), { status, headers: { 'Content-Type': 'application/json' } }); };
const json = (data: unknown, status = 200, headers: Record<string, string> = {}) => Response.json(data, { status, headers: { 'Cache-Control': 'no-store', ...headers } });
const uid = () => crypto.randomUUID();
async function init(env: Env) {
  if (!ready) ready = (async () => {
    // The same idempotent migration works locally and on a fresh D1 binding.
    for (const sql of schema.split(';').map(s => s.trim()).filter(Boolean)) await env.DB.prepare(sql).run();
    if (!await env.DB.prepare("SELECT value FROM app_meta WHERE key='seed-v1'").first()) {
      await env.DB.batch([
        ...seed.map(c => env.DB.prepare('INSERT OR IGNORE INTO content VALUES (?, ?, ?)').bind(c.id, c.kind, JSON.stringify(c))),
        ...roles.filter(r => r !== 'Guest').map(r => env.DB.prepare('INSERT OR IGNORE INTO users VALUES (?, ?, ?)').bind(`demo-${r.toLowerCase()}`, `${r} traveler`, r)),
        env.DB.prepare("INSERT OR IGNORE INTO app_meta VALUES ('seed-v1','done')"),
      ]);
    }
    if (!await env.DB.prepare("SELECT value FROM app_meta WHERE key='seed-europe-v1'").first()) {
      await env.DB.batch([...europeDestinations.map(c => env.DB.prepare('INSERT OR IGNORE INTO content VALUES (?, ?, ?)').bind(c.id, c.kind, JSON.stringify(c))), env.DB.prepare("INSERT OR IGNORE INTO app_meta VALUES ('seed-europe-v1','done')")]);
    }
    if (!await env.DB.prepare("SELECT value FROM app_meta WHERE key='seed-europe-tours-v1'").first()) {
      await env.DB.batch([...europeTours.map(c => env.DB.prepare('INSERT OR IGNORE INTO content VALUES (?, ?, ?)').bind(c.id, c.kind, JSON.stringify(c))), env.DB.prepare("INSERT OR IGNORE INTO app_meta VALUES ('seed-europe-tours-v1','done')")]);
    }
    if (!await env.DB.prepare("SELECT value FROM app_meta WHERE key='demo-tour-prices-v1'").first()) {
      const prices: [string, number, number][] = [['tatras-weekend', 39, 1290], ['krakow-weekend', 29, 890], ['baltic-weekend', 35, 1190], ['bieszczady-weekend', 29, 990]];
      await env.DB.batch([...prices.map(([id, oldPrice, price]) => env.DB.prepare("UPDATE content SET data=json_set(data, '$.price', ?) WHERE id=? AND json_extract(data, '$.price')=?").bind(price, id, oldPrice)), env.DB.prepare("INSERT OR IGNORE INTO app_meta VALUES ('demo-tour-prices-v1','done')")]);
    }
    if (!await env.DB.prepare("SELECT value FROM app_meta WHERE key='seed-agency-v1'").first()) {
      await env.DB.batch([env.DB.prepare('INSERT OR IGNORE INTO content VALUES (?, ?, ?)').bind(agencyPage.id, agencyPage.kind, JSON.stringify(agencyPage)), env.DB.prepare("INSERT OR IGNORE INTO app_meta VALUES ('seed-agency-v1','done')")]);
    }
    if (!await env.DB.prepare("SELECT value FROM app_meta WHERE key='agency-copy-v2'").first()) {
      const changes = [
        ['$.title.en', 'Tours from a team in Switzerland.', agencyPage.title.en],
        ['$.title.pl', 'Wycieczki z zespołem w Szwajcarii.', agencyPage.title.pl],
        ['$.description.en', '<p>We organise tours across Europe and beyond, with practical planning and support before and during your trip.</p>', agencyPage.description.en],
        ['$.description.pl', '<p>Organizujemy wycieczki po Europie i poza nią. Pomagamy w planowaniu oraz wspieramy przed wyjazdem i w jego trakcie.</p>', agencyPage.description.pl],
      ];
      await env.DB.batch([...changes.map(([path, original, updated]) => env.DB.prepare('UPDATE content SET data=json_set(data, ?, ?) WHERE id=? AND json_extract(data, ?)=?').bind(path, updated, 'agency', path, original)), env.DB.prepare("INSERT OR IGNORE INTO app_meta VALUES ('agency-copy-v2','done')")]);
    }
    if (!await env.DB.prepare("SELECT value FROM app_meta WHERE key='agency-copy-v3'").first()) {
      const changes = [
        ['$.title.en', 'Tours organised for you.', agencyPage.title.en], ['$.title.pl', 'Wycieczki zorganizowane dla Ciebie.', agencyPage.title.pl],
        ['$.description.en', '<p>We plan the itinerary, arrange accommodation and provide support before and during your trip.</p>', agencyPage.description.en],
        ['$.description.pl', '<p>Planujemy trasę, organizujemy noclegi i zapewniamy wsparcie przed podróżą oraz w jej trakcie.</p>', agencyPage.description.pl],
      ];
      await env.DB.batch([...changes.map(([path, original, updated]) => env.DB.prepare('UPDATE content SET data=json_set(data, ?, ?) WHERE id=? AND json_extract(data, ?)=?').bind(path, updated, 'agency', path, original)), env.DB.prepare("INSERT OR IGNORE INTO app_meta VALUES ('agency-copy-v3','done')")]);
    }
    if (!await env.DB.prepare("SELECT value FROM app_meta WHERE key='seed-peru-v1'").first()) {
      await env.DB.batch([...peruContent.map(c => env.DB.prepare('INSERT OR IGNORE INTO content VALUES (?, ?, ?)').bind(c.id, c.kind, JSON.stringify(c))), env.DB.prepare("INSERT OR IGNORE INTO app_meta VALUES ('seed-peru-v1','done')")]);
    }
    if (!await env.DB.prepare("SELECT value FROM app_meta WHERE key='lisbon-photo-v1'").first()) {
      await env.DB.batch([env.DB.prepare('UPDATE content SET data=replace(data, ?, ?) WHERE id IN (?, ?)').bind('photo-1555881400-74d7acaacd8b', 'photo-1744580162134-b9b64645f7c8', 'lisbon', 'lisbon-tour'), env.DB.prepare("INSERT OR IGNORE INTO app_meta VALUES ('lisbon-photo-v1','done')")]);
    }
    if (!await env.DB.prepare("SELECT value FROM app_meta WHERE key='country-tour-names-v1'").first()) {
      const updates = europeTours.flatMap((tour, index) => {
        const destination = europeDestinations[index];
        return [
          env.DB.prepare("UPDATE content SET data=json_set(data, '$.title.en', ?) WHERE id=? AND json_extract(data, '$.title.en')=?").bind(tour.title.en, tour.id, `${destination.title.en} city tour`),
          env.DB.prepare("UPDATE content SET data=json_set(data, '$.title.pl', ?) WHERE id=? AND json_extract(data, '$.title.pl')=?").bind(tour.title.pl, tour.id, `Wycieczka: ${destination.title.pl}`),
        ];
      });
      await env.DB.batch([...updates, env.DB.prepare("INSERT OR IGNORE INTO app_meta VALUES ('country-tour-names-v1','done')")]);
    }
  })().catch(error => { ready = undefined; throw error; });
  await ready;
}
async function identity(request: Request, env: Env): Promise<Identity> {
  const session = /(?:^|;\s*)roam_session=([^;]+)/.exec(request.headers.get('Cookie') || '')?.[1];
  if (!session) return guest;
  const user = await env.DB.prepare('SELECT u.id,u.name,u.role FROM users u JOIN sessions s ON s.user_id=u.id WHERE s.id=? AND s.expires_at>?').bind(session, Date.now()).first<Identity>();
  return user || guest;
}
const requireUser = (u: Identity) => { if (u.role === 'Guest') fail(401, 'Choose a demo account to continue.'); };
const requireEditor = (u: Identity) => { if (!canEdit(u.role)) fail(403, 'Editor or Admin access is required.'); };
async function all(env: Env) { return (await env.DB.prepare('SELECT data FROM content').all<{ data: string }>()).results.map(r => JSON.parse(r.data) as Content); }
async function owned(env: Env, user: Identity, tripId: string) {
  if (user.role === 'Guest') return false;
  return !!await env.DB.prepare("SELECT id FROM purchases WHERE user_id=? AND trip_id=? AND status='success' LIMIT 1").bind(user.id, tripId).first();
}
async function event(env: Env, user: Identity, action: string, detail: string) {
  console.log(JSON.stringify({ action, userId: user.id, detail }));
  await env.DB.prepare('INSERT INTO events VALUES (?,?,?,?,?)').bind(uid(), user.id, action, detail, new Date().toISOString()).run();
}
async function body<T>(request: Request): Promise<T> {
  const text = await request.text();
  if (text.length > 1_000_000) fail(413, 'Content is too large.');
  try { return JSON.parse(text) as T; } catch { return fail(400, 'Invalid JSON.'); }
}
function validate(input: Content): Content {
  if (!input || !['destination', 'trip', 'route', 'place', 'page'].includes(input.kind)) fail(400, 'Invalid content type.');
  if (!input.title || typeof input.title.en !== 'string' || typeof input.title.pl !== 'string' || !(input.title.en.trim() || input.title.pl.trim())) fail(400, 'A title is required.');
  if (!/^[a-z0-9][a-z0-9-]{0,100}$/.test(input.slug || '')) fail(400, 'Use a slug containing lowercase letters, numbers and hyphens.');
  if (input.lat != null && (!Number.isFinite(input.lat) || Math.abs(input.lat) > 90)) fail(400, 'Latitude must be between -90 and 90.');
  if (input.lng != null && (!Number.isFinite(input.lng) || Math.abs(input.lng) > 180)) fail(400, 'Longitude must be between -180 and 180.');
  for (const key of ['duration', 'budget', 'price', 'order'] as const) if (input[key] != null && (!Number.isFinite(input[key]) || input[key]! < 0)) fail(400, `${key} must be a non-negative number.`);
  if (input.foundedYear != null && (!Number.isInteger(input.foundedYear) || input.foundedYear < 1800 || input.foundedYear > new Date().getFullYear())) fail(400, 'Enter a valid founding year.');
  const validImage = (url: string) => /^https:\/\/[^\s<>"']+$/.test(url) || /^\/api\/media\/[a-z0-9-]+$/.test(url);
  if (!validImage(input.image) || !Array.isArray(input.gallery) || input.gallery.some(x => typeof x !== 'string' || !validImage(x))) fail(400, 'Choose an uploaded image or an HTTPS image URL.');
  return { ...input, title: { en: input.title.en.slice(0, 200), pl: input.title.pl.slice(0, 200) }, description: { en: cleanHtml(input.description?.en || '').slice(0, 50000), pl: cleanHtml(input.description?.pl || '').slice(0, 50000) }, published: !!input.published, featured: !!input.featured };
}
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/api/')) return env.ASSETS.fetch(request);
    try {
      if (!['GET', 'HEAD'].includes(request.method) && request.headers.get('Origin') !== url.origin) fail(403, 'Cross-origin writes are not allowed.');
      await init(env);
      const user = await identity(request, env);
      const path = url.pathname.slice(5).split('/');
      const method = request.method;
      if (path[0] === 'session' && method === 'GET') return json(user);
      if (path[0] === 'session' && method === 'POST') {
        const { role } = await body<{ role: Role }>(request);
        if (!roles.includes(role)) fail(400, 'Unknown role.');
        const prior = /(?:^|;\s*)roam_session=([^;]+)/.exec(request.headers.get('Cookie') || '')?.[1];
        if (prior) await env.DB.prepare('DELETE FROM sessions WHERE id=?').bind(prior).run();
        const session = uid();
        const next = role === 'Guest' ? guest : await env.DB.prepare('SELECT * FROM users WHERE id=?').bind(`demo-${role.toLowerCase()}`).first<Identity>();
        if (!next) fail(404, 'Demo identity is unavailable.');
        if (role !== 'Guest') await env.DB.prepare('INSERT INTO sessions VALUES (?,?,?)').bind(session, next!.id, Date.now() + 30 * 86400000).run();
        return json(next, 200, { 'Set-Cookie': `roam_session=${role === 'Guest' ? '' : session}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${role === 'Guest' ? 0 : 2592000}${url.protocol === 'https:' ? '; Secure' : ''}` });
      }
      if (path[0] === 'content' && method === 'GET') {
        const records = await all(env);
        const purchases = user.role === 'Guest' ? [] : (await env.DB.prepare("SELECT trip_id FROM purchases WHERE user_id=? AND status='success'").bind(user.id).all<{ trip_id: string }>()).results.map(p => p.trip_id);
        const ownedRoutes = records.filter(c => c.kind === 'route' && purchases.includes(c.tripId || ''));
        const ownedStops = new Set(ownedRoutes.flatMap(c => c.stopIds || []));
        return json(records.filter(c => c.published || canEdit(user.role) || purchases.includes(c.id) || ownedRoutes.some(r => r.id === c.id) || ownedStops.has(c.id)));
      }
      if (path[0] === 'content' && ['PUT', 'POST'].includes(method)) {
        requireEditor(user);
        const input = validate(await body<Content>(request));
        const records = await all(env);
        if (records.some(c => c.id !== input.id && c.kind === input.kind && c.slug === input.slug)) fail(409, 'This slug is already in use.');
        if (method === 'PUT' && !records.some(c => c.id === path[1])) fail(404, 'Content not found.');
        const content = { ...input, id: method === 'POST' ? uid() : path[1] };
        for (const [key, kind] of [['destinationId', 'destination'], ['tripId', 'trip']] as const) if (content[key] && !records.some(c => c.id === content[key] && c.kind === kind)) fail(400, `Invalid ${kind} relationship.`);
        for (const [key, kind] of [['routeIds', 'route'], ['stopIds', 'place']] as const) if (content[key] && (!Array.isArray(content[key]) || content[key]!.some(id => !records.some(c => c.id === id && c.kind === kind)))) fail(400, `Invalid ${kind} relationship.`);
        if (content.kind === 'route' && content.tripId) {
          const parent = records.find(c => c.id === content.tripId)!;
          if (parent.destinationId !== content.destinationId) fail(400, 'The route and trip must share a destination.');
        }
        const updates = new Map<string, Content>();
        const previous = records.find(c => c.id === content.id);
        if (previous && previous.kind !== content.kind) fail(400, 'A record’s content type cannot be changed.');
        if (content.kind === 'route') {
          for (const parent of records.filter(c => c.kind === 'trip')) {
            const ids = (parent.routeIds || []).filter(id => id !== content.id);
            if (parent.id === content.tripId) ids.push(content.id);
            // Keep an existing route in its current position.
            const routeIds = parent.id === content.tripId && parent.routeIds?.includes(content.id) ? parent.routeIds : ids;
            if (JSON.stringify(routeIds) !== JSON.stringify(parent.routeIds || [])) updates.set(parent.id, { ...parent, routeIds });
          }
        }
        if (content.kind === 'trip') {
          for (const child of records.filter(c => c.kind === 'route')) {
            if (content.routeIds?.includes(child.id)) {
              updates.set(child.id, { ...child, tripId: content.id, destinationId: content.destinationId });
              if (child.tripId && child.tripId !== content.id) {
                const old = updates.get(child.tripId) || records.find(c => c.id === child.tripId);
                if (old) updates.set(old.id, { ...old, routeIds: old.routeIds?.filter(id => id !== child.id) });
              }
            } else if (child.tripId === content.id) updates.set(child.id, { ...child, tripId: undefined });
          }
        }
        updates.set(content.id, content);
        await env.DB.batch([...updates.values()].map(c => env.DB.prepare('INSERT INTO content VALUES (?,?,?) ON CONFLICT(id) DO UPDATE SET kind=excluded.kind,data=excluded.data').bind(c.id, c.kind, JSON.stringify(c))));
        await event(env, user, 'content.saved', content.id);
        return json(content);
      }
      if (path[0] === 'content' && method === 'DELETE') {
        requireEditor(user);
        if (['home', 'about', 'agency'].includes(path[1])) fail(400, 'This page cannot be deleted.');
        const records = await all(env);
        if (records.some(c => c.destinationId === path[1] || c.tripId === path[1])) fail(409, 'Remove or reassign related content first.');
        if (await env.DB.prepare('SELECT id FROM purchases WHERE trip_id=? LIMIT 1').bind(path[1]).first()) fail(409, 'Purchased trips must be unpublished rather than deleted.');
        await env.DB.batch([env.DB.prepare('DELETE FROM content WHERE id=?').bind(path[1]), ...records.filter(c => c.routeIds?.includes(path[1]) || c.stopIds?.includes(path[1])).map(c => env.DB.prepare('UPDATE content SET data=? WHERE id=?').bind(JSON.stringify({ ...c, routeIds: c.routeIds?.filter(id => id !== path[1]), stopIds: c.stopIds?.filter(id => id !== path[1]) }), c.id))]);
        await event(env, user, 'content.deleted', path[1]);
        return json({ ok: true });
      }
      if (path[0] === 'purchases' && method === 'GET') {
        requireUser(user);
        const query = user.role === 'Admin' ? env.DB.prepare('SELECT * FROM purchases ORDER BY created_at DESC') : env.DB.prepare('SELECT * FROM purchases WHERE user_id=? ORDER BY created_at DESC').bind(user.id);
        return json((await query.all()).results.map(p => ({ id: p.id, userId: p.user_id, tripId: p.trip_id, amount: p.amount, status: p.status, method: p.method, createdAt: p.created_at })));
      }
      if (path[0] === 'purchases' && method === 'POST') {
        requireUser(user);
        const { tripId, method: paymentMethod, outcome } = await body<{ tripId: string; method: string; outcome: string }>(request);
        const trip = (await all(env)).find(c => c.id === tripId && c.kind === 'trip' && c.published);
        if (!trip) fail(404, 'Published trip not found.');
        if (!['Card', 'BLIK', 'Przelewy24'].includes(paymentMethod) || !['success', 'failed', 'cancelled'].includes(outcome)) fail(400, 'Invalid simulation options.');
        if (await owned(env, user, tripId)) fail(409, 'This tour has already been booked.');
        const purchase = { id: uid(), userId: user.id, tripId, amount: trip!.price || 0, status: outcome, method: paymentMethod, createdAt: new Date().toISOString() };
        await env.DB.prepare('INSERT INTO purchases VALUES (?,?,?,?,?,?,?)').bind(purchase.id, user.id, tripId, purchase.amount, outcome, paymentMethod, purchase.createdAt).run();
        await event(env, user, `payment.${outcome}`, purchase.id);
        return json(purchase);
      }
      if (path[0] === 'purchases' && method === 'PATCH') {
        if (user.role !== 'Admin') fail(403, 'Admin access is required.');
        await env.DB.prepare("UPDATE purchases SET status='refunded' WHERE id=? AND status='success'").bind(path[1]).run();
        await event(env, user, 'payment.refunded', path[1]);
        return json({ ok: true });
      }
      if (path[0] === 'guides' && method === 'GET') {
        const records = await all(env);
        const trip = records.find(c => c.id === path[1] && c.kind === 'trip' && (c.published || canEdit(user.role)));
        if (!trip) fail(404, 'Route not found.');
        const routes = (trip!.routeIds || []).map(id => records.find(c => c.id === id && (c.published || canEdit(user.role)))).filter((c): c is Content => !!c);
        const ids = new Set(routes.flatMap(r => r.stopIds || []));
        return json({ trip, routes, places: records.filter(c => ids.has(c.id) && (c.published || canEdit(user.role))) });
      }
      if (path[0] === 'media' && method === 'POST') {
        requireUser(user);
        if (Number(request.headers.get('Content-Length') || 0) > 15 * 1024 * 1024) fail(413, 'Maximum upload size is 15 MB.');
        const form = await request.formData();
        const file = form.get('file');
        if (!(file instanceof File) || !['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm'].includes(file.type)) fail(400, 'Upload a JPEG, PNG, WebP, GIF, MP4 or WebM file.');
        const f = file as File;
        if (f.size > 15 * 1024 * 1024) fail(413, 'Maximum upload size is 15 MB.');
        const id = uid();
        await env.MEDIA.put(id, f.stream(), { httpMetadata: { contentType: f.type } });
        const thumbnail = form.get('thumbnail');
        if (thumbnail instanceof File && thumbnail.type === 'image/jpeg' && thumbnail.size < 1024 * 1024) await env.MEDIA.put(`${id}-thumb`, thumbnail.stream(), { httpMetadata: { contentType: 'image/jpeg' } });
        await env.DB.prepare('INSERT INTO media VALUES (?,?,?,?,?)').bind(id, user.id, f.name.slice(0, 200), f.type, new Date().toISOString()).run();
        await event(env, user, 'media.uploaded', id);
        return json({ id, url: `/api/media/${id}`, name: f.name, userId: user.id, createdAt: new Date().toISOString() }, 201);
      }
      if (path[0] === 'media' && method === 'GET' && !path[1]) {
        requireEditor(user);
        return json((await env.DB.prepare('SELECT * FROM media ORDER BY created_at DESC').all()).results.map(m => ({ id: m.id, url: `/api/media/${m.id}`, name: m.name, userId: m.user_id, createdAt: m.created_at })));
      }
      if (path[0] === 'media' && path[1] && method === 'GET') {
        const media = await env.DB.prepare('SELECT * FROM media WHERE id=?').bind(path[1]).first<{ user_id: string }>();
        if (!media) fail(404, 'Media not found.');
        const mediaUrl = `/api/media/${path[1]}`;
        const publicUse = (await all(env)).some(c => c.published && (c.image === mediaUrl || c.gallery.includes(mediaUrl))) || !!await env.DB.prepare("SELECT id FROM submissions WHERE image=? AND status='approved'").bind(mediaUrl).first();
        if (!publicUse && !canEdit(user.role) && !canModerate(user.role) && media!.user_id !== user.id) fail(403, 'This media is private.');
        const object = (url.searchParams.has('thumb') ? await env.MEDIA.get(`${path[1]}-thumb`) : null) || await env.MEDIA.get(path[1]);
        if (!object) fail(404, 'Media not found.');
        return new Response(object!.body, { headers: { 'Content-Type': object!.httpMetadata?.contentType || 'application/octet-stream', 'Cache-Control': publicUse ? 'public, max-age=3600' : 'private, no-store', 'X-Content-Type-Options': 'nosniff' } });
      }
      if (path[0] === 'media' && method === 'DELETE') {
        requireEditor(user);
        const mediaUrl = `/api/media/${path[1]}`;
        if ((await all(env)).some(c => c.image === mediaUrl || c.gallery.includes(mediaUrl)) || await env.DB.prepare('SELECT id FROM submissions WHERE image=? LIMIT 1').bind(mediaUrl).first()) fail(409, 'This media is in use and cannot be deleted.');
        await env.MEDIA.delete(path[1]);
        await env.MEDIA.delete(`${path[1]}-thumb`);
        await env.DB.prepare('DELETE FROM media WHERE id=?').bind(path[1]).run();
        return json({ ok: true });
      }
      if (path[0] === 'submissions' && method === 'GET') {
        const rows = (await env.DB.prepare('SELECT s.*,u.name FROM submissions s JOIN users u ON u.id=s.user_id ORDER BY s.created_at DESC').all()).results;
        return json(rows.filter(s => s.status === 'approved' || s.user_id === user.id || canModerate(user.role)).map(s => ({ id: s.id, userId: s.user_id, name: s.name, targetId: s.target_id, image: s.image, caption: s.caption, status: s.status, createdAt: s.created_at })));
      }
      if (path[0] === 'submissions' && method === 'POST') {
        requireUser(user);
        const data = await body<{ targetId: string; image: string; caption: string }>(request);
        if (!(await all(env)).some(c => c.id === data.targetId && c.published && ['trip', 'place'].includes(c.kind))) fail(400, 'Choose a published place or trip.');
        if (!await env.DB.prepare('SELECT id FROM media WHERE id=? AND user_id=?').bind(data.image?.split('/').pop(), user.id).first()) fail(403, 'You can only submit your own uploads.');
        if (!data.caption?.trim() || data.caption.length > 1000) fail(400, 'Add a caption of up to 1,000 characters.');
        await env.DB.prepare('INSERT INTO submissions VALUES (?,?,?,?,?,?,?)').bind(uid(), user.id, data.targetId, data.image, data.caption.trim(), 'pending', new Date().toISOString()).run();
        await event(env, user, 'submission.created', data.targetId);
        return json({ ok: true }, 201);
      }
      if (path[0] === 'submissions' && method === 'PATCH') {
        if (!canModerate(user.role)) fail(403, 'Moderator or Admin access is required.');
        const { status } = await body<{ status: string }>(request);
        if (!['approved', 'rejected'].includes(status)) fail(400, 'Invalid moderation status.');
        await env.DB.prepare('UPDATE submissions SET status=? WHERE id=?').bind(status, path[1]).run();
        await event(env, user, `submission.${status}`, path[1]);
        return json({ ok: true });
      }
      if (path[0] === 'users') {
        if (user.role !== 'Admin') fail(403, 'Admin access is required.');
        if (method === 'GET') return json((await env.DB.prepare('SELECT * FROM users').all()).results);
        if (method === 'PATCH') {
          const { role } = await body<{ role: Role }>(request);
          if (!roles.includes(role) || role === 'Guest') fail(400, 'Invalid account role.');
          if (path[1] === user.id) fail(400, 'Use the demo account selector to switch your own role.');
          await env.DB.prepare('UPDATE users SET role=? WHERE id=?').bind(role, path[1]).run();
          await event(env, user, 'user.role_changed', path[1]);
          return json({ ok: true });
        }
      }
      if (path[0] === 'contact' && method === 'POST') {
        const data = await body<{ name: string; email: string; message: string }>(request);
        if (!data.name?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email || '') || !data.message?.trim()) fail(400, 'Complete all contact fields.');
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

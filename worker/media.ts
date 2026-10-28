import type { Content } from '../shared/types';
import { fail } from './http';

export interface MediaEnv {
  DB: D1Database;
  MEDIA: R2Bucket;
}
export const mediaUrls = (content: Content) => [content.image, ...content.gallery];
export function mediaRefs(
  env: MediaEnv,
  type: string,
  id: string,
  urls: string[],
  publicUse: boolean,
) {
  return [
    env.DB.prepare('DELETE FROM media_refs WHERE ref_type=? AND ref_id=?').bind(type, id),
    ...[...new Set(urls)]
      .filter((url) => /^\/api\/media\/[a-z0-9-]+$/.test(url))
      .map((url) =>
        env.DB.prepare('INSERT INTO media_refs VALUES (?,?,?,?)').bind(
          url.split('/').pop(),
          type,
          id,
          publicUse ? 1 : 0,
        ),
      ),
  ];
}

// Check container signatures instead of trusting the browser-provided MIME type.
async function detectedType(file: File) {
  const bytes = new Uint8Array(await file.slice(0, 4096).arrayBuffer());
  const ascii = (start: number, end: number) => new TextDecoder().decode(bytes.slice(start, end));
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg';
  if (bytes.slice(0, 8).join(',') === '137,80,78,71,13,10,26,10') return 'image/png';
  if (['GIF87a', 'GIF89a'].includes(ascii(0, 6))) return 'image/gif';
  if (ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP') return 'image/webp';
  if (ascii(4, 8) === 'ftyp' && /^(isom|iso[2-9]|mp4[12]|avc1|M4V )/.test(ascii(8, 12)))
    return 'video/mp4';
  if (bytes.slice(0, 4).join(',') === '26,69,223,163' && ascii(0, 4096).includes('webm'))
    return 'video/webm';
  return undefined;
}

export async function cleanupUploads(env: MediaEnv) {
  const stale = (
    await env.DB.prepare(
      'SELECT media_id FROM media_uploads u WHERE created_at<? AND NOT EXISTS (SELECT 1 FROM media_refs r WHERE r.media_id=u.media_id) LIMIT 50',
    )
      .bind(Date.now() - 48 * 3600000)
      .all<{ media_id: string }>()
  ).results;
  for (const { media_id: id } of stale) await removeMedia(env, id);
  await env.DB.prepare('DELETE FROM sessions WHERE expires_at<?').bind(Date.now()).run();
}

export async function removeMedia(env: MediaEnv, id: string) {
  if (await env.DB.prepare('SELECT 1 FROM media_refs WHERE media_id=? LIMIT 1').bind(id).first())
    fail(409, 'This media is in use.');
  await env.MEDIA.delete([id, `${id}-thumb`]);
  await env.DB.batch([
    env.DB.prepare('DELETE FROM media WHERE id=?').bind(id),
    env.DB.prepare('DELETE FROM media_uploads WHERE media_id=?').bind(id),
  ]);
}

export async function upload(request: Request, env: MediaEnv, userId: string) {
  // A bounded stream prevents multipart parsing from buffering an unlimited body.
  const limit = 17 * 1024 * 1024;
  if (Number(request.headers.get('Content-Length') || 0) > limit)
    fail(413, 'Maximum upload size is 15 MB.');
  let size = 0;
  const stream = request.body?.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        size += chunk.byteLength;
        if (size > limit) {
          controller.error(new Error('Upload too large'));
          return;
        }
        controller.enqueue(chunk);
      },
    }),
  );
  let form: FormData;
  try {
    form = await new Response(stream, {
      headers: { 'Content-Type': request.headers.get('Content-Type') || '' },
    }).formData();
  } catch {
    return fail(size > limit ? 413 : 400, 'Invalid or oversized upload.');
  }
  const file = form.get('file');
  if (!(file instanceof File) || !file.size || file.size > 15 * 1024 * 1024)
    fail(400, 'Choose a file between 1 byte and 15 MB.');
  const original = file as File;
  const mime = await detectedType(original);
  if (!mime || mime !== original.type)
    fail(400, 'The file contents do not match a supported image or video format.');
  const key = request.headers.get('X-Upload-Key') || crypto.randomUUID();
  if (!/^[a-zA-Z0-9-]{1,100}$/.test(key)) fail(400, 'Invalid upload key.');
  const existing = await env.DB.prepare(
    'SELECT m.* FROM media m JOIN media_uploads u ON u.media_id=m.id WHERE u.user_id=? AND u.upload_key=?',
  )
    .bind(userId, key)
    .first<{ id: string; name: string; mime: string; created_at: string }>();
  const describe = (id: string, name: string, type: string, createdAt: string) => ({
    id,
    url: `/api/media/${id}`,
    name,
    mime: type,
    userId,
    createdAt,
  });
  if (existing) return describe(existing.id, existing.name, existing.mime, existing.created_at);
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(`${userId}:${key}`),
  );
  const id = [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
  const thumbnail = form.get('thumbnail');
  if (
    thumbnail instanceof File &&
    (thumbnail.size > 1024 * 1024 || (await detectedType(thumbnail)) !== 'image/jpeg')
  )
    fail(400, 'Invalid thumbnail.');
  const bytes = original.size + (thumbnail instanceof File ? thumbnail.size : 0);
  const reservation =
    await env.DB.prepare(`INSERT OR IGNORE INTO media_uploads SELECT ?,?,?,?,?,? WHERE
    (SELECT count(*) FROM media_uploads WHERE user_id=? AND created_at>?) < 100 AND
    (SELECT coalesce(sum(bytes),0) FROM media_uploads WHERE user_id=?) + ? <= 524288000`)
      .bind(
        id,
        userId,
        key,
        bytes,
        Date.now(),
        thumbnail instanceof File ? 1 : 0,
        userId,
        Date.now() - 86400000,
        userId,
        bytes,
      )
      .run();
  if (!reservation.meta.changes)
    fail(429, 'Upload limit reached. Try again later or remove unused files.');
  const createdAt = new Date().toISOString();
  try {
    await env.MEDIA.put(id, original.stream(), { httpMetadata: { contentType: mime } });
    if (thumbnail instanceof File)
      await env.MEDIA.put(`${id}-thumb`, thumbnail.stream(), {
        httpMetadata: { contentType: 'image/jpeg' },
      });
    await env.DB.prepare('INSERT INTO media VALUES (?,?,?,?,?)')
      .bind(id, userId, original.name.slice(0, 200), mime, createdAt)
      .run();
  } catch (error) {
    await removeMedia(env, id);
    throw error;
  }
  return describe(id, original.name.slice(0, 200), mime!, createdAt);
}

export async function serveMedia(
  request: Request,
  env: MediaEnv,
  id: string,
  thumbnail: boolean,
  publicUse: boolean,
) {
  const key = thumbnail && (await env.MEDIA.head(`${id}-thumb`)) ? `${id}-thumb` : id;
  const head = await env.MEDIA.head(key);
  if (!head) return fail(404, 'Media not found.');
  const headers = new Headers({
    'Content-Type': head.httpMetadata?.contentType || 'application/octet-stream',
    'Cache-Control': publicUse ? 'public, max-age=3600' : 'private, no-store',
    'X-Content-Type-Options': 'nosniff',
    'Accept-Ranges': 'bytes',
    ETag: head.httpEtag,
  });
  if (request.headers.get('If-None-Match') === head.httpEtag)
    return new Response(null, { status: 304, headers });
  const range = request.headers.get('Range');
  let offset = 0,
    end = head.size - 1;
  if (
    range &&
    (!request.headers.has('If-Range') || request.headers.get('If-Range') === head.httpEtag)
  ) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range);
    if (!match || (!match[1] && !match[2])) {
      headers.set('Content-Range', `bytes */${head.size}`);
      return new Response(null, { status: 416, headers });
    }
    offset = match[1] ? Number(match[1]) : Math.max(0, head.size - Number(match[2]));
    end = match[1] && match[2] ? Math.min(end, Number(match[2])) : end;
    if (
      !Number.isSafeInteger(offset) ||
      !Number.isSafeInteger(end) ||
      offset > end ||
      offset >= head.size
    ) {
      headers.set('Content-Range', `bytes */${head.size}`);
      return new Response(null, { status: 416, headers });
    }
    headers.set('Content-Range', `bytes ${offset}-${end}/${head.size}`);
  }
  const partial = headers.has('Content-Range');
  headers.set('Content-Length', String(end - offset + 1));
  const object = await env.MEDIA.get(
    key,
    partial ? { range: { offset, length: end - offset + 1 } } : undefined,
  );
  return new Response(object?.body, { status: partial ? 206 : 200, headers });
}

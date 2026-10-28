import type { Identity, MediaAttachment } from '../shared/types';
import { canModerate } from '../shared/types';
import { fail } from './http';

export async function listSubmissions(url: URL, db: D1Database, user: Identity) {
  const target = url.searchParams.get('target');
  const status = url.searchParams.get('status');
  if (!target && !canModerate(user.role)) fail(403, 'Choose a tour or place.');
  if (status && !['pending', 'approved', 'rejected'].includes(status))
    fail(400, 'Invalid submission status.');
  const offset = Number(url.searchParams.get('offset') || 0);
  if (!Number.isSafeInteger(offset) || offset < 0) fail(400, 'Invalid page offset.');
  const conditions = [],
    bindings: string[] = [];
  if (target) {
    conditions.push('s.target_id=?');
    bindings.push(target);
  }
  if (!canModerate(user.role)) {
    conditions.push("(s.status='approved' OR s.user_id=?)");
    bindings.push(user.id);
  }
  const base = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const counts = Object.fromEntries(
    (
      await db
        .prepare(`SELECT s.status,count(*) AS total FROM submissions s ${base} GROUP BY s.status`)
        .bind(...bindings)
        .all<{ status: string; total: number }>()
    ).results.map((row) => [row.status, row.total]),
  );
  if (status) {
    conditions.push('s.status=?');
    bindings.push(status);
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const rows = (
    await db
      .prepare(
        `SELECT s.*,u.name FROM submissions s JOIN users u ON u.id=s.user_id ${where} ORDER BY s.created_at DESC,s.id DESC LIMIT 25 OFFSET ?`,
      )
      .bind(...bindings, offset)
      .all<{
        id: string;
        user_id: string;
        name: string;
        target_id: string;
        image: string;
        caption: string;
        status: string;
        created_at: string;
      }>()
  ).results;
  const page = rows.slice(0, 24);
  const attachments = new Map<string, MediaAttachment[]>();
  if (page.length) {
    const media = (
      await db
        .prepare(
          `SELECT sm.submission_id,sm.url,m.mime,mu.thumbnail FROM submission_media sm LEFT JOIN media m ON sm.url='/api/media/' || m.id LEFT JOIN media_uploads mu ON mu.media_id=m.id WHERE sm.submission_id IN (${page.map(() => '?').join(',')}) ORDER BY sm.position`,
        )
        .bind(...page.map((row) => row.id))
        .all<{
          submission_id: string;
          url: string;
          mime: string | null;
          thumbnail: number | null;
        }>()
    ).results;
    for (const file of media) {
      const files = attachments.get(file.submission_id) || [];
      files.push({
        url: file.url,
        mime: file.mime || (/\.(mp4|webm)(?:[?#]|$)/i.test(file.url) ? 'video/mp4' : 'image/jpeg'),
        thumbnail:
          file.url.startsWith('/api/media/') && (file.thumbnail || file.mime?.startsWith('image/'))
            ? `${file.url}?thumb=1`
            : undefined,
      });
      attachments.set(file.submission_id, files);
    }
  }
  return {
    items: page.map((row) => {
      const media = attachments.get(row.id) || [
        {
          url: row.image,
          mime: /\.(mp4|webm)(?:[?#]|$)/i.test(row.image) ? 'video/mp4' : 'image/jpeg',
        },
      ];
      return {
        id: row.id,
        userId: row.user_id,
        name: row.name,
        targetId: row.target_id,
        image: row.image,
        images: media.map((file) => file.url),
        media,
        caption: row.caption,
        status: row.status,
        createdAt: row.created_at,
      };
    }),
    nextOffset: rows.length > 24 ? offset + 24 : null,
    counts,
  };
}

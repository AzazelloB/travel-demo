import { type Content, canEdit, type Identity } from '../shared/types';

// Keep visibility in SQL so public reads don't load every draft and description.
export async function visibleContent(
  db: D1Database,
  user: Identity,
  options: { ids?: string[]; offset?: number } = {},
) {
  if (options.ids?.length === 0) return [];
  const bindings: (string | number)[] = [canEdit(user.role) ? 1 : 0, user.id, user.id, user.id];
  let where = `(json_extract(c.data,'$.published')=1 OR ?=1
    OR EXISTS (SELECT 1 FROM purchases p WHERE p.user_id=? AND p.trip_id=c.id AND p.status='success')
    OR (c.kind='route' AND EXISTS (SELECT 1 FROM purchases p WHERE p.user_id=? AND p.trip_id=json_extract(c.data,'$.tripId') AND p.status='success'))
    OR (c.kind='place' AND EXISTS (SELECT 1 FROM purchases p JOIN content r ON r.kind='route' AND json_extract(r.data,'$.tripId')=p.trip_id JOIN json_each(r.data,'$.stopIds') stop WHERE p.user_id=? AND p.status='success' AND stop.value=c.id)))`;
  if (options.ids) {
    where += ` AND c.id IN (${options.ids.map(() => '?').join(',')})`;
    bindings.push(...options.ids);
  }
  let query = `SELECT c.data FROM content c WHERE ${where} ORDER BY c.id`;
  if (options.offset !== undefined) {
    query += ' LIMIT 101 OFFSET ?';
    bindings.push(options.offset);
  }
  return (
    await db
      .prepare(query)
      .bind(...bindings)
      .all<{ data: string }>()
  ).results.map((row) => JSON.parse(row.data) as Content);
}

CREATE TABLE IF NOT EXISTS media_refs (media_id TEXT NOT NULL, ref_type TEXT NOT NULL, ref_id TEXT NOT NULL, public INTEGER NOT NULL DEFAULT 0, PRIMARY KEY(media_id, ref_type, ref_id));
CREATE INDEX IF NOT EXISTS media_refs_owner ON media_refs(ref_type, ref_id);
CREATE TABLE IF NOT EXISTS media_uploads (media_id TEXT PRIMARY KEY, user_id TEXT NOT NULL, upload_key TEXT NOT NULL, bytes INTEGER NOT NULL, created_at INTEGER NOT NULL, thumbnail INTEGER NOT NULL DEFAULT 0, UNIQUE(user_id, upload_key));
CREATE INDEX IF NOT EXISTS media_uploads_owner ON media_uploads(user_id, created_at);
CREATE INDEX IF NOT EXISTS submissions_target ON submissions(target_id, created_at DESC, id);
CREATE INDEX IF NOT EXISTS submissions_status ON submissions(status, created_at DESC, id);
CREATE INDEX IF NOT EXISTS submissions_user ON submissions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS sessions_expiry ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS content_trip ON content(json_extract(data,'$.tripId'),kind);

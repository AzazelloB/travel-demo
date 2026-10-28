import { Trash2, Upload } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Media, Page } from '../../../shared/types';
import { useStore } from '../../context/Store';
import { api, send } from '../../lib/api';
import { uploadMedia } from '../../lib/upload';
import { buttonStyles } from '../../ui/Button';
import { Modal } from '../../ui/Modal';
export function MediaPicker({
  onSelect,
  onClose,
}: {
  onSelect: (url: string) => void;
  onClose: () => void;
}) {
  const { content, notice } = useStore();
  const fileInput = useRef<HTMLInputElement>(null);
  const [media, setMedia] = useState<Media[]>([]),
    [search, setSearch] = useState(''),
    [busy, setBusy] = useState(false),
    [url, setUrl] = useState(''),
    [nextOffset, setNextOffset] = useState<number | null>(null);
  const requestVersion = useRef(0);
  const load = useCallback(
    async (offset = 0) => {
      const request = ++requestVersion.current;
      try {
        const page = await api<Page<Media>>(
          `media?q=${encodeURIComponent(search)}&offset=${offset}`,
        );
        if (request !== requestVersion.current) return;
        setMedia((current) => (offset ? [...current, ...page.items] : page.items));
        setNextOffset(page.nextOffset);
      } catch (error) {
        if (request === requestVersion.current) notice((error as Error).message);
      }
    },
    [notice, search],
  );
  useEffect(() => {
    const timer = setTimeout(() => void load(), 150);
    return () => {
      clearTimeout(timer);
      requestVersion.current++;
    };
  }, [load]);
  const selected = (u: string) => {
    onSelect(u);
    onClose();
  };
  const existing = [...new Set(content.flatMap((c) => [c.image, ...c.gallery]))].filter((u) =>
    u.startsWith('https:'),
  );
  return (
    <Modal title="Media library" onClose={onClose} wide>
      <div className="mb-6 flex items-center gap-3">
        <input
          placeholder="Search uploaded media…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          type="button"
          disabled={busy}
          className={buttonStyles({ size: 'sm' })}
          onClick={() => fileInput.current?.click()}
        >
          <Upload size={16} />
          {busy ? 'Uploading…' : 'Upload'}
        </button>
        <input
          ref={fileInput}
          hidden
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          disabled={busy}
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setBusy(true);
            try {
              await uploadMedia(file);
              await load();
            } catch (error) {
              notice((error as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        />
      </div>
      <div className="grid max-h-media grid-cols-3 gap-4 overflow-auto p-1 max-sm:grid-cols-2">
        {media
          .filter((m) => m.name.toLowerCase().includes(search.toLowerCase()))
          .map((m) => (
            <div key={m.id}>
              <button
                type="button"
                className="flex w-full flex-col items-start gap-2 p-0 text-left [&_img]:h-32 [&_img]:rounded-lg [&_small]:truncate"
                onClick={() => selected(m.url)}
              >
                <img src={`${m.url}?thumb=1`} alt={m.name} />
                <span>{m.name}</span>
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-3 py-1.5 text-sm font-medium text-primary hover:text-accent text-red-700"
                onClick={async () => {
                  try {
                    await api(`media/${m.id}`, send('DELETE'));
                    await load();
                  } catch (e) {
                    notice((e as Error).message);
                  }
                }}
              >
                <Trash2 size={13} />
                Delete unused
              </button>
            </div>
          ))}
        {!search &&
          existing.map((u) => (
            <button
              type="button"
              key={u}
              className="flex w-full flex-col items-start gap-2 p-0 text-left [&_img]:h-32 [&_img]:rounded-lg [&_small]:truncate"
              onClick={() => selected(u)}
            >
              <img src={u} alt="Travel library photograph" />
              <span>Travel collection</span>
            </button>
          ))}
      </div>
      {nextOffset !== null && (
        <button
          type="button"
          className={buttonStyles({ variant: 'secondary', size: 'sm', className: 'mt-4' })}
          onClick={() => void load(nextOffset)}
        >
          Load more
        </button>
      )}
      <form
        className="mt-6 flex flex-wrap gap-3 [&_input]:flex-1"
        onSubmit={(e) => {
          e.preventDefault();
          if (/^https:\/\//.test(url)) selected(url);
        }}
      >
        <input
          type="url"
          placeholder="Or use an https:// image URL"
          required
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button type="submit" className={buttonStyles({ size: 'sm' })}>
          Use image
        </button>
      </form>
    </Modal>
  );
}

import { ImagePlus, Plus, Save, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { type Content, canEdit, copy, type Kind } from '../../../shared/types';
import { useStore } from '../../context/Store';
import { api, send } from '../../lib/api';
import { buttonStyles } from '../../ui/Button';
import { Modal } from '../../ui/Modal';
import { MediaPicker } from './MediaPicker';
export function newContent(kind: Kind, parent?: Content): Content {
  return {
    id: '',
    kind,
    slug: `new-${kind}-${Date.now().toString(36)}`,
    title: { en: `New ${kind}`, pl: '' },
    description: { en: '<p>Add a description.</p>', pl: '' },
    image:
      parent?.image ||
      'https://images.unsplash.com/photo-1626468391668-6780596a4190?auto=format&fit=crop&w=1600&q=85',
    gallery: [],
    published: false,
    featured: false,
    order: 0,
    destinationId: parent?.kind === 'destination' ? parent.id : parent?.destinationId,
    tripId: parent?.kind === 'trip' ? parent.id : parent?.tripId,
    ...(kind === 'trip' ? { duration: 2, budget: 300, price: 29, routeIds: [] } : {}),
    ...(kind === 'route' ? { duration: 4, budget: 50, transport: 'walking', stopIds: [] } : {}),
    ...(kind === 'place'
      ? { duration: 60, budget: 0, category: 'nature', lat: 50.06, lng: 19.94 }
      : {}),
    ...(kind === 'destination' ? { region: 'Southern Poland', lat: 50, lng: 20 } : {}),
  };
}

export function ContentEditor({
  item,
  onClose,
  onSaved,
}: {
  item: Content;
  onClose: () => void;
  onSaved?: (c: Content) => void;
}) {
  const { content, lang, save, notice, refresh, user } = useStore();
  const navigate = useNavigate(),
    location = useLocation();
  const [draft, setDraft] = useState<Content>(structuredClone(item)),
    [busy, setBusy] = useState(false),
    [media, setMedia] = useState<'cover' | 'gallery' | null>(null),
    [dirty, setDirty] = useState(!item.id);
  const set = <K extends keyof Content>(key: K, value: Content[K]) => {
    setDraft((c) => ({ ...c, [key]: value }));
    setDirty(true);
  };
  const close = () => {
    if (!dirty || window.confirm('Discard unsaved changes?')) onClose();
  };
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);
  if (!canEdit(user.role)) return null;
  return (
    <>
      <Modal title={item.id ? `Edit ${item.kind}` : `Create ${item.kind}`} onClose={close} wide>
        <form
          className="flex flex-col gap-5 [&_.form-columns:has(>label:nth-child(3))]:grid-cols-3 max-sm:[&_.form-columns]:grid-cols-2"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            try {
              const result = await save(draft, !item.id);
              setDirty(false);
              onSaved?.(result);
              onClose();
              if (
                item.id &&
                item.slug !== result.slug &&
                location.pathname.endsWith(`/${item.slug}`)
              ) {
                const section =
                  item.kind === 'destination'
                    ? 'destinations'
                    : item.kind === 'trip'
                      ? 'trips'
                      : item.kind === 'route'
                        ? 'routes'
                        : 'places';
                navigate(`/${section}/${result.slug}`, { replace: true });
              }
              notice('Content saved.');
            } catch (error) {
              notice((error as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          <div className="flex flex-wrap items-center gap-2 rounded-lg bg-surface p-3 text-xs text-muted [&>span:last-child]:ml-auto">
            <span
              className={
                dirty ? 'size-1.5 rounded-full bg-amber-500' : 'size-1.5 rounded-full bg-accent'
              }
            />
            {dirty ? 'Unsaved changes' : 'Saved'}
            <span>
              {lang === 'en' ? 'English' : 'Polski'}
              {!draft.title[lang] && ' · translation missing; English fallback'}
            </span>
          </div>
          {draft.id === 'agency' && (
            <label>
              Agency founding year
              <input
                type="number"
                min="1800"
                max={new Date().getFullYear()}
                value={draft.foundedYear ?? ''}
                onChange={(e) =>
                  set('foundedYear', e.target.value ? Number(e.target.value) : undefined)
                }
              />
            </label>
          )}
          <label>
            Title
            <input
              value={draft.title[lang]}
              required
              onChange={(e) => set('title', { ...draft.title, [lang]: e.target.value })}
            />
          </label>
          <label>
            Description (rich HTML)
            <textarea
              rows={5}
              value={draft.description[lang]}
              onChange={(e) => set('description', { ...draft.description, [lang]: e.target.value })}
            />
          </label>
          <div className="block text-xs leading-relaxed text-muted">
            Use the text directly on the page for visual rich-text editing. Supported: headings,
            bold, italic, lists and links.
          </div>
          <div className="form-columns grid grid-cols-2 gap-4 max-sm:gap-3">
            <label>
              Slug
              <input
                pattern="[a-z0-9][a-z0-9-]*"
                required
                value={draft.slug}
                onChange={(e) => set('slug', e.target.value)}
              />
            </label>
            <label>
              Collection position
              <input
                type="number"
                min="0"
                value={draft.order}
                onChange={(e) => set('order', Number(e.target.value))}
              />
            </label>
          </div>
          <div className="flex items-center gap-5 [&>img]:h-24 [&>img]:w-36 [&>img]:rounded-xl">
            <img src={draft.image} alt="Cover preview" />
            <button
              type="button"
              className={buttonStyles({ variant: 'secondary', size: 'sm' })}
              onClick={() => setMedia('cover')}
            >
              <ImagePlus size={16} />
              Replace cover
            </button>
          </div>
          <div className="flex flex-wrap gap-3 [&>div]:relative [&_img]:h-20 [&_img]:w-24 [&_img]:rounded-lg [&>div>button]:absolute [&>div>button]:right-1 [&>div>button]:top-1 [&>div>button]:rounded-full [&>div>button]:bg-white">
            {draft.gallery.map((image, i) => (
              <div
                key={image}
                draggable
                onDragStart={(e) => e.dataTransfer.setData('text/plain', String(i))}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const from = Number(e.dataTransfer.getData('text/plain'));
                  const result = [...draft.gallery];
                  result.splice(i, 0, result.splice(from, 1)[0]);
                  set('gallery', result);
                }}
              >
                <img src={image} alt={`Gallery item ${i + 1}`} />
                <button
                  type="button"
                  aria-label="Move image left"
                  disabled={i === 0}
                  onClick={() => {
                    const g = [...draft.gallery];
                    [g[i - 1], g[i]] = [g[i], g[i - 1]];
                    set('gallery', g);
                  }}
                >
                  ←
                </button>
                <button
                  type="button"
                  aria-label="Remove image"
                  onClick={() =>
                    set(
                      'gallery',
                      draft.gallery.filter((_, n) => n !== i),
                    )
                  }
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            <button
              type="button"
              className="flex h-20 w-24 flex-col rounded-lg border border-dashed border-line text-xs"
              onClick={() => setMedia('gallery')}
            >
              <Plus />
              Add image
            </button>
          </div>
          {draft.kind === 'destination' && (
            <label>
              Region
              <select value={draft.region} onChange={(e) => set('region', e.target.value)}>
                {[
                  ...new Set([
                    draft.region || 'Southern Poland',
                    'Southern Poland',
                    'Northern Poland',
                    'Eastern Poland',
                    'Western Poland',
                    'Central Poland',
                    'Portugal',
                    'Spain',
                    'Italy',
                    'Czechia',
                    'Austria',
                    'France',
                    'Netherlands',
                    'Greece',
                  ]),
                ].map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </label>
          )}
          {['trip', 'route', 'place'].includes(draft.kind) && (
            <label>
              Destination
              <select
                value={draft.destinationId || ''}
                required
                onChange={(e) => set('destinationId', e.target.value)}
              >
                <option value="">Choose destination</option>
                {content
                  .filter((c) => c.kind === 'destination')
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {copy(c.title, lang)}
                    </option>
                  ))}
              </select>
            </label>
          )}
          {draft.kind === 'route' && (
            <label>
              Trip
              <select
                value={draft.tripId || ''}
                required
                onChange={(e) => {
                  const trip = content.find((c) => c.id === e.target.value);
                  setDraft((d) => ({ ...d, tripId: trip?.id, destinationId: trip?.destinationId }));
                  setDirty(true);
                }}
              >
                <option value="">Choose trip</option>
                {content
                  .filter((c) => c.kind === 'trip')
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {copy(c.title, lang)}
                    </option>
                  ))}
              </select>
            </label>
          )}
          {['trip', 'route', 'place'].includes(draft.kind) && (
            <div className="form-columns grid grid-cols-2 gap-4 max-sm:gap-3">
              <label>
                Duration (
                {draft.kind === 'trip' ? 'days' : draft.kind === 'place' ? 'minutes' : 'hours'})
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={draft.duration || 0}
                  onChange={(e) => set('duration', Number(e.target.value))}
                />
              </label>
              <label>
                Estimated budget (PLN)
                <input
                  type="number"
                  min="0"
                  value={draft.budget || 0}
                  onChange={(e) => set('budget', Number(e.target.value))}
                />
              </label>
              {draft.kind === 'trip' && (
                <label>
                  Tour price (PLN)
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={draft.price || 0}
                    onChange={(e) => set('price', Number(e.target.value))}
                  />
                </label>
              )}
            </div>
          )}
          {draft.kind === 'route' && (
            <label>
              Transport
              <select value={draft.transport} onChange={(e) => set('transport', e.target.value)}>
                {['walking', 'driving', 'cycling'].map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </label>
          )}
          {draft.kind === 'place' && (
            <label>
              Category
              <select value={draft.category} onChange={(e) => set('category', e.target.value)}>
                {['nature', 'city', 'museum', 'food', 'accommodation'].map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </label>
          )}
          {['place', 'destination'].includes(draft.kind) && (
            <div className="form-columns grid grid-cols-2 gap-4 max-sm:gap-3">
              <label>
                Latitude
                <input
                  type="number"
                  step="any"
                  min="-90"
                  max="90"
                  value={draft.lat || 0}
                  onChange={(e) => set('lat', Number(e.target.value))}
                />
              </label>
              <label>
                Longitude
                <input
                  type="number"
                  step="any"
                  min="-180"
                  max="180"
                  value={draft.lng || 0}
                  onChange={(e) => set('lng', Number(e.target.value))}
                />
              </label>
            </div>
          )}
          <details>
            <summary>Search engine details</summary>
            <label>
              Meta title
              <input
                value={draft.metaTitle?.[lang] || ''}
                onChange={(e) =>
                  set('metaTitle', { en: '', pl: '', ...draft.metaTitle, [lang]: e.target.value })
                }
              />
            </label>
            <label>
              Meta description
              <textarea
                value={draft.metaDescription?.[lang] || ''}
                onChange={(e) =>
                  set('metaDescription', {
                    en: '',
                    pl: '',
                    ...draft.metaDescription,
                    [lang]: e.target.value,
                  })
                }
              />
            </label>
          </details>
          <div className="flex gap-6 [&_label]:flex-row [&_label]:items-center">
            <label>
              <input
                type="checkbox"
                checked={draft.published}
                onChange={(e) => set('published', e.target.checked)}
              />
              Published
            </label>
            <label>
              <input
                type="checkbox"
                checked={draft.featured}
                onChange={(e) => set('featured', e.target.checked)}
              />
              Featured on home
            </label>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-3 border-t border-line pt-5 [&>.danger]:mr-auto">
            {item.id && !['home', 'about'].includes(item.id) && (
              <button
                type="button"
                className="inline-flex items-center gap-3 py-1.5 text-sm font-medium text-primary hover:text-accent text-red-700"
                disabled={busy}
                onClick={async () => {
                  if (!window.confirm('Delete this content?')) return;
                  try {
                    await api(`content/${item.id}`, send('DELETE'));
                    await refresh();
                    onClose();
                    notice('Content deleted.');
                  } catch (e) {
                    notice((e as Error).message);
                  }
                }}
              >
                <Trash2 size={16} />
                Delete
              </button>
            )}
            <button
              type="button"
              className={buttonStyles({ variant: 'secondary' })}
              onClick={close}
            >
              Cancel
            </button>
            <button type="submit" className={buttonStyles()} disabled={busy}>
              <Save size={16} />
              {busy ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      </Modal>
      {media && (
        <MediaPicker
          onClose={() => setMedia(null)}
          onSelect={(url) => {
            if (media === 'cover') set('image', url);
            else set('gallery', [...draft.gallery, url]);
          }}
        />
      )}
    </>
  );
}

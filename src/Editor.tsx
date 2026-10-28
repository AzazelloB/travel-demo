import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Bold, Check, ImagePlus, Italic, Link as LinkIcon, List, Plus, Save, Trash2, Upload, X } from 'lucide-react';
import { canEdit, copy, type Content, type Kind, type Media } from '../shared/types';
import { cleanHtml } from '../shared/html';
import { useLocation, useNavigate } from 'react-router-dom';
import { api, send, useStore } from './store';
export function Modal({ title, children, onClose, wide = false }: { title: string; children: ReactNode; onClose: () => void; wide?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose); closeRef.current = onClose;
  useEffect(() => {
    const prior = document.activeElement as HTMLElement;
    const old = document.body.style.overflow; document.body.style.overflow = 'hidden';
    ref.current?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeRef.current();
      if (e.key === 'Tab') {
        const items = [...(ref.current?.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],input,select,textarea,[contenteditable="true"]') || [])];
        const first = items[0], last = items.at(-1);
        if (e.shiftKey && (document.activeElement === first || document.activeElement === ref.current)) { e.preventDefault(); last?.focus(); }
        if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener('keydown', key);
    return () => { document.body.style.overflow = old; document.removeEventListener('keydown', key); prior?.focus(); };
  }, []);
  return <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}><div ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title} className={`modal ${wide ? 'wide' : ''}`}><div className="modal-head"><h2>{title}</h2><button className="icon-button" aria-label="Close dialog" onClick={onClose}><X/></button></div>{children}</div></div>;
}
function Toolbar({ target }: { target: React.RefObject<HTMLElement | null> }) {
  const command = (name: string, value?: string) => { target.current?.focus(); document.execCommand(name, false, value); target.current?.dispatchEvent(new Event('input', { bubbles: true })); };
  return <div className="rich-toolbar" onMouseDown={e => e.preventDefault()}><button title="Bold" onClick={() => command('bold')}><Bold size={15}/></button><button title="Italic" onClick={() => command('italic')}><Italic size={15}/></button><button title="Heading" onClick={() => command('formatBlock', 'h3')}>H</button><button title="Paragraph" onClick={() => command('formatBlock', 'p')}>P</button><button title="List" onClick={() => command('insertUnorderedList')}><List size={15}/></button><button title="Add link" onClick={() => { const url = window.prompt('Link URL (https://…)'); if (url && /^https:\/\//.test(url)) command('createLink', url); }}><LinkIcon size={15}/></button></div>;
}
export function InlineCopy({ item, field = 'title', rich = false, as = 'h1', className = '' }: { item: Content; field?: 'title' | 'description'; rich?: boolean; as?: 'h1' | 'h2' | 'p' | 'div'; className?: string }) {
  const { editing, lang, save, notice } = useStore();
  const [active, setActive] = useState(false), [dirty, setDirty] = useState(false), [busy, setBusy] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const Tag = as;
  useEffect(() => { if (!editing) { setActive(false); setDirty(false); } }, [editing]);
  useEffect(() => { const warn = (e: BeforeUnloadEvent) => { if (dirty) e.preventDefault(); }; window.addEventListener('beforeunload', warn); return () => window.removeEventListener('beforeunload', warn); }, [dirty]);
  const value = copy(item[field], lang);
  return <div className={`inline-copy ${editing ? 'editable' : ''} ${active ? 'is-editing' : ''}`}>
    {active && rich && <Toolbar target={ref}/>}
    <Tag ref={ref as never} className={className} contentEditable={active} suppressContentEditableWarning onInput={() => setDirty(true)} onClick={() => { if (editing && !active) { setActive(true); setTimeout(() => ref.current?.focus(), 0); } }} dangerouslySetInnerHTML={{ __html: rich ? cleanHtml(value) : value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\n/g, '<br/>') }}/>
    {editing && !active && <span className="edit-hint">Click to edit{!item[field][lang] ? ' · missing translation' : ''}</span>}
    {active && <div className="inline-actions"><span>{dirty ? 'Unsaved changes' : lang.toUpperCase()}</span><button disabled={busy} onClick={async () => { setBusy(true); try { const text = rich ? cleanHtml(ref.current?.innerHTML || '') : ref.current?.innerText || ''; await save({ ...item, [field]: { ...item[field], [lang]: text } }); setActive(false); setDirty(false); notice('Changes saved.'); } catch (e) { notice((e as Error).message); } finally { setBusy(false); } }}><Check size={14}/>Save</button><button onClick={() => { setActive(false); setDirty(false); if (ref.current) { if (rich) ref.current.innerHTML = cleanHtml(value); else ref.current.textContent = value; } }}>Cancel</button></div>}
  </div>;
}
export async function uploadMedia(file: File) {
  const form = new FormData(); form.append('file', file);
  if (file.type.startsWith('image/')) {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 600 / bitmap.width);
    const canvas = document.createElement('canvas'); canvas.width = bitmap.width * scale; canvas.height = bitmap.height * scale;
    canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height); bitmap.close();
    const thumb = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', .8));
    if (thumb) form.append('thumbnail', thumb, 'thumbnail.jpg');
  }
  return api<Media>('media', { method: 'POST', body: form });
}
export function MediaPicker({ onSelect, onClose }: { onSelect: (url: string) => void; onClose: () => void }) {
  const { content, notice } = useStore();
  const [media, setMedia] = useState<Media[]>([]), [search, setSearch] = useState(''), [busy, setBusy] = useState(false), [url, setUrl] = useState('');
  const load = () => api<Media[]>('media').then(setMedia).catch(e => notice(e.message));
  useEffect(() => { load(); }, []);
  const selected = (u: string) => { onSelect(u); onClose(); };
  const existing = [...new Set(content.flatMap(c => [c.image, ...c.gallery]))].filter(u => u.startsWith('https:'));
  return <Modal title="Media library" onClose={onClose} wide><div className="library-tools"><input placeholder="Search uploaded media…" value={search} onChange={e => setSearch(e.target.value)}/><label className="button small"><Upload size={16}/>{busy ? 'Uploading…' : 'Upload'}<input hidden type="file" accept="image/jpeg,image/png,image/webp,image/gif" disabled={busy} onChange={async e => { const file = e.target.files?.[0]; if (!file) return; setBusy(true); try { await uploadMedia(file); await load(); } catch (error) { notice((error as Error).message); } finally { setBusy(false); } }}/></label></div><div className="media-grid">{media.filter(m => m.name.toLowerCase().includes(search.toLowerCase())).map(m => <div key={m.id}><button className="media-choice" onClick={() => selected(m.url)}><img src={`${m.url}?thumb=1`} alt={m.name}/><span>{m.name}</span></button><button className="text-button danger" onClick={async () => { try { await api(`media/${m.id}`, send('DELETE')); await load(); } catch (e) { notice((e as Error).message); } }}><Trash2 size={13}/>Delete unused</button></div>)}{!search && existing.map(u => <button key={u} className="media-choice" onClick={() => selected(u)}><img src={u} alt="Travel library photograph"/><span>Travel collection</span></button>)}</div><form className="url-row" onSubmit={e => { e.preventDefault(); if (/^https:\/\//.test(url)) selected(url); }}><input type="url" placeholder="Or use an https:// image URL" required value={url} onChange={e => setUrl(e.target.value)}/><button className="button small">Use image</button></form></Modal>;
}
export function newContent(kind: Kind, parent?: Content): Content {
  return { id: '', kind, slug: `new-${kind}-${Date.now().toString(36)}`, title: { en: `New ${kind}`, pl: '' }, description: { en: '<p>Add a description.</p>', pl: '' }, image: parent?.image || 'https://images.unsplash.com/photo-1626468391668-6780596a4190?auto=format&fit=crop&w=1600&q=85', gallery: [], published: false, featured: false, order: 0, destinationId: parent?.kind === 'destination' ? parent.id : parent?.destinationId, tripId: parent?.kind === 'trip' ? parent.id : parent?.tripId, ...(kind === 'trip' ? { duration: 2, budget: 300, price: 29, routeIds: [] } : {}), ...(kind === 'route' ? { duration: 4, budget: 50, transport: 'walking', stopIds: [] } : {}), ...(kind === 'place' ? { duration: 60, budget: 0, category: 'nature', lat: 50.06, lng: 19.94 } : {}), ...(kind === 'destination' ? { region: 'Southern Poland', lat: 50, lng: 20 } : {}) };
}
export function ContentEditor({ item, onClose, onSaved }: { item: Content; onClose: () => void; onSaved?: (c: Content) => void }) {
  const { content, lang, save, notice, refresh, user } = useStore();
  const navigate = useNavigate(), location = useLocation();
  const [draft, setDraft] = useState<Content>(structuredClone(item)), [busy, setBusy] = useState(false), [media, setMedia] = useState<'cover' | 'gallery' | null>(null), [dirty, setDirty] = useState(!item.id);
  const set = <K extends keyof Content>(key: K, value: Content[K]) => { setDraft(c => ({ ...c, [key]: value })); setDirty(true); };
  const close = () => { if (!dirty || window.confirm('Discard unsaved changes?')) onClose(); };
  useEffect(() => { const warn = (e: BeforeUnloadEvent) => { if (dirty) e.preventDefault(); }; window.addEventListener('beforeunload', warn); return () => window.removeEventListener('beforeunload', warn); }, [dirty]);
  if (!canEdit(user.role)) return null;
  return <><Modal title={item.id ? `Edit ${item.kind}` : `Create ${item.kind}`} onClose={close} wide><form className="editor-form" onSubmit={async e => { e.preventDefault(); setBusy(true); try { const result = await save(draft, !item.id); setDirty(false); onSaved?.(result); onClose(); if (item.id && item.slug !== result.slug && location.pathname.endsWith('/' + item.slug)) { const section = item.kind === 'destination' ? 'destinations' : item.kind === 'trip' ? 'trips' : item.kind === 'route' ? 'routes' : 'places'; navigate('/' + section + '/' + result.slug, { replace: true }); } notice('Content saved.'); } catch (error) { notice((error as Error).message); } finally { setBusy(false); } }}>
    <div className="editor-status"><span className={dirty ? 'dirty-dot' : 'saved-dot'}/>{dirty ? 'Unsaved changes' : 'Saved'}<span>{lang === 'en' ? 'English' : 'Polski'}{!draft.title[lang] && ' · translation missing; English fallback'}</span></div>
    {draft.id === 'agency' && <label>Agency founding year<input type="number" min="1800" max={new Date().getFullYear()} value={draft.foundedYear ?? ''} onChange={e => set('foundedYear', e.target.value ? Number(e.target.value) : undefined)}/></label>}
    <label>Title<input value={draft.title[lang]} required onChange={e => set('title', { ...draft.title, [lang]: e.target.value })}/></label>
    <label>Description (rich HTML)<textarea rows={5} value={draft.description[lang]} onChange={e => set('description', { ...draft.description, [lang]: e.target.value })}/></label><div className="form-note">Use the text directly on the page for visual rich-text editing. Supported: headings, bold, italic, lists and links.</div>
    <div className="form-columns"><label>Slug<input pattern="[a-z0-9][a-z0-9-]*" required value={draft.slug} onChange={e => set('slug', e.target.value)}/></label><label>Collection position<input type="number" min="0" value={draft.order} onChange={e => set('order', Number(e.target.value))}/></label></div>
    <div className="cover-field"><img src={draft.image} alt="Cover preview"/><button type="button" className="button secondary small" onClick={() => setMedia('cover')}><ImagePlus size={16}/>Replace cover</button></div>
    <div className="gallery-editor">{draft.gallery.map((image, i) => <div key={`${image}-${i}`} draggable onDragStart={e => e.dataTransfer.setData('text/plain', String(i))} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); const from = Number(e.dataTransfer.getData('text/plain')); const result = [...draft.gallery]; result.splice(i, 0, result.splice(from, 1)[0]); set('gallery', result); }}><img src={image} alt={`Gallery image ${i + 1}`}/><button type="button" aria-label="Move image left" disabled={i === 0} onClick={() => { const g = [...draft.gallery]; [g[i - 1], g[i]] = [g[i], g[i - 1]]; set('gallery', g); }}>←</button><button type="button" aria-label="Remove image" onClick={() => set('gallery', draft.gallery.filter((_, n) => n !== i))}><X size={12}/></button></div>)}<button type="button" className="gallery-add" onClick={() => setMedia('gallery')}><Plus/>Add image</button></div>
    {draft.kind === 'destination' && <label>Region<select value={draft.region} onChange={e => set('region', e.target.value)}>{[...new Set([draft.region || 'Southern Poland', 'Southern Poland', 'Northern Poland', 'Eastern Poland', 'Western Poland', 'Central Poland', 'Portugal', 'Spain', 'Italy', 'Czechia', 'Austria', 'France', 'Netherlands', 'Greece'])].map(r => <option key={r}>{r}</option>)}</select></label>}
    {['trip', 'route', 'place'].includes(draft.kind) && <label>Destination<select value={draft.destinationId || ''} required onChange={e => set('destinationId', e.target.value)}><option value="">Choose destination</option>{content.filter(c => c.kind === 'destination').map(c => <option key={c.id} value={c.id}>{copy(c.title, lang)}</option>)}</select></label>}
    {draft.kind === 'route' && <label>Trip<select value={draft.tripId || ''} required onChange={e => { const trip = content.find(c => c.id === e.target.value); setDraft(d => ({ ...d, tripId: trip?.id, destinationId: trip?.destinationId })); setDirty(true); }}><option value="">Choose trip</option>{content.filter(c => c.kind === 'trip').map(c => <option key={c.id} value={c.id}>{copy(c.title, lang)}</option>)}</select></label>}
    {['trip', 'route', 'place'].includes(draft.kind) && <div className="form-columns"><label>Duration ({draft.kind === 'trip' ? 'days' : draft.kind === 'place' ? 'minutes' : 'hours'})<input type="number" min="0" step="0.5" value={draft.duration || 0} onChange={e => set('duration', Number(e.target.value))}/></label><label>Estimated budget (PLN)<input type="number" min="0" value={draft.budget || 0} onChange={e => set('budget', Number(e.target.value))}/></label>{draft.kind === 'trip' && <label>Tour price (PLN)<input type="number" min="0" step="0.01" value={draft.price || 0} onChange={e => set('price', Number(e.target.value))}/></label>}</div>}
    {draft.kind === 'route' && <label>Transport<select value={draft.transport} onChange={e => set('transport', e.target.value)}>{['walking', 'driving', 'cycling'].map(r => <option key={r}>{r}</option>)}</select></label>}
    {draft.kind === 'place' && <label>Category<select value={draft.category} onChange={e => set('category', e.target.value)}>{['nature', 'city', 'museum', 'food', 'accommodation'].map(r => <option key={r}>{r}</option>)}</select></label>}
    {['place', 'destination'].includes(draft.kind) && <div className="form-columns"><label>Latitude<input type="number" step="any" min="-90" max="90" value={draft.lat || 0} onChange={e => set('lat', Number(e.target.value))}/></label><label>Longitude<input type="number" step="any" min="-180" max="180" value={draft.lng || 0} onChange={e => set('lng', Number(e.target.value))}/></label></div>}
    <details><summary>Search engine details</summary><label>Meta title<input value={draft.metaTitle?.[lang] || ''} onChange={e => set('metaTitle', { en: '', pl: '', ...draft.metaTitle, [lang]: e.target.value })}/></label><label>Meta description<textarea value={draft.metaDescription?.[lang] || ''} onChange={e => set('metaDescription', { en: '', pl: '', ...draft.metaDescription, [lang]: e.target.value })}/></label></details>
    <div className="check-row"><label><input type="checkbox" checked={draft.published} onChange={e => set('published', e.target.checked)}/>Published</label><label><input type="checkbox" checked={draft.featured} onChange={e => set('featured', e.target.checked)}/>Featured on home</label></div>
    <div className="editor-footer">{item.id && !['home', 'about'].includes(item.id) && <button type="button" className="text-button danger" disabled={busy} onClick={async () => { if (!window.confirm('Delete this content?')) return; try { await api(`content/${item.id}`, send('DELETE')); await refresh(); onClose(); notice('Content deleted.'); } catch (e) { notice((e as Error).message); } }}><Trash2 size={16}/>Delete</button>}<button type="button" className="button secondary" onClick={close}>Cancel</button><button className="button" disabled={busy}><Save size={16}/>{busy ? 'Saving…' : 'Save changes'}</button></div>
  </form></Modal>{media && <MediaPicker onClose={() => setMedia(null)} onSelect={url => { if (media === 'cover') set('image', url); else set('gallery', [...draft.gallery, url]); }}/>}</>;
}

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Content, Guide, Identity, Lang, Purchase, Submission } from '../shared/types';
export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`/api/${path}`, { ...options, headers: { ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }), ...options.headers } });
  const data = await response.json();
  if (!response.ok) throw new Error((data as { error?: string }).error || 'Request failed.');
  return data as T;
}
export const send = (method: string, data?: unknown): RequestInit => ({ method, body: data == null ? undefined : JSON.stringify(data) });
const read = <T,>(key: string, fallback: T): T => { try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; } catch { return fallback; } };
async function database() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open('roam-guides', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('guides');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
export async function localGuide(user: string, id: string, action: 'get' | 'put' | 'delete' = 'get', guide?: Guide): Promise<Guide | undefined> {
  const db = await database();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('guides', action === 'get' ? 'readonly' : 'readwrite');
    const store = tx.objectStore('guides');
    const key = `${user}:${id}`;
    const req = action === 'get' ? store.get(key) : action === 'put' ? store.put(guide, key) : store.delete(key);
    tx.oncomplete = () => { db.close(); resolve(action === 'get' ? req.result : guide); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}
export async function loadGuide(user: string, id: string, online: boolean): Promise<Guide | undefined> {
  if (online) {
    try { return await api<Guide>(`guides/${id}`); }
    catch (error) { if (!(error instanceof TypeError)) throw error; }
  }
  return localGuide(user, id);
}
type Store = {
  content: Content[]; user: Identity; lang: Lang; setLang: (l: Lang) => void;
  editing: boolean; setEditing: (b: boolean) => void; purchases: Purchase[]; submissions: Submission[];
  loading: boolean; online: boolean; notice: (text: string) => void; refresh: () => Promise<void>;
  switchRole: (role: Identity['role']) => Promise<void>; save: (c: Content, create?: boolean) => Promise<Content>;
  hydrate: (g: Guide) => void; owns: (id: string) => boolean;
};
const Context = createContext<Store>(null!);
export const useStore = () => useContext(Context);
export function Provider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<Content[]>([]);
  const [user, setUser] = useState<Identity>({ id: 'guest', name: 'Guest', role: 'Guest' });
  const [lang, setLanguage] = useState<Lang>(read('roam-language', 'en'));
  const [editing, setEditing] = useState(false);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [online, setOnline] = useState(navigator.onLine);
  const [message, setMessage] = useState('');
  const notice = (text: string) => setMessage(text);
  useEffect(() => {
    const pointer = () => { document.documentElement.dataset.inputModality = 'pointer'; };
    const keyboard = (event: KeyboardEvent) => { if (event.key === 'Tab') document.documentElement.dataset.inputModality = 'keyboard'; };
    document.addEventListener('pointerdown', pointer, true);
    document.addEventListener('keydown', keyboard, true);
    return () => { document.removeEventListener('pointerdown', pointer, true); document.removeEventListener('keydown', keyboard, true); };
  }, []);
  async function refresh() {
    const next = await api<Identity>('session');
    const [records, bought, submitted] = await Promise.all([api<Content[]>('content'), next.role === 'Guest' ? Promise.resolve([]) : api<Purchase[]>('purchases'), api<Submission[]>('submissions')]);
    setUser(next); setContent(records); setPurchases(bought); setSubmissions(submitted);
    localStorage.setItem('roam-user', JSON.stringify(next));
    localStorage.setItem('roam-content', JSON.stringify(records.filter(c => c.published)));
    localStorage.setItem(`roam-purchases-${next.id}`, JSON.stringify(bought.filter(p => p.userId === next.id)));
  }
  useEffect(() => {
    refresh().catch(e => {
      if (e instanceof TypeError) setOnline(false);
      const cachedUser = read<Identity>('roam-user', { id: 'guest', name: 'Guest', role: 'Guest' });
      setUser(cachedUser); setContent(read('roam-content', [])); setPurchases(read(`roam-purchases-${cachedUser.id}`, []));
      if (navigator.onLine) notice(e.message);
    }).finally(() => setLoading(false));
    const change = () => { setOnline(navigator.onLine); if (navigator.onLine) refresh().catch(e => notice(e.message)); };
    window.addEventListener('online', change); window.addEventListener('offline', change);
    return () => { window.removeEventListener('online', change); window.removeEventListener('offline', change); };
  }, []);
  useEffect(() => { if (message) { const timeout = setTimeout(() => setMessage(''), 5000); return () => clearTimeout(timeout); } }, [message]);
  async function switchRole(role: Identity['role']) {
    await api('session', send('POST', { role })); setEditing(false); await refresh();
  }
  async function save(c: Content, create = false) {
    const saved = await api<Content>(create ? 'content' : `content/${c.id}`, send(create ? 'POST' : 'PUT', c));
    await refresh(); return saved;
  }
  function hydrate(g: Guide) { setContent(previous => { const incoming = [g.trip, ...g.routes, ...g.places]; return [...previous.filter(c => !incoming.some(n => n.id === c.id)), ...incoming]; }); }
  return <Context.Provider value={{ content, user, lang, setLang: l => { setLanguage(l); localStorage.setItem('roam-language', JSON.stringify(l)); }, editing, setEditing, purchases, submissions, loading, online, notice, refresh, switchRole, save, hydrate, owns: id => purchases.some(p => p.userId === user.id && p.tripId === id && p.status === 'success') }}>{children}{message && <div className="toast" role="status" onClick={() => setMessage('')}>{message}</div>}</Context.Provider>;
}

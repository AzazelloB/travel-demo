import { createContext, type ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import type { Content, Guide, Identity, Lang, Page, Purchase } from '../../shared/types';
import { api, send } from '../lib/api';
export const read = <T,>(key: string, fallback: T): T => {
  try {
    return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback;
  } catch {
    return fallback;
  }
};

export type Store = {
  content: Content[];
  user: Identity;
  lang: Lang;
  setLang: (l: Lang) => void;
  editing: boolean;
  setEditing: (b: boolean) => void;
  purchases: Purchase[];
  loading: boolean;
  online: boolean;
  notice: (text: string) => void;
  refresh: () => Promise<void>;
  switchRole: (role: Identity['role']) => Promise<void>;
  save: (c: Content, create?: boolean) => Promise<Content>;
  hydrate: (g: Guide) => void;
  mergeContent: (records: Content[]) => void;
  owns: (id: string) => boolean;
};

const Context = createContext<Store | null>(null);

export function useStore() {
  const store = useContext(Context);
  if (!store) throw new Error('useStore must be used within Provider.');
  return store;
}

export function Provider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<Content[]>([]);
  const [user, setUser] = useState<Identity>({ id: 'guest', name: 'Guest', role: 'Guest' });
  const [lang, setLanguage] = useState<Lang>(read('roam-language', 'en'));
  const [editing, setEditing] = useState(false);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [online, setOnline] = useState(navigator.onLine);
  const [message, setMessage] = useState('');
  const notice = useCallback((text: string) => setMessage(text), []);
  useEffect(() => {
    const pointer = () => {
      document.documentElement.dataset.inputModality = 'pointer';
    };
    const keyboard = (event: KeyboardEvent) => {
      if (event.key === 'Tab') document.documentElement.dataset.inputModality = 'keyboard';
    };
    document.addEventListener('pointerdown', pointer, true);
    document.addEventListener('keydown', keyboard, true);
    return () => {
      document.removeEventListener('pointerdown', pointer, true);
      document.removeEventListener('keydown', keyboard, true);
    };
  }, []);
  const refresh = useCallback(async () => {
    const next = await api<Identity>('session');
    const [records, bought] = await Promise.all([
      (async () => {
        const records: Content[] = [];
        let offset: number | null = 0;
        while (offset !== null) {
          const page: Page<Content> = await api(`content?catalog=1&offset=${offset}`);
          records.push(...page.items);
          offset = page.nextOffset;
        }
        return records;
      })(),
      next.role === 'Guest' ? Promise.resolve([]) : api<Purchase[]>('purchases'),
    ]);
    setUser(next);
    setContent(records);
    setPurchases(bought);
    localStorage.setItem('roam-user', JSON.stringify(next));
    localStorage.setItem('roam-content', JSON.stringify(records.filter((c) => c.published)));
    localStorage.setItem(
      `roam-purchases-${next.id}`,
      JSON.stringify(bought.filter((p) => p.userId === next.id)),
    );
  }, []);
  useEffect(() => {
    refresh()
      .catch((e) => {
        if (e instanceof TypeError) setOnline(false);
        const cachedUser = read<Identity>('roam-user', {
          id: 'guest',
          name: 'Guest',
          role: 'Guest',
        });
        setUser(cachedUser);
        setContent(read('roam-content', []));
        setPurchases(read(`roam-purchases-${cachedUser.id}`, []));
        if (navigator.onLine) notice(e.message);
      })
      .finally(() => setLoading(false));
    const change = () => {
      setOnline(navigator.onLine);
      if (navigator.onLine) refresh().catch((e) => notice(e.message));
    };
    window.addEventListener('online', change);
    window.addEventListener('offline', change);
    return () => {
      window.removeEventListener('online', change);
      window.removeEventListener('offline', change);
    };
  }, [refresh, notice]);
  useEffect(() => {
    if (message) {
      const timeout = setTimeout(() => setMessage(''), 5000);
      return () => clearTimeout(timeout);
    }
  }, [message]);
  async function switchRole(role: Identity['role']) {
    await api('session', send('POST', { role }));
    setEditing(false);
    await refresh();
  }
  async function save(c: Content, create = false) {
    const result = await api<{ item: Content; updated: Content[] }>(
      create ? 'content' : `content/${c.id}`,
      send(create ? 'POST' : 'PUT', c),
    );
    setContent((current) => {
      const next = [
        ...current.filter((record) => !result.updated.some((changed) => changed.id === record.id)),
        ...result.updated,
      ];
      localStorage.setItem(
        'roam-content',
        JSON.stringify(next.filter((record) => record.published)),
      );
      return next;
    });
    return result.item;
  }
  const mergeContent = useCallback((incoming: Content[]) => {
    setContent((previous) => {
      const next = [
        ...previous.filter((c) => !incoming.some((record) => record.id === c.id)),
        ...incoming,
      ];
      localStorage.setItem('roam-content', JSON.stringify(next.filter((c) => c.published)));
      return next;
    });
  }, []);
  const hydrate = useCallback((g: Guide) => {
    setContent((previous) => {
      const incoming = [g.trip, ...g.routes, ...g.places];
      return [...previous.filter((c) => !incoming.some((n) => n.id === c.id)), ...incoming];
    });
  }, []);
  return (
    <Context.Provider
      value={{
        content,
        user,
        lang,
        setLang: (l) => {
          setLanguage(l);
          localStorage.setItem('roam-language', JSON.stringify(l));
        },
        editing,
        setEditing,
        purchases,
        loading,
        online,
        notice,
        refresh,
        switchRole,
        save,
        hydrate,
        mergeContent,
        owns: (id) =>
          purchases.some((p) => p.userId === user.id && p.tripId === id && p.status === 'success'),
      }}
    >
      {children}
      {message && (
        <div
          className="fixed bottom-6 left-1/2 z-100 max-w-toast -translate-x-1/2 rounded-xl bg-ink px-6 py-4 text-sm text-white shadow-xl"
          role="status"
        >
          {message}
        </div>
      )}
    </Context.Provider>
  );
}

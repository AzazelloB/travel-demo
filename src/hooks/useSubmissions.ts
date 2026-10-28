import { useCallback, useEffect, useRef, useState } from 'react';
import type { SubmissionPage } from '../../shared/types';
import { useStore } from '../context/Store';
import { api } from '../lib/api';

const empty: SubmissionPage = { items: [], nextOffset: null, counts: {} };
export function useSubmissions(target?: string, status?: string) {
  const { user, notice } = useStore();
  const [page, setPage] = useState(empty);
  const [loading, setLoading] = useState(true);
  const version = useRef(0);
  const refresh = useCallback(
    async (offset = 0) => {
      if (!target && (user.id === 'guest' || !['Admin', 'Moderator'].includes(user.role))) {
        setPage(empty);
        setLoading(false);
        return;
      }
      const request = ++version.current;
      setLoading(true);
      const params = new URLSearchParams({ offset: String(offset) });
      if (target) params.set('target', target);
      if (status) params.set('status', status);
      try {
        const result = await api<SubmissionPage>(`submissions?${params}`);
        if (request === version.current)
          setPage((current) => ({
            ...result,
            items: offset
              ? [
                  ...current.items,
                  ...result.items.filter(
                    (item) => !current.items.some((old) => old.id === item.id),
                  ),
                ]
              : result.items,
          }));
      } catch (error) {
        if (request === version.current) notice((error as Error).message);
      } finally {
        if (request === version.current) setLoading(false);
      }
    },
    [target, status, user.id, user.role, notice],
  );
  // A new identity must fetch its own visibility-filtered page, even with the same role.
  useEffect(() => {
    setPage(empty);
    void refresh();
    return () => {
      version.current++;
    };
  }, [refresh]);
  return { page, loading, refresh };
}

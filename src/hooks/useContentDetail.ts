import { useEffect, useState } from 'react';
import { type Content, canEdit } from '../../shared/types';
import { useStore } from '../context/Store';
import { api } from '../lib/api';

export function useContentDetail(id?: string) {
  const { user, online, mergeContent, notice } = useStore();
  const [loaded, setLoaded] = useState('');
  const key = `${user.id}:${id}`;
  const fullCatalog = canEdit(user.role);
  useEffect(() => {
    if (!id || !online || fullCatalog) return;
    const controller = new AbortController();
    api<Content[]>(`content/${id}`, { signal: controller.signal })
      .then((records) => {
        mergeContent(records);
        setLoaded(key);
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          notice(error.message);
          setLoaded(key);
        }
      });
    return () => controller.abort();
  }, [id, key, online, fullCatalog, mergeContent, notice]);
  return !id || !online || fullCatalog || loaded === key;
}

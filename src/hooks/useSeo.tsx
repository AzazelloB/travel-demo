import { useEffect } from 'react';
import { type Content, copy } from '../../shared/types';
import { useStore } from '../context/Store';

export function useSeo(item?: Content) {
  const { lang } = useStore();
  useEffect(() => {
    if (!item) return;
    document.title = `${copy(item.metaTitle, lang) || copy(item.title, lang)} — Roam`;
    const meta = document.querySelector('meta[name="description"]');
    meta?.setAttribute(
      'content',
      copy(item.metaDescription, lang) ||
        copy(item.description, lang)
          .replace(/<[^>]*>/g, '')
          .slice(0, 160),
    );
    return () => {
      document.title = 'Roam — Tours and routes';
    };
  }, [item, lang]);
}

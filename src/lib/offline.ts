import type { Guide } from '../../shared/types';
import { api } from './api';

export async function downloadGuide(user: string, tripId: string) {
  const guide = await api<Guide>(`guides/${tripId}`);
  const cache = await caches.open(`roam-guide-images-${user}-${tripId}`);
  const images = [...new Set([guide.trip, ...guide.routes, ...guide.places]
    .flatMap((entry) => [entry.image, ...entry.gallery]).filter(Boolean))];
  let missed = 0;
  let next = 0;
  // Limit simultaneous photo downloads on mobile connections.
  await Promise.all(Array.from({ length: Math.min(4, images.length) }, async () => {
    while (next < images.length) {
      const image = images[next++];
      try {
        const response = await fetch(image, { mode: image.startsWith('https:') ? 'no-cors' : 'same-origin' });
        if (!response.ok && response.type !== 'opaque') throw new Error('Photo unavailable.');
        await cache.put(image, response);
      } catch { missed++; }
    }
  }));
  await localGuide(user, tripId, 'put', { ...guide, downloadedAt: new Date().toISOString() });
  return { guide, missed };
}
export async function database() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open('roam-guides', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('guides');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function localGuide(
  user: string,
  id: string,
  action: 'get' | 'put' | 'delete' = 'get',
  guide?: Guide,
): Promise<Guide | undefined> {
  const db = await database();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('guides', action === 'get' ? 'readonly' : 'readwrite');
    const store = tx.objectStore('guides');
    const key = `${user}:${id}`;
    const req =
      action === 'get'
        ? store.get(key)
        : action === 'put'
          ? store.put(guide, key)
          : store.delete(key);
    tx.oncomplete = () => {
      db.close();
      resolve(action === 'get' ? req.result : guide);
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

export async function loadGuide(
  user: string,
  id: string,
  online: boolean,
): Promise<Guide | undefined> {
  if (online) {
    try {
      return await api<Guide>(`guides/${id}`);
    } catch (error) {
      if (!(error instanceof TypeError)) throw error;
    }
  }
  return localGuide(user, id);
}

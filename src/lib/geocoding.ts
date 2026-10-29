import { z } from 'zod';
import type { Lang, MapCoordinate } from '../../shared/types';

const responseSchema = z.object({
  features: z.array(z.object({
    geometry: z.object({ type: z.literal('Point'), coordinates: z.tuple([z.number().min(-180).max(180), z.number().min(-90).max(90)]) }),
    properties: z.object({
      name: z.string().optional(), street: z.string().optional(), housenumber: z.string().optional(),
      city: z.string().optional(), district: z.string().optional(), postcode: z.string().optional(),
    }),
  })).max(10),
});

export interface StartingPlace {
  label: string;
  address: string;
  coordinates: MapCoordinate;
}

// Explicit searches only. Keep a small in-memory cache without persisting addresses.
const resultsCache = new Map<string, StartingPlace[]>();

export async function findStartingPlaces(query: string, center: MapCoordinate, lang: Lang, signal: AbortSignal) {
  const q = query.trim();
  if (q.length < 2 || q.length > 200) return [];
  const key = JSON.stringify([q.toLowerCase(), center, lang]);
  const cached = resultsCache.get(key);
  if (cached) return cached;
  const [lon, lat] = center;
  // The public Photon instance has no Polish index; retain local place names.
  const searchLanguage = lang === 'pl' ? 'default' : lang;
  const params = new URLSearchParams({
    q, lon: String(lon), lat: String(lat), lang: searchLanguage, limit: '5',
    bbox: `${Math.max(-180, lon - 0.5)},${Math.max(-90, lat - 0.5)},${Math.min(180, lon + 0.5)},${Math.min(90, lat + 0.5)}`,
  });
  const response = await fetch(`https://photon.komoot.io/api/?${params}`, {
    signal: AbortSignal.any([signal, AbortSignal.timeout(10000)]),
    credentials: 'omit',
  });
  if (!response.ok) throw new Error('Place search is unavailable.');
  const data = responseSchema.parse(await response.json());
  const results = data.features.map(({ properties: p, geometry }) => ({
    label: p.name || [p.street, p.housenumber].filter(Boolean).join(' ') || p.city || q,
    address: [...new Set([[p.street, p.housenumber].filter(Boolean).join(' '), p.postcode, p.city || p.district].filter(Boolean))].join(', '),
    coordinates: geometry.coordinates,
  }));
  if (resultsCache.size >= 20) resultsCache.delete(resultsCache.keys().next().value!);
  resultsCache.set(key, results);
  return results;
}

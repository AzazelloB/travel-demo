import type { Content } from '../../shared/types';

export const money = (n?: number) => `${(n || 0).toLocaleString('en-GB')} zł`;

export const pathTo = (c: Content) =>
  `/${c.kind === 'destination' ? 'destinations' : c.kind === 'trip' ? 'trips' : c.kind === 'route' ? 'routes' : 'places'}/${c.slug}`;

export const sortOrder = (a: Content, b: Content) => a.order - b.order;

export function routeDuration(hours: number | undefined, lang: 'en' | 'pl') {
  if (!hours) return '';
  if (hours >= 24 && hours % 24 === 0) {
    const days = hours / 24;
    return lang === 'pl' ? `${days} dni` : `${days} ${days === 1 ? 'day' : 'days'}`;
  }
  return `${hours} h`;
}

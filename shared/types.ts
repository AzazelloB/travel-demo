export type Role = 'Guest' | 'User' | 'Moderator' | 'Editor' | 'Admin';
export type Lang = 'en' | 'pl';
export type Copy = { en: string; pl: string };
export type Kind = 'destination' | 'trip' | 'route' | 'place' | 'page';
export interface Content {
  id: string;
  kind: Kind;
  slug: string;
  title: Copy;
  description: Copy;
  image: string;
  gallery: string[];
  published: boolean;
  featured: boolean;
  order: number;
  region?: string;
  destinationId?: string;
  tripId?: string;
  routeIds?: string[];
  stopIds?: string[];
  duration?: number;
  budget?: number;
  price?: number;
  transport?: string;
  category?: string;
  lat?: number;
  lng?: number;
  metaTitle?: Copy;
  metaDescription?: Copy;
  foundedYear?: number;
}
export interface Identity {
  id: string;
  name: string;
  role: Role;
}
export interface Purchase {
  id: string;
  userId: string;
  tripId: string;
  amount: number;
  status: 'success' | 'failed' | 'cancelled' | 'refunded';
  method: string;
  createdAt: string;
}
export interface Submission {
  id: string;
  userId: string;
  name: string;
  targetId: string;
  image: string;
  images: string[];
  media: MediaAttachment[];
  caption: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}
export interface Media {
  id: string;
  url: string;
  name: string;
  mime: string;
  userId: string;
  createdAt: string;
}
export interface MediaAttachment {
  url: string;
  mime: string;
  thumbnail?: string;
}
export interface Page<T> {
  items: T[];
  nextOffset: number | null;
}
export interface SubmissionPage extends Page<Submission> {
  counts: Record<string, number>;
}
export interface Guide {
  trip: Content;
  routes: Content[];
  places: Content[];
  downloadedAt?: string;
}
export const roles: Role[] = ['Guest', 'User', 'Moderator', 'Editor', 'Admin'];
export const canEdit = (role: Role) => role === 'Editor' || role === 'Admin';
export const canModerate = (role: Role) => role === 'Moderator' || role === 'Admin';
export const copy = (value: Copy | undefined, lang: Lang) =>
  value?.[lang] || value?.en || value?.pl || '';

export type Role = 'Guest' | 'User' | 'Moderator' | 'Editor' | 'Admin';
export type Lang = 'en' | 'pl';
export type Copy = { en: string; pl: string };
export type Kind = 'destination' | 'trip' | 'route' | 'place' | 'page';
export type MapCoordinate = [longitude: number, latitude: number];
export interface RouteMapPoint {
  id: string;
  kind: 'metro' | 'meal' | 'start';
  title: Copy;
  description: Copy;
  coordinates: MapCoordinate;
  stepId?: string;
}
export interface RouteMapPath {
  from: string;
  to: string;
  coordinates: MapCoordinate[];
  whenSkipped?: string;
}
export interface RouteDayMap {
  points: RouteMapPoint[];
  paths: RouteMapPath[];
}
export interface RouteStep {
  id: string;
  kind: 'visit' | 'meal' | 'break';
  placeId?: string;
  title?: Copy;
  description: Copy;
  minutes: number;
  admission?: Copy;
  hours?: Copy;
  booking?: Copy;
  sourceId?: string;
  optional?: boolean;
  transfer?: { minutes: number; description: Copy; distance: string };
}
export interface RouteDay {
  id: string;
  title: Copy;
  summary: Copy;
  startTime: string;
  walkingKm: number;
  arrival: Copy;
  departure: Copy;
  shorterDeparture?: Copy;
  notice?: Copy;
  steps: RouteStep[];
  map?: RouteDayMap;
}
export interface RoutePlan {
  checkedAt: string;
  introduction: Copy;
  accessibility: Copy;
  days: RouteDay[];
  costs: { label: Copy; min: number; max: number; note: Copy; sourceId?: string; optionalStepId?: string }[];
  preparation: { title: Copy; description: Copy; sourceId?: string }[];
  alternatives: { title: Copy; description: Copy }[];
  sources: { id: string; label: string; url: string }[];
}
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
  plan?: RoutePlan;
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

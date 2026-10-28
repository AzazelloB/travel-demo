import { z } from 'zod';
import { cleanHtml } from './html';

const id = z
  .string()
  .min(1)
  .max(120)
  .regex(/^[a-zA-Z0-9-]+$/);
const text = (max: number) => z.string().trim().max(max);
const copy = (max: number) => z.object({ en: text(max), pl: text(max) });
const image = z
  .string()
  .max(2048)
  .refine(
    (url) => /^https:\/\/[^\s<>"']+$/.test(url) || /^\/api\/media\/[a-z0-9-]+$/.test(url),
    'Choose an uploaded image or an HTTPS image URL.',
  );
const positive = z.number().finite().nonnegative();

// Object schemas strip unknown keys, so API input cannot add arbitrary stored properties.
export const contentSchema = z.object({
  id: z
    .string()
    .max(120)
    .regex(/^[a-zA-Z0-9-]*$/),
  kind: z.enum(['destination', 'trip', 'route', 'place', 'page']),
  slug: z.string().regex(/^[a-z0-9][a-z0-9-]{0,100}$/),
  title: copy(200).refine((value) => !!(value.en || value.pl), 'A title is required.'),
  description: copy(50000).transform((value) => ({
    en: cleanHtml(value.en),
    pl: cleanHtml(value.pl),
  })),
  image,
  gallery: z.array(image).max(100),
  published: z.boolean(),
  featured: z.boolean(),
  order: positive,
  region: text(100).optional(),
  destinationId: id.optional(),
  tripId: id.optional(),
  routeIds: z.array(id).max(500).optional(),
  stopIds: z.array(id).max(500).optional(),
  duration: positive.optional(),
  budget: positive.optional(),
  price: positive.optional(),
  transport: text(100).optional(),
  category: text(100).optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  metaTitle: copy(200).optional(),
  metaDescription: copy(500).optional(),
  foundedYear: z.number().int().min(1800).max(new Date().getFullYear()).optional(),
});
export const roleSchema = z.object({
  role: z.enum(['Guest', 'User', 'Moderator', 'Editor', 'Admin']),
});
export const purchaseSchema = z.object({
  tripId: id,
  method: z.enum(['Card', 'BLIK', 'Przelewy24']),
  outcome: z.enum(['success', 'failed', 'cancelled']),
});
export const submissionSchema = z.object({
  targetId: id,
  images: z
    .array(z.string().regex(/^\/api\/media\/[a-zA-Z0-9-]+$/))
    .min(1)
    .max(6)
    .refine((images) => new Set(images).size === images.length, 'Choose distinct files.'),
  caption: text(1000).min(1),
});
export const moderationSchema = z.object({ status: z.enum(['approved', 'rejected']) });
export const contactSchema = z.object({
  name: text(200).min(1),
  email: z.string().trim().email().max(254),
  message: text(10000).min(1),
});

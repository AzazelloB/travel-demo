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
const sourceLink = z.string().max(2048).url().refine((url) => url.startsWith('https://'));
const coordinates = z.tuple([z.number().min(-180).max(180), z.number().min(-90).max(90)]);
const routePlanSchema = z.object({
  checkedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  introduction: copy(3000),
  accessibility: copy(3000),
  sources: z.array(z.object({ id, label: text(200), url: sourceLink })).max(30),
  days: z.array(z.object({
    id, title: copy(200), summary: copy(2000),
    startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
    walkingKm: positive.max(100), arrival: copy(2000), departure: copy(2000), shorterDeparture: copy(2000).optional(), notice: copy(2000).optional(),
    map: z.object({
      points: z.array(z.object({
        id, kind: z.enum(['metro', 'meal', 'start']), title: copy(200), description: copy(2000), coordinates, stepId: id.optional(),
      })).max(50),
      paths: z.array(z.object({
        from: id, to: id, coordinates: z.array(coordinates).min(2).max(5000), whenSkipped: id.optional(),
      })).max(100),
    }).optional(),
    steps: z.array(z.object({
      id, kind: z.enum(['visit', 'meal', 'break']), placeId: id.optional(), title: copy(200).optional(),
      description: copy(3000), minutes: positive.max(1440), admission: copy(1000).optional(),
      hours: copy(1000).optional(), booking: copy(1500).optional(), sourceId: id.optional(), optional: z.boolean().optional(),
      transfer: z.object({ minutes: positive.max(1440), description: copy(2000), distance: text(100) }).optional(),
    })).min(1).max(50),
  })).min(1).max(30),
  costs: z.array(z.object({ label: copy(200), min: positive, max: positive, note: copy(1000), sourceId: id.optional(), optionalStepId: id.optional() })
    .refine((cost) => cost.max >= cost.min, 'Maximum cost must be at least the minimum.')).max(30),
  preparation: z.array(z.object({ title: copy(200), description: copy(3000), sourceId: id.optional() })).max(30),
  alternatives: z.array(z.object({ title: copy(200), description: copy(3000) })).max(20),
}).superRefine((plan, context) => {
  const sourceIds = new Set(plan.sources.map((source) => source.id));
  const stepIds = new Set<string>();
  const optionalIds = new Set<string>();
  plan.days.forEach((day, dayIndex) => day.steps.forEach((step, stepIndex) => {
    const path = ['days', dayIndex, 'steps', stepIndex];
    if (stepIds.has(step.id)) context.addIssue({ code: 'custom', path, message: 'Step IDs must be unique.' });
    stepIds.add(step.id);
    if (step.optional) optionalIds.add(step.id);
    if (step.kind === 'visit' && !step.placeId) context.addIssue({ code: 'custom', path, message: 'A visit must reference a place.' });
    if (step.kind !== 'visit' && !step.title) context.addIssue({ code: 'custom', path, message: 'A break or meal needs a title.' });
    if (step.sourceId && !sourceIds.has(step.sourceId)) context.addIssue({ code: 'custom', path, message: 'Unknown information source.' });
  }));
  plan.costs.forEach((cost, index) => {
    if (cost.optionalStepId && !optionalIds.has(cost.optionalStepId)) context.addIssue({ code: 'custom', path: ['costs', index], message: 'Optional costs must reference an optional stop.' });
  });
});

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
  plan: routePlanSchema.optional(),
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

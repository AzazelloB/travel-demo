# Roam

A React / TypeScript travel PWA with a Cloudflare Worker API, D1 records, and R2 uploads. The seeded Poland collection includes four destinations, four trips, ten daily routes, and thirty places.

## Local development

```sh
npm install
npm run dev
```

Open the printed local URL. The Cloudflare Vite plugin runs the Worker, D1 and R2 locally. Data persists under `.wrangler/`. The idempotent schema and seed initialize on the first API request. No Cloudflare credentials are needed locally.

```sh
npm run build
npm run preview
```

The production preview includes the service worker. Install or use offline downloads from a secure origin (localhost or HTTPS). Development deliberately does not register a service worker. Unregister an old worker in browser developer tools when returning to development.

## Using the demo

- Browse destinations and trips, filter the listings, and explore the illustrated regional map.
- Select **Editor**, turn on **Edit this page**, and click text in the page to edit it. The inline rich-text toolbar supports headings, bold, italic, lists and links. Use **Edit details & media** for galleries, fields, SEO, draft/published state and translations. Switch EN/PL to edit each language separately; missing translations fall back to English and show a warning while editing.
- Reorder featured collections with arrows. Reorder route stops by dragging or using arrows. Add existing records or create related records in place. In editing mode, drag map markers to move them or use the marker button and click the map to create a place. Maps are SVG regional illustrations, not navigation maps.
- Choose **User** to purchase a trip using Card, BLIK or Przelewy24. Select a simulated success, failure or cancellation. No payment data is requested and no money is charged. Successful purchases book a demo tour. Guides and route notes are free for everyone.
- Open **My Guides** to download, update or remove an offline copy. Downloads include descriptions, routes, stops, photos and illustrated maps. A failed image cache is reported; text and map data still download. Downloaded records are scoped to the demo identity. Refunds revoke the demo tour booking; free guides remain available.
- Signed-in identities can upload photos or video from trip/place pages. **Moderator** and **Admin** can approve, reject and remove contributions. Approved contributions show the contributor name in public galleries.
- **Admin** can review purchase history, simulate refunds, and assign permissions to the other demo identities. The account selector selects an identity; its current assigned role determines access.

Demo identities are shared and freely selectable by design. This is an authorization demonstration, not production authentication. The server uses HttpOnly, SameSite session cookies and enforces roles and guide ownership for every protected operation. Cross-origin writes are rejected. Unpublished content is restricted to Editor/Admin sessions. Rich-text markup is sanitized to a small allowlist. Private uploads are served only to the owner or authorized staff until used in published content or approved submissions.

## Cloudflare deployment

Create your resources:

```sh
npx wrangler d1 create roam-poland
npx wrangler r2 bucket create roam-poland-media
```

Replace the placeholder `database_id` in `wrangler.jsonc` with your D1 ID. Then:

```sh
npm run db:migrate
npm run deploy
```

The Worker serves the SPA and `/api/*`; D1 stores content, identities, sessions, purchases, moderation and event records. R2 stores originals and image thumbnails. Request, error, payment, upload and content-change events use Cloudflare observability. The schema is in `migrations/0001_initial.sql`, the seed in `shared/seed.ts`.

For deployment beyond a demo, replace unrestricted identity switching with real authentication, add upload scanning and quotas, contact delivery, operational retention policies, and audit/review the deployment’s privacy terms. Seed photography loads from Unsplash; uploads are stored in R2. Sample travel information is illustrative and needs editorial verification before use as a real travel guide.

## Verification

`npm run build` runs TypeScript compilation and the Vite production build. No unit tests are included. Physical Android/iOS installation, storage eviction and airplane-mode behavior must be checked on actual devices; desktop preview does not establish mobile compatibility.

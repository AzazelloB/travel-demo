# Roam

A React / TypeScript travel PWA with a Cloudflare Worker API, D1 records, and R2 uploads. The demo offers tours in Europe and Peru, free travel routes, an interactive world map, and an inline content editor. English and Polish content is supported.

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
- Choose **User** to purchase a trip using Card, BLIK or Przelewy24. Select a simulated success, failure or cancellation. No payment data is requested and no money is charged. Successful purchases book a demo tour. Routes and practical notes are free for everyone.
- Open **Routes** to download, update or remove an offline copy. Downloads include descriptions, routes, stops, photos and illustrated maps. A failed image cache is reported; text and map data still download. Downloaded records are scoped to the demo identity. Refunds revoke the demo tour booking; free routes remain available.
- Signed-in identities can upload photos or video from trip/place pages. **Moderator** and **Admin** can approve, reject and remove contributions. Approved contributions show the contributor name in public galleries.
- **Admin** can review purchase history, simulate refunds, and assign permissions to the other demo identities. The account selector selects an identity; its current assigned role determines access.

Demo identities are shared and freely selectable by design. This is an authorization demonstration, not production authentication. The server uses HttpOnly, SameSite session cookies and enforces roles for protected operations. Cross-origin writes are rejected. Unpublished content is restricted to Editor/Admin sessions. Rich-text markup is sanitized to a small allowlist. Private uploads are served only to the owner or authorized staff until used in published content or approved submissions.

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

## Code organization

- `src/pages`: page composition and page-specific behavior.
- `src/components`: reusable application features, including the editor and illustrated route map.
- `src/ui`: configurable visual primitives such as buttons, dropdowns and modals.
- `src/hooks`: shared React hooks.
- `src/context`: application state and session management.
- `src/lib`: API requests, offline storage and content helpers.
- `src/style.css`: Tailwind theme tokens, base element defaults and a few map/stamp utilities. Component styling lives in Tailwind classes.
- `shared`: content types, demo seed and HTML sanitization shared with the Worker.
- `worker`: the API and storage integration.

## Uploads and API validation

Write endpoints validate JSON with Zod and strip unrecognised properties. Public catalogue requests are paginated and return short descriptions; detail pages fetch full text separately. Community posts and the media library use scoped, paginated queries. Content edits return affected records so the client can update them without a full refresh.

Uploads verify file signatures against their declared format and allow files up to 15 MB. Each demo identity has a rolling limit of 100 uploads per day and 500 MiB of tracked uploads. Upload keys make retries idempotent. A daily scheduled Worker removes unreferenced uploads older than 48 hours, while referenced media is retained. Video responses support byte ranges; posts include media types and available thumbnails.

Apply both database migrations when deploying. The configured daily cron runs orphan cleanup; it does not run automatically during ordinary local development. Signature checks are not malware scanning or a full media decoder. Older uploads without tracking records are not automatically deleted or counted toward the new quota.

Use standard Tailwind utilities when adding styles. Extend the theme for reusable colors, fonts and layout dimensions instead of adding arbitrary pixel values. Keep page-specific components in their page file; extract them when multiple pages need them. `buttonStyles` shares visual variants between native buttons and router links.

## Formatting and linting

Biome formats and checks TypeScript, TSX, JavaScript, JSON and CSS with Tailwind syntax enabled. Recommended lint rules are enabled; documented overrides cover sanitized CMS HTML, SVG controls and pointer handlers that complement keyboard-accessible controls.

```sh
npm run check       # formatting, lint and import checks
npm run check:fix   # apply safe fixes and formatting
npm run format     # formatting only
npm run build      # TypeScript and production assets
```

GitHub Actions runs the checks and build for pushes and pull requests. The offline fallback is a Vite HTML entry so it uses the same Tailwind theme as the application.

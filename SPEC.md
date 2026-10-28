# Travel Guide PWA — Demo Project Specification

A travel discovery and itinerary application with an integrated inline CMS, interactive maps, simulated purchases, and offline guides.

**Stack:** React / Next.js, TypeScript, Cloudflare Workers, D1 (database), R2 (media storage). No separate CMS or traditional backend.

## 1. Landing page

- Header
  - Logo
  - Navigation
    - Home
    - Destinations
    - Trips
    - My Guides
  - Account / role selector
    - Guest
    - User
    - Moderator
    - Editor
    - Admin
- Hero
  - Background image
    - Select / upload (editor)
  - Title
    - Inline edit (editor)
  - Description
    - Inline rich-text edit (editor)
  - Explore trips button
- Featured destinations
  - Destination cards
    - Image
    - Name
    - Short description
  - Add / remove / reorder (editor)
- Featured trips
  - Trip cards
    - Image
    - Title
    - Duration
    - Budget
    - Price
  - Add / remove / reorder (editor)
- About section
  - Title
  - Rich text
  - Images
  - Inline edit (editor)
- Contact form
  - Name
  - Email
  - Message
  - Simulated submission / success state
- Footer
  - Navigation links
  - Contact information
  - Legal page links

## 2. Destinations

- Destinations listing
  - Search
  - Filter by region
  - Destination cards
    - Image
    - Title
    - Short description
  - Add destination (editor)
- Destination page
  - Cover image
    - Upload / select / replace (editor)
  - Name
    - Inline edit
  - Description
    - Rich-text edit
  - Location / region
    - Select
  - Gallery
    - Add / remove / reorder images
  - Associated trips
    - Trip cards
    - Add / remove associations
  - Publish / unpublish (editor)

## 3. Trips

- Trips listing
  - Search
  - Filters
    - Destination
    - Duration
    - Budget
  - Sort
    - Price
    - Duration
  - Trip cards
    - Image
    - Title
    - Duration
    - Budget
    - Price
  - Create trip (editor)
- Trip detail page
  - Cover image
    - Upload / select
  - Title
    - Inline edit
  - Description
    - Rich-text edit
  - Destination
    - Select
  - Duration
    - Edit
  - Estimated budget
    - Edit
  - Price
    - Edit
  - Gallery
    - Add / remove / reorder
  - Routes / itinerary days
    - Route card
      - Image
      - Title
      - Duration
      - Budget
      - Stops count - Add / remove / reorder routes (editor)
  - Interactive map
    - Display all route stops
    - Select stop to show details
  - Purchase guide button
    - Simulated checkout
  - Publish / unpublish (editor)

## 4. Routes / itineraries

- Route detail page
  - Title
    - Inline edit
  - Description
    - Rich-text edit
  - Cover image
    - Upload / select
  - Duration
    - Edit
  - Estimated budget
    - Edit
  - Transport type
    - Walking / driving / cycling
  - Stops list
    - Stop card
      - Image
      - Title
      - Description
      - Estimated visit duration
      - Estimated cost - Add existing stop - Create new stop - Remove stop - Drag-and-drop reorder
  - Interactive route map
    - Stop markers
    - Ordered route line
    - Click marker to select stop
    - Click stop to focus marker
    - Add / move markers (editor)
  - Previous / next route navigation

## 5. Places / stops

- Place detail
  - Title
    - Inline edit
  - Description
    - Rich-text edit
  - Cover image
    - Upload / select
  - Gallery
    - Add / remove / reorder
  - Coordinates
    - Select on map
    - Edit latitude / longitude
  - Category
    - Nature / city / museum / food / etc.
  - Estimated visit duration
    - Edit
  - Estimated cost
    - Edit
  - Associated routes
    - View
  - Publish / unpublish (editor)

## 6. Interactive map

- Map
  - Pan / zoom
  - Destination markers
  - Place markers
  - Route lines
  - Marker clustering (optional)
- Marker interaction
  - Hover preview
  - Click to open place / destination
  - Highlight associated route
- Filters
  - Destination
  - Place category
  - Trip
- Editor mode
  - Add marker
  - Drag marker
  - Assign marker to place
  - Edit marker details

Use MapLibre with map tiles, or an SVG-based regional map if reproducing a simplified illustrated style.

## 7. Inline CMS

- Editing mode
  - Available to Editor / Admin
  - Edit controls appear within normal pages
  - Toggle editing mode
  - Unsaved changes indicator
- Text editing
  - Click to edit
  - Save / cancel
- Rich-text editing
  - Headings
  - Bold / italic
  - Lists
  - Links
- Image management
  - Upload to R2
  - Media library
    - Grid of uploaded images
    - Search
    - Select existing image
    - Delete unused image
  - Replace image
  - Crop / focal point (optional)
  - Automatic thumbnail generation
- Content management
  - Create
  - Edit
  - Delete
  - Draft / published states
  - Preview drafts through protected routes
  - Publish / unpublish
- Relationships
  - Select existing destinations, trips, routes, places
  - Create related records inline
  - Reorder collections
- Localization
  - Language selector
    - Polish
    - English
  - Edit translations separately
  - Missing translation indicator
  - Language fallback
- SEO
  - Editable slug
  - Meta title
  - Meta description

## 8. Authentication and roles

- Login simulation
  - Header dropdown
    - Continue as Guest
    - Login as User
    - Login as Moderator
    - Login as Editor
    - Login as Admin
  - Persist selected demo identity
  - Display current role
  - Logout / switch role
- Permissions

| Action                 | Guest | User | Moderator | Editor | Admin |
| ---------------------- | ----- | ---- | --------- | ------ | ----- |
| View published content | Yes   | Yes  | Yes       | Yes    | Yes   |
| Purchase guides        | No    | Yes  | Yes       | Yes    | Yes   |
| Access owned guides    | No    | Yes  | Yes       | Yes    | Yes   |
| Submit media           | No    | Yes  | Yes       | Yes    | Yes   |
| Moderate submissions   | No    | No   | Yes       | No     | Yes   |
| Create / edit content  | No    | No   | No        | Yes    | Yes   |
| Publish content        | No    | No   | No        | Yes    | Yes   |
| Manage roles           | No    | No   | No        | No     | Yes   |
- Backend permission enforcement
  - Check role for each operation
  - Check ownership for purchases / uploads
  - Restrict unpublished content
  - Never rely on hidden frontend controls for security

For the demo, role switching is intentionally unrestricted. It demonstrates authorization behavior, not real authentication security.

## 9. Simulated payments

- Checkout
  - Guide / trip summary
  - Price in PLN
  - Mock payment methods
    - Card
    - BLIK
    - Przelewy24
  - Pay button
- Payment simulation
  - Processing state
  - Simulate success
  - Simulate failure
  - Simulate cancellation
- Purchase records
  - User
  - Guide
  - Amount
  - Status
  - Timestamp
- After successful payment
  - Grant guide access
  - Add to My Guides
  - Enable offline download
- Admin
  - View purchases
  - Simulate refund / revoke access

No real transactions or payment provider integration.

## 10. My Guides / PWA

- My Guides
  - Purchased guides list
  - Guide cover
  - Title
  - Download status
  - Open guide
  - Remove local download
- Offline guide
  - Trip overview
  - Routes
  - Stops
  - Descriptions
  - Images
  - Cached map data where supported
  - Offline availability indicator
- PWA
  - Installable app
  - Web app manifest
  - App icons
  - Service worker
  - Cache application shell
  - Explicit guide download
  - Offline fallback page
  - Update downloaded guide
  - Test on Android / iOS
- Access
  - Guide details available to owner
  - Purchase required for protected content
  - Downloaded content available offline

## 11. User-generated content and moderation

- User submissions
  - Select place / trip
  - Upload photo / video
  - Add caption
  - Submit
- Submission status
  - Pending
  - Approved
  - Rejected
- Moderator interface
  - Pending submissions queue
  - Preview media
  - Approve
  - Reject
  - Remove approved submission
- Public display
  - Approved submissions in place galleries
  - Contributor name

## 12. Cloudflare infrastructure

- Workers
  - Next.js server functionality
  - API routes
  - Permission checks
  - Mock payment handling
- D1
  - Users / demo identities
  - Roles / permissions
  - Destinations
  - Trips
  - Routes
  - Places
  - Route stops
  - Content translations
  - Purchases
  - Submissions
- R2
  - Cover images
  - Galleries
  - User-uploaded media
  - Guide assets
- Static assets
  - Frontend JavaScript / CSS
  - Icons
  - PWA manifest
- Monitoring
  - Request logs
  - Errors
  - Payment simulation events
  - Content modification events

## 13. Suggested implementation priority

1. **Core experience:** Landing page, destinations, trips, routes, places, interactive map.
2. **Inline CMS:** Editing controls, rich text, media library, create/edit/delete, publishing.
3. **Roles and permissions:** Demo account selector, guarded routes, backend authorization.
4. **Commerce:** Simulated checkout, purchases, guide ownership.
5. **PWA:** Installability, offline downloads, guide caching.
6. **Additional features:** Localization, submissions, moderation, SEO, polish.

**Portfolio goal:** Demonstrate a production-style, CMS-driven travel application where public content, inline editing, role-based access, mock commerce, and offline PWA functionality share one codebase.

The distinguishing feature should be the inline CMS: editing destinations, itineraries, maps, and media directly in their actual UI rather than through a generic administration panel.

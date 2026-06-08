# Admin Operations Design

## Objective

Build a secure admin dashboard for Pista House Wentworthville that lets owners manage daily operations without code changes. The dashboard must support order fulfilment, QR/order lookup, menu updates, image updates by URL or upload, and revenue/order audits across daily, weekly, monthly, and yearly periods.

## Chosen Approach

Use database overrides on top of the current `src/data/menu.ts` menu seed.

The existing menu file remains the safe fallback and source of default item IDs/categories. PostgreSQL stores admin edits in `MenuItemOverride` and optional new menu records. A shared server-side menu loader merges the seed menu with DB state. Every public surface must consume that loader so admin changes reflect across the whole site:

- homepage signature/menu preview
- `/menu`
- `/order`
- menu JSON-LD
- tRPC menu endpoint
- admin dashboard

This keeps the current build stable while giving owners live menu control.

## Admin Authentication And Security

Admin remains protected by NextAuth credentials, but security is tightened:

- require `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, and `NEXTAUTH_SECRET` in production
- store only password hashes, never plain text admin passwords
- use bcrypt/argon verification for credentials
- middleware protects `/admin` and `/api/admin/*`
- admin API routes validate the active session server-side
- write operations use POST/PATCH/DELETE only
- validate request bodies with Zod
- rate-limit login and QR/order lookup endpoints where deployment supports it
- audit important admin actions in a new `AdminAuditLog` table

The dashboard should show a clear warning only in development if production-grade secrets are missing.

## Data Model

Use current Prisma models where possible and extend them where needed.

`Order`

- stores customer details, pickup time, payment status, order status, totals, Stripe session ID, and timestamps
- status flow: `RECEIVED -> CONFIRMED -> BEING_PREPARED -> READY_FOR_PICKUP -> COMPLETED`
- also allow `CANCELLED`

`OrderItem`

- stores snapshot item name, menu item ID, price cents, and quantity so old orders remain accurate after menu edits

`MenuItemOverride`

- stores override values for existing seed item IDs
- supports name, description, price, image URL, tags, visible flag, category slug, popular flag, weekend-only flag, sort order

`CustomMenuItem`

- stores admin-created items not present in the seed menu
- supports item ID/slug, category, name, description, price, image, tags, visibility, sort order, popular, weekend-only

`MenuCategoryOverride`

- supports category display name, visibility, and ordering if owners add, hide, or reorder categories

`AdminAuditLog`

- stores admin email, action, entity type, entity ID, before/after JSON, IP/user agent when available, and timestamp

`OrderPayment`

- optional if Stripe webhook detail needs to be separated from `Order`
- can track checkout session status, payment status, amount paid, and receipt URL

## Image Management

The menu editor supports two image modes:

1. Paste image URL
   - accepts Cloudinary, Wikimedia, Unsplash, or approved external image hosts
   - validates URL format
   - previews the image before saving

2. Upload image
   - admin selects a local file
   - API route uploads to Cloudinary when `CLOUDINARY_*` env vars are configured
   - stores returned secure URL in the menu item record
   - development fallback may keep URL-only mode if Cloudinary is not configured

Image validation:

- max file size, recommended 2-5 MB
- allow JPEG, PNG, WebP
- reject SVG uploads for menu items
- show alt text based on dish name

## Admin Screens

### 1. Secure Login

Purpose: allow only authorized restaurant operators into `/admin`.

Content:

- email
- password
- clear error states
- redirect back to admin after sign-in

### 2. Orders

Purpose: run the pickup counter.

Features:

- live list of recent and active orders
- filters by status, date, payment status, pickup time
- search by order ID, customer name, email, phone
- order detail drawer with item list, quantities, notes, totals, payment status, pickup time
- update status buttons: Received, Confirmed, Being Prepared, Ready for Pickup, Completed, Cancelled
- optional print/kitchen ticket action
- highlighted overdue pickup orders

### 3. QR Scan / Order Lookup

Purpose: quickly identify a customer order at pickup.

Features:

- camera-based QR scanner using a browser QR library
- fallback input for order ID or pasted QR value
- supports scanning QR from `/order/success`
- parses order ID from either plain order ID or URL/query string
- opens order detail immediately
- has a large "Mark Ready" / "Complete Handover" workflow

If camera permission is unavailable, the manual order ID input remains fully usable.

### 4. Menu Editor

Purpose: update public menu without code changes.

Features:

- category sidebar
- search/filter menu items
- edit item name
- edit description
- edit price in AUD
- edit category
- edit dietary tags
- toggle visible/hidden
- toggle popular
- toggle weekend-only
- paste image URL
- upload image file
- image preview
- add new item
- remove or hide item
- reorder items within category
- save/reset changes

Saving a menu item writes a DB record and refreshes cache so the public pages update.

Deletion behavior:

- existing seed items should be hidden, not physically deleted
- custom DB-created items can be deleted or hidden
- previous order item snapshots remain unchanged

### 5. Audit / Reports

Purpose: make daily operations and accounting easier.

Time ranges:

- daily
- weekly
- monthly
- yearly
- custom date range

Metrics:

- total orders
- paid orders
- cancelled orders
- gross revenue
- GST included
- average order value
- top-selling items
- busiest pickup windows
- status breakdown
- payment status breakdown

Actions:

- export CSV
- print summary
- compare current period vs previous period

### 6. Settings

Purpose: keep operational configuration visible without distracting from the first operational release.

Initial scope:

- read current restaurant config
- show current contact, hours, and ordering settings from `RESTAURANT_CONFIG`
- leave full config editing for a later release unless it blocks order/menu operations
- keep menu/order operations as the first fully functional priority

## API Design

Admin routes are under `/api/admin/*` and require a valid admin session.

- `GET /api/admin/orders`
- `GET /api/admin/orders/:id`
- `PATCH /api/admin/orders/:id/status`
- `GET /api/admin/orders/lookup?code=...`
- `GET /api/admin/audit?range=daily|weekly|monthly|yearly&from=&to=`
- `GET /api/admin/menu`
- `PATCH /api/admin/menu/items/:id`
- `POST /api/admin/menu/items`
- `DELETE /api/admin/menu/items/:id`
- `POST /api/admin/menu/images`

Public routes:

- public menu data is read through a shared server loader, not directly from `src/data/menu.ts`
- order creation stores order records before/after Stripe checkout as appropriate
- order success QR includes the real order ID

## Shared Menu Loader

Create a server-side loader:

- reads seed menu from `src/data/menu.ts`
- reads `MenuItemOverride`, `CustomMenuItem`, and category overrides when DB is configured
- merges seed + overrides + custom items
- filters hidden items by default for public pages
- keeps hidden items visible in admin
- supports cache invalidation after admin saves

Client components receive menu data via props or API responses. Avoid importing `ALL_MENU_ITEMS` directly in public client flows once live DB menu is enabled.

## Order Creation And QR Flow

When customer places a pickup order:

1. `/order` cart uses live menu data.
2. Checkout API validates items against live menu prices.
3. API creates an `Order` record with `RECEIVED` status and item snapshots.
4. Stripe checkout session is created when configured.
5. Success page receives real `order_id`.
6. Success page QR encodes a pickup URL or order lookup value.
7. Admin QR scanner reads the code and opens the matching order detail.
8. Staff updates status through the dashboard.

In local development without Stripe/database, the app may keep a demo fallback, but production must persist orders.

## Error Handling

- If DB is unavailable, public pages use seed menu and admin shows a clear unavailable state.
- If image upload fails, keep unsaved form state and show the upload error.
- If QR parsing fails, prompt for manual order ID entry.
- If an order is not found, show a "not found" state without crashing.
- If payment is unpaid or cancelled, highlight it before handover.
- If a menu save conflicts with a newer update, show the latest updated timestamp and ask admin to reload.

## Testing And Verification

Automated tests:

- menu merge loader applies overrides correctly
- hidden seed items disappear publicly but remain in admin
- custom DB items appear in correct category
- order status transitions validate allowed states
- audit range calculations for daily, weekly, monthly, yearly
- QR parsing handles plain IDs and URLs
- admin API rejects unauthenticated requests

Rendered browser checks:

- admin login page
- admin orders tab
- QR lookup manual input
- menu editor save flow
- image URL preview
- image upload disabled/fallback when Cloudinary missing
- desktop and mobile admin dashboard
- public `/menu` and `/order` reflect edited menu values

Build checks:

- `npm test`
- `npm run lint`
- `npm run build`

## Implementation Notes

Start with a practical first version:

1. DB-backed menu override loader and admin menu editor.
2. Persisted order creation and admin order status updates.
3. QR lookup by order ID.
4. Audit metrics from persisted orders.
5. Cloudinary upload endpoint and UI.

This order gives owners immediate control over menu and fulfilment while keeping upload/reporting features grounded in real data.

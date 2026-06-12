# Pista House Wentworthville

Production-ready Next.js restaurant website and admin operations dashboard for Pista House Wentworthville.

## Stack

- Next.js 14 App Router, TypeScript, Tailwind CSS
- NextAuth credentials admin login
- Prisma ORM with PostgreSQL/Supabase-ready schema
- Stripe Checkout routes for click-and-collect
- Resend email helpers for orders, reservations, and guest messaging
- Google reviews/map integration fallbacks
- Vitest unit tests

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Admin defaults for local development:

```text
Email: admin@pistahouse.com.au
Password: pistahouse-admin
```

Set `ADMIN_PASSWORD_HASH` in production instead of using the development password.

## Environment Variables

Create `.env.local` for local secrets. Do not commit it.

```text
DATABASE_URL=
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=
ADMIN_EMAIL=admin@pistahouse.com.au
ADMIN_PASSWORD=
ADMIN_PASSWORD_HASH=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
RESEND_API_KEY=
RESEND_FROM_EMAIL=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_FROM_NUMBER=
TWILIO_MESSAGING_SERVICE_SID=
GOOGLE_PLACES_API_KEY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

## Validation

```bash
npm test
npm run lint
npm run build
```

## Database

The Prisma schema lives in `prisma/schema.prisma`. Run migrations against your Supabase/PostgreSQL database before using persistent admin data.

```bash
npx prisma migrate dev
npx prisma generate
```

Without `DATABASE_URL`, the app uses demo/fallback data for local UI development.

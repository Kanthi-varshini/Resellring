# ResellRing — Sell fast on campus

A second-hand marketplace built around the **offer, not the listing**:
listing → offers → acceptance → pickup → rating, with exclusive deals and
category price history.

---

## Problem Statement

Marketplace groups are comment chaos: "is this available?", price haggling in
DMs, and meetups that never happen — with multiple buyers promised the same
item. ResellRing structures the sale so every offer has a real amount, a
visible chain, and exactly one winner.

## Target Users

- **Students** clearing out books, electronics and furniture each semester.
- **Buyers** who want honest prices and non-ghosting sellers.
- **Sellers** who want serious offers instead of "dm price" comments.

## Solution

Sellers list items with a price, condition and meetup spot. Buyers make real
offers the seller can accept, counter or decline — all transitions guarded by
a state machine. Accepting locks the listing (other live offers auto-decline)
and records the agreed price; marking the handover done unlocks the buyer's
rating, which feeds the seller's public score. Every listing shows recent sold
prices in its category.

## Key Features

- **Offer state machine** — `open → countered → accepted | declined |
  withdrawn`, invalid transitions return 409 with the current state named.
- **Exclusive deals** — acceptance sets the listing to `pending`, stores the
  agreed price, and auto-declines all rival offers (tested).
- **Visible offer chain** — buyers and sellers see the full history
  (Offer ₹19,000 → Counter ₹20,500 → Accepted).
- **Category price history** — the last 10 sold prices per category on every
  listing page.
- **Reputation** — buyer ratings update the seller's cached average and sales
  count; "My ring" dashboards for both sides.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS 4, React Router 6, Axios |
| Backend | Node.js, Express 4, Mongoose 8, Zod validation |
| Auth | JWT (7-day), bcryptjs, rate-limited auth |
| Database | MongoDB (Atlas or local); `USE_MEMORY_DB=1` zero-config demo |
| Tests | `node:test` + `mongodb-memory-server` (19 checks incl. state-machine tests) |
| Deployment | Render (backend `render.yaml`) + Vercel (frontend `vercel.json`) |

## Architecture

```text
React SPA (Vercel) — market grid, listing page with offer chain, my-ring dashboards
   │  axios + JWT bearer
   ▼
Express API (Render)
   │   /api/listings        public browse+filters; authed CRUD, mark-sold
   │   ├─ offers            state machine: accept/counter/decline/withdraw
   │   ├─ accept            locks listing + auto-declines rivals
   │   └─ rating            buyer-only after sold; refreshes seller cache
   ▼
MongoDB: User (rating cache) · Listing (status machine) · Offer (history[]) · Rating
```

## Major Workflows

1. **List an item** — title, category, price, condition, campus + meetup spot.
2. **Offer & negotiate** — real amounts; sellers counter; the chain renders
   visually on the listing.
3. **Accept & coordinate** — acceptance locks the listing, rivals are declined
   automatically; both sides see the agreed price and meetup spot.
4. **Mark sold & rate** — handover confirmation enables the buyer's one-time
   1–5 star rating; seller averages update.
5. **My ring** — seller dashboard (live offer counts, mark sold) + buyer
   dashboard (offer states, withdraw).

## Local Setup

```bash
# 1. Backend
cd backend
npm install
npm test                       # 19-check suite (no database needed)

# Zero-config demo:
USE_MEMORY_DB=1 npm start      # API on http://localhost:5111

# Or with a real MongoDB:
cp .env.example .env           # set MONGODB_URI + JWT_SECRET
npm run seed
npm start

# 2. Frontend
cd ../frontend
npm install
npm run dev                    # app on http://localhost:5311
```

**Demo credentials** (password `Demo@1234`): `kabir@demo.com` (seller with
live + countered + accepted offers), `tara@demo.com`, `zoya@demo.com`,
`imran@demo.com` (buyer of the pending lamp deal). Seed: 7 listings across
categories, one sold with rating, and price history for books.

## Environment Variables

### backend/.env

| Name | Purpose |
|---|---|
| `PORT` | API port (default 5111) |
| `MONGODB_URI` | MongoDB connection string (empty + `USE_MEMORY_DB=1` for demo mode) |
| `USE_MEMORY_DB` | `1` = ephemeral in-memory MongoDB, auto-seeded on boot |
| `JWT_SECRET` | Secret used to sign JWTs — long random string in production |
| `CLIENT_ORIGIN` | Frontend origin allowed by CORS (default http://localhost:5311) |

### frontend/.env

| Name | Purpose |
|---|---|
| `VITE_API_URL` | Backend API base URL (default http://localhost:5111/api) |

## API Overview

| Method & path | Purpose |
|---|---|
| `POST /api/auth/register` · `POST /api/auth/login` · `GET /api/auth/me` | Auth |
| `GET /api/listings?q&category&maxPrice&campus` | Public marketplace |
| `POST /api/listings` · `GET /api/listings/mine` · `PATCH/DELETE /api/listings/:id` | Listing management |
| `PATCH /api/listings/:id/sold` | Confirm handover (requires pending deal) |
| `POST /api/listings/:id/offers` · `GET /api/listings/:id/offers` | Make / view offers |
| `PATCH /api/offers/:id/accept` · `…/counter` · `…/decline` · `…/withdraw` | State machine |
| `POST /api/listings/:id/rating` | Buyer rates a completed sale |
| `GET /api/health` | Health probe |

## Deployment

- **Backend**: Render web service from `backend/render.yaml`; set `MONGODB_URI`,
  `JWT_SECRET`, `CLIENT_ORIGIN`; health check `/api/health`.
- **Frontend**: Vercel from `frontend/` (SPA rewrite); set `VITE_API_URL`.

Live links: backend — [add URL] · frontend — [add URL]

## Error Handling & Security

- Zod validation everywhere; the offer state machine rejects every invalid
  transition with 409 and a message naming the current state.
- Seller authorization resolved through the listing (offers carry no seller
  field to spoof); buyers only withdraw their own offers.
- One live offer per buyer per listing (unique check); self-offers blocked.
- bcrypt(12) hashing, no account enumeration, rate-limited auth, 7-day JWTs.
- Frontend handles loading/empty/error/success states; toasts on every
  mutation; 401 auto-logout.

## Roadmap

- Photo uploads on listings.
- In-app chat anchored to the offer chain.
- Saved searches with alerts.
- Seller payout tracking for paid platforms.

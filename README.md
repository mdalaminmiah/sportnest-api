# 🏟️ SportNest — API (Backend)

RESTful backend for **SportNest**, a sports facility booking platform. Built with
**Express 5 + MongoDB (Mongoose)**, secured with **JWT in HTTPOnly cookies**, and
using **Better Auth** for Google OAuth.

## 🔗 Live Links

- **Live API:** https://sportnest-api.vercel.app
- **Live Site:** https://sportnest-client-rho.vercel.app

## 🎯 Purpose

Provide secure, well-structured endpoints for facilities (CRUD) and bookings,
with authentication and owner-based authorization.

## ✨ Features

- 🔐 **JWT auth with HTTPOnly cookies** — generate, store, verify in middleware, protect private APIs.
- 🔁 **Google OAuth** via Better Auth, bridged into the same auth middleware.
- 🏟️ **Facility CRUD** — create, read, update, delete (owner-only for write actions).
- 📅 **Bookings** — create, list own bookings, cancel; `booking_count` auto-increments.
- 🔎 **Search & Filter** — `$regex` (name search) and `$in` (sport type filter).
- 🛡️ Centralised error handling and consistent response envelope.
- 🔑 MongoDB credentials & secrets secured via environment variables.

## 🧰 Tech Stack & NPM Packages

- **express** (v5) — web framework
- **mongoose** — MongoDB ODM
- **jsonwebtoken** — JWT signing/verification
- **bcrypt** — password hashing
- **cookie-parser** — read cookies
- **cors** — cross-origin config
- **better-auth** + **@better-auth/mongo-adapter** — Google OAuth
- **dotenv** — env management
- **nodemon** (dev)

## 🚀 Getting Started

```bash
npm install

# Create .env (see .env.example)
npm run seed     # optional: seed sample facilities into the database
npm run dev      # start with nodemon
```

### Environment Variables (`.env`)

See [`.env.example`](./.env.example). Required keys:

```
PORT, CLIENT_URL, DATABASE_URL, JWT_SECRET,
BETTER_AUTH_SECRET, BETTER_AUTH_URL,
GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
```

## 🔑 Google OAuth Setup

Email/password works out of the box. Because the frontend reverse-proxies
`/api/*` to this API, Better Auth's public URL (`BETTER_AUTH_URL`) is the
**client** origin, so Google's callback returns through the proxy and cookies
stay first-party.

1. Go to **Google Cloud Console → APIs & Services → Credentials**.
2. Create an **OAuth 2.0 Client ID** (type: *Web application*).
3. **Authorized redirect URIs** (note: the **client** origin, not the API):
   - `http://localhost:3000/api/auth/callback/google`
   - `https://sportnest-client-rho.vercel.app/api/auth/callback/google`
4. Copy the **Client ID** and **Client Secret** into your env
   (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`).
5. Set `BETTER_AUTH_URL` **and** `CLIENT_URL` to your client origin.

Flow: client POSTs `/api/auth/sign-in/social` (proxied) → Better Auth redirects
to Google → Google returns to `<client>/api/auth/callback/google` (proxied) → a
session cookie is set first-party → `requireAuth` recognises it (falling back
from the JWT cookie), so Google users are treated exactly like email/password
users.

## ☁️ Deployment & Redeployment (Vercel)

The client and API deploy as **two Vercel projects**. The client reverse-proxies
`/api/*` to this API, so they behave as one origin (first-party cookies, no
cross-site CORS).

### API environment variables (Vercel → `sportnest-api` → Settings → Environment Variables)

| Key                    | Value                                                   |
| ---------------------- | ------------------------------------------------------- |
| `DATABASE_URL`         | `mongodb+srv://<user>:<pass>@<cluster>/sportnest`       |
| `CLIENT_URL`           | `https://sportnest-client-rho.vercel.app`               |
| `BETTER_AUTH_URL`      | `https://sportnest-client-rho.vercel.app` *(client origin)* |
| `BETTER_AUTH_SECRET`   | *a long random string*                                  |
| `JWT_SECRET`           | *a long random string*                                  |
| `GOOGLE_CLIENT_ID`     | *from Google Cloud Console*                             |
| `GOOGLE_CLIENT_SECRET` | *from Google Cloud Console*                             |

> 🔐 **Never commit real secret values** — set them only in the Vercel dashboard
> (or a local `.env`, which is gitignored).
> - ❌ Don't set `NODE_ENV` — Vercel sets it to `production` automatically.
> - ❌ Don't set `PORT` — Vercel serverless ignores it.
> - `CLIENT_URL` accepts a comma-separated list for multiple origins.

### Client environment variables (Vercel → `sportnest-client`)

| Key                | Value                              |
| ------------------ | ---------------------------------- |
| `API_PROXY_TARGET` | `https://sportnest-api.vercel.app` |

> ❌ Do **NOT** set `NEXT_PUBLIC_API_URL` on the client — an absolute value
> bypasses the proxy and causes a CORS error on Google sign-in.

### Redeploy steps

1. Update the env vars above in each project.
2. **Push to GitHub** (auto-deploys) **or** dashboard →
   **Deployments → ⋯ → Redeploy** (uncheck *Use existing Build Cache*).
3. Redeploy **both** projects after changing shared origins.

### Verify after deploy

- `GET https://sportnest-api.vercel.app/` → `{ "success": true }`
- `GET https://sportnest-api.vercel.app/api/v1/sports/all` → facility list
- On the live client: register, email/password login, and private-route reload
  all work; "Continue with Google" redirects to Google.

## 📚 API Endpoints

### Auth (`/api/auth`)

| Method | Endpoint         | Access  | Description                     |
| ------ | ---------------- | ------- | ------------------------------- |
| POST   | `/register`      | Public  | Register with email/password    |
| POST   | `/login`         | Public  | Login → sets HTTPOnly cookie    |
| POST   | `/logout`        | Public  | Clears the session cookie       |
| GET    | `/me`            | Cookie  | Current logged-in user          |
| \*     | `/sign-in/social`| Public  | Google OAuth (Better Auth)      |

### Facilities & Bookings (`/api/v1/sports`)

| Method | Endpoint          | Access  | Description                     |
| ------ | ----------------- | ------- | ------------------------------- |
| GET    | `/all`            | Public  | List facilities (`?search=&type=`) |
| GET    | `/facility/:id`   | Public  | Facility details                |
| GET    | `/my-facilities`  | Private | Facilities owned by the user    |
| POST   | `/create`         | Private | Create a facility               |
| PUT    | `/update/:id`     | Private | Update (owner only)             |
| DELETE | `/delete/:id`     | Private | Delete (owner only)             |
| POST   | `/book`           | Private | Create a booking                |
| GET    | `/my-bookings`    | Private | User's bookings                 |
| PATCH  | `/cancel/:id`     | Private | Cancel a booking                |

## 🗄️ Data Models

**Court (Facility):** `name, facility_type, image, location, price_per_hour,
capacity, available_slots[], description, owner_email, booking_count`

**Booking:** `facility_id, user_email, booking_date, time_slot, hours,
total_price, status (pending | confirmed | cancelled)`

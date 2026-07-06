# 🏟️ SportNest — API (Backend)

RESTful backend for **SportNest**, a sports facility booking platform. Built with
**Express 5 + MongoDB (Mongoose)**, secured with **JWT in HTTPOnly cookies**, and
using **Better Auth** for Google OAuth.

## 🔗 Live URL

- **Live API:** https://your-sportnest-api.onrender.com _(update after deployment)_
- **Client Repository:** ../sportnest-client

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
npm run seed     # optional: seed a demo owner + 8 facilities
npm run dev      # start with nodemon
```

Demo owner created by the seed: **demo@sportnest.com** / **Passw0rd**

### Environment Variables (`.env`)

See [`.env.example`](./.env.example). Required keys:

```
PORT, CLIENT_URL, DATABASE_URL, JWT_SECRET,
BETTER_AUTH_SECRET, BETTER_AUTH_URL,
GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
```

## 🔑 Google OAuth Setup

Email/password works out of the box. To enable the **Continue with Google**
button, configure a Google OAuth client:

1. Go to **Google Cloud Console → APIs & Services → Credentials**.
2. Create an **OAuth 2.0 Client ID** (type: *Web application*).
3. **Authorized JavaScript origins:**
   - `http://localhost:5000`
   - _(your deployed API URL)_
4. **Authorized redirect URIs:**
   - `http://localhost:5000/api/auth/callback/google`
   - `https://<your-api-domain>/api/auth/callback/google`
5. Copy the **Client ID** and **Client Secret** into `.env`
   (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`).

Flow: client POSTs `/api/auth/sign-in/social` → Better Auth redirects to Google
→ Google returns to `/api/auth/callback/google` → a session cookie is set →
`requireAuth` recognises it (falling back from the JWT cookie), so Google users
are treated exactly like email/password users.

> **Production note:** for different client/API domains, cookies must be
> `SameSite=None; Secure`. Set `NODE_ENV=production` (our JWT cookie already
> switches) and serve both over HTTPS.

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

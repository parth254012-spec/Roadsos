# RoadSoS

A dark, premium emergency response web app that helps drivers and road users trigger SOS alerts, manage emergency contacts, find nearby services, and get AI-powered guidance during road emergencies.

## Run & Operate

- `pnpm --filter @workspace/roadsos run dev` — run the frontend (port 20383, served at `/`)
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, served at `/api`)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind CSS v4, Framer Motion, Wouter routing
- Maps: Leaflet + react-leaflet + OpenStreetMap (CartoDB dark tiles)
- Auth & DB: Firebase Auth (Google Sign-In) + Firestore
- AI: Google Gemini 1.5 Flash via `@google/generative-ai`
- Nearby Services: Overpass API (no key required)
- API: Express 5
- DB: PostgreSQL + Drizzle ORM (incidents, sos_alerts, emergency_contacts)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/roadsos/src/` — React frontend
  - `services/firebase.ts` — Firebase app init
  - `services/auth.ts` — Google Sign-In / Sign-Out
  - `services/gemini.ts` — Gemini AI integration
  - `services/nearbyServices.ts` — Overpass API for nearby hospitals/police/fire
  - `context/AuthContext.tsx` — Firebase auth state + contacts modal trigger
  - `pages/` — AuthPage, Dashboard, SOSPage, LiveMapPage, ProfilePage
  - `components/` — auth/, dashboard/, map/, ai/, sos/, ui/
- `artifacts/api-server/src/routes/` — Express route handlers
- `lib/db/src/schema/` — Drizzle table definitions
- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth)

## Architecture decisions

- Firebase handles auth and emergency contacts (Firestore) — these are user-scoped and don't need our Postgres
- Postgres + Drizzle used for SOS alerts and road incidents (shared/queryable data)
- OpenAPI-first: all API contracts defined in spec, codegen produces typed hooks + Zod validators
- Gemini AI called directly from the frontend (no server proxy needed for this use case)
- Overpass API used for nearby services — zero cost, no API key, real OSM data

## Product

- Google Sign-In authentication flow
- Emergency contacts setup modal on first login (saved to Firestore)
- SOS alert trigger with hold-to-activate (3-second countdown)
- Live dark map with nearby hospitals, police stations, fire departments
- AI emergency advisor (Gemini) for situation-specific guidance
- Dashboard with quick stats, contacts preview, nearby services, incidents feed
- Profile page for managing contacts and SOS history

## User preferences

- Dark modern emergency UI (always force dark class on html element)
- Google Sans font
- Premium glassmorphism design
- Red emergency accents (#ef4444)
- No emojis in UI

## Gotchas

- Firebase env vars must be prefixed `VITE_` for Vite to expose them on the frontend
- Leaflet default marker icons need manual fix (L.Icon.Default paths) in MapView
- Google Fonts `@import url()` must be the VERY FIRST line in index.css
- After each OpenAPI spec change, run codegen before using the updated types
- `pnpm run typecheck:libs` must pass before API server typecheck works

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details

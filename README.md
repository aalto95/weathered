# Weathered

A weather forecast **Progressive Web App**. Search for a city or use your current
location to see current conditions, hourly and daily forecasts, and save favorite places.

## Features

- Current conditions, hourly forecast and daily forecast (Open-Meteo)
- City search with geocoding; "use my location" via browser geolocation and reverse geocoding
- Favorites and a dedicated notifications screen
- Animated weather illustrations (Rive) that follow the WMO weather code
- English and Russian UI, light and dark themes
- Installable PWA: app-shell precache, offline caching for weather/geocoding requests,
  and an in-app update prompt
- Optional daily push notifications (Vercel Functions + QStash + Vercel Blob + GitHub
  Actions scheduler) — see [NOTIFICATIONS.md](./NOTIFICATIONS.md)

## Tech stack

React 19 · TypeScript · Vite 7 · Redux Toolkit / React Redux · React Router 7 ·
styled-components · i18next · Rive · `vite-plugin-pwa` · Vitest + Testing Library ·
ESLint + Prettier

## Requirements

- Node.js >= 22
- pnpm 12 (`packageManager` is pinned in `package.json`)

## Getting started

```bash
pnpm install
pnpm start
```

The dev server starts on <http://localhost:3000> and opens automatically.

No API keys are needed for the weather itself: the app talks to the public
[Open-Meteo](https://open-meteo.com/) forecast and geocoding APIs and
[BigDataCloud](https://www.bigdatacloud.com/) for reverse geocoding.

## Scripts

| Command | Description |
| --- | --- |
| `pnpm start` | Vite dev server on port 3000 |
| `pnpm build` | Production build to `dist/` |
| `pnpm test` | Vitest with coverage |
| `pnpm lint` / `pnpm lint:fix` | ESLint |
| `pnpm prettier` / `pnpm prettier:fix` | Prettier check / write |
| `pnpm notifications:setup` | Generate VAPID keys into `.env.local` |

## Push notifications (optional)

Daily forecast notifications are implemented as Vercel Functions in `api/`, scheduled by
`vercel.json` crons and per-subscriber QStash jobs. Setup and deployment are documented in
[NOTIFICATIONS.md](./NOTIFICATIONS.md); `.env.example` lists every required variable.

For local development of the notification backend:

```bash
pnpm notifications:setup   # writes VAPID keys to .env.local
```

## Project layout

```
api/                    Vercel Functions (subscribe, unsubscribe, tick, send, test)
src/
  api/                  Open-Meteo / BigDataCloud clients, WMO code mapping
  app/                  Redux store and typed hooks
  components/           UI: header, search, sidebar, animations, PWA prompts
  features/app-slice.ts Redux slice
  pages/                Search, Favorites, Notifications
  server/               Push, scheduling, validation and Blob helpers
  hooks/                Push notification hook
public/                 Manifest, service-worker push handler, Rive assets, splash screens
```

## Deployment

The project targets **Vercel**: the SPA is built with Vite, `api/` holds the serverless
functions, `vercel.json` configures hourly crons and SPA rewrites, and the PWA manifest
points at `weathered.vercel.app`.

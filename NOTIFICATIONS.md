# Daily weather notifications

Weathered can send one daily web-push digest with the current weather for every
favorite city. The backend is implemented with Vercel Functions and Vercel Blob.

## How it works

1. The Notifications page asks for notification permission and subscribes the
   browser with `pushManager.subscribe()`.
2. The subscription, local delivery time, timezone, language and favorites are
   stored as a private JSON blob at `notifications/<id>.json`.
3. Vercel Cron runs `/api/tick` every hour. Because Hobby cron jobs are limited
   to one run per day, `vercel.json` contains one daily job per hour. Each job
   can fire anywhere inside its hour, so delivery is typically within about an
   hour of the chosen local time.
4. `api/tick.ts` finds subscriptions whose local time has arrived, fetches
   current weather from Open-Meteo, sends the digest with `web-push`, and records
   `lastSentDate` so it only sends once per local day.

The optional GitHub Actions workflow remains as a more precise scheduler. If
you use it, add the same `CRON_SECRET` as a GitHub Actions repository secret.
The Vercel Cron jobs are the reliable fallback and use the `CRON_SECRET` that is
already configured in Vercel.

The Blob store `weathered-notifications` is already connected to the Vercel
project and injects `BLOB_READ_WRITE_TOKEN` automatically.

## Required environment variables

| Variable                | Purpose                                    |
| ----------------------- | ------------------------------------------ |
| `VAPID_PUBLIC_KEY`      | Web Push public key (server + client)      |
| `VAPID_PRIVATE_KEY`     | Web Push private key (server only, secret) |
| `VAPID_SUBJECT`         | Contact URL or `mailto:` address           |
| `VITE_VAPID_PUBLIC_KEY` | Public key exposed to the Vite build       |
| `CRON_SECRET`           | Shared secret for `/api/tick`              |
| `BLOB_READ_WRITE_TOKEN` | Injected by Vercel Blob                    |

Generate and write the local configuration:

```bash
pnpm notifications:setup
```

This creates `.env.local` (gitignored), prints the **public** key, and keeps the
private key and cron secret out of the terminal output.

Add these to Vercel for Production, Preview and Development:

- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `VAPID_SUBJECT`
- `VITE_VAPID_PUBLIC_KEY`
- `CRON_SECRET`

`BLOB_READ_WRITE_TOKEN` is already present on the project.

Then add the same `CRON_SECRET` value as a **GitHub Actions repository secret**:

```
Repository → Settings → Secrets and variables → Actions → New repository secret
Name: CRON_SECRET
```

The workflow is `.github/workflows/notifications.yml`. It runs every 5 minutes
and can also be triggered manually with **Run workflow**.

## Deploying

After the environment variables and GitHub secret are set, deploy the project.
For local function testing:

```bash
vercel env pull .env.local   # includes BLOB_READ_WRITE_TOKEN
vercel dev
```

`pnpm dev` only runs the Vite frontend; use `vercel dev` if you need `/api/*`.

## Manual test

Open **Notifications** in the sidebar, pick a delivery time, enable
notifications, then press **Send test notification**.

You can also invoke the scheduler manually:

```bash
curl -X POST \
  -H "Authorization: Bearer $CRON_SECRET" \
  https://weathered.vercel.app/api/tick
```

## API

| Endpoint           | Method       | Purpose                                            |
| ------------------ | ------------ | -------------------------------------------------- |
| `/api/subscribe`   | `POST`       | Create or update a subscription                    |
| `/api/unsubscribe` | `POST`       | Delete a subscription                              |
| `/api/test`        | `POST`       | Send a test notification                           |
| `/api/tick`        | `GET`/`POST` | Process due notifications (requires `CRON_SECRET`) |

## Limitations

- GitHub Actions has a 5-minute minimum interval and can run late under load.
  Notifications may arrive a few minutes after the chosen time.
- iOS/iPadOS requires the PWA to be installed on the Home Screen before Web Push
  can be enabled.
- Notification permission can be revoked by the browser at any time.
- The tick endpoint is idempotent per local date, but two overlapping runs could
  still race and send twice. The workflow uses a `concurrency` group to reduce
  that risk.
- If exact delivery timing becomes important, replace the GitHub Actions trigger
  with Upstash QStash or a Cloudflare Worker cron; `/api/tick` can stay as-is.

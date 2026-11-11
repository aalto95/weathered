# Daily weather notifications

Weathered can send one daily web-push digest with the current weather for every
favorite city. The backend is built with Hono and deployed as Vercel Functions,
using Vercel Blob for storage.

## How it works

1. The Notifications page asks for notification permission and subscribes the
   browser with `pushManager.subscribe()`.
2. The subscription, local delivery time, timezone, language and favorites are
   stored as a private JSON blob at `notifications/<id>.json`.
3. On save, the backend schedules a one-off QStash message for the next local
   delivery time. When it fires, `/api/send` sends the digest and schedules the
   next day’s message.
4. The Vercel Cron jobs in `vercel.json` remain as a fallback. They run
   `/api/tick` hourly; anything QStash already delivered is skipped by
   `lastSentDate`, and if QStash failed the cron picks it up.
5. `api/tick.ts` and `api/send.ts` fetch current weather from Open-Meteo, encrypt
   the digest with `@block65/webcrypto-web-push`, deliver it with `fetch`, and
   record `lastSentDate` so each subscriber gets at most one digest per local
   day.

QStash gives minute-level scheduling. The Vercel Cron fallback is approximate
because Hobby cron jobs have an hourly window.

The Blob store `weathered-notifications` is already connected to the Vercel
project and injects `BLOB_READ_WRITE_TOKEN` automatically.

## Required environment variables

| Variable                     | Purpose                                    |
| ---------------------------- | ------------------------------------------ |
| `VAPID_PUBLIC_KEY`           | Web Push public key (server + client)      |
| `VAPID_PRIVATE_KEY`          | Web Push private key (server only, secret) |
| `VAPID_SUBJECT`              | Contact URL or `mailto:` address           |
| `VITE_VAPID_PUBLIC_KEY`      | Public key exposed to the Vite build       |
| `QSTASH_TOKEN`               | Upstash QStash token (required for precise scheduling) |
| `QSTASH_CURRENT_SIGNING_KEY` | QStash request verification key            |
| `QSTASH_NEXT_SIGNING_KEY`    | QStash key-rotation verification key       |
| `CRON_SECRET`                | Shared secret for `/api/tick`              |
| `APP_URL`                    | Optional public base URL for QStash calls  |
| `BLOB_READ_WRITE_TOKEN`      | Injected by Vercel Blob                    |

Generate and write the local configuration:

```bash
pnpm notifications:setup
```

This creates `.env.local` (gitignored), prints the **public** key, and keeps the
private key and cron secret out of the terminal output. `web-push` is only used
by this setup script (as a dev dependency) to generate the VAPID key pair; push
delivery itself uses `@block65/webcrypto-web-push`.

Add these to Vercel for Production, Preview and Development:

- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `VAPID_SUBJECT`
- `VITE_VAPID_PUBLIC_KEY`
- `QSTASH_TOKEN`
- `QSTASH_CURRENT_SIGNING_KEY`
- `QSTASH_NEXT_SIGNING_KEY`
- `CRON_SECRET`

`BLOB_READ_WRITE_TOKEN` is already present on the project.

The GitHub Actions workflow is **optional** now. QStash performs the precise
per-subscriber scheduling, and the Vercel Cron jobs are the fallback. If you
also want the GitHub workflow, add the same `CRON_SECRET` as a GitHub Actions
repository secret:

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

| Endpoint           | Method       | Purpose                                                       |
| ------------------ | ------------ | ------------------------------------------------------------- |
| `/api/subscribe`   | `POST`       | Save a subscription and schedule the next QStash run          |
| `/api/unsubscribe` | `POST`       | Delete a subscription and cancel its QStash message           |
| `/api/test`        | `POST`       | Send a test notification                                      |
| `/api/send`        | `POST`       | QStash delivery endpoint for one subscriber                   |
| `/api/tick`        | `GET`/`POST` | Fallback sweep for due subscriptions (requires `CRON_SECRET`) |

## Notifications arrive late

Precise delivery depends on `QSTASH_TOKEN`. The signing keys are only needed to
verify incoming QStash requests; they are not required for scheduling.

1. Check the Vercel logs for `Scheduled QStash delivery <id> ... at <time>`.
   If that line is missing, QStash is not scheduling and only the cron fallback
   is active.
2. If you see `QSTASH_TOKEN is not configured`, add the token to Vercel.
3. Check `APP_URL` in Vercel. It must be your public production URL or unset.
   A `localhost` value makes QStash deliver to an unreachable host; the code now
   ignores localhost values, but leaving it unset is safest.
4. The Vercel cron fallback is hourly and may run anywhere inside its window.
   The GitHub Actions workflow runs every 5 minutes, but it needs the
   `CRON_SECRET` repository secret and GitHub disables scheduled workflows after
   60 days without repository activity.
5. Opening the app no longer cancels a pending QStash message unless the
   delivery time or timezone changed. Favorites/language syncs leave the
   schedule untouched.

## Limitations

- QStash delivery is minute-level, but it depends on QStash having capacity.
- The Vercel Cron fallback is hourly because Hobby cron jobs have an hourly
  window.
- GitHub Actions is optional; if enabled, it has a 5-minute minimum interval and
  can run late under load.
- iOS/iPadOS requires the PWA to be installed on the Home Screen before Web Push
  can be enabled.
- Notification permission can be revoked by the browser at any time.
- The tick endpoint is idempotent per local date, but two overlapping runs could
  still race and send twice. The workflow uses a `concurrency` group to reduce
  that risk.
- If exact delivery timing becomes important, replace the GitHub Actions trigger
  with Upstash QStash or a Cloudflare Worker cron; `/api/tick` can stay as-is.

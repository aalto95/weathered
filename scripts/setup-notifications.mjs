import { randomBytes } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const webpush = require('web-push');

const path = '.env.local';
const existing = existsSync(path) ? readFileSync(path, 'utf8') : '';
const values = new Map();

for (const line of existing.split('\n')) {
  const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (match) {
    values.set(match[1], match[2]);
  }
}

const hasPublicKey = Boolean(values.get('VAPID_PUBLIC_KEY'));
const hasPrivateKey = Boolean(values.get('VAPID_PRIVATE_KEY'));

if (!hasPublicKey || !hasPrivateKey) {
  const keys = webpush.generateVAPIDKeys();
  values.set('VAPID_PUBLIC_KEY', keys.publicKey);
  values.set('VAPID_PRIVATE_KEY', keys.privateKey);
}

values.set('VITE_VAPID_PUBLIC_KEY', values.get('VAPID_PUBLIC_KEY'));

if (!values.get('VAPID_SUBJECT')) {
  values.set('VAPID_SUBJECT', 'https://weathered.vercel.app');
}

if (!values.get('CRON_SECRET')) {
  values.set('CRON_SECRET', randomBytes(32).toString('hex'));
}

if (!values.has('BLOB_READ_WRITE_TOKEN')) {
  values.set('BLOB_READ_WRITE_TOKEN', '');
}

const output = `${[...values.entries()]
  .map(([key, value]) => `${key}=${value}`)
  .join('\n')}\n`;

writeFileSync(path, output, { mode: 0o600 });

console.log('Notification configuration written to .env.local');
console.log(`Public VAPID key: ${values.get('VAPID_PUBLIC_KEY')}`);
console.log('VAPID_PRIVATE_KEY and CRON_SECRET were written but not printed.');
console.log('');
console.log('Next steps:');
console.log('  1. Add VAPID_PRIVATE_KEY and CRON_SECRET to Vercel env vars.');
console.log(
  '  2. Add CRON_SECRET as a GitHub Actions repository secret.'
);
console.log(
  '  3. Deploy. The public VAPID key is already configured in Vercel.'
);

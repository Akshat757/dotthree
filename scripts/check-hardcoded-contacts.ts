/**
 * CI guard (SRS §11.1): firm contact details may live ONLY in src/config/site.ts.
 * Fails if a wa.me link, the firm phone number, or the firm email appears anywhere
 * else in source, content, public config or scripts. Run: npm run check:contacts
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

import { site } from '../src/config/site';

const ROOT = process.cwd();
const SCAN_DIRS = ['src', 'content', 'scripts', 'public/_headers', 'public/_redirects', 'e2e'];
const EXT = new Set(['.ts', '.tsx', '.js', '.mjs', '.mdx', '.md', '.json', '.css', '']);
const ALLOW = new Set([
  'src/config/site.ts',
  'src/lib/whatsapp/index.ts', // the single sanctioned wa.me builder
  'scripts/check-hardcoded-contacts.ts',
]);

const digits = site.whatsapp.replace(/\D/g, '');
const local10 = digits.slice(-10);
const phoneRe = new RegExp(
  [
    'wa\\.me/',
    'api\\.whatsapp\\.com/send',
    'web\\.whatsapp\\.com/send',
    // firm phone in any spacing/formatting: +91 90000 00000 / 9000000000 / 91-9000-000-000
    `\\+?\\s*91?[\\s-]*${local10.split('').join('[\\s-]*')}`,
    site.email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
  ].join('|'),
  'i',
);

function walk(p: string, out: string[]) {
  const st = statSync(p, { throwIfNoEntry: false });
  if (!st) return;
  if (st.isFile()) {
    const ext = p.includes('.') ? p.slice(p.lastIndexOf('.')) : '';
    if (EXT.has(ext)) out.push(p);
    return;
  }
  for (const name of readdirSync(p)) {
    if (name === 'node_modules' || name.startsWith('.')) continue;
    walk(join(p, name), out);
  }
}

const files: string[] = [];
for (const d of SCAN_DIRS) walk(join(ROOT, d), files);

const violations: string[] = [];
for (const f of files) {
  const rel = relative(ROOT, f).split(sep).join('/');
  if (ALLOW.has(rel)) continue;
  const lines = readFileSync(f, 'utf8').split(/\r?\n/);
  lines.forEach((line, i) => {
    if (phoneRe.test(line)) violations.push(`${rel}:${i + 1}: ${line.trim().slice(0, 120)}`);
  });
}

if (violations.length) {
  console.error(
    `✖ Hardcoded contact details found outside src/config/site.ts (${violations.length}):\n`,
  );
  for (const v of violations) console.error('  ' + v);
  console.error('\nUse `site.*` from @/config/site or the builders in @/lib/whatsapp instead.');
  process.exit(1);
}
console.log(`✔ No hardcoded contact details in ${files.length} files.`);

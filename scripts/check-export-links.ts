/**
 * Scans the static export in ./out and verifies that every internal
 * href/src points at a file that exists in the export.
 *
 * Usage: npx tsx scripts/check-export-links.ts
 */
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const OUT = resolve(process.cwd(), 'out');

function walk(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, acc);
    else if (entry.endsWith('.html')) acc.push(full);
  }
  return acc;
}

function targetExists(url: string): boolean {
  const clean = decodeURIComponent(url.split('#')[0]?.split('?')[0] ?? '');
  if (!clean || clean === '/') return existsSync(join(OUT, 'index.html'));
  const rel = clean.replace(/^\//, '');
  const candidates = [
    join(OUT, rel),
    join(OUT, rel, 'index.html'),
    join(OUT, rel.replace(/\/$/, '') + '.html'),
  ];
  return candidates.some((c) => existsSync(c));
}

const htmlFiles = walk(OUT);
const attrRe = /\b(?:href|src)="(\/[^"]*)"/g;
const broken = new Map<string, Set<string>>();
let checked = 0;

for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  for (const match of html.matchAll(attrRe)) {
    const url = match[1];
    if (!url) continue;
    if (url.startsWith('//')) continue;
    checked++;
    if (!targetExists(url)) {
      const set = broken.get(url) ?? new Set<string>();
      set.add(file.replace(OUT, 'out'));
      broken.set(url, set);
    }
  }
}

console.log(`Scanned ${htmlFiles.length} pages, ${checked} internal references.`);
if (broken.size === 0) {
  console.log('No broken internal links.');
  process.exit(0);
}
console.error(`\n${broken.size} broken target(s):`);
for (const [url, files] of broken) {
  console.error(`  ${url}  (from ${files.size} page(s), e.g. ${[...files][0]})`);
}
process.exit(1);

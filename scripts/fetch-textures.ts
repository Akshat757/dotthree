/**
 * Texture pipeline (SRS §11.3): CC0 PBR sets from ambientCG with a procedural fallback.
 *
 *   npm run assets:textures                 # download where possible, else procedural
 *   npm run assets:textures -- --offline    # procedural only (no network)
 *   npm run assets:textures -- --force      # regenerate everything
 *   npm run assets:textures -- --only wood  # slug prefix filter
 *
 * Output: public/textures/<slug>/{albedo,normal,roughness}.webp (1024², tileable)
 *         src/data/textures.generated.ts  (provenance for /legal/image-credits)
 *         scripts/textures.lock.json      (sha256 of each downloaded zip)
 */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { unzipSync } from 'fflate';
import sharp from 'sharp';

import { albedoSvg, normalFromHeight, roughnessFrom, specFor, TEX } from './lib/texture';

interface ManifestSet {
  slug: string;
  assetId: string | null;
}
interface Manifest {
  source: string;
  licence: string;
  resolution: string;
  sets: ManifestSet[];
}
interface Provenance {
  slug: string;
  source: 'ambientcg' | 'procedural';
  assetId?: string;
  url?: string;
  licence: 'cc0';
  sha256?: string;
}

const ROOT = process.cwd();
const OUT = resolve(ROOT, 'public/textures');
const MANIFEST = resolve(ROOT, 'scripts/textures.manifest.json');
const LOCK = resolve(ROOT, 'scripts/textures.lock.json');
const GENERATED = resolve(ROOT, 'src/data/textures.generated.ts');

const args = process.argv.slice(2);
const FORCE = args.includes('--force');
const OFFLINE = args.includes('--offline') || process.env.ATELIER_OFFLINE === '1';
const ONLY = args.includes('--only') ? (args[args.indexOf('--only') + 1] ?? '') : '';
const TIMEOUT_MS = 25_000;

const manifest = JSON.parse(readFileSync(MANIFEST, 'utf8')) as Manifest;
const lock: Record<string, string> = existsSync(LOCK)
  ? (JSON.parse(readFileSync(LOCK, 'utf8')) as Record<string, string>)
  : {};

const FILES = ['albedo', 'normal', 'roughness'] as const;
const outPaths = (slug: string) =>
  Object.fromEntries(FILES.map((k) => [k, resolve(OUT, slug, `${k}.webp`)])) as Record<
    (typeof FILES)[number],
    string
  >;
const done = (slug: string) => FILES.every((k) => existsSync(outPaths(slug)[k]));

async function writeSet(slug: string, albedo: Buffer, normal: Buffer, roughness: Buffer) {
  mkdirSync(resolve(OUT, slug), { recursive: true });
  const p = outPaths(slug);
  await Promise.all([
    sharp(albedo)
      .resize(TEX, TEX, { fit: 'cover' })
      .webp({ quality: 82, effort: 4 })
      .toFile(p.albedo),
    sharp(normal)
      .resize(TEX, TEX, { fit: 'cover' })
      .webp({ quality: 90, effort: 4, smartSubsample: false })
      .toFile(p.normal),
    sharp(roughness)
      .resize(TEX, TEX, { fit: 'cover' })
      .greyscale()
      .webp({ quality: 80, effort: 4 })
      .toFile(p.roughness),
  ]);
}

async function procedural(slug: string): Promise<Provenance> {
  const spec = specFor(slug);
  const albedo = await sharp(Buffer.from(albedoSvg(spec)), { density: 72 })
    .png()
    .toBuffer();
  const [normal, roughness] = await Promise.all([
    normalFromHeight(albedo, spec.bump),
    roughnessFrom(albedo, spec.roughness),
  ]);
  await writeSet(slug, albedo, normal, roughness);
  return { slug, source: 'procedural', licence: 'cc0' };
}

function ambientUrl(assetId: string) {
  return `https://ambientcg.com/get?file=${encodeURIComponent(assetId)}_${manifest.resolution}.zip`;
}

async function download(url: string): Promise<Buffer> {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: ctl.signal,
      headers: { 'user-agent': 'atelier-asset-pipeline/1.0 (+build-time CC0 fetch)' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const ct = res.headers.get('content-type') ?? '';
    if (!/zip|octet-stream/.test(ct)) throw new Error(`unexpected content-type ${ct}`);
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length > 80 * 1024 * 1024) throw new Error('zip too large');
    return buf;
  } finally {
    clearTimeout(t);
  }
}

async function fromAmbient(set: ManifestSet): Promise<Provenance> {
  const assetId = set.assetId!;
  const url = ambientUrl(assetId);
  const zip = await download(url);
  const sha256 = createHash('sha256').update(zip).digest('hex');
  if (lock[set.slug] && lock[set.slug] !== sha256)
    throw new Error(
      `sha256 mismatch for ${assetId} (expected ${lock[set.slug]!.slice(0, 12)}…, got ${sha256.slice(0, 12)}…)`,
    );

  const files = unzipSync(new Uint8Array(zip));
  const find = (re: RegExp) => Object.keys(files).find((n) => re.test(n));
  const colour = find(/_Color\.(jpg|png)$/i);
  const normalGl = find(/_NormalGL\.(jpg|png)$/i) ?? find(/_Normal\.(jpg|png)$/i);
  const rough = find(/_Roughness\.(jpg|png)$/i);
  if (!colour) throw new Error('no _Color map in archive');

  const albedo = Buffer.from(files[colour]!);
  const albedoPng = await sharp(albedo).png().toBuffer();
  const normal = normalGl ? Buffer.from(files[normalGl]!) : await normalFromHeight(albedoPng, 1.0);
  const roughness = rough ? Buffer.from(files[rough]!) : await roughnessFrom(albedoPng, 0.6);
  await writeSet(set.slug, albedo, normal, roughness);
  lock[set.slug] = sha256;
  return {
    slug: set.slug,
    source: 'ambientcg',
    assetId,
    url: `https://ambientcg.com/a/${assetId}`,
    licence: 'cc0',
    sha256,
  };
}

async function main() {
  const existing: Record<string, Provenance> = {};
  if (existsSync(GENERATED)) {
    const txt = readFileSync(GENERATED, 'utf8');
    const json = txt.slice(txt.indexOf('= [') + 2, txt.lastIndexOf(';'));
    try {
      for (const p of JSON.parse(json) as Provenance[]) existing[p.slug] = p;
    } catch {
      /* regenerate */
    }
  }

  const sets = ONLY ? manifest.sets.filter((s) => s.slug.startsWith(ONLY)) : manifest.sets;
  const results: Provenance[] = [];
  let downloaded = 0;
  let fallback = 0;
  let skipped = 0;
  const t0 = Date.now();

  for (const set of sets) {
    if (!FORCE && done(set.slug) && existing[set.slug]) {
      results.push(existing[set.slug]!);
      skipped++;
      continue;
    }
    let prov: Provenance | undefined;
    if (set.assetId && !OFFLINE) {
      try {
        prov = await fromAmbient(set);
        downloaded++;
        process.stdout.write(`  ↓ ${set.slug.padEnd(24)} ${set.assetId}\n`);
      } catch (e) {
        process.stdout.write(
          `  ! ${set.slug.padEnd(24)} ${set.assetId}: ${(e as Error).message} → procedural\n`,
        );
      }
    }
    if (!prov) {
      prov = await procedural(set.slug);
      fallback++;
      if (!set.assetId || OFFLINE) process.stdout.write(`  ◌ ${set.slug.padEnd(24)} procedural\n`);
    }
    results.push(prov);
  }

  // keep provenance for sets outside the --only filter
  const bySlug = new Map(Object.values(existing).map((p) => [p.slug, p]));
  for (const p of results) bySlug.set(p.slug, p);
  const all = manifest.sets
    .map((s) => bySlug.get(s.slug))
    .filter((p): p is Provenance => Boolean(p));

  writeFileSync(LOCK, JSON.stringify(lock, null, 2) + '\n');
  writeFileSync(
    GENERATED,
    `/* AUTO-GENERATED by scripts/fetch-textures.ts — do not edit by hand. */\n` +
      `export interface TextureProvenance {\n  slug: string;\n  source: 'ambientcg' | 'procedural';\n  assetId?: string;\n  url?: string;\n  licence: 'cc0';\n  sha256?: string;\n}\n\n` +
      `export const TEXTURE_PROVENANCE: TextureProvenance[] = ${JSON.stringify(all, null, 2)};\n`,
  );
  console.log(
    `✔ Textures: ${downloaded} downloaded, ${fallback} procedural, ${skipped} skipped → public/textures (${((Date.now() - t0) / 1000).toFixed(0)}s)`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

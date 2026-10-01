/**
 * Renders the visualiser room templates only (base image + per-surface masks).
 * Equivalent to `fetch-demo-assets.ts --only template` but kept as its own
 * entry so authors iterating on roomTemplates.ts get a fast loop.
 */
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const extra = process.argv.slice(2);
const r = spawnSync(
  process.execPath,
  [
    require.resolve('tsx/cli'),
    'scripts/fetch-demo-assets.ts',
    '--only',
    'template',
    '--force',
    ...extra,
  ],
  {
    stdio: 'inherit',
    cwd: process.cwd(),
  },
);
process.exit(r.status ?? 1);

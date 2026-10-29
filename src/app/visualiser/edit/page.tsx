import { Suspense } from 'react';

import { VisualiserEditor } from '@/components/visualiser/editor';
import { pageMeta } from '@/lib/seo/metadata';

export const metadata = pageMeta({
  title: 'Visualiser editor',
  description: 'Tap a surface, swap the material, save or share your room.',
  path: '/visualiser/edit/',
  noindex: true,
});

export default function VisualiserEditPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-canvas" aria-busy="true" />}>
      <VisualiserEditor />
    </Suspense>
  );
}

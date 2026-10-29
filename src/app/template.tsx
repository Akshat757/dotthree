import type { ReactNode } from 'react';

import { PageTransition } from '@/components/motion';

/** Re-mounts on every navigation so each page fades/rises in. */
export default function Template({ children }: { children: ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}

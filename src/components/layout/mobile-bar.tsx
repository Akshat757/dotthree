'use client';

import { Home, LayoutGrid, Calculator, Wand2, Phone } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';

import { WhatsAppIcon } from '@/components/ui/whatsapp-button';
import { buildTelUrl, buildWhatsAppUrl, messages } from '@/lib/whatsapp';
import { cn } from '@/lib/utils';

const items = [
  { label: 'Home', href: '/', Icon: Home },
  { label: 'Projects', href: '/projects', Icon: LayoutGrid },
  { label: 'Visualise', href: '/visualiser', Icon: Wand2 },
  { label: 'Estimate', href: '/estimate', Icon: Calculator },
];

/** Hidden on the visualiser workspace and dashboard where the page owns its own chrome. */
const HIDE_ON = ['/visualiser/', '/dashboard'];

export function MobileBar() {
  const pathname = usePathname();
  if (HIDE_ON.some((p) => pathname.startsWith(p) && pathname !== '/visualiser/')) return null;
  return (
    <nav
      aria-label="Quick actions"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-canvas/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
    >
      <ul className="grid grid-cols-5">
        {items.map(({ label, href, Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex h-14 flex-col items-center justify-center gap-1 text-[0.6875rem] font-medium',
                  active ? 'text-accent' : 'text-ink-muted',
                )}
              >
                <Icon className="size-5" aria-hidden />
                {label}
              </Link>
            </li>
          );
        })}
        <li>
          <a
            href={buildTelUrl()}
            className="flex h-14 flex-col items-center justify-center gap-1 text-[0.6875rem] font-medium text-ink-muted"
          >
            <Phone className="size-5" aria-hidden />
            Call
          </a>
        </li>
      </ul>
    </nav>
  );
}

/** Floating WhatsApp button — desktop only (the mobile bar covers the phone). */
export function WhatsAppFab() {
  const pathname = usePathname();
  const [href, setHref] = React.useState(() =>
    buildWhatsAppUrl(messages.generic(), { forceWeb: false }),
  );
  React.useEffect(() => {
    setHref(buildWhatsAppUrl(messages.generic(), { ua: navigator.userAgent }));
  }, []);
  if (pathname.startsWith('/visualiser/') && pathname !== '/visualiser/') return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed right-6 bottom-6 z-40 hidden size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-e3 transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-focus/40 focus-visible:outline-none motion-reduce:transition-none lg:flex"
    >
      <WhatsAppIcon className="size-7" />
      <span className="sr-only">Chat with us on WhatsApp</span>
    </a>
  );
}

'use client';

import {
  ChevronDown,
  Menu,
  Search,
  Sun,
  Moon,
  Type,
  Contrast,
  LayoutDashboard,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/disclosure';
import { Sheet, SheetContent, SheetTitle, SheetTrigger, Tooltip } from '@/components/ui/overlay';
import { SwitchField } from '@/components/ui/form-controls';
import { WhatsAppButton } from '@/components/ui/whatsapp-button';
import { primaryNav, type NavItem } from '@/config/nav';
import { site } from '@/config/site';
import { cn } from '@/lib/utils';

import { usePrefs } from './app-providers';
import { Container, Logo } from './primitives';

function isActive(pathname: string, href: string) {
  const base = href.split('?')[0] ?? href;
  return base === '/' ? pathname === '/' : pathname.startsWith(base);
}

/* --------------------------------- Mega menu -------------------------------- */

function MegaPanel({ item, onNavigate }: { item: NavItem; onNavigate: () => void }) {
  if (!item.mega) return null;
  return (
    <div className="grid gap-8 md:grid-cols-[repeat(3,minmax(0,1fr))]">
      {item.mega.columns.map((col) => (
        <div key={col.heading}>
          <p className="mb-3 overline">{col.heading}</p>
          <ul className="grid gap-1">
            {col.links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={onNavigate}
                  className="-mx-2 block rounded-md px-2 py-1.5 text-body-s text-ink hover:bg-surface-sunk hover:text-accent focus-visible:ring-2 focus-visible:ring-focus/40 focus-visible:outline-none"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function DesktopNav() {
  const pathname = usePathname();
  const [openIdx, setOpenIdx] = React.useState<number | null>(null);
  const closeTimer = React.useRef<number | null>(null);
  const navRef = React.useRef<HTMLElement>(null);

  const open = (i: number) => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    setOpenIdx(i);
  };
  const scheduleClose = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpenIdx(null), 160);
  };

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpenIdx(null);
    const onClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpenIdx(null);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onClick);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onClick);
    };
  }, []);

  React.useEffect(() => setOpenIdx(null), [pathname]);

  return (
    <nav
      ref={navRef}
      aria-label="Primary"
      className="relative hidden items-center gap-1 lg:flex"
      onMouseLeave={scheduleClose}
    >
      {primaryNav.map((item, i) => {
        const active = isActive(pathname, item.href);
        const linkCls = cn(
          'inline-flex h-10 items-center gap-1 rounded-md px-3 text-body-s font-medium transition-colors hover:bg-surface-sunk focus-visible:ring-2 focus-visible:ring-focus/40 focus-visible:outline-none',
          active ? 'text-accent' : 'text-ink',
        );
        if (!item.mega) {
          return (
            <Link
              key={item.href}
              href={item.href}
              className={linkCls}
              aria-current={active ? 'page' : undefined}
              onMouseEnter={scheduleClose}
            >
              {item.label}
            </Link>
          );
        }
        const isOpen = openIdx === i;
        return (
          <div key={item.href} onMouseEnter={() => open(i)}>
            <button
              type="button"
              className={linkCls}
              aria-expanded={isOpen}
              aria-controls={`mega-${i}`}
              onClick={() => setOpenIdx(isOpen ? null : i)}
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  open(i);
                  requestAnimationFrame(() =>
                    document.getElementById(`mega-${i}`)?.querySelector<HTMLElement>('a')?.focus(),
                  );
                }
              }}
            >
              {item.label}
              <ChevronDown
                className={cn(
                  'duration-quick size-3.5 transition-transform',
                  isOpen && 'rotate-180',
                )}
                aria-hidden
              />
            </button>
            <div
              id={`mega-${i}`}
              hidden={!isOpen}
              className="absolute top-full left-0 z-40 w-[min(56rem,calc(100vw-4rem))] pt-2"
              onMouseEnter={() => open(i)}
            >
              <div className="animate-fade-in rounded-xl border border-line bg-surface p-6 shadow-e3 motion-reduce:animate-none">
                <MegaPanel item={item} onNavigate={() => setOpenIdx(null)} />
                <div className="mt-6 flex items-center justify-between border-t border-line pt-4">
                  <Link
                    href={item.href}
                    className="text-body-s font-medium text-accent underline-offset-4 hover:underline"
                    onClick={() => setOpenIdx(null)}
                  >
                    View all {item.label.toLowerCase()} →
                  </Link>
                  <span className="text-caption text-ink-subtle">Press Esc to close</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </nav>
  );
}

/* ------------------------------- Prefs popover ------------------------------ */

function PrefsControls({ compact }: { compact?: boolean }) {
  const { prefs, setPrefs } = usePrefs();
  const dark = prefs.theme === 'dark';
  if (compact) {
    return (
      <div className="grid gap-4">
        <SwitchField
          id="pref-dark"
          label="Dark theme"
          checked={dark}
          onCheckedChange={(v) => setPrefs({ theme: v ? 'dark' : 'light' })}
        />
        <SwitchField
          id="pref-large"
          label="Larger text"
          checked={prefs.largeText}
          onCheckedChange={(v) => setPrefs({ largeText: v })}
        />
        <SwitchField
          id="pref-hc"
          label="High contrast"
          checked={prefs.highContrast}
          onCheckedChange={(v) => setPrefs({ highContrast: v })}
        />
      </div>
    );
  }
  return (
    <div className="hidden items-center md:flex">
      <Tooltip label={dark ? 'Switch to light theme' : 'Switch to dark theme'}>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-pressed={dark}
          onClick={() => setPrefs({ theme: dark ? 'light' : 'dark' })}
        >
          {dark ? <Sun aria-hidden /> : <Moon aria-hidden />}
          <span className="sr-only">Toggle dark theme</span>
        </Button>
      </Tooltip>
      <Tooltip label="Larger text">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-pressed={prefs.largeText}
          onClick={() => setPrefs({ largeText: !prefs.largeText })}
          className={cn(prefs.largeText && 'text-accent')}
        >
          <Type aria-hidden />
          <span className="sr-only">Toggle larger text</span>
        </Button>
      </Tooltip>
      <Tooltip label="High contrast">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-pressed={prefs.highContrast}
          onClick={() => setPrefs({ highContrast: !prefs.highContrast })}
          className={cn(prefs.highContrast && 'text-accent')}
        >
          <Contrast aria-hidden />
          <span className="sr-only">Toggle high contrast</span>
        </Button>
      </Tooltip>
    </div>
  );
}

/* --------------------------------- Mobile menu ------------------------------ */

function MobileMenu() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  React.useEffect(() => setOpen(false), [pathname]);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu aria-hidden />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-[min(24rem,calc(100vw-2rem))] gap-0 overflow-y-auto p-0"
      >
        <div className="border-b border-line p-4">
          <SheetTitle asChild>
            <Logo />
          </SheetTitle>
        </div>
        <nav aria-label="Mobile" className="p-2">
          <Accordion type="multiple" className="grid">
            {primaryNav.map((item, i) =>
              item.mega ? (
                <AccordionItem key={item.href} value={`m-${i}`} className="border-0">
                  <AccordionTrigger className="px-3 py-3 text-body">{item.label}</AccordionTrigger>
                  <AccordionContent className="px-3">
                    <div className="grid gap-5">
                      {item.mega.columns.map((col) => (
                        <div key={col.heading}>
                          <p className="mb-2 overline">{col.heading}</p>
                          <ul className="grid">
                            {col.links.map((l) => (
                              <li key={l.href}>
                                <Link
                                  href={l.href}
                                  className="block py-2 text-body-s text-ink hover:text-accent"
                                >
                                  {l.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive(pathname, item.href) ? 'page' : undefined}
                  className={cn(
                    'flex items-center px-3 py-3 text-body font-medium hover:text-accent',
                    isActive(pathname, item.href) && 'text-accent',
                  )}
                >
                  {item.label}
                </Link>
              ),
            )}
          </Accordion>
        </nav>
        <div className="mt-auto grid gap-4 border-t border-line p-4">
          <PrefsControls compact />
          <div className="grid gap-2">
            <Button asChild variant="outline">
              <Link href="/dashboard">
                <LayoutDashboard aria-hidden /> My dashboard
              </Link>
            </Button>
            <WhatsAppButton fullWidth />
          </div>
          <p className="text-caption text-ink-muted">
            {site.businessHours.weekdays} Mon–Sat · {site.address.city}
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* ----------------------------------- Header --------------------------------- */

export function Header({ variant = 'default' }: { variant?: 'default' | 'transparent' }) {
  const [scrolled, setScrolled] = React.useState(false);
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const transparent = variant === 'transparent' && !scrolled;

  return (
    <header
      className={cn(
        'duration-base sticky top-0 z-40 transition-[background-color,box-shadow,border-color]',
        transparent
          ? 'border-b border-transparent bg-transparent text-canvas'
          : 'border-b border-line bg-canvas/85 backdrop-blur-md supports-[backdrop-filter]:bg-canvas/75',
        scrolled && 'shadow-e1',
      )}
      data-transparent={transparent || undefined}
    >
      <Container className="flex h-16 items-center justify-between gap-4 md:h-[4.5rem]">
        <Logo className={cn(transparent && '[&_span]:text-canvas [&_span_span]:text-canvas/70')} />
        <DesktopNav />
        <div className="flex items-center gap-1">
          <Tooltip label="Search">
            <Button asChild variant="ghost" size="icon-sm">
              <Link href="/search">
                <Search aria-hidden />
                <span className="sr-only">Search</span>
              </Link>
            </Button>
          </Tooltip>
          <PrefsControls />
          <Button asChild variant="ghost" size="icon-sm" className="hidden md:inline-flex">
            <Link href="/dashboard">
              <LayoutDashboard aria-hidden />
              <span className="sr-only">My dashboard</span>
            </Link>
          </Button>
          <Button asChild size="sm" className="ml-1 hidden sm:inline-flex">
            <Link href="/consultation">Book a consultation</Link>
          </Button>
          <MobileMenu />
        </div>
      </Container>
    </header>
  );
}

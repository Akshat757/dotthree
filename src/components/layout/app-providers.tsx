'use client';

import * as React from 'react';

import { TooltipProvider } from '@/components/ui/overlay';
import { ToastProvider } from '@/components/ui/toast';

export interface Prefs {
  theme: 'light' | 'dark' | 'system';
  largeText: boolean;
  highContrast: boolean;
}

const KEY = 'atelier:prefs';
const DEFAULT: Prefs = { theme: 'light', largeText: false, highContrast: false };

const Ctx = React.createContext<{ prefs: Prefs; setPrefs: (p: Partial<Prefs>) => void } | null>(
  null,
);

export function usePrefs() {
  const c = React.useContext(Ctx);
  if (!c) throw new Error('usePrefs must be used within <AppProviders>');
  return c;
}

function applyPrefs(p: Prefs) {
  const root = document.documentElement;
  const dark =
    p.theme === 'dark' ||
    (p.theme === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
  root.classList.toggle('dark', dark);
  root.classList.toggle('large-text', p.largeText);
  root.classList.toggle('high-contrast', p.highContrast);
}

/** Inline script run before paint to avoid a flash — mirrors applyPrefs(). */
export const PREFS_BOOT_SCRIPT = `try{var p=JSON.parse(localStorage.getItem('${KEY}')||'{}');var d=p.theme==='dark'||(p.theme==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);var c=document.documentElement.classList;d&&c.add('dark');p.largeText&&c.add('large-text');p.highContrast&&c.add('high-contrast');}catch(e){}`;

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [prefs, setState] = React.useState<Prefs>(DEFAULT);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState({ ...DEFAULT, ...(JSON.parse(raw) as Partial<Prefs>) });
    } catch {
      /* ignore */
    }
  }, []);

  const setPrefs = React.useCallback((patch: Partial<Prefs>) => {
    setState((prev) => {
      const next = { ...prev, ...patch };
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      applyPrefs(next);
      return next;
    });
  }, []);

  const value = React.useMemo(() => ({ prefs, setPrefs }), [prefs, setPrefs]);

  return (
    <Ctx.Provider value={value}>
      <TooltipProvider delayDuration={300}>
        <ToastProvider>{children}</ToastProvider>
      </TooltipProvider>
    </Ctx.Provider>
  );
}

/** Forces the visualiser's dark workspace theme while mounted (SRS §8.2). */
export function ForceDarkTheme() {
  React.useEffect(() => {
    const root = document.documentElement;
    const had = root.classList.contains('dark');
    root.classList.add('dark');
    return () => {
      if (!had) root.classList.remove('dark');
    };
  }, []);
  return null;
}

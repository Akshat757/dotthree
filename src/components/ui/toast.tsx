'use client';

import * as ToastPrimitive from '@radix-ui/react-toast';
import { CheckCircle2, Info, TriangleAlert, X, XCircle } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

export type ToastTone = 'neutral' | 'success' | 'warning' | 'danger';

export interface ToastOptions {
  title: React.ReactNode;
  description?: React.ReactNode;
  tone?: ToastTone;
  action?: { label: string; onClick: () => void };
  durationMs?: number;
}

interface ToastItem extends ToastOptions {
  id: number;
}

const ToastContext = React.createContext<{ toast: (o: ToastOptions) => void } | null>(null);

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return ctx;
}

const icons: Record<ToastTone, React.ReactNode> = {
  neutral: <Info className="size-5 text-ink-muted" aria-hidden />,
  success: <CheckCircle2 className="size-5 text-success" aria-hidden />,
  warning: <TriangleAlert className="size-5 text-warning" aria-hidden />,
  danger: <XCircle className="size-5 text-danger" aria-hidden />,
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<ToastItem[]>([]);
  const counter = React.useRef(0);

  const toast = React.useCallback((o: ToastOptions) => {
    counter.current += 1;
    setItems((prev) => [...prev.slice(-3), { ...o, id: counter.current }]);
  }, []);

  const value = React.useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      <ToastPrimitive.Provider swipeDirection="right" duration={5000}>
        {children}
        {items.map((t) => (
          <ToastPrimitive.Root
            key={t.id}
            duration={t.durationMs}
            onOpenChange={(open) => {
              if (!open) setItems((prev) => prev.filter((x) => x.id !== t.id));
            }}
            className={cn(
              'group pointer-events-auto relative flex w-full items-start gap-3 rounded-lg border border-line bg-surface p-4 pr-10 text-ink shadow-e3',
              'data-[state=closed]:animate-fade-in data-[state=open]:animate-rise-in data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] motion-reduce:animate-none',
            )}
          >
            <span className="mt-0.5 shrink-0">{icons[t.tone ?? 'neutral']}</span>
            <div className="grid flex-1 gap-0.5">
              <ToastPrimitive.Title className="text-body-s font-medium">
                {t.title}
              </ToastPrimitive.Title>
              {t.description && (
                <ToastPrimitive.Description className="text-caption text-ink-muted">
                  {t.description}
                </ToastPrimitive.Description>
              )}
              {t.action && (
                <ToastPrimitive.Action asChild altText={t.action.label}>
                  <button
                    type="button"
                    onClick={t.action.onClick}
                    className="mt-1 justify-self-start text-body-s font-medium text-accent underline-offset-4 hover:underline"
                  >
                    {t.action.label}
                  </button>
                </ToastPrimitive.Action>
              )}
            </div>
            <ToastPrimitive.Close className="absolute top-2 right-2 rounded-md p-1.5 text-ink-muted hover:bg-surface-sunk hover:text-ink focus-visible:ring-2 focus-visible:ring-focus/40 focus-visible:outline-none">
              <X className="size-4" aria-hidden />
              <span className="sr-only">Dismiss</span>
            </ToastPrimitive.Close>
          </ToastPrimitive.Root>
        ))}
        <ToastPrimitive.Viewport className="fixed right-0 bottom-[calc(env(safe-area-inset-bottom)+4.5rem)] z-[60] flex w-full max-w-sm flex-col gap-2 p-4 outline-none md:bottom-0" />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}

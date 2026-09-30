'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

export interface LightboxItem {
  id: string;
  render: React.ReactNode;
  caption?: React.ReactNode;
}

export function Lightbox({
  items,
  index,
  open,
  onOpenChange,
  onIndexChange,
}: {
  items: LightboxItem[];
  index: number;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onIndexChange: (i: number) => void;
}) {
  const count = items.length;
  const go = React.useCallback(
    (d: number) => onIndexChange((index + d + count) % count),
    [index, count, onIndexChange],
  );

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, go]);

  const touchX = React.useRef<number | null>(null);
  const item = items[index];

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-ink/95 data-[state=open]:animate-fade-in motion-reduce:animate-none" />
        <DialogPrimitive.Content
          className="fixed inset-0 z-50 flex flex-col text-canvas outline-none"
          onTouchStart={(e) => (touchX.current = e.touches[0]?.clientX ?? null)}
          onTouchEnd={(e) => {
            const x0 = touchX.current;
            const x1 = e.changedTouches[0]?.clientX;
            if (x0 !== null && x1 !== undefined && Math.abs(x1 - x0) > 48) go(x1 < x0 ? 1 : -1);
            touchX.current = null;
          }}
        >
          <DialogPrimitive.Title className="sr-only">Image viewer</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            Image {index + 1} of {count}. Use arrow keys to navigate.
          </DialogPrimitive.Description>

          <div className="flex items-center justify-between p-3">
            <span className="tabular text-caption text-canvas/70">
              {index + 1} / {count}
            </span>
            <DialogPrimitive.Close className="rounded-md p-2 hover:bg-canvas/10 focus-visible:ring-2 focus-visible:ring-canvas focus-visible:outline-none">
              <X className="size-5" aria-hidden />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 md:px-16">
            <div
              key={item?.id}
              className="max-h-full max-w-full animate-fade-in motion-reduce:animate-none [&_img]:max-h-[calc(100dvh-9rem)] [&_img]:w-auto [&_img]:max-w-full [&_img]:object-contain [&_picture]:flex [&_picture]:justify-center [&_picture]:!bg-transparent"
            >
              {item?.render}
            </div>
            {count > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => go(-1)}
                  className="absolute top-1/2 left-2 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full bg-canvas/10 hover:bg-canvas/20 focus-visible:ring-2 focus-visible:ring-canvas focus-visible:outline-none md:flex"
                >
                  <ChevronLeft className="size-6" aria-hidden />
                  <span className="sr-only">Previous</span>
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  className="absolute top-1/2 right-2 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full bg-canvas/10 hover:bg-canvas/20 focus-visible:ring-2 focus-visible:ring-canvas focus-visible:outline-none md:flex"
                >
                  <ChevronRight className="size-6" aria-hidden />
                  <span className="sr-only">Next</span>
                </button>
              </>
            )}
          </div>

          <div
            className={cn(
              'min-h-12 px-4 py-3 text-center text-body-s text-canvas/80',
              !item?.caption && 'invisible',
            )}
          >
            {item?.caption}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

/** Hook wiring a gallery to the Lightbox. */
export function useLightbox(count: number) {
  const [open, setOpen] = React.useState(false);
  const [index, setIndex] = React.useState(0);
  const openAt = React.useCallback(
    (i: number) => {
      setIndex(Math.max(0, Math.min(count - 1, i)));
      setOpen(true);
    },
    [count],
  );
  return { open, index, setOpen, setIndex, openAt };
}

'use client';

import { Expand } from 'lucide-react';
import * as React from 'react';

import { Img } from '@/components/ui/img';
import { Lightbox, useLightbox } from '@/components/ui/lightbox';
import { ROOM_LABELS } from '@/data/demo';
import { cn } from '@/lib/utils';
import type { ImageRef } from '@/types/content';

export function ProjectGallery({ images, title }: { images: ImageRef[]; title: string }) {
  const lb = useLightbox(images.length);
  const [room, setRoom] = React.useState<string | null>(null);

  const rooms = React.useMemo(
    () => Array.from(new Set(images.map((i) => i.roomType).filter((r): r is string => !!r))),
    [images],
  );
  const visible = room ? images.filter((i) => i.roomType === room) : images;

  return (
    <div>
      {rooms.length > 1 && (
        <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Filter gallery by room">
          <RoomTab active={room === null} onClick={() => setRoom(null)}>
            All ({images.length})
          </RoomTab>
          {rooms.map((r) => (
            <RoomTab key={r} active={room === r} onClick={() => setRoom(r)}>
              {ROOM_LABELS[r] ?? r}
            </RoomTab>
          ))}
        </div>
      )}
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
        {visible.map((im, i) => {
          const globalIndex = images.indexOf(im);
          const wide = i === 0 && visible.length > 2;
          return (
            <li key={im.id} className={cn(wide && 'col-span-2 row-span-2')}>
              <button
                type="button"
                onClick={() => lb.openAt(globalIndex)}
                className="group relative block w-full overflow-hidden rounded-md bg-surface-sunk focus-visible:ring-2 focus-visible:ring-focus/40 focus-visible:outline-none"
                aria-label={`Open image ${globalIndex + 1} of ${images.length}: ${im.alt}`}
              >
                <Img
                  image={im}
                  aspect={wide ? '4 / 3' : '1 / 1'}
                  sizes={wide ? '(min-width: 768px) 66vw, 100vw' : '(min-width: 768px) 33vw, 50vw'}
                  imgClassName="size-full object-cover transition-transform duration-slow group-hover:scale-[1.03] motion-reduce:transition-none"
                />
                <span className="absolute right-2 bottom-2 flex size-8 items-center justify-center rounded-full bg-ink/60 text-canvas opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                  <Expand className="size-4" aria-hidden />
                </span>
                {im.roomType && (
                  <span className="absolute top-2 left-2 rounded-sm bg-ink/60 px-1.5 py-0.5 text-caption text-canvas">
                    {ROOM_LABELS[im.roomType] ?? im.roomType}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
      <Lightbox
        items={images.map((im) => ({
          id: im.id,
          render: <Img image={im} sizes="100vw" />,
          caption: (
            <>
              {title}
              {im.roomType ? ` · ${ROOM_LABELS[im.roomType] ?? im.roomType}` : ''}
              {im.caption ? ` — ${im.caption}` : ''}
            </>
          ),
        }))}
        index={lb.index}
        open={lb.open}
        onOpenChange={lb.setOpen}
        onIndexChange={lb.setIndex}
      />
    </div>
  );
}

function RoomTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'h-8 rounded-full border px-3 text-caption font-medium transition-colors focus-visible:ring-2 focus-visible:ring-focus/40 focus-visible:outline-none',
        active
          ? 'border-ink bg-ink text-canvas'
          : 'border-line bg-surface text-ink hover:border-sand hover:bg-surface-sunk',
      )}
    >
      {children}
    </button>
  );
}

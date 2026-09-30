'use client';

import { Check, ChevronsUpDown, Search, X } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

import { Popover, PopoverContent, PopoverTrigger } from './overlay';

export interface ComboboxOption {
  value: string;
  label: string;
  hint?: string;
  group?: string;
}

export interface ComboboxProps {
  id?: string;
  options: ComboboxOption[];
  value?: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  clearable?: boolean;
  disabled?: boolean;
  className?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
}

/** Accessible searchable single-select (listbox + combobox pattern). */
export function Combobox({
  id,
  options,
  value,
  onChange,
  placeholder = 'Select…',
  searchPlaceholder = 'Search…',
  emptyText = 'No matches',
  clearable,
  disabled,
  className,
  ...aria
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [q, setQ] = React.useState('');
  const [active, setActive] = React.useState(0);
  const listId = React.useId();
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Focus the search input when the list opens (Radix restores trigger focus on close).
  React.useEffect(() => {
    if (open) requestAnimationFrame(() => inputRef.current?.focus());
  }, [open]);

  const filtered = React.useMemo(() => {
    const n = q.trim().toLowerCase();
    return n
      ? options.filter(
          (o) => o.label.toLowerCase().includes(n) || o.hint?.toLowerCase().includes(n),
        )
      : options;
  }, [options, q]);

  React.useEffect(() => setActive(0), [q, open]);

  const selected = options.find((o) => o.value === value);

  const pick = (o: ComboboxOption) => {
    onChange(o.value);
    setOpen(false);
    setQ('');
  };

  return (
    <div className={cn('relative', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            id={id}
            type="button"
            role="combobox"
            aria-expanded={open}
            aria-controls={listId}
            aria-haspopup="listbox"
            disabled={disabled}
            {...aria}
            className={cn(
              'flex h-11 w-full items-center justify-between gap-2 rounded-md border border-line bg-surface px-3.5 text-left text-body hover:border-sand focus-visible:border-focus focus-visible:ring-2 focus-visible:ring-focus/40 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-danger',
              clearable && selected && 'pr-16',
            )}
          >
            <span className="truncate">
              {selected?.label ?? <span className="text-ink-subtle">{placeholder}</span>}
            </span>
            <ChevronsUpDown className="size-4 text-ink-muted" aria-hidden />
          </button>
        </PopoverTrigger>
        {clearable && selected && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute top-1/2 right-10 -translate-y-1/2 rounded-sm p-1 text-ink-muted hover:text-ink focus-visible:ring-2 focus-visible:ring-focus/40 focus-visible:outline-none"
          >
            <X className="size-3.5" aria-hidden />
            <span className="sr-only">Clear selection</span>
          </button>
        )}
        <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] p-1">
          <div className="flex items-center gap-2 border-b border-line px-2 pt-1 pb-1.5">
            <Search className="size-4 text-ink-muted" aria-hidden />
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              aria-controls={listId}
              aria-activedescendant={
                filtered[active] ? `${listId}-${filtered[active].value}` : undefined
              }
              className="h-9 w-full bg-transparent text-body-s outline-none placeholder:text-ink-subtle"
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  setActive((a) => Math.min(filtered.length - 1, a + 1));
                } else if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  setActive((a) => Math.max(0, a - 1));
                } else if (e.key === 'Enter') {
                  e.preventDefault();
                  const o = filtered[active];
                  if (o) pick(o);
                } else if (e.key === 'Escape') {
                  setOpen(false);
                }
              }}
            />
          </div>
          <ul id={listId} role="listbox" className="max-h-64 overflow-y-auto py-1">
            {filtered.length === 0 && (
              <li className="px-3 py-6 text-center text-body-s text-ink-muted">{emptyText}</li>
            )}
            {filtered.map((o, i) => (
              // Keyboard interaction is handled by the search input (aria-activedescendant pattern).
              // eslint-disable-next-line jsx-a11y/click-events-have-key-events
              <li
                key={o.value}
                id={`${listId}-${o.value}`}
                role="option"
                aria-selected={o.value === value}
                data-active={i === active || undefined}
                onMouseEnter={() => setActive(i)}
                onClick={() => pick(o)}
                className="flex cursor-default items-center gap-2 rounded-sm px-2 py-2 text-body-s data-[active]:bg-surface-sunk"
              >
                <span className="flex size-4 items-center justify-center">
                  {o.value === value && <Check className="size-4 text-accent" aria-hidden />}
                </span>
                <span className="flex-1 truncate">{o.label}</span>
                {o.hint && <span className="text-caption text-ink-subtle">{o.hint}</span>}
              </li>
            ))}
          </ul>
        </PopoverContent>
      </Popover>
    </div>
  );
}

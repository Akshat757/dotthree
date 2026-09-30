'use client';

import * as LabelPrimitive from '@radix-ui/react-label';
import * as React from 'react';

import { cn } from '@/lib/utils';

export const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & {
    required?: boolean;
    optional?: boolean;
  }
>(({ className, required, optional, children, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(
      'text-body-s leading-none font-medium text-ink peer-disabled:cursor-not-allowed peer-disabled:opacity-60',
      className,
    )}
    {...props}
  >
    {children}
    {required && (
      <span className="ml-0.5 text-accent" aria-hidden>
        *
      </span>
    )}
    {optional && <span className="ml-1.5 font-normal text-ink-subtle">(optional)</span>}
  </LabelPrimitive.Root>
));
Label.displayName = 'Label';

/* ------------------------------------------------------------------ */

const fieldBase =
  'flex w-full rounded-md border bg-surface text-ink text-body placeholder:text-ink-subtle transition-[border-color,box-shadow] duration-quick focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus/40 focus-visible:border-focus disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-surface-sunk aria-[invalid=true]:border-danger aria-[invalid=true]:focus-visible:ring-danger/30';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, leading, trailing, type, ...props }, ref) => {
    if (!leading && !trailing) {
      return (
        <input
          ref={ref}
          type={type}
          className={cn(fieldBase, 'h-11 border-line px-3.5 hover:border-sand', className)}
          {...props}
        />
      );
    }
    return (
      <div
        className={cn(
          fieldBase,
          'h-11 items-center gap-2 border-line px-3.5 focus-within:border-focus focus-within:ring-2 focus-within:ring-focus/40 hover:border-sand',
          className,
        )}
      >
        {leading && <span className="shrink-0 text-ink-muted [&_svg]:size-4">{leading}</span>}
        <input
          ref={ref}
          type={type}
          className="h-full w-full min-w-0 bg-transparent outline-none placeholder:text-ink-subtle"
          {...props}
        />
        {trailing && <span className="shrink-0 text-ink-muted [&_svg]:size-4">{trailing}</span>}
      </div>
    );
  },
);
Input.displayName = 'Input';

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      fieldBase,
      'min-h-28 resize-y border-line px-3.5 py-2.5 hover:border-sand',
      className,
    )}
    {...props}
  />
));
Textarea.displayName = 'Textarea';

/* ------------------------------------------------------------------ */

export interface FieldProps {
  id: string;
  label: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  required?: boolean;
  optional?: boolean;
  className?: string;
  children: (a: {
    id: string;
    'aria-describedby'?: string;
    'aria-invalid'?: boolean;
    'aria-required'?: boolean;
  }) => React.ReactNode;
}

/** Accessible label + hint + error wiring for any control. */
export function Field({
  id,
  label,
  hint,
  error,
  required,
  optional,
  className,
  children,
}: FieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errId].filter(Boolean).join(' ') || undefined;
  return (
    <div className={cn('grid gap-1.5', className)}>
      <Label htmlFor={id} required={required} optional={optional}>
        {label}
      </Label>
      {children({
        id,
        'aria-describedby': describedBy,
        'aria-invalid': error ? true : undefined,
        'aria-required': required || undefined,
      })}
      {hint && !error && (
        <p id={hintId} className="text-caption text-ink-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errId} role="alert" className="text-caption text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

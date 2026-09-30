'use client';

import * as AccordionPrimitive from '@radix-ui/react-accordion';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { ChevronDown } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

/* --------------------------------- Accordion ------------------------------- */

export const Accordion = AccordionPrimitive.Root;

export const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item ref={ref} className={cn('border-b border-line', className)} {...props} />
));
AccordionItem.displayName = 'AccordionItem';

export const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        'flex flex-1 items-center justify-between gap-4 rounded-sm py-4 text-left text-body font-medium text-ink transition-colors hover:text-accent focus-visible:ring-2 focus-visible:ring-focus/40 focus-visible:outline-none [&[data-state=open]>svg]:rotate-180',
        className,
      )}
      {...props}
    >
      {children}
      <ChevronDown
        className="duration-base size-4 shrink-0 text-ink-muted transition-transform"
        aria-hidden
      />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = 'AccordionTrigger';

export const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden text-body-s text-ink-muted data-[state=closed]:animate-[accordion-up_var(--duration-quick)_var(--ease-quick)] data-[state=open]:animate-[accordion-down_var(--duration-base)_var(--ease-base)] motion-reduce:animate-none"
    {...props}
  >
    <div className={cn('pt-0 pb-4', className)}>{children}</div>
  </AccordionPrimitive.Content>
));
AccordionContent.displayName = 'AccordionContent';

/** Convenience for FAQs: `<FaqAccordion items={[{q,a}]} />` */
export function FaqAccordion({
  items,
  className,
}: {
  items: { q: string; a: React.ReactNode }[];
  className?: string;
}) {
  return (
    <Accordion type="single" collapsible className={className}>
      {items.map((it, i) => (
        <AccordionItem key={i} value={`item-${i}`}>
          <AccordionTrigger>{it.q}</AccordionTrigger>
          <AccordionContent>{it.a}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

/* ----------------------------------- Tabs ---------------------------------- */

export const Tabs = TabsPrimitive.Root;

export const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> & { variant?: 'line' | 'pill' }
>(({ className, variant = 'line', ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      'no-scrollbar inline-flex max-w-full items-center gap-1 overflow-x-auto',
      variant === 'line' ? 'w-full border-b border-line' : 'rounded-lg bg-surface-sunk p-1',
      className,
    )}
    data-variant={variant}
    {...props}
  />
));
TabsList.displayName = 'TabsList';

export const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      'inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-body-s font-medium whitespace-nowrap text-ink-muted transition-colors focus-visible:ring-2 focus-visible:ring-focus/40 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
      // line variant
      'group-data-[variant=line]/tabs:-mb-px group-data-[variant=line]/tabs:border-b-2 group-data-[variant=line]/tabs:border-transparent',
      '[[data-variant=line]_&]:-mb-px [[data-variant=line]_&]:rounded-none [[data-variant=line]_&]:border-b-2 [[data-variant=line]_&]:border-transparent [[data-variant=line]_&]:px-3 [[data-variant=line]_&]:py-3 [[data-variant=line]_&]:data-[state=active]:border-accent [[data-variant=line]_&]:data-[state=active]:text-ink',
      // pill variant
      '[[data-variant=pill]_&]:px-3.5 [[data-variant=pill]_&]:py-2 [[data-variant=pill]_&]:data-[state=active]:bg-surface [[data-variant=pill]_&]:data-[state=active]:text-ink [[data-variant=pill]_&]:data-[state=active]:shadow-e1',
      className,
    )}
    {...props}
  />
));
TabsTrigger.displayName = 'TabsTrigger';

export const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      'mt-4 rounded-md focus-visible:ring-2 focus-visible:ring-focus/40 focus-visible:outline-none',
      className,
    )}
    {...props}
  />
));
TabsContent.displayName = 'TabsContent';

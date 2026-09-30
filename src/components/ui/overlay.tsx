'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cva, type VariantProps } from 'class-variance-authority';
import { X } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

/* ---------------------------------- Dialog --------------------------------- */

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;
export const DialogPortal = DialogPrimitive.Portal;
export const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn('font-display text-h3 text-ink', className)}
    {...props}
  />
));
DialogTitle.displayName = 'DialogTitle';
export const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-body-s text-ink-muted', className)}
    {...props}
  />
));
DialogDescription.displayName = 'DialogDescription';

export const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-ink/50 backdrop-blur-[2px] data-[state=open]:animate-fade-in motion-reduce:animate-none',
      className,
    )}
    {...props}
  />
));
DialogOverlay.displayName = 'DialogOverlay';

export interface DialogContentProps extends React.ComponentPropsWithoutRef<
  typeof DialogPrimitive.Content
> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  hideClose?: boolean;
}
const dialogSizes = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-[calc(100vw-2rem)] h-[calc(100dvh-2rem)]',
};

export const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(({ className, children, size = 'md', hideClose, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'fixed top-1/2 left-1/2 z-50 grid max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 overflow-y-auto rounded-xl border border-line bg-surface p-6 text-ink shadow-e4 outline-none data-[state=open]:animate-rise-in motion-reduce:animate-none',
        dialogSizes[size],
        className,
      )}
      {...props}
    >
      {children}
      {!hideClose && (
        <DialogPrimitive.Close className="absolute top-3 right-3 rounded-md p-2 text-ink-muted transition-colors hover:bg-surface-sunk hover:text-ink focus-visible:ring-2 focus-visible:ring-focus/40 focus-visible:outline-none">
          <X className="size-4" aria-hidden />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      )}
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = 'DialogContent';

export function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col gap-1.5 pr-8', className)} {...props} />;
}
export function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)}
      {...props}
    />
  );
}

/* ----------------------------------- Sheet --------------------------------- */

export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;
export const SheetTitle = DialogTitle;
export const SheetDescription = DialogDescription;
export const SheetHeader = DialogHeader;
export const SheetFooter = DialogFooter;

const sheetVariants = cva(
  'duration-base data-[state=closed]:duration-quick fixed z-50 flex flex-col gap-4 bg-surface text-ink shadow-e4 transition-transform ease-slow outline-none motion-reduce:transition-none',
  {
    variants: {
      side: {
        right:
          'inset-y-0 right-0 h-dvh w-[min(28rem,calc(100vw-2rem))] border-l border-line data-[state=closed]:animate-[slide-out-right_var(--duration-quick)_var(--ease-quick)] data-[state=open]:animate-[slide-in-right_var(--duration-base)_var(--ease-slow)]',
        left: 'inset-y-0 left-0 h-dvh w-[min(28rem,calc(100vw-2rem))] border-r border-line data-[state=closed]:animate-[slide-out-left_var(--duration-quick)_var(--ease-quick)] data-[state=open]:animate-[slide-in-left_var(--duration-base)_var(--ease-slow)]',
        bottom:
          'inset-x-0 bottom-0 max-h-[92dvh] rounded-t-xl border-t border-line data-[state=closed]:animate-[slide-out-bottom_var(--duration-quick)_var(--ease-quick)] data-[state=open]:animate-[slide-in-bottom_var(--duration-base)_var(--ease-slow)]',
        top: 'inset-x-0 top-0 max-h-[92dvh] rounded-b-xl border-b border-line data-[state=open]:animate-[slide-in-top_var(--duration-base)_var(--ease-slow)]',
      },
    },
    defaultVariants: { side: 'right' },
  },
);

export interface SheetContentProps
  extends
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    VariantProps<typeof sheetVariants> {
  hideClose?: boolean;
}

export const SheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  SheetContentProps
>(({ side = 'right', className, children, hideClose, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(sheetVariants({ side }), 'p-6', className)}
      {...props}
    >
      {side === 'bottom' && (
        <div aria-hidden className="mx-auto -mt-2 mb-1 h-1.5 w-12 rounded-full bg-sand" />
      )}
      {children}
      {!hideClose && (
        <DialogPrimitive.Close className="absolute top-3 right-3 rounded-md p-2 text-ink-muted transition-colors hover:bg-surface-sunk hover:text-ink focus-visible:ring-2 focus-visible:ring-focus/40 focus-visible:outline-none">
          <X className="size-4" aria-hidden />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      )}
    </DialogPrimitive.Content>
  </DialogPortal>
));
SheetContent.displayName = 'SheetContent';

/** Drawer = bottom sheet on mobile, right sheet on desktop. */
export const Drawer = Sheet;
export const DrawerTrigger = SheetTrigger;
export const DrawerClose = SheetClose;
export const DrawerTitle = SheetTitle;
export const DrawerDescription = SheetDescription;
export const DrawerContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  Omit<SheetContentProps, 'side'>
>(({ className, ...props }, ref) => (
  <SheetContent
    ref={ref}
    side="bottom"
    className={cn(
      'md:inset-y-0 md:right-0 md:left-auto md:h-dvh md:max-h-none md:w-[min(28rem,calc(100vw-2rem))] md:rounded-none md:border-t-0 md:border-l',
      className,
    )}
    {...props}
  />
));
DrawerContent.displayName = 'DrawerContent';

/* ---------------------------------- Popover -------------------------------- */

export const Popover = PopoverPrimitive.Root;
export const PopoverTrigger = PopoverPrimitive.Trigger;
export const PopoverAnchor = PopoverPrimitive.Anchor;
export const PopoverClose = PopoverPrimitive.Close;

export const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = 'center', sideOffset = 6, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        'z-50 w-72 rounded-lg border border-line bg-surface p-4 text-ink shadow-e3 outline-none data-[state=open]:animate-fade-in motion-reduce:animate-none',
        className,
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
));
PopoverContent.displayName = 'PopoverContent';

/* ---------------------------------- Tooltip -------------------------------- */

export const TooltipProvider = TooltipPrimitive.Provider;
export const TooltipRoot = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;

export const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 6, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        'z-50 max-w-xs rounded-md bg-ink px-3 py-1.5 text-caption text-canvas shadow-e2 data-[state=delayed-open]:animate-fade-in motion-reduce:animate-none',
        className,
      )}
      {...props}
    />
  </TooltipPrimitive.Portal>
));
TooltipContent.displayName = 'TooltipContent';

/** Convenience wrapper: `<Tooltip label="…"><button/></Tooltip>` */
export function Tooltip({
  label,
  children,
  side,
  delayDuration = 300,
}: {
  label: React.ReactNode;
  children: React.ReactElement;
  side?: 'top' | 'right' | 'bottom' | 'left';
  delayDuration?: number;
}) {
  return (
    <TooltipRoot delayDuration={delayDuration}>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side={side}>{label}</TooltipContent>
    </TooltipRoot>
  );
}

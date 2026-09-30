import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

export const buttonVariants = cva(
  'duration-quick inline-flex items-center justify-center gap-2 rounded-md font-medium whitespace-nowrap transition-[background-color,color,box-shadow,transform] ease-quick select-none active:scale-[0.985] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary: 'bg-accent text-white shadow-e1 hover:bg-accent-hover hover:shadow-e2',
        secondary:
          'bg-ink text-canvas hover:bg-ink/90 dark:bg-canvas dark:text-ink dark:hover:bg-canvas/90',
        outline:
          'border border-line bg-transparent text-ink hover:border-sand hover:bg-surface-sunk',
        ghost: 'bg-transparent text-ink hover:bg-surface-sunk',
        soft: 'bg-accent-soft text-accent-hover hover:bg-accent-soft/80',
        link: 'h-auto px-0 text-accent underline-offset-4 hover:underline',
        whatsapp: 'bg-[#25D366] text-[#0b3d2a] shadow-e1 hover:bg-[#1fbd5b]',
        danger: 'bg-danger text-white hover:bg-danger/90',
      },
      size: {
        sm: 'h-9 px-3 text-body-s',
        md: 'h-11 px-5 text-body',
        lg: 'h-13 px-7 text-body-l',
        icon: 'size-11',
        'icon-sm': 'size-9',
      },
      fullWidth: { true: 'w-full' },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      asChild = false,
      loading = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, fullWidth }), className)}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        data-loading={loading || undefined}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" aria-hidden />
            <span className="sr-only">Loading</span>
            {children}
          </>
        ) : (
          children
        )}
      </Comp>
    );
  },
);
Button.displayName = 'Button';

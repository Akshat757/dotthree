'use client';

import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import * as SelectPrimitive from '@radix-ui/react-select';
import * as SliderPrimitive from '@radix-ui/react-slider';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import { Check, ChevronDown, ChevronUp, Minus } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

/* ---------------------------------- Select --------------------------------- */

export const Select = SelectPrimitive.Root;
export const SelectGroup = SelectPrimitive.Group;
export const SelectValue = SelectPrimitive.Value;

export const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      'flex h-11 w-full items-center justify-between gap-2 rounded-md border border-line bg-surface px-3.5 text-body text-ink hover:border-sand focus-visible:border-focus focus-visible:ring-2 focus-visible:ring-focus/40 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-danger data-[placeholder]:text-ink-subtle [&>span]:truncate',
      className,
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="size-4 shrink-0 text-ink-muted" aria-hidden />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = 'SelectTrigger';

export const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = 'popper', ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      position={position}
      className={cn(
        'relative z-50 max-h-[min(24rem,var(--radix-select-content-available-height))] min-w-32 animate-fade-in overflow-hidden rounded-md border border-line bg-surface text-ink shadow-e3',
        position === 'popper' &&
          'w-full min-w-[var(--radix-select-trigger-width)] data-[side=bottom]:translate-y-1 data-[side=top]:-translate-y-1',
        className,
      )}
      {...props}
    >
      <SelectPrimitive.ScrollUpButton className="flex h-6 items-center justify-center">
        <ChevronUp className="size-4" aria-hidden />
      </SelectPrimitive.ScrollUpButton>
      <SelectPrimitive.Viewport className="p-1">{children}</SelectPrimitive.Viewport>
      <SelectPrimitive.ScrollDownButton className="flex h-6 items-center justify-center">
        <ChevronDown className="size-4" aria-hidden />
      </SelectPrimitive.ScrollDownButton>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = 'SelectContent';

export const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn('px-2 py-1.5 text-overline text-ink-subtle uppercase', className)}
    {...props}
  />
));
SelectLabel.displayName = 'SelectLabel';

export const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex w-full cursor-default items-center rounded-sm py-2 pr-2 pl-8 text-body-s outline-none select-none focus:bg-surface-sunk data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className,
    )}
    {...props}
  >
    <span className="absolute left-2 flex size-4 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="size-4 text-accent" aria-hidden />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = 'SelectItem';

/** Convenience: a fully-wired native-feeling select. */
export function SimpleSelect({
  options,
  placeholder = 'Select…',
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Root> & {
  options: { value: string; label: string; disabled?: boolean }[];
  placeholder?: string;
  className?: string;
  id?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
}) {
  const { id, 'aria-describedby': describedBy, 'aria-invalid': invalid, ...root } = props;
  return (
    <Select {...root}>
      <SelectTrigger
        id={id}
        aria-describedby={describedBy}
        aria-invalid={invalid}
        className={className}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value} disabled={o.disabled}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/* --------------------------------- Checkbox -------------------------------- */

export const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      'peer duration-quick size-5 shrink-0 rounded-sm border border-ink-subtle bg-surface transition-colors hover:border-ink focus-visible:ring-2 focus-visible:ring-focus/40 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-accent data-[state=checked]:bg-accent data-[state=checked]:text-white data-[state=indeterminate]:border-accent data-[state=indeterminate]:bg-accent data-[state=indeterminate]:text-white',
      className,
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator className="flex items-center justify-center">
      {props.checked === 'indeterminate' ? (
        <Minus className="size-3.5" strokeWidth={3} aria-hidden />
      ) : (
        <Check className="size-3.5" strokeWidth={3} aria-hidden />
      )}
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = 'Checkbox';

export function CheckboxField({
  id,
  label,
  hint,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof Checkbox> & {
  id: string;
  label: React.ReactNode;
  hint?: React.ReactNode;
}) {
  return (
    <div className={cn('flex items-start gap-3', className)}>
      <Checkbox
        id={id}
        className="mt-0.5"
        aria-describedby={hint ? `${id}-hint` : undefined}
        {...props}
      />
      <div className="grid gap-0.5">
        <label
          htmlFor={id}
          className="text-body-s leading-snug font-medium text-ink peer-disabled:opacity-60"
        >
          {label}
        </label>
        {hint && (
          <p id={`${id}-hint`} className="text-caption text-ink-muted">
            {hint}
          </p>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------- Switch --------------------------------- */

export const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root
    ref={ref}
    className={cn(
      'peer duration-quick inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent bg-sand transition-colors focus-visible:ring-2 focus-visible:ring-focus/40 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-accent',
      className,
    )}
    {...props}
  >
    <SwitchPrimitive.Thumb className="duration-quick pointer-events-none block size-5 rounded-full bg-white shadow-e1 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0" />
  </SwitchPrimitive.Root>
));
Switch.displayName = 'Switch';

export function SwitchField({
  id,
  label,
  hint,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof Switch> & {
  id: string;
  label: React.ReactNode;
  hint?: React.ReactNode;
}) {
  return (
    <div className={cn('flex items-center justify-between gap-4', className)}>
      <div className="grid gap-0.5">
        <label htmlFor={id} className="text-body-s font-medium text-ink">
          {label}
        </label>
        {hint && (
          <p id={`${id}-hint`} className="text-caption text-ink-muted">
            {hint}
          </p>
        )}
      </div>
      <Switch id={id} aria-describedby={hint ? `${id}-hint` : undefined} {...props} />
    </div>
  );
}

/* ---------------------------------- Slider --------------------------------- */

export interface SliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  /** Accessible names for each thumb (required for a11y) */
  thumbLabels: string[];
  formatValue?: (v: number) => string;
  showValue?: boolean;
}

/** Single- or multi-thumb slider. Use two values + two labels for RangeSlider. */
export const Slider = React.forwardRef<React.ElementRef<typeof SliderPrimitive.Root>, SliderProps>(
  (
    { className, thumbLabels, formatValue = String, showValue, value, defaultValue, ...props },
    ref,
  ) => {
    const values = value ?? defaultValue ?? [0];
    return (
      <div className={cn('grid gap-2', className)}>
        {showValue && (
          <div className="tabular flex justify-between text-caption text-ink-muted" aria-hidden>
            {values.map((v, i) => (
              <span key={i}>{formatValue(v)}</span>
            ))}
          </div>
        )}
        <SliderPrimitive.Root
          ref={ref}
          value={value}
          defaultValue={defaultValue}
          className="relative flex w-full touch-none items-center py-2 select-none data-[disabled]:opacity-50"
          {...props}
        >
          <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-sand/70">
            <SliderPrimitive.Range className="absolute h-full bg-accent" />
          </SliderPrimitive.Track>
          {values.map((v, i) => (
            <SliderPrimitive.Thumb
              key={i}
              aria-label={thumbLabels[i] ?? `Value ${i + 1}`}
              aria-valuetext={formatValue(v)}
              className="duration-quick block size-5 rounded-full border-2 border-accent bg-surface shadow-e1 transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-focus/40 focus-visible:outline-none disabled:pointer-events-none"
            />
          ))}
        </SliderPrimitive.Root>
      </div>
    );
  },
);
Slider.displayName = 'Slider';

export const RangeSlider = Slider;

/* ------------------------------ RadioCardGroup ----------------------------- */

export interface RadioCardOption {
  value: string;
  label: React.ReactNode;
  description?: React.ReactNode;
  /** Optional media — an <Img> or any node rendered above the label */
  media?: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface RadioCardGroupProps extends Omit<
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>,
  'children'
> {
  options: RadioCardOption[];
  columns?: 1 | 2 | 3 | 4;
  size?: 'sm' | 'md';
}

const cols = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-2 sm:grid-cols-3',
  4: 'grid-cols-2 sm:grid-cols-4',
};

export const RadioCardGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  RadioCardGroupProps
>(({ className, options, columns = 2, size = 'md', ...props }, ref) => (
  <RadioGroupPrimitive.Root
    ref={ref}
    className={cn('grid gap-3', cols[columns], className)}
    {...props}
  >
    {options.map((o) => (
      <RadioGroupPrimitive.Item
        key={o.value}
        value={o.value}
        disabled={o.disabled}
        className={cn(
          'group duration-quick relative flex flex-col items-start gap-2 overflow-hidden rounded-lg border border-line bg-surface text-left transition-[border-color,box-shadow,transform] hover:border-sand hover:shadow-e1 focus-visible:ring-2 focus-visible:ring-focus/40 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-accent data-[state=checked]:ring-1 data-[state=checked]:ring-accent',
          o.media ? 'p-0' : size === 'sm' ? 'p-3' : 'p-4',
        )}
      >
        {o.media && (
          <div className="aspect-[4/3] w-full overflow-hidden bg-surface-sunk [&_img]:size-full [&_img]:object-cover">
            {o.media}
          </div>
        )}
        <div
          className={cn(
            'flex w-full items-start gap-3',
            o.media && (size === 'sm' ? 'p-3 pt-1' : 'p-4 pt-2'),
          )}
        >
          {o.icon && (
            <span className="mt-0.5 text-ink-muted group-data-[state=checked]:text-accent [&_svg]:size-5">
              {o.icon}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <div className="text-body-s leading-snug font-medium text-ink">{o.label}</div>
            {o.description && (
              <div className="mt-0.5 text-caption text-ink-muted">{o.description}</div>
            )}
          </div>
          <span
            aria-hidden
            className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border border-ink-subtle group-data-[state=checked]:border-accent group-data-[state=checked]:bg-accent"
          >
            <RadioGroupPrimitive.Indicator>
              <Check className="size-3 text-white" strokeWidth={3} />
            </RadioGroupPrimitive.Indicator>
          </span>
        </div>
      </RadioGroupPrimitive.Item>
    ))}
  </RadioGroupPrimitive.Root>
));
RadioCardGroup.displayName = 'RadioCardGroup';

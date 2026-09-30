'use client';

import * as React from 'react';

import { buildWhatsAppUrl, messages } from '@/lib/whatsapp';
import { cn } from '@/lib/utils';

import { Button, type ButtonProps } from './button';

export function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn('size-4', className)} fill="currentColor" aria-hidden>
      <path d="M17.5 14.4c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.5-.6c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5-.1-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.2-.3-.2-.6-.3zM12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.5 1.3 5L2 22l5.2-1.4c1.4.8 3.1 1.2 4.8 1.2 5.5 0 10-4.5 10-10S17.5 2 12 2zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3.1.8.8-3-.2-.3C4 15 3.7 13.5 3.7 12c0-4.6 3.7-8.3 8.3-8.3s8.3 3.7 8.3 8.3-3.7 8.2-8.3 8.2z" />
    </svg>
  );
}

export interface WhatsAppButtonProps extends Omit<ButtonProps, 'asChild' | 'onClick'> {
  /** Prebuilt message; defaults to the generic greeting */
  message?: string;
  /** Called after the link opens (analytics hook) */
  onOpen?: () => void;
  label?: React.ReactNode;
}

/** The single WhatsApp deep-link button. Never hardcode wa.me elsewhere (CI grep). */
export function WhatsAppButton({
  message,
  onOpen,
  label = 'Chat on WhatsApp',
  variant = 'whatsapp',
  className,
  ...props
}: WhatsAppButtonProps) {
  const [href, setHref] = React.useState(() =>
    buildWhatsAppUrl(message ?? messages.generic(), { forceWeb: false }),
  );
  React.useEffect(() => {
    setHref(buildWhatsAppUrl(message ?? messages.generic(), { ua: navigator.userAgent }));
  }, [message]);
  return (
    <Button asChild variant={variant} className={className} {...props}>
      <a href={href} target="_blank" rel="noopener noreferrer" onClick={onOpen}>
        <WhatsAppIcon />
        {label}
      </a>
    </Button>
  );
}

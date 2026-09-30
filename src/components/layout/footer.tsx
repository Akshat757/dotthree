import { Instagram, Facebook, Youtube, MapPin, Phone, Mail, Clock } from 'lucide-react';
import Link from 'next/link';

import { footerColumns, legalLinks } from '@/config/nav';
import { site } from '@/config/site';
import { buildMailtoUrl, buildTelUrl } from '@/lib/whatsapp';

import { Container, Logo } from './primitives';

function PinterestIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12 2C6.5 2 2 6.5 2 12c0 4.2 2.6 7.8 6.4 9.3-.1-.8-.2-2 0-2.9l1.2-5s-.3-.6-.3-1.5c0-1.4.8-2.4 1.8-2.4.9 0 1.3.6 1.3 1.4 0 .9-.5 2.1-.8 3.3-.2 1 .5 1.8 1.5 1.8 1.8 0 3.1-1.9 3.1-4.5 0-2.4-1.7-4-4.2-4-2.8 0-4.5 2.1-4.5 4.3 0 .9.3 1.8.8 2.3.1.1.1.2.1.3l-.3 1.2c0 .2-.2.2-.4.1-1.3-.6-2.1-2.5-2.1-4 0-3.3 2.4-6.3 6.8-6.3 3.6 0 6.4 2.6 6.4 6 0 3.6-2.3 6.4-5.4 6.4-1.1 0-2-.5-2.4-1.2l-.7 2.5c-.2.9-.9 2.1-1.3 2.8.9.3 2 .5 3 .5 5.5 0 10-4.5 10-10S17.5 2 12 2z" />
    </svg>
  );
}

const socials = [
  { label: 'Instagram', href: site.social.instagram, Icon: Instagram },
  { label: 'Facebook', href: site.social.facebook, Icon: Facebook },
  { label: 'YouTube', href: site.social.youtube, Icon: Youtube },
  { label: 'Pinterest', href: site.social.pinterest, Icon: PinterestIcon },
];

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-line bg-surface-sunk pb-24 lg:pb-0">
      <Container className="py-14 md:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-4 text-body-s text-ink-muted">{site.tagline}</p>
            <ul className="mt-6 grid gap-3 text-body-s text-ink">
              <li className="flex gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
                <address className="not-italic">
                  {site.address.line1}, {site.address.line2}, {site.address.city}{' '}
                  {site.address.pincode}
                </address>
              </li>
              <li className="flex gap-3">
                <Phone className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
                <a href={buildTelUrl()} className="hover:text-accent">
                  {site.phone}
                </a>
              </li>
              <li className="flex gap-3">
                <Mail className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
                <a href={buildMailtoUrl('Enquiry from website', '')} className="hover:text-accent">
                  {site.email}
                </a>
              </li>
              <li className="flex gap-3">
                <Clock className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
                <span>
                  Mon–Sat {site.businessHours.weekdays} · Sun{' '}
                  {site.businessHours.sunday.toLowerCase()}
                </span>
              </li>
            </ul>
            <ul className="mt-6 flex gap-2" aria-label="Social media">
              {socials.map(({ label, href, Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex size-10 items-center justify-center rounded-full border border-line bg-surface text-ink-muted transition-colors hover:border-accent hover:text-accent focus-visible:ring-2 focus-visible:ring-focus/40 focus-visible:outline-none"
                  >
                    <Icon className="size-4" aria-hidden />
                    <span className="sr-only">{label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {footerColumns.map((col) => (
            <nav key={col.heading} aria-label={col.heading}>
              <p className="mb-4 overline">{col.heading}</p>
              <ul className="grid gap-2.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-body-s text-ink hover:text-accent">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-line pt-6 text-caption text-ink-muted md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {site.legalName}. GSTIN {site.gstin}. Serving{' '}
            {site.serviceAreas.slice(0, 4).join(', ')} and nearby.
          </p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {legalLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-accent">
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/sitemap.xml" className="hover:text-accent">
                Sitemap
              </Link>
            </li>
          </ul>
        </div>
      </Container>
    </footer>
  );
}

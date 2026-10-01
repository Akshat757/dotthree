import { site } from '@/config/site';

/**
 * JSON-LD <script> — the only sanctioned innerHTML site besides MDX.
 * Input is build-time, repo-authored data; `<` is escaped so a stray string
 * can never close the script tag.
 */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}

export function absUrl(path: string): string {
  return new URL(path, site.url).toString();
}

export function organisationLd() {
  return {
    '@type': 'Organization',
    '@id': `${site.url}/#org`,
    name: site.name,
    url: site.url,
    logo: absUrl('/icons/icon-512.png'),
    telephone: site.phoneE164,
    email: site.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: `${site.address.line1}, ${site.address.line2}`,
      addressLocality: site.address.city,
      addressRegion: site.address.state,
      postalCode: site.address.pincode,
      addressCountry: site.address.country,
    },
  };
}

export function breadcrumbLd(items: { name: string; href: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: absUrl(it.href),
    })),
  };
}

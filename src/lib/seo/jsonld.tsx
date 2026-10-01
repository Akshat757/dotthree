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

export function faqLd(faqs: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

export function localBusinessLd(extra?: Record<string, unknown>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'InteriorDesigner',
    '@id': `${site.url}/#business`,
    name: site.name,
    url: site.url,
    image: absUrl('/og/default.png'),
    telephone: site.phoneE164,
    email: site.email,
    priceRange: '₹₹₹',
    address: organisationLd().address,
    geo: { '@type': 'GeoCoordinates', latitude: site.address.lat, longitude: site.address.lng },
    areaServed: site.serviceAreas.map((a) => ({ '@type': 'City', name: a })),
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '10:00',
        closes: '19:00',
      },
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: site.stats.avgRating,
      reviewCount: site.stats.reviewCount,
    },
    ...extra,
  };
}

export function serviceLd(s: {
  name: string;
  description: string;
  path: string;
  image?: string;
  min?: number;
  max?: number;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: s.name,
    description: s.description,
    url: absUrl(s.path),
    image: s.image ? absUrl(s.image) : undefined,
    provider: { '@id': `${site.url}/#business` },
    areaServed: { '@type': 'City', name: 'Indore' },
    offers:
      s.min !== undefined
        ? {
            '@type': 'AggregateOffer',
            priceCurrency: 'INR',
            lowPrice: s.min,
            highPrice: s.max,
          }
        : undefined,
  };
}

export function creativeWorkLd(p: {
  name: string;
  description: string;
  path: string;
  image: string;
  dateCreated?: string;
  keywords?: string[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: p.name,
    description: p.description,
    url: absUrl(p.path),
    image: absUrl(p.image),
    dateCreated: p.dateCreated,
    keywords: p.keywords?.join(', '),
    creator: { '@id': `${site.url}/#org` },
  };
}

export function reviewsLd(
  reviews: { author: string; body: string; rating: number; date?: string }[],
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'InteriorDesigner',
    '@id': `${site.url}/#business`,
    name: site.name,
    review: reviews.map((r) => ({
      '@type': 'Review',
      author: { '@type': 'Person', name: r.author },
      reviewBody: r.body,
      datePublished: r.date,
      reviewRating: { '@type': 'Rating', ratingValue: r.rating, bestRating: 5 },
    })),
  };
}

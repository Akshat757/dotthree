import { Suspense } from 'react';

import { ConsultationBooking } from '@/components/consultation/booking';
import { PageHero } from '@/components/shared/page';
import { pageMeta } from '@/lib/seo/metadata';

export const metadata = pageMeta({
  title: 'Book a free design consultation',
  description:
    'Book a free video, phone, studio or home consultation with a Dot 3 designer in Indore. Pick a designer and a slot; we confirm on WhatsApp the same working day.',
  path: '/consultation/',
});

export default function ConsultationPage() {
  return (
    <Suspense
      fallback={
        <PageHero
          crumbs={[{ label: 'Home', href: '/' }, { label: 'Book a consultation' }]}
          overline="Free first consultation"
          title="Loading the booking form…"
        />
      }
    >
      <ConsultationBooking />
    </Suspense>
  );
}

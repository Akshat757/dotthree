import { RoomCard } from '@/components/cards';
import { Container, Section } from '@/components/layout';
import { CtaBand, PageHero } from '@/components/shared/page';
import { roomGuides } from '@/data/demo';
import { breadcrumbLd, JsonLd } from '@/lib/seo/jsonld';
import { pageMeta } from '@/lib/seo/metadata';

export const metadata = pageMeta({
  title: 'Room-by-Room Interior Design Guides',
  description: `${roomGuides.length} room guides for Indian homes — dimensions, storage strategies, realistic Indore costs, common mistakes and the materials that hold up.`,
  path: '/rooms/',
  image: '/og/rooms/default.png',
});

export default function RoomsPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: 'Home', href: '/' },
          { name: 'Rooms', href: '/rooms/' },
        ])}
      />
      <PageHero
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Rooms' }]}
        overline="Room guides"
        title="Plan one room at a time"
        description="Each guide gives you the questions to settle before you brief a designer: dimensions that work, where storage really goes, what it costs in Indore, and the mistakes we keep fixing."
      />
      <Section className="pt-0 md:pt-0">
        <Container>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {roomGuides.map((r) => (
              <RoomCard key={r.slug} room={r} />
            ))}
          </div>
        </Container>
      </Section>
      <CtaBand
        title="Doing just one room?"
        description="Our estimator handles single rooms too — pick the room, the size and the finish tier and you'll have a range in a minute."
      />
    </>
  );
}

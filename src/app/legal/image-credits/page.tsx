import { Container, Section } from '@/components/layout';
import { PageHero, Prose } from '@/components/shared/page';
import { allImages } from '@/data/demo';
import { pageMeta } from '@/lib/seo/metadata';

export const metadata = pageMeta({
  title: 'Image credits',
  description:
    'Where the photographs, illustrations and textures on this demo site come from, and under which licences.',
  path: '/legal/image-credits/',
});

const SOURCE_LABEL: Record<string, string> = {
  unsplash: 'Unsplash',
  pexels: 'Pexels',
  ambientcg: 'ambientCG',
  polyhaven: 'Poly Haven',
  original: 'Original illustrations generated for this demo',
};

export default function ImageCreditsPage() {
  const images = allImages();
  const bySource = new Map<string, number>();
  const photographers = new Map<string, { author: string; url?: string; source: string }>();
  for (const i of images) {
    bySource.set(i.credit.source, (bySource.get(i.credit.source) ?? 0) + 1);
    if (i.credit.author)
      photographers.set(`${i.credit.source}:${i.credit.author}`, {
        author: i.credit.author,
        url: i.credit.url,
        source: i.credit.source,
      });
  }

  return (
    <>
      <PageHero
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Image credits' }]}
        overline="Legal"
        title="Image credits"
        description="Every picture on this demo is either an original illustration made for it or carries a free-to-use licence."
        className="pb-6 md:pb-8"
      />
      <Section className="pt-0 md:pt-0">
        <Container>
          <Prose>
            <h2>Sources</h2>
            <ul>
              {[...bySource.entries()].map(([source, count]) => (
                <li key={source}>
                  {SOURCE_LABEL[source] ?? source}: {count} image{count === 1 ? '' : 's'}
                </li>
              ))}
            </ul>

            <h2>Textures</h2>
            <p>
              Material textures are CC0 (public domain) sets from ambientCG and Poly Haven, or
              procedural patterns generated for this demo. Colour names in the shade library are
              original and are not brand shade names.
            </p>

            {photographers.size > 0 && (
              <>
                <h2>Photographers</h2>
                <ul>
                  {[...photographers.values()].map((p) => (
                    <li key={`${p.source}:${p.author}`}>
                      {p.url ? (
                        <a href={p.url} rel="noopener noreferrer" target="_blank">
                          {p.author}
                        </a>
                      ) : (
                        p.author
                      )}{' '}
                      via {SOURCE_LABEL[p.source] ?? p.source}
                    </li>
                  ))}
                </ul>
              </>
            )}

            <p>
              These are placeholders. They will be replaced with the studio&apos;s own photography
              before launch.
            </p>
          </Prose>
        </Container>
      </Section>
    </>
  );
}

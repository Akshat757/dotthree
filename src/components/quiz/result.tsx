'use client';

import Link from 'next/link';
import { ArrowRight, RotateCcw, Sparkles } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

import { Container, Section } from '@/components/layout';
import { CtaBand, PageHero } from '@/components/shared/page';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/display';
import { Img } from '@/components/ui/img';
import { getStyle, materials, projects, quizProfiles } from '@/data/demo';
import { parseQuizAnswers, scoreQuiz } from '@/lib/quiz/score';
import { breadcrumbLd, JsonLd } from '@/lib/seo/jsonld';

export function QuizResult() {
  const params = useSearchParams();
  const answers = parseQuizAnswers(Object.fromEntries(params.entries()));

  if (!Object.keys(answers).length) {
    return (
      <>
        <PageHero
          crumbs={[
            { label: 'Home', href: '/' },
            { label: 'Style quiz', href: '/quiz/' },
            { label: 'Your match' },
          ]}
          overline="Style quiz"
          title="No result yet"
          description="Take the quick quiz and we’ll suggest your best-fitting design direction."
          actions={
            <Button asChild>
              <Link href="/quiz/">
                <Sparkles className="size-4" aria-hidden /> Start the quiz
              </Link>
            </Button>
          }
        />
      </>
    );
  }

  const profile = scoreQuiz(answers, quizProfiles);
  const style = getStyle(profile.styleSlug);
  if (!style) return null;

  const relatedProjects = projects
    .filter((project) => profile.projectSlugs.includes(project.slug))
    .slice(0, 3);
  const relatedMaterials = materials
    .filter((material) => profile.materialSlugs.includes(material.slug))
    .slice(0, 4);

  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: 'Home', href: '/' },
          { name: 'Style quiz', href: '/quiz/' },
          { name: profile.name, href: '/quiz/result/' },
        ])}
      />
      <PageHero
        crumbs={[
          { label: 'Home', href: '/' },
          { label: 'Style quiz', href: '/quiz/' },
          { label: profile.name },
        ]}
        overline="Your match"
        title={profile.name}
        description={profile.description}
        image={profile.heroImage}
        actions={
          <>
            <Button asChild>
              <Link href={`/styles/${style.slug}/`}>
                See {style.name} <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/quiz/">
                <RotateCcw className="size-4" aria-hidden /> Retake quiz
              </Link>
            </Button>
          </>
        }
      />

      <Section className="pt-0 md:pt-0">
        <Container className="grid gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]">
          <div className="rounded-lg border border-line bg-surface p-6">
            <p className="overline">Why this fits</p>
            <p className="mt-3 text-body text-ink-muted">{style.description}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {style.characteristics.slice(0, 6).map((trait) => (
                <Badge key={trait} tone="outline">
                  {trait}
                </Badge>
              ))}
            </div>
          </div>

          <aside className="rounded-lg border border-line bg-surface-sunk p-6">
            <p className="overline">Best suited to</p>
            <ul className="mt-3 grid gap-3 text-body-s text-ink-muted">
              {style.bestRooms.map((room) => (
                <li key={room} className="capitalize">
                  • {room.replace(/-/g, ' ')}
                </li>
              ))}
            </ul>
          </aside>
        </Container>
      </Section>

      {relatedProjects.length > 0 && (
        <Section tone="sunk">
          <Container>
            <h2 className="font-display text-h2 text-ink">Projects in this direction</h2>
            <div className="mt-6 grid gap-5 md:grid-cols-3">
              {relatedProjects.map((project) => (
                <article
                  key={project.slug}
                  className="overflow-hidden rounded-lg border border-line bg-surface"
                >
                  <Img image={project.heroImage} aspect="4/3" className="block" />
                  <div className="p-4">
                    <p className="font-medium text-ink">{project.title}</p>
                    <p className="mt-1 text-body-s text-ink-muted">{project.locality}</p>
                  </div>
                </article>
              ))}
            </div>
          </Container>
        </Section>
      )}

      {relatedMaterials.length > 0 && (
        <Section>
          <Container>
            <h2 className="font-display text-h2 text-ink">Materials that shape this look</h2>
            <div className="mt-6 flex flex-wrap gap-2">
              {relatedMaterials.map((material) => (
                <Badge key={material.slug} tone="neutral">
                  {material.name}
                </Badge>
              ))}
            </div>
          </Container>
        </Section>
      )}

      <CtaBand
        title="Want a design direction that feels like you?"
        description="We can turn this match into a realistic plan, room-by-room budget and material shortlist for your home in Indore."
        primary={{ label: 'Book a consultation', href: '/consultation/' }}
        secondary={{ label: 'Browse styles', href: '/styles/' }}
      />
    </>
  );
}

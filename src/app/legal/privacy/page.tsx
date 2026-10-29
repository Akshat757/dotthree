import { Container, Section } from '@/components/layout';
import { PageHero, Prose } from '@/components/shared/page';
import { site } from '@/config/site';
import { pageMeta } from '@/lib/seo/metadata';

export const metadata = pageMeta({
  title: 'Privacy policy',
  description: `How ${site.name} handles your information: designs, estimates and enquiries stay on your device until you choose to send them.`,
  path: '/legal/privacy/',
});

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Privacy policy' }]}
        overline="Legal"
        title="Privacy policy"
        description="Short version: we keep what you create on your own device, and we only receive what you choose to send."
        className="pb-6 md:pb-8"
      />
      <Section className="pt-0 md:pt-0">
        <Container>
          <Prose>
            <p>
              <strong>Demo notice.</strong> This site is a demonstration build. This policy
              describes how it behaves today and will be replaced by the studio&apos;s own policy
              before launch.
            </p>

            <h2>What stays on your device</h2>
            <p>
              Saved designs, estimates, enquiries and preferences are stored in your browser
              (IndexedDB and local storage). They are not uploaded to any server. Clearing site
              data, or using “Clear all” in your dashboard, removes them.
            </p>

            <h2>What we receive</h2>
            <p>
              We only receive information you send us on purpose: for example by tapping “Send on
              WhatsApp”, opening an email draft, or contacting {site.name} directly. Anything you
              send is used to respond to your request, such as confirming a consultation slot.
            </p>

            <h2>Third parties</h2>
            <p>
              Pages load without third-party scripts, trackers or fonts. When you tap a WhatsApp,
              calendar or email link, you leave this site and that service&apos;s own policy
              applies.
            </p>

            <h2>Your rights</h2>
            <p>
              Under India&apos;s Digital Personal Data Protection Act 2023 you may ask us to access,
              correct or erase any personal data we hold about you. Write to{' '}
              {site.grievanceOfficer.name} at {site.grievanceOfficer.email}.
            </p>

            <h2>Children</h2>
            <p>This site is not directed at children under 18.</p>
          </Prose>
        </Container>
      </Section>
    </>
  );
}

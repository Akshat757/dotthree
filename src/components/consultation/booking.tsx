'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CalendarPlus, Check, Download, Mail, MapPin, Phone, Video } from 'lucide-react';

import { Container, Section } from '@/components/layout';
import { PageHero } from '@/components/shared/page';
import { Button } from '@/components/ui/button';
import { Badge, Chip } from '@/components/ui/display';
import { Checkbox, SimpleSelect } from '@/components/ui/form-controls';
import { Img } from '@/components/ui/img';
import { Field, Input, Textarea } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { WhatsAppButton } from '@/components/ui/whatsapp-button';
import { site } from '@/config/site';
import { designers, indoreLocalities, nearbyCities } from '@/data/demo';
import { getAdapters, type CalendarLinks, type LeadResult } from '@/lib/adapters';
import { mintReference } from '@/lib/leads/reference';
import { breadcrumbLd, JsonLd } from '@/lib/seo/jsonld';
import { cn } from '@/lib/utils';
import type { Bhk, PropertyType, Weekday } from '@/types/content';
import type { ConsultationType, Enquiry } from '@/types/local';

/* ------------------------------------------------------------------ */

const TYPES: {
  value: ConsultationType;
  label: string;
  minutes: number;
  blurb: string;
  icon: React.ReactNode;
}[] = [
  {
    value: 'VIDEO',
    label: 'Video call',
    minutes: 45,
    blurb: 'Share your plan on screen',
    icon: <Video className="size-4" aria-hidden />,
  },
  {
    value: 'PHONE',
    label: 'Phone call',
    minutes: 20,
    blurb: 'Quick first conversation',
    icon: <Phone className="size-4" aria-hidden />,
  },
  {
    value: 'STUDIO_VISIT',
    label: 'Studio visit',
    minutes: 60,
    blurb: 'See materials in person',
    icon: <MapPin className="size-4" aria-hidden />,
  },
  {
    value: 'HOME_VISIT',
    label: 'Home visit',
    minutes: 90,
    blurb: 'Designer comes to you (Indore)',
    icon: <MapPin className="size-4" aria-hidden />,
  },
];
const BHKS: Bhk[] = ['1BHK', '2BHK', '3BHK', '4BHK+'];
const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: 'APARTMENT', label: 'Apartment' },
  { value: 'VILLA', label: 'Villa / bungalow' },
  { value: 'DUPLEX', label: 'Duplex / penthouse' },
  { value: 'FARMHOUSE', label: 'Farmhouse' },
  { value: 'OFFICE', label: 'Office' },
  { value: 'CLINIC', label: 'Clinic' },
  { value: 'RETAIL', label: 'Retail' },
  { value: 'RESTAURANT', label: 'Restaurant / café' },
];
const WEEKDAYS: Weekday[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const STUDIO_HOURS = ['10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

function isoDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function nextDays(n: number) {
  const out: Date[] = [];
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  for (let i = 1; i <= n; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    out.push(d);
  }
  return out;
}

const PHONE_RE = /^(\+91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}$/;

interface FormState {
  type: ConsultationType;
  designerSlug: string;
  date: string;
  time: string;
  name: string;
  phone: string;
  email: string;
  locality: string;
  pincode: string;
  propertyType: PropertyType;
  bhk: Bhk | '';
  notes: string;
  preferredContact: Enquiry['preferredContact'];
  consent: boolean;
  honeypot: string;
}

/* ------------------------------------------------------------------ */

export function ConsultationBooking() {
  const params = useSearchParams();
  const { toast } = useToast();
  const startedAt = React.useRef(Date.now());

  const [form, setForm] = React.useState<FormState>(() => ({
    type: 'VIDEO',
    designerSlug: designers.some((d) => d.slug === params.get('designer'))
      ? (params.get('designer') as string)
      : '',
    date: '',
    time: '',
    name: '',
    phone: '',
    email: '',
    locality: '',
    pincode: '',
    propertyType: 'APARTMENT',
    bhk: (['1BHK', '2BHK', '3BHK', '4BHK+'] as const).find((b) => b === params.get('bhk')) ?? '',
    notes: (params.get('note') ?? '').slice(0, 400),
    preferredContact: 'WHATSAPP',
    consent: false,
    honeypot: '',
  }));
  const [errors, setErrors] = React.useState<Partial<Record<keyof FormState, string>>>({});
  const [busy, setBusy] = React.useState(false);
  const [done, setDone] = React.useState<{
    enquiry: Enquiry;
    lead: LeadResult;
    calendar: CalendarLinks | null;
  } | null>(null);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const designer = designers.find((d) => d.slug === form.designerSlug);
  const days = React.useMemo(() => nextDays(21), []);

  const slotsFor = (date: string): string[] => {
    if (!date) return [];
    const wd = WEEKDAYS[new Date(`${date}T00:00:00`).getDay()] as Weekday;
    if (designer) {
      if (designer.availability.blockedDates.includes(date)) return [];
      return designer.availability.slots[wd] ?? [];
    }
    if (wd === 'sun') return [];
    return wd === 'sat' ? STUDIO_HOURS.slice(0, 5) : STUDIO_HOURS;
  };

  const needsVisit = form.type === 'HOME_VISIT' || form.type === 'SITE_MEASUREMENT';
  const outOfArea =
    needsVisit &&
    /^\d{6}$/.test(form.pincode) &&
    !site.serviceablePinPrefixes.some((p) => form.pincode.startsWith(p));

  const validate = () => {
    const e: typeof errors = {};
    if (form.name.trim().length < 2) e.name = 'Please tell us your name.';
    if (!PHONE_RE.test(form.phone.trim())) e.phone = 'Enter a valid Indian mobile number.';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = 'That email does not look right.';
    if (form.pincode && !/^\d{6}$/.test(form.pincode)) e.pincode = 'PIN codes are six digits.';
    else if (outOfArea) e.pincode = 'That PIN is outside our visiting area.';
    if (!form.date) e.date = 'Pick a day.';
    if (!form.time) e.time = 'Pick a time.';
    if (!form.consent) e.consent = 'We need your consent to contact you.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setBusy(true);
    try {
      const adapters = getAdapters();
      const guard = await adapters.botGuard.verify({
        honeypot: form.honeypot,
        startedAt: startedAt.current,
        submittedAt: Date.now(),
      });
      if (!guard.ok) {
        toast({
          title: 'Please try again',
          description: 'The form was submitted too quickly.',
          tone: 'warning',
        });
        return;
      }

      const typeMeta = TYPES.find((t) => t.value === form.type)!;
      const localityName =
        [...indoreLocalities, ...nearbyCities].find((l) => l.slug === form.locality)?.name ??
        undefined;
      const reference = mintReference();
      const summaryText = [
        `Consultation request ${reference}`,
        `Type: ${typeMeta.label} (${typeMeta.minutes} min)`,
        designer ? `Designer: ${designer.name}` : 'Designer: any available',
        `Slot: ${form.date} at ${form.time}`,
        '',
        `Name: ${form.name.trim()}`,
        `Phone: ${form.phone.trim()}`,
        form.email && `Email: ${form.email.trim()}`,
        `Contact me by: ${form.preferredContact}`,
        '',
        `Property: ${PROPERTY_TYPES.find((p) => p.value === form.propertyType)?.label}${form.bhk ? `, ${form.bhk}` : ''}`,
        localityName && `Locality: ${localityName}`,
        form.pincode && `PIN: ${form.pincode}`,
        form.notes.trim() && `Notes: ${form.notes.trim()}`,
      ]
        .filter(Boolean)
        .join('\n');

      const enquiry: Enquiry = {
        reference,
        createdAt: Date.now(),
        type: form.type,
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || undefined,
        city: 'Indore',
        locality: form.locality || undefined,
        pincode: form.pincode || undefined,
        propertyType: form.propertyType,
        bhk: form.bhk || undefined,
        preferredSlot: { date: form.date, time: form.time },
        preferredContact: form.preferredContact,
        designerSlug: form.designerSlug || undefined,
        notes: form.notes.trim() || undefined,
        vastu: 'NONE',
        consent: true,
        summaryText,
        status: 'SUBMITTED',
        source: 'web/consultation',
      };

      const lead = await adapters.leads.submit(enquiry);
      const calendar = await adapters.notifier.confirm(enquiry);
      setDone({ enquiry, lead, calendar });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      toast({
        title: 'Something went wrong',
        description: 'Please WhatsApp us directly instead.',
        tone: 'danger',
      });
    } finally {
      setBusy(false);
    }
  };

  /* ---------------------------- Success ---------------------------- */
  if (done) {
    const typeMeta = TYPES.find((t) => t.value === done.enquiry.type)!;
    return (
      <>
        <PageHero
          crumbs={[
            { label: 'Home', href: '/' },
            { label: 'Consultation', href: '/consultation/' },
            { label: 'Requested' },
          ]}
          overline="Request received"
          title={`Reference ${done.enquiry.reference}`}
          description={`We've noted a ${typeMeta.label.toLowerCase()} on ${done.enquiry.preferredSlot?.date} at ${done.enquiry.preferredSlot?.time}. Send it to us on WhatsApp so a designer can confirm the slot.`}
          actions={
            <>
              {done.lead.whatsappUrl && (
                <Button asChild variant="whatsapp" size="lg">
                  <a href={done.lead.whatsappUrl} target="_blank" rel="noopener noreferrer">
                    Send on WhatsApp
                  </a>
                </Button>
              )}
              {done.lead.mailtoUrl && (
                <Button asChild variant="outline" size="lg">
                  <a href={done.lead.mailtoUrl}>
                    <Mail className="size-4" aria-hidden /> Email instead
                  </a>
                </Button>
              )}
            </>
          }
        />
        <Section className="pt-0 md:pt-0">
          <Container className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-lg border border-line bg-surface p-6">
              <p className="overline">What we'll receive</p>
              <pre className="mt-3 font-sans text-body-s whitespace-pre-wrap text-ink-muted">
                {done.enquiry.summaryText}
              </pre>
            </div>
            <div className="grid content-start gap-4">
              {done.calendar && (
                <div className="rounded-lg border border-line bg-surface p-6">
                  <p className="overline">Add to your calendar</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button asChild variant="outline">
                      <a
                        href={done.calendar.googleCalendarUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <CalendarPlus className="size-4" aria-hidden /> Google Calendar
                      </a>
                    </Button>
                    <IcsDownload
                      blob={done.calendar.icsBlob}
                      filename={done.calendar.icsFilename}
                    />
                  </div>
                </div>
              )}
              <div className="rounded-lg border border-line bg-surface p-6">
                <p className="overline">Next</p>
                <ul className="mt-3 grid gap-2 text-body-s text-ink-muted">
                  <li>
                    • A designer confirms the slot on WhatsApp within studio hours (
                    {site.businessHours.weekdays}).
                  </li>
                  <li>
                    • Keep your floor plan or a few photos handy — it makes the first conversation
                    twice as useful.
                  </li>
                  <li>
                    • This request is also saved in{' '}
                    <Link href="/dashboard/" className="text-accent underline">
                      your dashboard
                    </Link>{' '}
                    on this device.
                  </li>
                </ul>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="ghost">
                  <Link href="/estimate/">Get a cost estimate</Link>
                </Button>
                <Button asChild variant="ghost">
                  <Link href="/projects/">Browse projects</Link>
                </Button>
              </div>
            </div>
          </Container>
        </Section>
      </>
    );
  }

  /* ----------------------------- Form ------------------------------ */
  const slots = slotsFor(form.date);
  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: 'Home', href: '/' },
          { name: 'Book a consultation', href: '/consultation/' },
        ])}
      />
      <PageHero
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Book a consultation' }]}
        overline="Free first consultation"
        title={
          designer
            ? `Book time with ${designer.name.split(' ')[0]}`
            : 'Pick a designer, a slot, and we take it from there'
        }
        description="No payment, no obligation. Choose how you'd like to meet and when; we confirm on WhatsApp the same working day."
        className="pb-6 md:pb-8"
      />

      <Section className="pt-0 md:pt-0">
        <Container>
          <form
            onSubmit={submit}
            noValidate
            className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]"
          >
            <div className="grid gap-8">
              {/* Type */}
              <fieldset className="grid gap-3">
                <legend className="font-display text-h3 text-ink">
                  How would you like to meet?
                </legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  {TYPES.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => set('type', t.value)}
                      aria-pressed={form.type === t.value}
                      className={cn(
                        'flex items-start gap-3 rounded-md border p-4 text-left transition-colors',
                        form.type === t.value
                          ? 'border-ink bg-ink text-canvas'
                          : 'border-line bg-surface hover:bg-surface-sunk',
                      )}
                    >
                      <span
                        className={cn(
                          'mt-0.5',
                          form.type === t.value ? 'text-canvas' : 'text-accent',
                        )}
                      >
                        {t.icon}
                      </span>
                      <span>
                        <span className="block font-medium">{t.label}</span>
                        <span
                          className={cn(
                            'block text-caption',
                            form.type === t.value ? 'text-canvas/80' : 'text-ink-muted',
                          )}
                        >
                          {t.blurb} · {t.minutes} min
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              </fieldset>

              {/* Designer */}
              <fieldset className="grid gap-3">
                <legend className="font-display text-h3 text-ink">With whom?</legend>
                <div className="flex flex-wrap gap-2">
                  <Chip
                    selected={!form.designerSlug}
                    onClick={() => {
                      set('designerSlug', '');
                      set('time', '');
                    }}
                  >
                    Any available designer
                  </Chip>
                  {designers.map((d) => (
                    <Chip
                      key={d.slug}
                      selected={form.designerSlug === d.slug}
                      onClick={() => {
                        set('designerSlug', d.slug);
                        set('time', '');
                      }}
                    >
                      {d.name}
                    </Chip>
                  ))}
                </div>
                {designer && (
                  <div className="flex items-center gap-4 rounded-md border border-line bg-surface p-4">
                    <Img
                      image={designer.photo}
                      aspect="1/1"
                      className="size-14 shrink-0 rounded-full"
                      sizes="56px"
                    />
                    <div className="min-w-0">
                      <p className="font-medium text-ink">
                        {designer.name}{' '}
                        <span className="font-normal text-ink-muted">· {designer.role}</span>
                      </p>
                      <p className="truncate text-caption text-ink-muted">
                        {designer.specialisations.join(' · ')}
                      </p>
                    </div>
                    <Button asChild variant="link" size="sm" className="ml-auto shrink-0">
                      <Link href={`/studio/${designer.slug}/`}>Profile</Link>
                    </Button>
                  </div>
                )}
              </fieldset>

              {/* Slot */}
              <fieldset className="grid gap-3">
                <legend className="font-display text-h3 text-ink">When suits you?</legend>
                <div
                  className="-mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-2"
                  role="radiogroup"
                  aria-label="Day"
                >
                  {days.map((d) => {
                    const iso = isoDate(d);
                    const open = slotsFor(iso).length > 0;
                    const selected = form.date === iso;
                    return (
                      <button
                        key={iso}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        disabled={!open}
                        onClick={() => {
                          set('date', iso);
                          set('time', '');
                        }}
                        className={cn(
                          'flex w-16 shrink-0 snap-start flex-col items-center rounded-md border py-2 text-caption transition-colors disabled:opacity-40',
                          selected
                            ? 'border-ink bg-ink text-canvas'
                            : 'border-line bg-surface hover:bg-surface-sunk',
                        )}
                      >
                        <span className="uppercase">
                          {d.toLocaleDateString('en-IN', { weekday: 'short' })}
                        </span>
                        <span className="tabular font-display text-h3">{d.getDate()}</span>
                        <span>{d.toLocaleDateString('en-IN', { month: 'short' })}</span>
                      </button>
                    );
                  })}
                </div>
                {errors.date && (
                  <p role="alert" className="text-caption text-danger">
                    {errors.date}
                  </p>
                )}
                {form.date && (
                  <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Time">
                    {slots.map((t) => (
                      <Chip
                        key={t}
                        size="sm"
                        selected={form.time === t}
                        onClick={() => set('time', t)}
                        role="radio"
                        aria-checked={form.time === t}
                      >
                        {t}
                      </Chip>
                    ))}
                    {slots.length === 0 && (
                      <p className="text-body-s text-ink-muted">No slots that day — try another.</p>
                    )}
                  </div>
                )}
                {errors.time && (
                  <p role="alert" className="text-caption text-danger">
                    {errors.time}
                  </p>
                )}
              </fieldset>

              {/* About the home */}
              <fieldset className="grid gap-4">
                <legend className="font-display text-h3 text-ink">A little about the home</legend>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field id="c-type" label="Property type">
                    {(a) => (
                      <SimpleSelect
                        {...a}
                        value={form.propertyType}
                        onValueChange={(v) => set('propertyType', v as PropertyType)}
                        options={PROPERTY_TYPES}
                      />
                    )}
                  </Field>
                  <div className="grid gap-1.5">
                    <span className="text-body-s font-medium text-ink">Size</span>
                    <div className="flex flex-wrap gap-2">
                      {BHKS.map((b) => (
                        <Chip
                          key={b}
                          size="sm"
                          selected={form.bhk === b}
                          onClick={() => set('bhk', form.bhk === b ? '' : b)}
                        >
                          {b}
                        </Chip>
                      ))}
                    </div>
                  </div>
                  <Field id="c-locality" label="Locality" optional>
                    {(a) => (
                      <SimpleSelect
                        {...a}
                        value={form.locality || '__none'}
                        onValueChange={(v) => set('locality', v === '__none' ? '' : v)}
                        options={[
                          { value: '__none', label: 'Select…' },
                          ...indoreLocalities.map((l) => ({ value: l.slug, label: l.name })),
                          ...nearbyCities.map((l) => ({
                            value: l.slug,
                            label: `${l.name} (city)`,
                          })),
                        ]}
                      />
                    )}
                  </Field>
                  <Field id="c-pin" label="PIN code" optional error={errors.pincode}>
                    {(a) => (
                      <Input
                        {...a}
                        inputMode="numeric"
                        maxLength={6}
                        value={form.pincode}
                        onChange={(e) => set('pincode', e.target.value.replace(/\D/g, ''))}
                      />
                    )}
                  </Field>
                </div>
                {outOfArea && (
                  <div
                    role="alert"
                    className="rounded-md border border-warning/40 bg-warning/10 p-4 text-body-s text-ink"
                  >
                    <p className="font-medium">
                      Home visits cover Indore district only (PIN codes starting{' '}
                      {site.serviceablePinPrefixes.join(' or ')}).
                    </p>
                    <p className="mt-1 text-ink-muted">
                      We can still help: a free video consultation works from anywhere, and a
                      designer can plan a visit once we have talked.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={() => set('type', 'VIDEO')}
                    >
                      <Video className="size-4" aria-hidden /> Switch to a video consultation
                    </Button>
                  </div>
                )}
                <Field
                  id="c-notes"
                  label="Anything we should know?"
                  optional
                  hint="Timeline, must-haves, what's bothering you about the current space."
                >
                  {(a) => (
                    <Textarea
                      {...a}
                      maxLength={1200}
                      value={form.notes}
                      onChange={(e) => set('notes', e.target.value)}
                    />
                  )}
                </Field>
              </fieldset>
            </div>

            {/* Contact + submit */}
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="grid gap-4 rounded-lg border border-line bg-surface p-5 sm:p-7">
                <h3 className="font-display text-h3 text-ink">Your details</h3>
                <Field id="c-name" label="Name" required error={errors.name}>
                  {(a) => (
                    <Input
                      {...a}
                      autoComplete="name"
                      maxLength={80}
                      value={form.name}
                      onChange={(e) => set('name', e.target.value)}
                    />
                  )}
                </Field>
                <Field
                  id="c-phone"
                  label="Mobile"
                  required
                  error={errors.phone}
                  hint="We confirm on WhatsApp."
                >
                  {(a) => (
                    <Input
                      {...a}
                      type="tel"
                      autoComplete="tel"
                      inputMode="tel"
                      maxLength={16}
                      value={form.phone}
                      onChange={(e) => set('phone', e.target.value)}
                    />
                  )}
                </Field>
                <Field id="c-email" label="Email" optional error={errors.email}>
                  {(a) => (
                    <Input
                      {...a}
                      type="email"
                      autoComplete="email"
                      maxLength={120}
                      value={form.email}
                      onChange={(e) => set('email', e.target.value)}
                    />
                  )}
                </Field>
                <div className="grid gap-1.5">
                  <span className="text-body-s font-medium text-ink">Reach me by</span>
                  <div className="flex flex-wrap gap-2">
                    {(['WHATSAPP', 'CALL', 'EMAIL'] as const).map((c) => (
                      <Chip
                        key={c}
                        size="sm"
                        selected={form.preferredContact === c}
                        onClick={() => set('preferredContact', c)}
                      >
                        {c === 'WHATSAPP' ? 'WhatsApp' : c === 'CALL' ? 'Call' : 'Email'}
                      </Chip>
                    ))}
                  </div>
                </div>

                {/* Honeypot — hidden from humans */}
                <div
                  className="absolute top-auto -left-[9999px] h-px w-px overflow-hidden"
                  aria-hidden
                >
                  <label htmlFor="c-website">Website</label>
                  <input
                    id="c-website"
                    tabIndex={-1}
                    autoComplete="off"
                    value={form.honeypot}
                    onChange={(e) => set('honeypot', e.target.value)}
                  />
                </div>

                <label
                  htmlFor="c-consent"
                  className="flex cursor-pointer items-start gap-2.5 text-caption text-ink-muted"
                >
                  <Checkbox
                    id="c-consent"
                    checked={form.consent}
                    onCheckedChange={(v) => set('consent', v === true)}
                    aria-invalid={errors.consent ? true : undefined}
                  />
                  <span>
                    I agree to be contacted about this request and have read the{' '}
                    <Link href="/legal/privacy/" className="text-accent underline">
                      privacy policy
                    </Link>
                    .
                  </span>
                </label>
                {errors.consent && (
                  <p role="alert" className="text-caption text-danger">
                    {errors.consent}
                  </p>
                )}

                <Button type="submit" size="lg" loading={busy} fullWidth>
                  <Check className="size-4" aria-hidden /> Request this slot
                </Button>
                <p className="text-center text-caption text-ink-subtle">
                  Nothing is sent until you tap “Send on WhatsApp” on the next screen.
                </p>
              </div>

              <div className="mt-4 rounded-lg border border-line bg-surface-sunk p-5">
                <p className="overline">Prefer to just message?</p>
                <p className="mt-1 text-body-s text-ink-muted">
                  Skip the form — a designer picks up during studio hours.
                </p>
                <WhatsAppButton
                  className="mt-3"
                  message={
                    designer
                      ? `Hi, I'd like to book a consultation with ${designer.name}.`
                      : undefined
                  }
                />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Badge tone="forest">Free</Badge>
                <Badge tone="outline">No obligation</Badge>
                <Badge tone="outline">{site.serviceAreas.slice(0, 4).join(' · ')}</Badge>
              </div>
            </aside>
          </form>
        </Container>
      </Section>
    </>
  );
}

function IcsDownload({ blob, filename }: { blob: Blob; filename: string }) {
  const [href, setHref] = React.useState<string>('');
  React.useEffect(() => {
    const url = URL.createObjectURL(blob);
    setHref(url);
    return () => URL.revokeObjectURL(url);
  }, [blob]);
  if (!href) return null;
  return (
    <Button asChild variant="outline">
      <a href={href} download={filename}>
        <Download className="size-4" aria-hidden /> Apple / Outlook (.ics)
      </a>
    </Button>
  );
}

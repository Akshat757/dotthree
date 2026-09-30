'use client';

import { Inbox, Search } from 'lucide-react';
import * as React from 'react';

import { Container } from '@/components/layout';
import {
  Avatar,
  Badge,
  Breadcrumb,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardSkeleton,
  CardTitle,
  CheckboxField,
  Chip,
  Combobox,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  EmptyState,
  FaqAccordion,
  Field,
  Input,
  Pagination,
  PriceRange,
  RatingStars,
  SectionHeader,
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
  SimpleSelect,
  Slider,
  StepIndicator,
  SwitchField,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  Timeline,
  Tooltip,
  useToast,
  WhatsAppButton,
} from '@/components/ui';

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-4 border-t border-line py-10">
      <h2 className="font-display text-h3">{title}</h2>
      {children}
    </section>
  );
}

const variants = [
  'primary',
  'secondary',
  'outline',
  'ghost',
  'soft',
  'link',
  'whatsapp',
  'danger',
] as const;

export default function ComponentsGallery() {
  const { toast } = useToast();
  const [page, setPage] = React.useState(3);
  const [combo, setCombo] = React.useState<string | null>(null);
  const [range, setRange] = React.useState([15, 40]);

  return (
    <Container className="py-12">
      <SectionHeader
        overline="Dev"
        title="Component gallery"
        description="Every primitive in the UI kit, rendered once. Toggle theme, text size and contrast from the header to audit tokens."
      />

      <Block title="Buttons">
        <div className="flex flex-wrap gap-3">
          {variants.map((v) => (
            <Button key={v} variant={v}>
              {v}
            </Button>
          ))}
          <Button loading>Loading</Button>
          <Button disabled>Disabled</Button>
          <Button size="sm">Small</Button>
          <Button size="lg">Large</Button>
          <WhatsAppButton />
        </div>
      </Block>

      <Block title="Badges & chips">
        <div className="flex flex-wrap items-center gap-2">
          {(['neutral', 'accent', 'success', 'warning', 'danger', 'gold', 'outline'] as const).map(
            (t) => (
              <Badge key={t} tone={t}>
                {t}
              </Badge>
            ),
          )}
          <Chip>Filter</Chip>
          <Chip selected>Selected</Chip>
          <Chip onRemove={() => undefined}>Removable</Chip>
        </div>
      </Block>

      <Block title="Form controls">
        <div className="grid max-w-xl gap-5">
          <Field id="f-name" label="Full name" hint="As on your Aadhaar card" required>
            {(p) => <Input {...p} placeholder="Priya Sharma" />}
          </Field>
          <Field id="f-search" label="Search" error="No results for that pincode">
            {(p) => <Input {...p} leading={<Search />} placeholder="452010" />}
          </Field>
          <Field id="f-msg" label="Message">
            {(p) => <Textarea {...p} rows={3} />}
          </Field>
          <Field id="f-room" label="Room type">
            {(p) => (
              <SimpleSelect
                {...p}
                placeholder="Choose a room"
                options={[
                  { value: 'living', label: 'Living room' },
                  { value: 'kitchen', label: 'Kitchen' },
                ]}
              />
            )}
          </Field>
          <Field id="f-locality" label="Locality">
            {(p) => (
              <Combobox
                {...p}
                placeholder="Type to search…"
                options={[
                  { value: 'vijay-nagar', label: 'Vijay Nagar' },
                  { value: 'bicholi-mardana', label: 'Bicholi Mardana' },
                  { value: 'palasia', label: 'Palasia' },
                ]}
                value={combo}
                onChange={setCombo}
              />
            )}
          </Field>
          <CheckboxField id="cb" label="I agree to be contacted on WhatsApp" />
          <SwitchField id="sw" label="Include false ceiling" hint="Adds ₹90–140/sqft" />
          <Slider
            value={range}
            onValueChange={setRange}
            min={5}
            max={80}
            step={1}
            thumbLabels={['Minimum budget', 'Maximum budget']}
            formatValue={(v) => `₹${v}L`}
          />
        </div>
      </Block>

      <Block title="Overlays">
        <div className="flex flex-wrap gap-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Save this estimate?</DialogTitle>
                <DialogDescription>Stored locally on this device only.</DialogDescription>
              </DialogHeader>
              <Button>Save</Button>
            </DialogContent>
          </Dialog>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">Sheet</Button>
            </SheetTrigger>
            <SheetContent>
              <SheetTitle>Filters</SheetTitle>
            </SheetContent>
          </Sheet>
          <Tooltip label="Tooltips are keyboard-reachable">
            <Button variant="outline">Tooltip</Button>
          </Tooltip>
          <Button
            variant="outline"
            onClick={() =>
              toast({
                title: 'Saved',
                description: 'Estimate stored on this device.',
                tone: 'success',
              })
            }
          >
            Toast
          </Button>
        </div>
      </Block>

      <Block title="Disclosure">
        <Tabs defaultValue="a" className="max-w-xl">
          <TabsList>
            <TabsTrigger value="a">Overview</TabsTrigger>
            <TabsTrigger value="b">Materials</TabsTrigger>
          </TabsList>
          <TabsContent value="a">Tab A content</TabsContent>
          <TabsContent value="b">Tab B content</TabsContent>
        </Tabs>
        <FaqAccordion
          className="max-w-xl"
          items={[
            { q: 'How long does a 3BHK take?', a: '10–14 weeks from design freeze.' },
            { q: 'Do you handle civil work?', a: 'Yes, through empanelled contractors.' },
          ]}
        />
      </Block>

      <Block title="Display">
        <div className="grid gap-6 md:grid-cols-3">
          <Card interactive>
            <CardHeader>
              <CardTitle>Card title</CardTitle>
              <CardDescription>Supporting copy in muted ink.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-3">
              <Avatar name="Priya Sharma" />
              <RatingStars value={4.5} />
            </CardContent>
          </Card>
          <CardSkeleton />
          <EmptyState
            icon={<Inbox />}
            title="Nothing saved yet"
            description="Boards you create will appear here."
            action={<Button size="sm">Start a board</Button>}
          />
        </div>
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Projects', href: '/projects' },
            { label: 'Mahalaxmi Nagar 3BHK' },
          ]}
        />
        <PriceRange low={1800000} high={2600000} size="lg" />
        <StepIndicator steps={['Home', 'Rooms', 'Finish', 'Result']} current={1} />
        <Pagination page={page} pageCount={9} onChange={setPage} />
        <Timeline
          items={[
            { id: '1', title: 'Design freeze', meta: '12 Aug', tone: 'success' },
            {
              id: '2',
              title: 'Site measurement',
              meta: '18 Aug',
              tone: 'accent',
              body: 'Laser-measured; drawings updated.',
            },
            { id: '3', title: 'Modular production', meta: 'Sep', tone: 'neutral' },
          ]}
        />
      </Block>
    </Container>
  );
}

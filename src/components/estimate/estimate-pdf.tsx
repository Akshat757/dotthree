import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';

import { site } from '@/config/site';
import { formatWeeks, labelRoom } from '@/lib/pricing';
import type { EstimateInput, EstimateResult } from '@/types/local';

/**
 * Printable estimate. Built-in PDF fonts have no rupee glyph, so amounts are written "Rs".
 * Loaded on demand (dynamic import) so the PDF library never weighs on the estimator's first load.
 */

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: 'Helvetica', color: '#1c1a17' },
  brand: { fontSize: 18, fontFamily: 'Helvetica-Bold' },
  muted: { color: '#6b655c' },
  h2: { fontSize: 12, fontFamily: 'Helvetica-Bold', marginTop: 18, marginBottom: 6 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2.5 },
  rowBorder: { borderBottomWidth: 0.5, borderBottomColor: '#d9d3c8' },
  totalBox: { marginTop: 14, padding: 12, backgroundColor: '#f4efe6' },
  total: { fontSize: 20, fontFamily: 'Helvetica-Bold', marginTop: 4 },
  footer: { position: 'absolute', bottom: 28, left: 40, right: 40, fontSize: 8, color: '#6b655c' },
});

const inr = (n: number) => `Rs ${Math.round(n).toLocaleString('en-IN')}`;
const range = (r: { low: number; high: number }) => `${inr(r.low)} - ${inr(r.high)}`;

const CATEGORY_LABELS: Record<string, string> = {
  MODULAR: 'Modular (kitchen, wardrobes, units)',
  LOOSE_FURNITURE: 'Loose furniture',
  FALSE_CEILING: 'False ceiling',
  PAINTING: 'Painting',
  ELECTRICAL: 'Electrical & lighting',
  CIVIL: 'Civil & plumbing',
  DECOR: 'Decor & soft furnishing',
  DESIGN_FEE: 'Design fee',
  EXECUTION: 'Execution & site management',
};

export function EstimatePdf({
  input,
  result,
  tierLabel,
}: {
  input: EstimateInput;
  result: EstimateResult;
  tierLabel: string;
}) {
  const emi36 = result.emi.find((e) => e.months === 36);
  return (
    <Document title={`Estimate - ${site.name}`} author={site.name}>
      <Page size="A4" style={styles.page}>
        <Text style={styles.brand}>{site.name}</Text>
        <Text style={styles.muted}>
          {site.address.line2}, {site.address.city} · {site.phone} · {site.email}
        </Text>

        <View style={styles.totalBox}>
          <Text style={styles.muted}>Indicative range, incl. GST</Text>
          <Text style={styles.total}>{range(result.total)}</Text>
          <Text style={styles.muted}>
            {input.bhk} · {input.carpetAreaSqft} sq ft · {tierLabel} · {input.rooms.length} rooms
          </Text>
          <Text style={styles.muted}>
            Timeline {formatWeeks(result.timelineWeeks)}
            {emi36 ? ` · EMI (36 mo) ${range(emi36)} / month` : ''}
          </Text>
        </View>

        <Text style={styles.h2}>By category</Text>
        {result.byCategory
          .filter((c) => c.high > 0)
          .map((c) => (
            <View key={c.category} style={[styles.row, styles.rowBorder]}>
              <Text>{CATEGORY_LABELS[c.category] ?? c.category}</Text>
              <Text>{range(c)}</Text>
            </View>
          ))}

        <Text style={styles.h2}>By room</Text>
        {result.byRoom.map((r) => (
          <View key={r.room} style={[styles.row, styles.rowBorder]}>
            <Text>{labelRoom(r.room)}</Text>
            <Text>{range(r)}</Text>
          </View>
        ))}

        <Text style={styles.footer} fixed>
          Indicative only, based on price book {result.priceBookVersion}. Not included:{' '}
          {result.exclusions.join('; ')}.
          {site.isDemoContent ? ' Demo content - figures are illustrative.' : ''}
        </Text>
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={styles.h2}>Line items</Text>
        {result.lines.map((l) => (
          <View key={l.id} style={[styles.row, styles.rowBorder]} wrap={false}>
            <Text style={{ maxWidth: 300 }}>
              {l.label}
              {l.qty !== undefined && l.unit ? ` (${l.qty} ${l.unit})` : ''}
            </Text>
            <Text>{range(l)}</Text>
          </View>
        ))}
        <View style={[styles.row, { marginTop: 8 }]}>
          <Text>Subtotal</Text>
          <Text>{range(result.subtotal)}</Text>
        </View>
        <View style={styles.row}>
          <Text>GST</Text>
          <Text>{range(result.gst)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={{ fontFamily: 'Helvetica-Bold' }}>Total</Text>
          <Text style={{ fontFamily: 'Helvetica-Bold' }}>{range(result.total)}</Text>
        </View>
        <Text style={styles.footer} fixed>
          {site.name} · {site.address.city} · Price book {result.priceBookVersion}
        </Text>
      </Page>
    </Document>
  );
}

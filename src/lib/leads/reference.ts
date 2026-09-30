/**
 * Enquiry reference numbers — `IND-YYMM-####` from a timestamp + checksum (FR-H-01).
 */
export function mintReference(now = new Date(), entropy?: number): string {
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const seed = entropy ?? now.getTime();
  // Fold the timestamp (and optional entropy) into 3 digits + 1 checksum digit.
  const base = Math.abs(hash32(String(seed))) % 1000;
  const check = (base * 7 + Number(yy) * 3 + Number(mm)) % 10;
  return `IND-${yy}${mm}-${String(base).padStart(3, '0')}${check}`;
}

export function isValidReference(ref: string): boolean {
  const m = /^IND-(\d{2})(\d{2})-(\d{3})(\d)$/.exec(ref);
  if (!m) return false;
  const [, yy, mm, base, check] = m;
  const expected = (Number(base) * 7 + Number(yy) * 3 + Number(mm)) % 10;
  return Number(check) === expected;
}

function hash32(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h | 0;
}

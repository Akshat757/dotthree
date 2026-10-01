/** Reducing-balance EMI (standard amortisation formula). */
export const EMI_TENURES = [12, 24, 36] as const;

export function emi(principal: number, annualRatePct: number, months: number): number {
  if (principal <= 0 || months <= 0) return 0;
  const r = annualRatePct / 12 / 100;
  if (r === 0) return Math.round(principal / months);
  const f = Math.pow(1 + r, months);
  return Math.round((principal * r * f) / (f - 1));
}

export function emiSchedule(
  total: { low: number; high: number },
  annualRatePct: number,
  tenures: readonly number[] = EMI_TENURES,
): { months: number; low: number; high: number }[] {
  return tenures.map((months) => ({
    months,
    low: emi(total.low, annualRatePct, months),
    high: emi(total.high, annualRatePct, months),
  }));
}

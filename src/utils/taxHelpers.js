/**
 * Safe number parsing — returns 0 for empty/invalid values.
 */
export const parseNum = (n) => parseFloat(n) || 0;

/**
 * Format a number as US currency (absolute value, 2 decimal places).
 */
export const fmt = (n) =>
  Math.abs(n).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

/**
 * Tax on ordinary income using progressive brackets [{ min, max, rate }].
 */
export function computeTax(taxableIncome, brackets) {
  let tax = 0;
  for (const b of brackets) {
    if (taxableIncome <= b.min) break;
    const chunk = Math.min(taxableIncome, b.max) - b.min;
    tax += chunk * b.rate;
  }
  return tax;
}

/**
 * Tax on qualified dividends + LTCG using the "stacking" method.
 * Preferential-rate income is stacked on top of ordinary income so
 * it occupies the highest slices of taxable income first.
 * ltcgBrackets are [{ max, rate }].
 */
export function computeLTCGTax(ordinaryIncome, preferentialIncome, ltcgBrackets) {
  let tax = 0;
  let remaining = preferentialIncome;
  let cursor = ordinaryIncome;

  for (const tier of ltcgBrackets) {
    if (remaining <= 0) break;
    const spaceInTier = Math.max(0, tier.max - cursor);
    const taxableHere = Math.min(remaining, spaceInTier);
    tax += taxableHere * tier.rate;
    remaining -= taxableHere;
    cursor += taxableHere;
  }
  return tax;
}

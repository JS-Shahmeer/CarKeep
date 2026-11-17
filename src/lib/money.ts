/**
 * Money is stored as integer minor units (e.g. cents) to avoid float drift
 * (brief section 04). There's no currency selector yet (brief: "currency"
 * is a Settings field that lands with module 9 polish / a later pass), so
 * this only handles the major/minor conversion, not symbols or locales.
 */

export function majorToMinor(amount: number): number {
  return Math.round(amount * 100);
}

export function minorToMajor(minor: number): number {
  return minor / 100;
}

export function formatMinor(minor: number): string {
  return minorToMajor(minor).toFixed(2);
}

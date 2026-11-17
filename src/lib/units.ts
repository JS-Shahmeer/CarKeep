/**
 * Distance is stored canonically in whole metres (R01). Conversion happens
 * only at the display boundary, with one fixed rounding rule, so switching
 * the display unit never changes the underlying reading.
 */

export type DistanceUnit = "km" | "mi";

const METERS_PER_KM = 1000;
const METERS_PER_MILE = 1609.344;

export function metersToDisplay(meters: number, unit: DistanceUnit): number {
  const value = unit === "km" ? meters / METERS_PER_KM : meters / METERS_PER_MILE;
  return Math.round(value);
}

export function displayToMeters(value: number, unit: DistanceUnit): number {
  const meters = unit === "km" ? value * METERS_PER_KM : value * METERS_PER_MILE;
  return Math.round(meters);
}

export function formatDistance(meters: number, unit: DistanceUnit): string {
  return `${metersToDisplay(meters, unit).toLocaleString()} ${unit}`;
}

import { displayToMeters, formatDistance, metersToDisplay } from "../src/lib/units";

describe("units", () => {
  it("round-trips km to meters without drift", () => {
    const meters = displayToMeters(100, "km");
    expect(meters).toBe(100000);
    expect(metersToDisplay(meters, "km")).toBe(100);
  });

  it("converts meters to miles with the fixed divisor", () => {
    expect(metersToDisplay(1609344, "mi")).toBe(1000);
  });

  it("re-reading the same stored value in the same unit never drifts (R01)", () => {
    const meters = displayToMeters(100, "km");
    // Round-tripping through the *same* display unit must be exact: the
    // stored value never changes just because it was displayed again.
    expect(displayToMeters(metersToDisplay(meters, "km"), "km")).toBe(meters);
    const viaMiles = displayToMeters(metersToDisplay(meters, "mi"), "mi");
    expect(Math.abs(viaMiles - meters)).toBeLessThan(1609.344); // within one mile of rounding
  });

  it("formats with the unit suffix", () => {
    expect(formatDistance(100000, "km")).toBe("100 km");
  });
});

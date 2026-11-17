import {
  odometerUpdateNeedsConfirmation,
  vehicleFormSchema,
} from "../src/features/vehicles/domain";

describe("odometerUpdateNeedsConfirmation (R04)", () => {
  it("does not require confirmation when there is no prior reading", () => {
    expect(odometerUpdateNeedsConfirmation(undefined, 1000)).toBe(false);
    expect(odometerUpdateNeedsConfirmation(null, 1000)).toBe(false);
  });

  it("does not require confirmation when the new reading is higher or equal", () => {
    expect(odometerUpdateNeedsConfirmation(5000, 5000)).toBe(false);
    expect(odometerUpdateNeedsConfirmation(5000, 6000)).toBe(false);
  });

  it("requires confirmation when the new reading is lower (a correction)", () => {
    expect(odometerUpdateNeedsConfirmation(5000, 4999)).toBe(true);
  });
});

describe("vehicleFormSchema (CK-01)", () => {
  it("requires a non-empty nickname and allows everything else to be omitted", () => {
    expect(vehicleFormSchema.safeParse({ nickname: "My Civic" }).success).toBe(true);
    expect(vehicleFormSchema.safeParse({ nickname: "" }).success).toBe(false);
    expect(vehicleFormSchema.safeParse({}).success).toBe(false);
  });

  it("rejects an implausible year", () => {
    expect(vehicleFormSchema.safeParse({ nickname: "Car", year: 1800 }).success).toBe(false);
  });
});

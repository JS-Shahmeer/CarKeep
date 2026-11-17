import { serviceRecordFormSchema } from "../src/features/services/domain";
import { majorToMinor, minorToMajor, formatMinor } from "../src/lib/money";
import { validateAttachment, MAX_RECEIPT_BYTES } from "../src/features/attachments/domain";
import { formatDateOnly, parseDateOnly } from "../src/lib/time";

describe("serviceRecordFormSchema (CK-03)", () => {
  it("accepts a minimal valid record", () => {
    const result = serviceRecordFormSchema.safeParse({
      vehicleId: "v1",
      type: "oil_change",
      serviceOn: "2026-01-15",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a missing or malformed date", () => {
    expect(
      serviceRecordFormSchema.safeParse({ vehicleId: "v1", type: "oil_change", serviceOn: "" })
        .success,
    ).toBe(false);
    expect(
      serviceRecordFormSchema.safeParse({
        vehicleId: "v1",
        type: "oil_change",
        serviceOn: "15/01/2026",
      }).success,
    ).toBe(false);
  });

  it("rejects an unknown service type", () => {
    expect(
      serviceRecordFormSchema.safeParse({ vehicleId: "v1", type: "wash", serviceOn: "2026-01-15" })
        .success,
    ).toBe(false);
  });
});

describe("money (minor-unit storage)", () => {
  it("round-trips without float drift", () => {
    expect(majorToMinor(19.99)).toBe(1999);
    expect(minorToMajor(1999)).toBeCloseTo(19.99);
    expect(formatMinor(1999)).toBe("19.99");
  });
});

describe("validateAttachment (CK-07)", () => {
  it("accepts an allowed type under the size limit", () => {
    expect(validateAttachment("image/jpeg", 1024)).toBeUndefined();
    expect(validateAttachment("application/pdf", MAX_RECEIPT_BYTES)).toBeUndefined();
  });

  it("rejects a disallowed type", () => {
    expect(validateAttachment("video/mp4", 1024)?.code).toBe("unsupported_type");
  });

  it("rejects a file over the size limit", () => {
    expect(validateAttachment("image/png", MAX_RECEIPT_BYTES + 1)?.code).toBe("too_large");
  });
});

describe("date-only formatting (brief: calendar dates, not UTC instants)", () => {
  it("round-trips a date through format/parse without shifting days", () => {
    const original = new Date(2026, 0, 15); // 15 Jan 2026, local time
    const formatted = formatDateOnly(original);
    expect(formatted).toBe("2026-01-15");
    const parsed = parseDateOnly(formatted);
    expect(parsed.getFullYear()).toBe(2026);
    expect(parsed.getMonth()).toBe(0);
    expect(parsed.getDate()).toBe(15);
  });
});

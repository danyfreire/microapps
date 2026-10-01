import { describe, expect, it } from "vitest";
import { confidenceLabel, formatGrams, formatKcal, formatNumber } from "./format";

describe("formatNumber", () => {
  it("redondea y usa separador de miles", () => {
    expect(formatNumber(1234.6)).toBe("1.235");
  });
});

describe("formatKcal", () => {
  it("añade la unidad kcal", () => {
    expect(formatKcal(780)).toBe("780 kcal");
  });
});

describe("formatGrams", () => {
  it("añade la unidad g", () => {
    expect(formatGrams(35)).toBe("35 g");
  });
});

describe("confidenceLabel", () => {
  it("traduce los niveles", () => {
    expect(confidenceLabel("low")).toBe("Baja");
    expect(confidenceLabel("medium")).toBe("Media");
    expect(confidenceLabel("high")).toBe("Alta");
  });
});

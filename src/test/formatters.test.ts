import { describe, it, expect } from "vitest";
import {
  formatBRL,
  formatBRLCompact,
  formatBRLk,
  formatNumberBR,
  formatDateBR,
} from "@/lib/formatters";

describe("formatters", () => {
  it("formats BRL with 2 decimals", () => {
    expect(formatBRL(1234.5)).toContain("R$");
    expect(formatBRL(1234.5)).toContain("1.234,50");
  });

  it("formats compact BRL for thousands and millions", () => {
    expect(formatBRLCompact(1500)).toBe("R$ 1.5K");
    expect(formatBRLCompact(2_500_000)).toBe("R$ 2.50M");
    expect(formatBRLCompact(42)).toBe("R$ 42.00");
  });

  it("formats signed BRLk", () => {
    expect(formatBRLk(1500)).toBe("R$ 1.5k");
    expect(formatBRLk(-1500)).toBe("-R$ 1.5k");
  });

  it("formats plain pt-BR number", () => {
    expect(formatNumberBR(1234567)).toBe("1.234.567");
  });

  it("formats dates in pt-BR", () => {
    expect(formatDateBR("2025-01-15")).toMatch(/15\/01\/2025/);
  });
});

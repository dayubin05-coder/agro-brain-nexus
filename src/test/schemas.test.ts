import { describe, it, expect } from "vitest";
import {
  loginSchema,
  registerSchema,
  fazendaSchema,
  transacaoSchema,
  pragaSchema,
} from "@/lib/schemas";

describe("schemas", () => {
  describe("loginSchema", () => {
    it("accepts valid login", () => {
      const r = loginSchema.safeParse({ email: "a@b.com", password: "secret1" });
      expect(r.success).toBe(true);
    });
    it("rejects invalid email", () => {
      const r = loginSchema.safeParse({ email: "nope", password: "secret1" });
      expect(r.success).toBe(false);
    });
    it("rejects short password", () => {
      const r = loginSchema.safeParse({ email: "a@b.com", password: "123" });
      expect(r.success).toBe(false);
    });
  });

  describe("registerSchema", () => {
    it("requires letters and digits in password", () => {
      expect(registerSchema.safeParse({ nome: "X", email: "a@b.com", password: "abcdefgh" }).success).toBe(false);
      expect(registerSchema.safeParse({ nome: "X", email: "a@b.com", password: "abcd1234" }).success).toBe(true);
    });
  });

  describe("fazendaSchema", () => {
    it("requires positive area", () => {
      expect(fazendaSchema.safeParse({ nome: "F", area_total: 0 }).success).toBe(false);
      expect(fazendaSchema.safeParse({ nome: "F", area_total: 10 }).success).toBe(true);
    });
    it("coerces numeric strings", () => {
      const r = fazendaSchema.safeParse({ nome: "F", area_total: "12.5" });
      expect(r.success).toBe(true);
      if (r.success) expect(r.data.area_total).toBe(12.5);
    });
  });

  describe("transacaoSchema", () => {
    it("rejects invalid tipo", () => {
      expect(
        transacaoSchema.safeParse({
          fazenda_id: "00000000-0000-0000-0000-000000000000",
          tipo: "invalid",
          descricao: "x",
          valor: 1,
          data: "2025-01-01",
        }).success,
      ).toBe(false);
    });
  });

  describe("pragaSchema", () => {
    it("applies defaults for severidade and status", () => {
      const r = pragaSchema.safeParse({
        fazenda_id: "00000000-0000-0000-0000-000000000000",
        nome: "X",
        data_deteccao: "2025-01-01",
      });
      expect(r.success).toBe(true);
      if (r.success) {
        expect(r.data.severidade).toBe("media");
        expect(r.data.status).toBe("ativa");
      }
    });
  });
});

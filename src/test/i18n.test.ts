import { describe, it, expect } from "vitest";
import { t, getLocale } from "@/lib/i18n";

describe("i18n", () => {
  it("default locale is pt-BR", () => {
    expect(getLocale()).toBe("pt-BR");
  });
  it("returns translated string for known key", () => {
    expect(t("common.save")).toBe("Salvar");
  });
  it("returns the key itself when missing", () => {
    expect(t("does.not.exist")).toBe("does.not.exist");
  });
  it("interpolates variables", () => {
    expect(t("validation.required", { field: "Nome" })).toBe("Nome é obrigatório");
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import { z } from "zod";

// Mock toast antes do import
const toastMock = vi.fn();
vi.mock("@/hooks/use-toast", () => ({
  toast: (...args: any[]) => toastMock(...args),
}));

import { validateOrToast } from "@/lib/validate";

describe("validateOrToast", () => {
  beforeEach(() => toastMock.mockReset());

  const schema = z.object({ nome: z.string().min(2, "nome curto") });

  it("retorna dados parseados em sucesso e não dispara toast", () => {
    const r = validateOrToast(schema, { nome: "ok" });
    expect(r).toEqual({ nome: "ok" });
    expect(toastMock).not.toHaveBeenCalled();
  });

  it("retorna null e dispara toast destructive em falha", () => {
    const r = validateOrToast(schema, { nome: "x" });
    expect(r).toBeNull();
    expect(toastMock).toHaveBeenCalledTimes(1);
    const arg = toastMock.mock.calls[0][0];
    expect(arg.variant).toBe("destructive");
    expect(arg.description).toContain("nome curto");
  });
});

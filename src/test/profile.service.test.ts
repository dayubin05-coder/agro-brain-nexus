import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock do client Supabase usado pela service
const updateEqMock = vi.fn();
const updateMock = vi.fn(() => ({ eq: updateEqMock }));
const singleMock = vi.fn();
const eqMock = vi.fn(() => ({ single: singleMock }));
const selectMock = vi.fn(() => ({ eq: eqMock }));
const fromMock = vi.fn(() => ({ select: selectMock, update: updateMock }));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: (...args: any[]) => fromMock(...args),
  },
}));

import { profileService } from "@/services/profile.service";

describe("profileService", () => {
  beforeEach(() => {
    fromMock.mockClear();
    selectMock.mockClear();
    eqMock.mockClear();
    singleMock.mockReset();
    updateMock.mockClear();
    updateEqMock.mockReset();
  });

  it("getFullById faz select * e single, retornando dados", async () => {
    singleMock.mockResolvedValueOnce({ data: { id: "u1", nome: "Ana" }, error: null });
    const r = await profileService.getFullById("u1");
    expect(fromMock).toHaveBeenCalledWith("profiles");
    expect(selectMock).toHaveBeenCalledWith("*");
    expect(eqMock).toHaveBeenCalledWith("id", "u1");
    expect(r).toEqual({ id: "u1", nome: "Ana" });
  });

  it("getFullById lança erro quando supabase retorna error", async () => {
    singleMock.mockResolvedValueOnce({ data: null, error: { message: "boom" } });
    await expect(profileService.getFullById("u1")).rejects.toMatchObject({ message: "boom" });
  });

  it("getById ignora PGRST116 (no rows) silenciosamente", async () => {
    singleMock.mockResolvedValueOnce({ data: null, error: { code: "PGRST116", message: "no rows" } });
    const r = await profileService.getById("u1");
    expect(r).toBeNull();
  });

  it("update envia campos normalizados", async () => {
    updateEqMock.mockResolvedValueOnce({ error: null });
    await profileService.update("u1", { nome: "Ana", telefone: "9999", tipo: "produtor" });
    expect(updateMock).toHaveBeenCalledWith({ nome: "Ana", telefone: "9999", tipo: "produtor" });
    expect(updateEqMock).toHaveBeenCalledWith("id", "u1");
  });

  it("update lança erro do supabase", async () => {
    updateEqMock.mockResolvedValueOnce({ error: { message: "denied" } });
    await expect(profileService.update("u1", { nome: "A" })).rejects.toMatchObject({ message: "denied" });
  });
});

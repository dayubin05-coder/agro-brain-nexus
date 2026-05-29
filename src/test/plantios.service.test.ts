import { describe, it, expect, vi, beforeEach } from "vitest";

const orderMock = vi.fn();
const eqSelectMock: any = vi.fn(() => ({ order: orderMock }));
const selectMock: any = vi.fn(() => ({ eq: eqSelectMock }));
const insertMock = vi.fn();
const updateEqMock = vi.fn();
const updateMock: any = vi.fn(() => ({ eq: updateEqMock }));
const deleteEqMock = vi.fn();
const deleteMock: any = vi.fn(() => ({ eq: deleteEqMock }));
const fromMock: any = vi.fn(() => ({
  select: selectMock,
  insert: insertMock,
  update: updateMock,
  delete: deleteMock,
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: (t: string) => fromMock(t) },
}));

import { plantiosService } from "@/services/plantios.service";

describe("plantiosService", () => {
  beforeEach(() => {
    [fromMock, selectMock, eqSelectMock, updateMock, deleteMock].forEach((m) => m.mockClear());
    [orderMock, insertMock, updateEqMock, deleteEqMock].forEach((m) => m.mockReset());
  });

  it("listByUser filtra via talhoes.fazendas.user_id", async () => {
    orderMock.mockResolvedValueOnce({ data: [{ id: "p1" }], error: null });
    const r = await plantiosService.listByUser("u1");
    expect(fromMock).toHaveBeenCalledWith("plantios");
    expect(eqSelectMock).toHaveBeenCalledWith("talhoes.fazendas.user_id", "u1");
    expect(orderMock).toHaveBeenCalledWith("created_at", { ascending: false });
    expect(r).toEqual([{ id: "p1" }]);
  });

  it("create força status='plantio', progresso=0 e converte area_plantada", async () => {
    insertMock.mockResolvedValueOnce({ error: null });
    await plantiosService.create({
      cultura_id: "c1",
      talhao_id: "t1",
      area_plantada: "8.5",
      data_plantio: "2026-01-01",
    });
    expect(insertMock).toHaveBeenCalledWith([
      expect.objectContaining({
        cultura_id: "c1",
        talhao_id: "t1",
        area_plantada: 8.5,
        data_plantio: "2026-01-01",
        status: "plantio",
        progresso_percentual: 0,
      }),
    ]);
  });

  it("update converte progresso_percentual e propaga erro", async () => {
    updateEqMock.mockResolvedValueOnce({ error: { message: "x" } });
    await expect(
      plantiosService.update("p1", { status: "colheita", progresso_percentual: "55" }),
    ).rejects.toMatchObject({ message: "x" });
    const arg = updateMock.mock.calls[0][0];
    expect(arg.progresso_percentual).toBe(55);
    expect(arg.status).toBe("colheita");
  });

  it("remove chama delete().eq('id')", async () => {
    deleteEqMock.mockResolvedValueOnce({ error: null });
    await plantiosService.remove("p1");
    expect(deleteEqMock).toHaveBeenCalledWith("id", "p1");
  });
});

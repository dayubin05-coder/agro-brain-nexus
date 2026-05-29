import { describe, it, expect, vi, beforeEach } from "vitest";

const orderMock = vi.fn();
const eqSelectMock: any = vi.fn(() => ({ order: orderMock, eq: vi.fn() }));
const selectMock: any = vi.fn(() => ({ eq: eqSelectMock, order: orderMock }));
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

import { talhoesService } from "@/services/talhoes.service";

describe("talhoesService", () => {
  beforeEach(() => {
    [fromMock, selectMock, eqSelectMock, updateMock, deleteMock].forEach((m) => m.mockClear());
    [orderMock, insertMock, updateEqMock, deleteEqMock].forEach((m) => m.mockReset());
  });

  it("listByFarm filtra por fazenda_id e ordena por nome", async () => {
    orderMock.mockResolvedValueOnce({ data: [{ id: "t1" }], error: null });
    const r = await talhoesService.listByFarm("f1");
    expect(fromMock).toHaveBeenCalledWith("talhoes");
    expect(eqSelectMock).toHaveBeenCalledWith("fazenda_id", "f1");
    expect(orderMock).toHaveBeenCalledWith("nome");
    expect(r).toEqual([{ id: "t1" }]);
  });

  it("create converte area para Number e inclui fazenda_id", async () => {
    insertMock.mockResolvedValueOnce({ error: null });
    await talhoesService.create("f1", { nome: "T1", area: "12.5" });
    expect(insertMock).toHaveBeenCalledWith([
      expect.objectContaining({ nome: "T1", area: 12.5, fazenda_id: "f1" }),
    ]);
  });

  it("createMany insere múltiplos com fazenda_id e area normalizada", async () => {
    insertMock.mockResolvedValueOnce({ error: null });
    await talhoesService.createMany("f1", [
      { nome: "A", area: "1" },
      { nome: "B", area: 2 },
    ]);
    const arr = insertMock.mock.calls[0][0];
    expect(arr).toHaveLength(2);
    expect(arr[0]).toMatchObject({ nome: "A", area: 1, fazenda_id: "f1" });
    expect(arr[1]).toMatchObject({ nome: "B", area: 2, fazenda_id: "f1" });
  });

  it("update propaga erro", async () => {
    updateEqMock.mockResolvedValueOnce({ error: { message: "x" } });
    await expect(talhoesService.update("t1", { nome: "x", area: 1 })).rejects.toMatchObject({
      message: "x",
    });
  });

  it("remove chama delete().eq('id')", async () => {
    deleteEqMock.mockResolvedValueOnce({ error: null });
    await talhoesService.remove("t1");
    expect(deleteEqMock).toHaveBeenCalledWith("id", "t1");
  });
});

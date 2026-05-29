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

import { estoqueService } from "@/services/estoque.service";

describe("estoqueService", () => {
  beforeEach(() => {
    [fromMock, selectMock, eqSelectMock, updateMock, deleteMock].forEach((m) => m.mockClear());
    [orderMock, insertMock, updateEqMock, deleteEqMock].forEach((m) => m.mockReset());
  });

  it("listByUser filtra por fazendas.user_id e ordena por nome", async () => {
    orderMock.mockResolvedValueOnce({ data: [{ id: "e1" }], error: null });
    const r = await estoqueService.listByUser("u1");
    expect(fromMock).toHaveBeenCalledWith("estoque");
    expect(eqSelectMock).toHaveBeenCalledWith("fazendas.user_id", "u1");
    expect(orderMock).toHaveBeenCalledWith("nome");
    expect(r).toEqual([{ id: "e1" }]);
  });

  it("create converte quantidade/min/valor para Number e injeta data_entrada", async () => {
    insertMock.mockResolvedValueOnce({ error: null });
    await estoqueService.create({
      fazenda_id: "f1",
      nome: "  Adubo ",
      categoria: "insumo",
      quantidade: "10",
      unidade: "kg",
      quantidade_minima: "2",
      valor_unitario: "5",
    });
    const arg = insertMock.mock.calls[0][0][0];
    expect(arg).toMatchObject({
      fazenda_id: "f1",
      nome: "Adubo",
      categoria: "insumo",
      quantidade: 10,
      unidade: "kg",
      quantidade_minima: 2,
      valor_unitario: 5,
    });
    expect(typeof arg.data_entrada).toBe("string");
  });

  it("create deixa quantidade_minima/valor_unitario null quando ausentes", async () => {
    insertMock.mockResolvedValueOnce({ error: null });
    await estoqueService.create({
      fazenda_id: "f1",
      nome: "X",
      quantidade: 1,
      unidade: "un",
    });
    const arg = insertMock.mock.calls[0][0][0];
    expect(arg.quantidade_minima).toBeNull();
    expect(arg.valor_unitario).toBeNull();
  });

  it("update propaga erro", async () => {
    updateEqMock.mockResolvedValueOnce({ error: { message: "x" } });
    await expect(
      estoqueService.update("e1", { nome: "n", quantidade: 1, unidade: "kg" }),
    ).rejects.toMatchObject({ message: "x" });
  });

  it("remove chama delete().eq('id')", async () => {
    deleteEqMock.mockResolvedValueOnce({ error: null });
    await estoqueService.remove("e1");
    expect(deleteEqMock).toHaveBeenCalledWith("id", "e1");
  });
});

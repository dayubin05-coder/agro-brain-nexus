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

import { financeiroService } from "@/services/financeiro.service";

describe("financeiroService", () => {
  beforeEach(() => {
    [fromMock, selectMock, eqSelectMock, updateMock, deleteMock].forEach((m) => m.mockClear());
    [orderMock, insertMock, updateEqMock, deleteEqMock].forEach((m) => m.mockReset());
  });

  it("listByUser consulta transacoes_financeiras filtradas e ordenadas por data desc", async () => {
    orderMock.mockResolvedValueOnce({ data: [{ id: "t1" }], error: null });
    const r = await financeiroService.listByUser("u1");
    expect(fromMock).toHaveBeenCalledWith("transacoes_financeiras");
    expect(eqSelectMock).toHaveBeenCalledWith("fazendas.user_id", "u1");
    expect(orderMock).toHaveBeenCalledWith("data", { ascending: false });
    expect(r).toEqual([{ id: "t1" }]);
  });

  it("create normaliza descricao e converte valor para Number", async () => {
    insertMock.mockResolvedValueOnce({ error: null });
    await financeiroService.create({
      fazenda_id: "f1",
      descricao: "  Venda  ",
      valor: "100.5",
      tipo: "receita",
      data: "2026-01-01",
      categoria: "graos",
    });
    expect(insertMock).toHaveBeenCalledWith([
      {
        fazenda_id: "f1",
        descricao: "Venda",
        valor: 100.5,
        tipo: "receita",
        data: "2026-01-01",
        categoria: "graos",
      },
    ]);
  });

  it("update propaga erro", async () => {
    updateEqMock.mockResolvedValueOnce({ error: { message: "x" } });
    await expect(
      financeiroService.update("t1", {
        descricao: "x",
        valor: 1,
        tipo: "despesa",
        data: "2026-01-01",
      }),
    ).rejects.toMatchObject({ message: "x" });
  });

  it("remove chama delete().eq('id')", async () => {
    deleteEqMock.mockResolvedValueOnce({ error: null });
    await financeiroService.remove("t1");
    expect(deleteEqMock).toHaveBeenCalledWith("id", "t1");
  });
});

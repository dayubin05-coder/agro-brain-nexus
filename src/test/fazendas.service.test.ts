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

import { fazendasService } from "@/services/fazendas.service";

describe("fazendasService", () => {
  beforeEach(() => {
    fromMock.mockClear();
    selectMock.mockClear();
    eqSelectMock.mockClear();
    orderMock.mockReset();
    insertMock.mockReset();
    updateMock.mockClear();
    updateEqMock.mockReset();
    deleteMock.mockClear();
    deleteEqMock.mockReset();
  });

  it("listByUser filtra pelo user_id e ordena", async () => {
    orderMock.mockResolvedValueOnce({ data: [{ id: "f1" }], error: null });
    const r = await fazendasService.listByUser("u1");
    expect(fromMock).toHaveBeenCalledWith("fazendas");
    expect(eqSelectMock).toHaveBeenCalledWith("user_id", "u1");
    expect(orderMock).toHaveBeenCalledWith("created_at", { ascending: false });
    expect(r).toEqual([{ id: "f1" }]);
  });

  it("create insere convertendo area_total para Number", async () => {
    insertMock.mockResolvedValueOnce({ error: null });
    await fazendasService.create("u1", { nome: "F", cidade: "X", estado: "SP", area_total: "12.5" });
    expect(insertMock).toHaveBeenCalledWith([
      { nome: "F", cidade: "X", estado: "SP", area_total: 12.5, user_id: "u1" },
    ]);
  });

  it("update propaga erro", async () => {
    updateEqMock.mockResolvedValueOnce({ error: { message: "x" } });
    await expect(
      fazendasService.update("f1", { nome: "F", area_total: 1 }),
    ).rejects.toMatchObject({ message: "x" });
  });

  it("remove chama delete().eq('id')", async () => {
    deleteEqMock.mockResolvedValueOnce({ error: null });
    await fazendasService.remove("f1");
    expect(deleteEqMock).toHaveBeenCalledWith("id", "f1");
  });
});

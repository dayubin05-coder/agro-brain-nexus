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

import { pragasService } from "@/services/pragas.service";
import { maquinasService } from "@/services/maquinas.service";
import { funcionariosService } from "@/services/funcionarios.service";

describe("pragasService", () => {
  beforeEach(() => {
    [fromMock, selectMock, eqSelectMock, updateMock, deleteMock].forEach((m) => m.mockClear());
    [orderMock, insertMock, updateEqMock, deleteEqMock].forEach((m) => m.mockReset());
  });

  it("listByUser usa tabela pragas_ocorrencias e ordena por data_deteccao desc", async () => {
    orderMock.mockResolvedValueOnce({ data: [{ id: "x" }], error: null });
    await pragasService.listByUser("u1");
    expect(fromMock).toHaveBeenCalledWith("pragas_ocorrencias");
    expect(orderMock).toHaveBeenCalledWith("data_deteccao", { ascending: false });
  });

  it("create força status='ativa' e default data_deteccao", async () => {
    insertMock.mockResolvedValueOnce({ error: null });
    await pragasService.create({
      fazenda_id: "f1",
      nome: "Lagarta",
      tipo: "inseto",
      severidade: "alta",
    });
    const arg = insertMock.mock.calls[0][0][0];
    expect(arg.status).toBe("ativa");
    expect(typeof arg.data_deteccao).toBe("string");
    expect(arg.area_afetada).toBeNull();
  });
});

describe("maquinasService", () => {
  beforeEach(() => {
    [fromMock, selectMock, eqSelectMock, updateMock, deleteMock].forEach((m) => m.mockClear());
    [orderMock, insertMock, updateEqMock, deleteEqMock].forEach((m) => m.mockReset());
  });

  it("create aplica default status='parada' e horas_uso=0", async () => {
    insertMock.mockResolvedValueOnce({ error: null });
    await maquinasService.create({ fazenda_id: "f1", nome: "Trator" });
    const arg = insertMock.mock.calls[0][0][0];
    expect(arg.status).toBe("parada");
    expect(arg.horas_uso).toBe(0);
    expect(arg.ano).toBeNull();
  });

  it("update converte ano/horas_uso para Number", async () => {
    updateEqMock.mockResolvedValueOnce({ error: null });
    await maquinasService.update("m1", {
      nome: "Trator",
      ano: "2020",
      horas_uso: "150",
      combustivel_percentual: "80",
    });
    const arg = updateMock.mock.calls[0][0];
    expect(arg.ano).toBe(2020);
    expect(arg.horas_uso).toBe(150);
    expect(arg.combustivel_percentual).toBe(80);
  });
});

describe("funcionariosService", () => {
  beforeEach(() => {
    [fromMock, selectMock, eqSelectMock, updateMock, deleteMock].forEach((m) => m.mockClear());
    [orderMock, insertMock, updateEqMock, deleteEqMock].forEach((m) => m.mockReset());
  });

  it("create aplica default status='ativo' e trim no nome", async () => {
    insertMock.mockResolvedValueOnce({ error: null });
    await funcionariosService.create({ fazenda_id: "f1", nome: "  João  " });
    const arg = insertMock.mock.calls[0][0][0];
    expect(arg.status).toBe("ativo");
    expect(arg.nome).toBe("João");
  });

  it("remove chama delete().eq('id')", async () => {
    deleteEqMock.mockResolvedValueOnce({ error: null });
    await funcionariosService.remove("fn1");
    expect(fromMock).toHaveBeenCalledWith("funcionarios");
    expect(deleteEqMock).toHaveBeenCalledWith("id", "fn1");
  });
});

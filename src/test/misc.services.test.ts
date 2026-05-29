import { describe, it, expect, vi, beforeEach } from "vitest";

const orderMock = vi.fn();
const eqSelectMock: any = vi.fn(() => ({ order: orderMock, eq: vi.fn() }));
// support chained .eq().order() AND .eq() alone
const selectMock: any = vi.fn(() => ({ eq: eqSelectMock, order: orderMock }));
const insertMock = vi.fn();
const deleteEqMock = vi.fn();
const deleteMock: any = vi.fn(() => ({ eq: deleteEqMock }));
const rpcMock = vi.fn();
const invokeMock = vi.fn();
const getSessionMock = vi.fn();

const fromMock: any = vi.fn(() => ({
  select: selectMock,
  insert: insertMock,
  delete: deleteMock,
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: (t: string) => fromMock(t),
    rpc: (n: string) => rpcMock(n),
    functions: { invoke: (n: string, o: any) => invokeMock(n, o) },
    auth: { getSession: () => getSessionMock() },
  },
}));

import { marketplaceService } from "@/services/marketplace.service";
import { climaService } from "@/services/clima.service";
import { sustentabilidadeService } from "@/services/sustentabilidade.service";
import { culturasService } from "@/services/culturas.service";
import { auditoriaService } from "@/services/auditoria.service";
import { mercadoService } from "@/services/mercado.service";

beforeEach(() => {
  [fromMock, selectMock, eqSelectMock, deleteMock].forEach((m) => m.mockClear());
  [orderMock, insertMock, deleteEqMock, rpcMock, invokeMock, getSessionMock].forEach((m) => m.mockReset());
});

describe("marketplaceService", () => {
  it("listAtivos filtra status='ativo' e ordena por created_at desc", async () => {
    orderMock.mockResolvedValueOnce({ data: [{ id: "a1" }], error: null });
    const r = await marketplaceService.listAtivos();
    expect(fromMock).toHaveBeenCalledWith("marketplace_anuncios");
    expect(eqSelectMock).toHaveBeenCalledWith("status", "ativo");
    expect(orderMock).toHaveBeenCalledWith("created_at", { ascending: false });
    expect(r).toEqual([{ id: "a1" }]);
  });
});

describe("climaService", () => {
  it("listFazendasComCoords filtra por user_id", async () => {
    // listFazendasComCoords does select().eq() (no order)
    const eqOnly = vi.fn().mockResolvedValueOnce({ data: [{ id: "f1" }], error: null });
    selectMock.mockReturnValueOnce({ eq: eqOnly });
    const r = await climaService.listFazendasComCoords("u1");
    expect(eqOnly).toHaveBeenCalledWith("user_id", "u1");
    expect(r).toEqual([{ id: "f1" }]);
  });

  it("fetchWeather invoca edge function 'weather' com lat/long", async () => {
    invokeMock.mockResolvedValueOnce({ data: { temp: 25 }, error: null });
    const r = await climaService.fetchWeather(-23.5, -46.6);
    expect(invokeMock).toHaveBeenCalledWith("weather", { body: { latitude: -23.5, longitude: -46.6 } });
    expect(r).toEqual({ temp: 25 });
  });
});

describe("sustentabilidadeService", () => {
  it("create converte valor/meta para Number", async () => {
    insertMock.mockResolvedValueOnce({ error: null });
    await sustentabilidadeService.create({
      fazenda_id: "f1",
      categoria: "agua",
      indicador: "uso",
      valor: "100",
      unidade: "L",
      meta: "200",
    });
    const arg = insertMock.mock.calls[0][0][0];
    expect(arg.valor).toBe(100);
    expect(arg.meta).toBe(200);
  });

  it("remove deleta por id", async () => {
    deleteEqMock.mockResolvedValueOnce({ error: null });
    await sustentabilidadeService.remove("s1");
    expect(deleteEqMock).toHaveBeenCalledWith("id", "s1");
  });
});

describe("culturasService", () => {
  it("listAll ordena por nome", async () => {
    orderMock.mockResolvedValueOnce({ data: [{ id: "c1" }], error: null });
    const r = await culturasService.listAll();
    expect(fromMock).toHaveBeenCalledWith("culturas");
    expect(orderMock).toHaveBeenCalledWith("nome");
    expect(r).toEqual([{ id: "c1" }]);
  });
});

describe("auditoriaService", () => {
  it("getTablesRlsStatus chama rpc get_tables_rls_status", async () => {
    rpcMock.mockResolvedValueOnce({ data: [{ table_name: "t" }], error: null });
    const r = await auditoriaService.getTablesRlsStatus();
    expect(rpcMock).toHaveBeenCalledWith("get_tables_rls_status");
    expect(r).toEqual([{ table_name: "t" }]);
  });

  it("getTablesRlsStatus retorna [] quando data é null", async () => {
    rpcMock.mockResolvedValueOnce({ data: null, error: null });
    const r = await auditoriaService.getTablesRlsStatus();
    expect(r).toEqual([]);
  });
});

describe("mercadoService.fetchPrices", () => {
  it("usa access_token quando há sessão e lança em !ok", async () => {
    getSessionMock.mockResolvedValueOnce({ data: { session: { access_token: "tok" } } });
    const fetchSpy = vi.spyOn(globalThis, "fetch" as any).mockResolvedValueOnce({
      ok: false,
    } as any);
    await expect(mercadoService.fetchPrices()).rejects.toThrow("Failed to fetch prices");
    const call = fetchSpy.mock.calls[0];
    expect((call[1] as any).headers.Authorization).toBe("Bearer tok");
    fetchSpy.mockRestore();
  });

  it("retorna json quando ok", async () => {
    getSessionMock.mockResolvedValueOnce({ data: { session: null } });
    const payload = { commodities: [], historico: {}, updatedAt: "x" };
    const fetchSpy = vi.spyOn(globalThis, "fetch" as any).mockResolvedValueOnce({
      ok: true,
      json: async () => payload,
    } as any);
    const r = await mercadoService.fetchPrices();
    expect(r).toEqual(payload);
    fetchSpy.mockRestore();
  });
});

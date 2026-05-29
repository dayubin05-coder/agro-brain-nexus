import { describe, it, expect, vi, beforeEach } from "vitest";

const signInMock = vi.fn();
const signUpMock = vi.fn();
const resetMock = vi.fn();
const updateUserMock = vi.fn();
const signOutMock = vi.fn();
const getSessionMock = vi.fn();
const getUserMock = vi.fn();

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      signInWithPassword: (...a: any[]) => signInMock(...a),
      signUp: (...a: any[]) => signUpMock(...a),
      resetPasswordForEmail: (...a: any[]) => resetMock(...a),
      updateUser: (...a: any[]) => updateUserMock(...a),
      signOut: () => signOutMock(),
      getSession: () => getSessionMock(),
      getUser: () => getUserMock(),
    },
  },
}));

import { authService } from "@/services/auth.service";

describe("authService", () => {
  beforeEach(() => {
    [signInMock, signUpMock, resetMock, updateUserMock, signOutMock, getSessionMock, getUserMock].forEach((m) =>
      m.mockReset(),
    );
    // window.location.origin existe no jsdom
  });

  it("signIn delega para signInWithPassword", async () => {
    signInMock.mockResolvedValueOnce({ data: { user: { id: "u1" } }, error: null });
    const r = await authService.signIn("a@b.c", "pw");
    expect(signInMock).toHaveBeenCalledWith({ email: "a@b.c", password: "pw" });
    expect(r.user.id).toBe("u1");
  });

  it("signIn lança em erro", async () => {
    signInMock.mockResolvedValueOnce({ data: null, error: { message: "bad" } });
    await expect(authService.signIn("a", "b")).rejects.toMatchObject({ message: "bad" });
  });

  it("signUp envia options.data.nome e emailRedirectTo", async () => {
    signUpMock.mockResolvedValueOnce({ data: {}, error: null });
    await authService.signUp("a@b.c", "pw", "Ana");
    expect(signUpMock).toHaveBeenCalledWith({
      email: "a@b.c",
      password: "pw",
      options: { data: { nome: "Ana" }, emailRedirectTo: window.location.origin },
    });
  });

  it("resetPasswordForEmail usa /reset-password", async () => {
    resetMock.mockResolvedValueOnce({ error: null });
    await authService.resetPasswordForEmail("a@b.c");
    expect(resetMock).toHaveBeenCalledWith("a@b.c", {
      redirectTo: `${window.location.origin}/reset-password`,
    });
  });

  it("updatePassword chama updateUser", async () => {
    updateUserMock.mockResolvedValueOnce({ error: null });
    await authService.updatePassword("newpw");
    expect(updateUserMock).toHaveBeenCalledWith({ password: "newpw" });
  });

  it("signOut propaga erro", async () => {
    signOutMock.mockResolvedValueOnce({ error: { message: "no" } });
    await expect(authService.signOut()).rejects.toMatchObject({ message: "no" });
  });

  it("getSession retorna session", async () => {
    getSessionMock.mockResolvedValueOnce({ data: { session: { id: "s1" } }, error: null });
    const r = await authService.getSession();
    expect(r).toEqual({ id: "s1" });
  });

  it("getUser retorna user", async () => {
    getUserMock.mockResolvedValueOnce({ data: { user: { id: "u1" } }, error: null });
    const r = await authService.getUser();
    expect(r).toEqual({ id: "u1" });
  });
});

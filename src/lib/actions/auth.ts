"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { backendFetch } from "@/lib/api/backend";
import { signSession, SESSION_COOKIE, SESSION_DAYS } from "@/lib/auth/session";

export type LoginState = { error?: string };

/** Verify credentials against the backend, then set our signed session cookie. */
export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Введите email и пароль." };

  let user: { id: number; email: string; name?: string | null; role: string };
  try {
    const res = await backendFetch("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) return { error: "Неверный email или пароль." };
    ({ user } = await res.json());
  } catch (err) {
    console.error("[auth] login failed:", err);
    return { error: "Сервис недоступен, попробуйте позже." };
  }

  const token = await signSession(user);
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * SESSION_DAYS,
  });
  redirect("/admin/crm");
}

export async function logoutAction(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/admin/login");
}

"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { backendFetch } from "@/lib/api/backend";
import { signSession, SESSION_COOKIE, SESSION_DAYS } from "@/lib/auth/session";
import { rateLimit } from "@/lib/ratelimit";

export type LoginState = { error?: string };

/** Verify credentials against the backend, then set our signed session cookie. */
export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Введите email и пароль." };

  // Throttle password attempts per IP (10 / 15 min) — blunts brute-force.
  if (!(await rateLimit("login", 10, 15 * 60, { failClosed: true }))) {
    return { error: "Слишком много попыток входа. Подождите несколько минут." };
  }

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

  // signSession бросает на нечисловом id (строгий mint под строгий verify).
  // Без обработки исключение уходит из server action экраном ошибки/500 — и
  // если backend отдаст id строкой или без поля id, вход выключается ВСЕМ,
  // вместо понятного сообщения в форме.
  let token: string;
  try {
    token = await signSession(user);
  } catch (err) {
    console.error("[auth] не удалось выпустить сессию:", err);
    return { error: "Не удалось создать сессию. Сообщите администратору." };
  }
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

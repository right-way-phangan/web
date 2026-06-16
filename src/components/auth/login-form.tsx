"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/lib/actions/auth";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(loginAction, {});
  return (
    <form action={action} className="space-y-3">
      <div>
        <label className="block text-xs uppercase tracking-wide text-forest-900/50">Email</label>
        <input
          name="email"
          type="email"
          required
          autoComplete="username"
          className="mt-1 w-full rounded-md border border-forest-900/15 bg-cream-50 px-3 py-2 text-sm outline-none focus:border-brass-500"
        />
      </div>
      <div>
        <label className="block text-xs uppercase tracking-wide text-forest-900/50">Пароль</label>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="mt-1 w-full rounded-md border border-forest-900/15 bg-cream-50 px-3 py-2 text-sm outline-none focus:border-brass-500"
        />
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-panel px-3 py-2 text-sm font-medium text-panel-fg hover:bg-panel/90 disabled:opacity-50"
      >
        {pending ? "Вход…" : "Войти"}
      </button>
    </form>
  );
}

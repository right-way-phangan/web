import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Вход — Right Way Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <section className="mx-auto max-w-sm px-4 py-16">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-brass-500">Right Way</p>
      <h1 className="mt-2 text-2xl font-semibold text-forest-900">Вход в админку</h1>
      <p className="mt-1 mb-6 text-sm text-forest-900/60">CRM, объекты, лиды.</p>
      <LoginForm />
    </section>
  );
}

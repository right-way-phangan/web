import type { Metadata } from "next";
import { getUsers } from "@/lib/data/users";
import { UsersManager } from "@/components/admin/users-manager";
import { requireAdmin } from "@/lib/auth/require-admin";

export const metadata: Metadata = { title: "Пользователи", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

/** Аккаунты админки: агенты (TH/EN) видят только закреплённые за ними лиды. */
export default async function AdminUsersPage() {
  await requireAdmin();
  const users = await getUsers();
  return (
    <section className="px-4 py-8 md:px-8">
      <h1 className="text-2xl font-semibold text-forest-900">Пользователи</h1>
      <p className="mt-3 max-w-2xl text-sm text-forest-900/70">
        Агент видит только лиды, закреплённые за ним (выбор «Агент» в карточке лида), каталог без
        контактов собственников и документов, и может заводить новые объекты. Язык интерфейса
        агента — тайский или английский. Тот же email с новым паролем = сброс пароля.
      </p>
      <div className="mt-6">
        <UsersManager users={users} />
      </div>
    </section>
  );
}

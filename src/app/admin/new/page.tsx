import type { Metadata } from "next";
import { ObjectForm } from "@/components/forms/object-form";

export const metadata: Metadata = {
  title: "Новый объект",
  robots: { index: false, follow: false },
};

// Admin intake is dynamic + never cached — it writes to amoCRM.
export const dynamic = "force-dynamic";

export default function NewObjectPage() {
  return (
    <section className="container-prose py-12 md:py-16">
      <div className="mb-8">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-brass-500">
          Admin · приём объектов
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-forest-900 md:text-3xl">
          Новый объект
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-forest-900/70">
          Заполните поля, нажмите «Предпросмотр», проверьте карточку и опубликуйте. Карточка
          создаётся в amoCRM и попадает в каталог сайта. RW-номер присваивается автоматически.
        </p>
      </div>
      <ObjectForm />
    </section>
  );
}

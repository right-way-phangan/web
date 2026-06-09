import type { Metadata } from "next";
import { ProjectsIndex } from "@/components/projects/projects-index";

export const metadata: Metadata = {
  title: "Проекты застройщиков",
  description:
    "Off-plan и готовые проекты застройщиков на Ко Пангане — виллы с бассейном и комплексы: юниты, цена, график платежей и прогноз доходности.",
  alternates: {
    canonical: "/ru/projects",
    languages: { en: "/projects", ru: "/ru/projects" },
  },
};

export const revalidate = 300;

export default function RuProjectsPage() {
  return <ProjectsIndex locale="ru" />;
}

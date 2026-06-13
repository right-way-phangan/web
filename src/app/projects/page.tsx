import type { Metadata } from "next";
import { ProjectsIndex } from "@/components/projects/projects-index";

export const metadata: Metadata = {
  title: "Developer projects",
  description:
    "Off-plan and turnkey developer projects on Koh Phangan — pool villas and complexes with units, pricing, payment schedules and projected returns.",
  alternates: {
    canonical: "/projects",
    languages: { en: "/projects", ru: "/ru/projects", "x-default": "/projects" },
  },
};

export const revalidate = 300;

export default function ProjectsPage() {
  return <ProjectsIndex locale="en" />;
}

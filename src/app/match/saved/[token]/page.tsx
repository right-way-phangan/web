import type { Metadata } from "next";
import { SavedMatchesView } from "@/components/match/saved-matches-view";

export const metadata: Metadata = {
  title: "Your matches",
  robots: { index: false, follow: false }, // приватная magic-link страница
};

export const dynamic = "force-dynamic";

export default async function SavedMatchesPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <SavedMatchesView token={token} locale="en" />;
}

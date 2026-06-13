import type { Metadata, Viewport } from "next";
import { CommandPalette } from "@/components/admin/command-palette";

/**
 * Admin-only PWA wiring: a dedicated manifest (scope /admin, opens on the CRM
 * board) lets the team install the CRM on a phone home screen as a standalone
 * app, separate from the public site.
 */
export const metadata: Metadata = {
  manifest: "/crm-manifest.json",
  appleWebApp: {
    capable: true,
    title: "RW CRM",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#1F3A2E",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <CommandPalette />
    </>
  );
}

import type { Metadata, Viewport } from "next";
import { AdminNav } from "@/components/admin/admin-nav";
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
      {/* Навигация одна на всю админку; страницы её не подключают. Отступы
          повторяют стандартную обёртку страниц (px-4 md:px-8), низ даёт
          собственный mb навигации. */}
      <div className="px-4 pt-8 md:px-8">
        <AdminNav />
      </div>
      {children}
      <CommandPalette />
    </>
  );
}

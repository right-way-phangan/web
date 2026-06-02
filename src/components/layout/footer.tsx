import Link from "next/link";
import type { Route } from "next";
import { Logo } from "./logo";
import {
  siteConfig,
  telegramChannelLink,
  telegramDmLink,
  whatsappLink,
} from "@/lib/site-config";

const currentYear = new Date().getFullYear();

export function Footer() {
  return (
    <footer className="mt-32 border-t border-forest-500/10 bg-cream-200/40">
      <div className="container-prose py-16">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-2 max-w-md">
            <Logo size="lg" />
            <p className="mt-4 text-sm text-forest-500/70 leading-relaxed">
              {siteConfig.description}
            </p>
            <p className="mt-6 text-xs text-forest-500/50 leading-relaxed">
              Right Way Phangan Group is a Koh Phangan–based real estate
              agency focused on land, villas, and houses for international
              buyers.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-medium uppercase tracking-[0.2em] text-forest-500/50">
              Explore
            </h4>
            <ul className="mt-5 space-y-3">
              {siteConfig.nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href as Route}
                    className="text-sm text-forest-500 hover:text-brass-500 transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-medium uppercase tracking-[0.2em] text-forest-500/50">
              Contact
            </h4>
            <ul className="mt-5 space-y-3 text-sm">
              <li>
                <a
                  href={whatsappLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-forest-500 hover:text-brass-500 transition-colors"
                >
                  WhatsApp
                </a>
              </li>
              <li>
                <a
                  href={telegramDmLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-forest-500 hover:text-brass-500 transition-colors"
                >
                  Telegram chat
                </a>
              </li>
              <li>
                <a
                  href={telegramChannelLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-forest-500 hover:text-brass-500 transition-colors"
                >
                  Channel @{siteConfig.contact.telegram.channel}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${siteConfig.contact.email}`}
                  className="text-forest-500 hover:text-brass-500 transition-colors"
                >
                  {siteConfig.contact.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-forest-500/10 pt-8 md:flex-row md:items-center md:justify-between">
          <p className="text-xs text-forest-500/50">
            © {currentYear} Right Way Phangan Group. All rights reserved.
          </p>
          <p className="text-xs text-forest-500/50">
            Koh Phangan, Thailand
          </p>
        </div>
      </div>
    </footer>
  );
}

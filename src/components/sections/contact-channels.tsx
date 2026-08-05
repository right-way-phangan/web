import { MessageCircle, Send, Phone, Mail, MapPin } from "lucide-react";
import {
  siteConfig,
  whatsappLink,
  telegramDmLink,
  telegramChannelLink,
  phoneDisplay,
  telLink,
} from "@/lib/site-config";
import type { ContactDict } from "@/lib/i18n/dictionaries";

/**
 * Колонка прямых каналов на странице контактов. Общая для EN и RU: раньше
 * каждая версия несла свою разметку, и русская отставала на несколько правок
 * (не было канала Telegram и блока «Офис»).
 */
export function ContactChannels({ dict }: { dict: ContactDict }) {
  const c = dict.channels;
  return (
    <aside className="space-y-6">
      <div>
        <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-brass-500">
          {dict.channelsHeading}
        </h2>
        <ul className="mt-4 space-y-3">
          <ContactRow icon={MessageCircle} label={c.whatsapp} value={c.whatsappHint} href={whatsappLink()} />
          <ContactRow
            icon={Send}
            label={c.tgChat}
            value={`@${siteConfig.contact.telegram.bot}`}
            href={telegramDmLink()}
          />
          <ContactRow
            icon={Send}
            label={c.tgChannel}
            value={`@${siteConfig.contact.telegram.channel}`}
            href={telegramChannelLink()}
          />
          <ContactRow icon={Phone} label={c.call} value={phoneDisplay()} href={telLink()} />
          <ContactRow
            icon={Mail}
            label={c.email}
            value={siteConfig.contact.email}
            href={`mailto:${siteConfig.contact.email}`}
          />
        </ul>
      </div>

      <div className="border-t border-forest-500/10 pt-6">
        <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-brass-500">
          {dict.office.heading}
        </h2>
        <div className="mt-4 flex items-start gap-3 text-sm text-forest-500">
          <MapPin className="mt-0.5 h-4 w-4 text-forest-500/50" />
          <div>
            <p>{dict.office.place}</p>
            <p className="mt-1 text-xs text-forest-500/60">{dict.office.note}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function ContactRow({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: typeof MessageCircle;
  label: string;
  value: string;
  href: string;
}) {
  return (
    <li>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="group -m-2 flex items-start gap-3 rounded-sm border border-transparent p-2 transition-colors hover:border-forest-500/10 hover:bg-cream-200/40"
      >
        <Icon className="mt-1 h-4 w-4 shrink-0 text-forest-500/50 transition-colors group-hover:text-brass-500" />
        <div className="min-w-0">
          <p className="text-sm font-medium text-forest-900 transition-colors group-hover:text-brass-500">
            {label}
          </p>
          <p className="truncate text-xs text-forest-500/60">{value}</p>
        </div>
      </a>
    </li>
  );
}

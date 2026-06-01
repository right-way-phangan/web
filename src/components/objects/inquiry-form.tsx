import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  whatsappLink,
  telegramDmLink,
} from "@/lib/site-config";

interface Props {
  rwNumber: string;
}

/**
 * Sticky inquiry form on object detail pages. Real submit handler lands
 * on Day 7 (Server Action → amoCRM lead create). Today the button is
 * disabled and we direct interested visitors to direct channels.
 */
export function InquiryForm({ rwNumber }: Props) {
  const defaultMessage = `Hi — I'd like more information about ${rwNumber}.`;

  return (
    <aside className="rounded-sm border border-forest-500/10 bg-cream-50 p-6 md:sticky md:top-24">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-brass-500">
        Inquire about
      </p>
      <h2 className="mt-2 font-serif text-2xl text-forest-900">{rwNumber}</h2>
      <p className="mt-2 text-sm text-forest-500/70">
        We reply within the working day, usually within an hour.
      </p>

      <form className="mt-6 space-y-4" aria-label="Inquiry form">
        <div className="space-y-1.5">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" placeholder="Your name" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@email.com"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">Phone (optional)</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            placeholder="+66 ..."
            inputMode="tel"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="message">Message</Label>
          <Textarea
            id="message"
            name="message"
            defaultValue={defaultMessage}
            rows={4}
          />
        </div>
        <Button type="submit" variant="primary" size="md" className="w-full" disabled>
          <Send className="h-4 w-4" />
          Send inquiry
        </Button>
        <p className="text-center text-[11px] text-forest-500/50">
          Form goes live Day 7. Reach us now via:
        </p>
      </form>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Button asChild variant="outline" size="sm">
          <a
            href={whatsappLink(defaultMessage)}
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp
          </a>
        </Button>
        <Button asChild variant="outline" size="sm">
          <a
            href={telegramDmLink(`interest_${rwNumber}`)}
            target="_blank"
            rel="noopener noreferrer"
          >
            Telegram
          </a>
        </Button>
      </div>
    </aside>
  );
}

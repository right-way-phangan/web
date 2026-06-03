"use client";

import { Mail } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LeadForm } from "@/components/forms/lead-form";

/**
 * "Get this calculation" — opens a dialog with the standard lead form,
 * pre-filled with the calculation summary. Submits through the same amoCRM +
 * Telegram pipeline as object inquiries, tagged `calculator`.
 */
export function CalcLeadButton({ message, rwNumber }: { message: string; rwNumber?: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="primary" size="md" className="w-full">
          <Mail className="h-4 w-4" />
          Get this calculation
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Get this calculation</DialogTitle>
          <DialogDescription>
            We&apos;ll send it over and answer any questions — usually within the hour.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-2">
          <LeadForm
            source={rwNumber ? "object" : "contact"}
            rwNumber={rwNumber}
            kind="calculator"
            defaultMessage={message}
            layout="card"
            submitLabel="Send me this calculation"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

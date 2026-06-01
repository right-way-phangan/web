import * as React from "react";
import { cn } from "@/lib/utils/cn";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex min-h-[100px] w-full rounded-sm border border-forest-500/20 bg-cream-50 px-4 py-3 text-sm text-forest-900 placeholder:text-forest-500/40",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500/30 focus-visible:border-forest-500",
      "disabled:cursor-not-allowed disabled:opacity-50 resize-y",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export { Textarea };

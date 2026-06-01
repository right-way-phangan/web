import * as React from "react";
import { cn } from "@/lib/utils/cn";

const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => (
  <input
    type={type}
    ref={ref}
    className={cn(
      "flex h-11 w-full rounded-sm border border-forest-500/20 bg-cream-50 px-4 py-2 text-sm text-forest-900 placeholder:text-forest-500/40",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500/30 focus-visible:border-forest-500",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "file:border-0 file:bg-transparent file:text-sm file:font-medium",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";

export { Input };

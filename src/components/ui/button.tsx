import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const buttonVariants = cva(
  "group/btn inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-[color,background-color,border-color,box-shadow,transform] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] motion-reduce:active:scale-100 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500/35 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-100 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:transition-transform [&_svg]:duration-300 hover:[&_svg]:translate-x-0.5",
  {
    variants: {
      variant: {
        // Dark: forest is inverted to a muted light, so a solid forest button
        // would read as washed grey-green. Override to a confident bright pill
        // with dark text (panel-fg / panel never invert). outline/ghost/link
        // need no dark override — their forest tints/borders invert correctly.
        primary:
          // Light: my premium lift motion. Dark: forest inverts to muted light,
          // so override to a confident bright pill with dark text (panel-fg /
          // panel never invert).
          "bg-forest-500 text-cream-100 hover:-translate-y-px hover:bg-forest-400 hover:shadow-lift active:translate-y-0 active:bg-forest-900 active:shadow-none dark:bg-panel-fg dark:text-panel dark:shadow-[0_10px_28px_-14px_rgba(0,0,0,0.7)] dark:hover:bg-panel-fg/90 dark:hover:translate-y-0 dark:active:bg-panel-fg/80",
        accent:
          // Light: deep-amber fill + light text (brass-500 tuned AA) + my lift
          // motion; hover goes DARKER. Dark: warm gold gradient + dark text.
          "bg-brass-500 text-cream-50 hover:-translate-y-px hover:bg-brass-600 hover:shadow-lift active:translate-y-0 active:bg-brass-700 active:shadow-none dark:bg-gradient-to-b dark:from-brass-400 dark:to-brass-600 dark:text-panel dark:shadow-[0_10px_30px_-10px_rgba(229,174,112,0.5)] dark:hover:from-brass-300 dark:hover:to-brass-500 dark:active:from-brass-400 dark:active:to-brass-600",
        outline:
          "border border-forest-500/30 text-forest-500 hover:bg-forest-500 hover:text-cream-100 hover:border-forest-500",
        ghost:
          "text-forest-500 hover:bg-forest-500/5",
        link:
          "text-forest-500 underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-9 px-4 text-sm rounded-sm",
        md: "h-11 px-6 text-sm rounded-sm",
        lg: "h-12 px-8 text-base rounded-sm",
        icon: "h-10 w-10 rounded-sm",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };

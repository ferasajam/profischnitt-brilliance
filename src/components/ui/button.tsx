import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "border-2 border-[hsl(0,0%,80%)] bg-[hsl(0,0%,12%)] text-[hsl(0,0%,80%)] hover:bg-[hsl(0,0%,20%)] hover:text-[hsl(0,0%,95%)] font-semibold",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        // Luxury silver variants
        silver: "bg-gradient-to-r from-[hsl(0,0%,80%)] to-[hsl(0,0%,95%)] text-[hsl(0,0%,20%)] font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]",
        silverOutline: "border-2 border-[hsl(0,0%,80%)] text-[hsl(0,0%,40%)] bg-transparent hover:bg-[hsl(0,0%,90%)] hover:text-[hsl(0,0%,20%)] font-semibold",
        luxury: "relative overflow-hidden bg-primary text-primary-foreground font-semibold before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-700",
        dark: "bg-secondary text-foreground border border-border hover:border-primary hover:text-primary font-medium",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        xl: "h-14 rounded-md px-10 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
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
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };

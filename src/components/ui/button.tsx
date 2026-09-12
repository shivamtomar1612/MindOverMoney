import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg border text-sm font-medium transition-colors duration-150 disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "border-primary bg-primary text-primary-foreground hover:bg-[#125a41]",
        outline: "border-border bg-surface text-foreground hover:border-[#b9c4bd] hover:bg-surface-muted",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-[#dde3de]",
        ghost: "border-transparent bg-transparent text-muted-foreground hover:bg-surface-muted hover:text-foreground",
        destructive: "border-danger/20 bg-danger/8 text-danger hover:bg-danger/12",
        link: "border-transparent bg-transparent p-0 text-primary hover:underline",
      },
      size: {
        default: "h-9 px-3.5",
        xs: "h-7 px-2 text-xs",
        sm: "h-8 px-3 text-xs",
        lg: "h-10 px-4",
        icon: "size-9 p-0",
        "icon-xs": "size-7 p-0",
        "icon-sm": "size-8 p-0",
        "icon-lg": "size-10 p-0",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

function Button({ className, variant = "default", size = "default", ...props }: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return <ButtonPrimitive data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button, buttonVariants };

"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { ExternalLink } from "lucide-react";

const linkVariants = cva(
  [
    // Base
    "inline-flex",
    "items-center",
    "gap-1.5",
    "transition-colors",
    "duration-200",
    "cursor-pointer",
    
    // Focus states (accessible ring)
    "focus-visible:outline-none",
    "focus-visible:ring-2",
    "focus-visible:ring-ring",
    "focus-visible:ring-offset-2",
    "rounded-sm", // small radius for the focus ring

    // Disabled state
    "data-[disabled=true]:pointer-events-none",
    "data-[disabled=true]:opacity-50",
    "data-[disabled=true]:cursor-not-allowed",
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          "relative",
          "font-semibold",
          "text-secondary",
          "hover:text-secondary-400",
          "active:text-secondary-600",
          "after:absolute",
          "after:bottom-[-2px]",
          "after:left-0",
          "after:h-[2px]",
          "after:w-0",
          "after:bg-secondary",
          "after:transition-all",
          "after:duration-300",
          "after:ease-out",
          "hover:after:w-full",
        ].join(" "),
        inline: [
          // Overrides inline-flex with inline for text wrapping
          "!inline",
          "relative",
          "font-semibold",
          "text-secondary",
          "hover:text-secondary-400",
          "active:text-secondary-600",
          "leading-normal",
          "after:absolute",
          "after:bottom-[-2px]",
          "after:left-0",
          "after:h-[2px]",
          "after:w-0",
          "after:bg-secondary",
          "after:transition-all",
          "after:duration-300",
          "after:ease-out",
          "hover:after:w-full",
        ].join(" "),
      },
      size: {
        sm: "text-body-sm",
        default: "text-body",
        lg: "text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface LinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof linkVariants> {
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  isExternal?: boolean;
  isDisabled?: boolean;
}

const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  (
    {
      className,
      variant,
      size,
      leadingIcon,
      trailingIcon,
      isExternal,
      isDisabled,
      href,
      children,
      ...props
    },
    ref
  ) => {
    // Determine icon sizes based on text size
    const isInline = variant === "inline";

    const iconClasses = cn(
      "shrink-0 flex items-center justify-center",
      size === "lg" ? "[&_svg]:size-5" : size === "sm" ? "[&_svg]:size-3.5" : "[&_svg]:size-4",
      isInline && "inline-flex align-text-bottom"
    );

    const content = (
      <>
        {leadingIcon && (
          <span className={cn(iconClasses, isInline && "mr-1.5")}>
            {leadingIcon}
          </span>
        )}
        <span className={cn(isInline && "align-middle")}>{children}</span>
        {trailingIcon && !isExternal && (
          <span className={cn(iconClasses, isInline && "ml-1.5")}>
            {trailingIcon}
          </span>
        )}
        {isExternal && (
          <span className={cn(iconClasses, isInline && "ml-1.5")}>
            <ExternalLink />
          </span>
        )}
      </>
    );

    return (
      <a
        ref={ref}
        href={isDisabled ? undefined : href}
        className={cn(linkVariants({ variant, size }), className)}
        data-disabled={isDisabled}
        tabIndex={isDisabled ? -1 : undefined}
        {...(isExternal && !isDisabled ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...props}
      >
        {content}
      </a>
    );
  }
);

Link.displayName = "Link";

export { Link, linkVariants };

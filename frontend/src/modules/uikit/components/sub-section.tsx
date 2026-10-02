import React from "react";
import { UIKitContext } from "../views/uikit-view";

export interface SubSectionProps {
  icon?: React.ElementType;
  id?: string;
  title: string;
  description?: string | React.ReactNode;
  children: React.ReactNode;
  registerSection?: (id: string, el: HTMLElement | null) => void;
  isEditable?: boolean;
  color?: "primary" | "secondary" | "success" | "warning" | "danger" | "info" | "neutral";
}

export function SubSection({ id, title, description, children, registerSection, icon: Icon, isEditable, color = "primary" }: SubSectionProps) {
  const { showOnlyEditable } = React.useContext(UIKitContext);

  if (showOnlyEditable && !isEditable) {
    return null;
  }

  const textColorClass = {
    primary: "text-primary",
    secondary: "text-secondary",
    success: "text-success",
    warning: "text-warning",
    danger: "text-danger",
    info: "text-info",
    neutral: "text-foreground"
  }[color];

  return (
    <section
      id={id}
      ref={(el) => {
        if (id) registerSection?.(id, el);
      }}
      className="w-full bg-surface border border-border/50 rounded-[2rem] p-8 md:p-10 flex flex-col shadow-sm scroll-mt-24"
    >
      <div className="flex flex-col gap-2 mb-8">
        <h3 className={`text-h3 font-heading font-bold ${textColorClass} flex items-center gap-3`}>
          {Icon && <Icon className={`size-7 ${textColorClass} shrink-0`} strokeWidth={2.5} />}
          {title}</h3>
        {description && <div className="text-sm text-muted-foreground leading-relaxed">{description}</div>}
      </div>
      <div className="w-full">
        {children}
      </div>
    </section>
  );
}

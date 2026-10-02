import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

export interface CapacityCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title: React.ReactNode;
  description: React.ReactNode;
  icon: LucideIcon;
  color?: 'primary' | 'success' | 'info' | 'warning' | 'danger';
}

export function CapacityCard({
  title,
  description,
  icon: Icon,
  color = 'primary',
  className,
  ...props
}: CapacityCardProps) {
  const colorMap = {
    primary: {
      accent: 'var(--color-primary-500)',
      glow: 'rgba(var(--primitive-primary-500), 0.18)',
      bgClass: 'bg-primary/10 group-hover:bg-primary',
      textClass: 'text-primary group-hover:text-primary-foreground',
      titleHover: 'group-hover:text-primary',
    },
    success: {
      accent: 'var(--color-success-500)',
      glow: 'rgba(var(--primitive-success-500), 0.18)',
      bgClass: 'bg-success/10 group-hover:bg-success',
      textClass: 'text-success group-hover:text-success-foreground',
      titleHover: 'group-hover:text-success',
    },
    info: {
      accent: 'var(--color-info-500)',
      glow: 'rgba(var(--primitive-info-500), 0.18)',
      bgClass: 'bg-info/10 group-hover:bg-info',
      textClass: 'text-info group-hover:text-info-foreground',
      titleHover: 'group-hover:text-info',
    },
    warning: {
      accent: 'var(--color-warning-500)',
      glow: 'rgba(var(--primitive-warning-500), 0.18)',
      bgClass: 'bg-warning/10 group-hover:bg-warning',
      textClass: 'text-warning group-hover:text-warning-foreground',
      titleHover: 'group-hover:text-warning',
    },
    danger: {
      accent: 'var(--color-danger-500)',
      glow: 'rgba(var(--primitive-danger-500), 0.18)',
      bgClass: 'bg-danger/10 group-hover:bg-danger',
      textClass: 'text-danger group-hover:text-danger-foreground',
      titleHover: 'group-hover:text-danger',
    }
  };

  const selectedColor = colorMap[color];

  return (
    <Card 
      className={cn(
        "capacity-card bg-background/70 backdrop-blur-md border border-border/60 hover:border-transparent rounded-[11px] group hover:-translate-y-[2px] hover:shadow-sm transition-all duration-500",
        className
      )}
      style={{ 
        '--card-accent': selectedColor.accent, 
        '--card-glow': selectedColor.glow,
        ...props.style 
      } as React.CSSProperties}
      {...props}
    >
      <CardContent className="p-2 flex gap-2 items-start relative z-10 bg-transparent">
        <div className={cn("size-9 rounded-lg flex items-center justify-center shrink-0 transition-colors mt-0.5", selectedColor.bgClass, selectedColor.textClass)}>
          <Icon className="size-5" />
        </div>
        <div className="flex flex-col text-left">
          <span className={cn("font-heading font-bold text-sm text-foreground leading-tight line-clamp-1 transition-colors duration-300", selectedColor.titleHover)}>{title}</span>
          <span className="text-xs text-muted-foreground mt-0.5 leading-snug">{description}</span>
        </div>
      </CardContent>
    </Card>
  );
}

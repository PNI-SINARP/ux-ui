import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

export interface CapacityCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title: React.ReactNode;
  description: React.ReactNode;
  icon: LucideIcon;
  color?: 'primary' | 'secondary' | 'neutral' | 'success' | 'info' | 'warning' | 'danger';
  watermark?: boolean;
  contentClassName?: string;
  children?: React.ReactNode;
}

export function CapacityCard({
  title,
  description,
  icon: Icon,
  color = 'primary',
  watermark = false,
  contentClassName,
  className,
  children,
  ...props
}: CapacityCardProps) {
  const colorMap = {
    primary: {
      accent: 'var(--color-primary-500)',
      glow: 'color-mix(in srgb, var(--color-primary-500) 20%, transparent)',
      bgClass: 'bg-primary/10 group-hover:bg-primary',
      textClass: 'text-primary group-hover:text-primary-foreground',
      titleHover: 'group-hover:text-primary',
      watermarkClass: 'text-primary/5 group-hover:text-primary/10',
    },
    secondary: {
      accent: 'var(--color-secondary-500)',
      glow: 'color-mix(in srgb, var(--color-secondary-500) 20%, transparent)',
      bgClass: 'bg-secondary/10 group-hover:bg-secondary',
      textClass: 'text-secondary group-hover:text-secondary-foreground',
      titleHover: 'group-hover:text-secondary',
      watermarkClass: 'text-secondary/5 group-hover:text-secondary/10',
    },
    neutral: {
      accent: 'var(--color-neutral-500)',
      glow: 'color-mix(in srgb, var(--color-neutral-500) 20%, transparent)',
      bgClass: 'bg-neutral-500/10 group-hover:bg-neutral-600',
      textClass: 'text-neutral-500 group-hover:text-white',
      titleHover: 'group-hover:text-neutral-700 dark:group-hover:text-neutral-300',
      watermarkClass: 'text-neutral-500/5 group-hover:text-neutral-500/10',
    },
    success: {
      accent: 'var(--color-success-500)',
      glow: 'color-mix(in srgb, var(--color-success-500) 20%, transparent)',
      bgClass: 'bg-success/10 group-hover:bg-success',
      textClass: 'text-success group-hover:text-success-foreground',
      titleHover: 'group-hover:text-success',
      watermarkClass: 'text-success/5 group-hover:text-success/10',
    },
    info: {
      accent: 'var(--color-info-500)',
      glow: 'color-mix(in srgb, var(--color-info-500) 20%, transparent)',
      bgClass: 'bg-info/10 group-hover:bg-info',
      textClass: 'text-info group-hover:text-info-foreground',
      titleHover: 'group-hover:text-info',
      watermarkClass: 'text-info/5 group-hover:text-info/10',
    },
    warning: {
      accent: 'var(--color-warning-500)',
      glow: 'color-mix(in srgb, var(--color-warning-500) 20%, transparent)',
      bgClass: 'bg-warning/10 group-hover:bg-warning',
      textClass: 'text-warning group-hover:text-warning-foreground',
      titleHover: 'group-hover:text-warning',
      watermarkClass: 'text-warning/5 group-hover:text-warning/10',
    },
    danger: {
      accent: 'var(--color-danger-500)',
      glow: 'color-mix(in srgb, var(--color-danger-500) 20%, transparent)',
      bgClass: 'bg-danger/10 group-hover:bg-danger',
      textClass: 'text-danger group-hover:text-danger-foreground',
      titleHover: 'group-hover:text-danger',
      watermarkClass: 'text-danger/5 group-hover:text-danger/10',
    }
  };

  const selectedColor = colorMap[color] || colorMap.primary;

  return (
    <Card 
      innerClassName="p-0 flex flex-col h-full w-full"
      className={cn(
        "capacity-card bg-surface/80 backdrop-blur-md border border-border/60 hover:border-transparent rounded-2xl group hover:-translate-y-1 hover:shadow-md transition-all duration-500 relative overflow-hidden flex flex-col justify-between",
        className
      )}
      style={{ 
        '--card-accent': selectedColor.accent, 
        '--card-glow': selectedColor.glow,
        ...props.style 
      } as React.CSSProperties}
      {...props}
    >
      <CardContent className={cn("p-4 flex flex-col h-full justify-between gap-3 relative z-10 bg-transparent", contentClassName)}>
        <div className="flex gap-2.5 items-start w-full relative z-20">
          <div className={cn("size-9 sm:size-10 rounded-xl flex items-center justify-center shrink-0 transition-colors shadow-xs border border-transparent mt-0.5", selectedColor.bgClass, selectedColor.textClass)}>
            <Icon className="size-5" />
          </div>
          <div className="flex flex-col text-left space-y-1">
            <span className={cn("font-heading font-bold text-xs sm:text-sm text-foreground leading-tight transition-colors duration-300", selectedColor.titleHover)}>
              {title}
            </span>
            <span className="text-[11px] text-muted-foreground leading-snug font-normal">
              {description}
            </span>
          </div>
        </div>
        {children}
      </CardContent>
      {watermark && (
        <Icon className={cn("absolute -bottom-4 -right-3 size-24 opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 pointer-events-none z-0", selectedColor.watermarkClass)} />
      )}
    </Card>
  );
}

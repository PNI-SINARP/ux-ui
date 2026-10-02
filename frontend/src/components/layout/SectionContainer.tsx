import React from 'react';
import { cn } from '@/lib/utils';

interface SectionContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function SectionContainer({ children, className, ...props }: SectionContainerProps) {
  return (
    <div 
      className={cn("container mx-auto px-6 sm:px-8 lg:px-10 max-w-7xl", className)}
      {...props}
    >
      {children}
    </div>
  );
}

import * as React from 'react';
import { cn } from '../../lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'border border-tallyBorder bg-white shadow-none rounded-sm',
        className,
      )}
      {...props}
    />
  );
}


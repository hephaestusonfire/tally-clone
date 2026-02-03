import * as React from 'react';
import { cn } from '../../lib/utils';

export interface ScrollAreaProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export function ScrollArea({ className, ...props }: ScrollAreaProps) {
  return (
    <div
      className={cn(
        'overflow-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent',
        className,
      )}
      {...props}
    />
  );
}


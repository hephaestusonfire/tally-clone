import * as React from 'react';
import { cn } from '../../lib/utils';

export interface TabsRootProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export function Tabs({ value, onValueChange, className, children }: TabsRootProps) {
  return (
    <div className={cn('flex flex-col', className)}>
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        return React.cloneElement(child as any, {
          currentValue: value,
          onValueChange,
        });
      })}
    </div>
  );
}

interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  currentValue?: string;
  onValueChange?: (value: string) => void;
}

export function TabsList({ className, children, ...props }: TabsListProps) {
  return (
    <div
      className={cn(
        'flex border-b border-tallyBorder gap-px bg-[#C0C0C0]',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface TabsTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  tabValue: string;
  currentValue?: string;
  onValueChange?: (value: string) => void;
}

export function TabsTrigger({
  tabValue,
  currentValue,
  onValueChange,
  className,
  children,
  ...props
}: TabsTriggerProps) {
  const isActive = currentValue === tabValue;
  return (
    <button
      type="button"
      onClick={() => onValueChange && onValueChange(tabValue)}
      className={cn(
        'px-3 py-1 text-[11px] font-semibold border-t border-l border-r border-tallyBorder',
        isActive ? 'bg-tallyYellow' : 'bg-[#C0C0C0] hover:bg-[#d8d8d8]',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  when: string;
  currentValue?: string;
}

export function TabsContent({
  when,
  currentValue,
  className,
  ...props
}: TabsContentProps) {
  if (currentValue !== when) return null;
  return (
    <div
      className={cn('border border-tallyBorder border-t-0', className)}
      {...props}
    />
  );
}


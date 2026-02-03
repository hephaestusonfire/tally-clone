import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '../../lib/utils';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: 'default' | 'outline' | 'ghost' | 'subtle';
  size?: 'xs' | 'sm' | 'md';
}

const baseClasses =
  'inline-flex items-center justify-center border border-tallyBorder text-[11px] font-semibold leading-none tracking-tight rounded-none';

const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
  default:
    'bg-tallyNavy text-white hover:bg-[#02509a] disabled:bg-[#7f8fb0] disabled:text-gray-100',
  outline:
    'bg-tallyBgLight text-black hover:bg-[#d7e6f7] disabled:text-gray-500 disabled:bg-gray-200',
  ghost: 'bg-transparent text-black hover:bg-[#E0E0E0] disabled:text-gray-500',
  subtle:
    'bg-[#FFF5F5] text-black hover:bg-[#e2f0ff] disabled:text-gray-500 border-none',
};

const sizes: Record<NonNullable<ButtonProps['size']>, string> = {
  xs: 'h-6 px-2',
  sm: 'h-7 px-3',
  md: 'h-8 px-4',
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'default',
      size = 'sm',
      asChild = false,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        ref={ref}
        className={cn(baseClasses, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  },
);

Button.displayName = 'Button';

export { Button };


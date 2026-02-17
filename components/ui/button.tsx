import * as React from 'react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  asChild?: boolean;
}

const baseStyles =
  'inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-60';

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-primary-foreground shadow-sm hover:-translate-y-0.5 hover:shadow-card',
  secondary:
    'border border-border bg-secondary text-secondary-foreground shadow-sm hover:-translate-y-0.5 hover:shadow-card',
  ghost: 'text-foreground hover:bg-surface',
  danger: 'bg-rose-600 text-white hover:bg-rose-700'
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2',
  lg: 'px-5 py-3 text-base'
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading,
      asChild,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const content = isLoading ? (
      <span className="flex items-center gap-2">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
        Loading
      </span>
    ) : (
      children
    );

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
        className: cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          (children.props as { className?: string }).className,
          className
        ),
        ...props
      });
    }

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        {...props}
      >
        {content}
      </button>
    );
  }
);

Button.displayName = 'Button';

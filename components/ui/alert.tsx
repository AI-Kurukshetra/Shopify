import * as React from 'react';
import { cn } from '@/lib/utils';

type AlertVariant = 'info' | 'success' | 'warning' | 'error';

const styles: Record<AlertVariant, string> = {
  info: 'border-border bg-surface text-foreground',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-100',
  warning: 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-100',
  error: 'border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-800/60 dark:bg-rose-950/40 dark:text-rose-100'
};

const iconStyles: Record<AlertVariant, string> = {
  info: 'text-primary',
  success: 'text-emerald-600',
  warning: 'text-amber-600',
  error: 'text-rose-600'
};

export function Alert({
  className,
  variant = 'info',
  title,
  children
}: {
  className?: string;
  variant?: AlertVariant;
  title?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      role="alert"
      aria-live={variant === 'error' ? 'assertive' : 'polite'}
      className={cn(
        'flex gap-3 rounded-xl border px-4 py-3 text-sm font-medium',
        styles[variant],
        className
      )}
    >
      <span className={cn('mt-0.5 h-5 w-5', iconStyles[variant])}>
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
          <path
            d="M12 9v4m0 4h.01m8.938-5c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <div className="space-y-1">
        {title ? <p className="text-sm font-semibold">{title}</p> : null}
        {children ? <div className="text-sm font-normal">{children}</div> : null}
      </div>
    </div>
  );
}

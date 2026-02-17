import * as React from 'react';
import { cn } from '@/lib/utils';

export function FormField({
  label,
  htmlFor,
  hint,
  error,
  children,
  className
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string | null;
  children: React.ReactNode;
  className?: string;
}) {
  const describedBy = error ? `${htmlFor}-error` : hint ? `${htmlFor}-hint` : undefined;

  const content = React.isValidElement(children)
    ? React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
        id: htmlFor,
        'aria-describedby': describedBy,
        'aria-invalid': Boolean(error)
      })
    : children;

  return (
    <div className={cn('space-y-2', className)}>
      <label className="text-sm font-semibold text-slate-800" htmlFor={htmlFor}>
        {label}
      </label>
      {content}
      {hint ? (
        <p id={`${htmlFor}-hint`} className="text-xs text-slate-500">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${htmlFor}-error`} className="text-xs font-medium text-rose-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}

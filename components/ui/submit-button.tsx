'use client';

import { useFormStatus } from 'react-dom';
import { Button } from './button';

export function SubmitButton({
  children,
  variant,
  size,
  className
}: {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant={variant}
      size={size}
      isLoading={pending}
      className={className}
    >
      {children}
    </Button>
  );
}

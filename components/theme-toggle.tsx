'use client';

import { Button } from '@/components/ui/button';
import { useTheme } from './theme-provider';

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={toggleTheme}
      aria-pressed={theme === 'dark'}
      className={className}
    >
      {theme === 'dark' ? 'Light mode' : 'Dark mode'}
    </Button>
  );
}

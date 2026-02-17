import * as React from 'react';
import { cn } from '@/lib/utils';

const palettes = [
  ['#f1f5f9', '#e2e8f0'],
  ['#fff7ed', '#fed7aa'],
  ['#ecfeff', '#a5f3fc'],
  ['#fdf2f8', '#fbcfe8'],
  ['#f0fdf4', '#bbf7d0'],
  ['#eef2ff', '#c7d2fe']
];

function hashSeed(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function ProductImage({
  src,
  alt,
  className,
  seed
}: {
  src?: string | null;
  alt: string;
  className?: string;
  seed?: string;
}) {
  const fallbackSeed = seed ?? alt ?? 'product';
  const [from, to] = palettes[hashSeed(fallbackSeed) % palettes.length];
  const fallbackStyle = src
    ? undefined
    : {
        backgroundImage: `linear-gradient(135deg, ${from}, ${to})`
      };

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200',
        className
      )}
      style={fallbackStyle}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-slate-400">
          No image
        </div>
      )}
    </div>
  );
}

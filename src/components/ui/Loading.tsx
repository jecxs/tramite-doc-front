'use client';

import { Loader2 } from 'lucide-react';

interface LoadingProps {
  label?: string;
  fullScreen?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  height?: string;
  noBackground?: boolean;
}

export default function Loading({
  label = 'Cargando...',
  fullScreen = false,
  className = '',
  size = 'md',
  height,
  noBackground = false,
}: LoadingProps) {
  const containerBase = 'flex items-center justify-center';
  const bg = noBackground ? '' : 'bg-background';
  const h = fullScreen ? 'min-h-screen' : height ? height : 'h-96';

  const sizeMap: Record<'sm' | 'md' | 'lg', string> = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`${containerBase} ${bg} ${h} ${className}`}>
      <div className='text-center'>
        <Loader2 className={`${sizeMap[size]} animate-spin text-primary mx-auto mb-4`} />
        <p className='text-muted-foreground'>{label}</p>
      </div>
    </div>
  );
}

import type { ComponentProps } from 'react';

// Local shadcn/ui Card surface, styled by this site's CSS.
export function Card({ className = '', ...props }: ComponentProps<'div'>) {
  return <div data-slot="card" className={`ui-card ${className}`} {...props} />;
}

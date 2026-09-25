import type { ComponentProps } from 'react';

type BadgeVariant = 'default' | 'blue' | 'orange' | 'indigo' | 'violet';

// Adapted from Spell UI's shadcn registry Badge for the variants used here.
// https://spell.sh/docs/badge
export function Badge({ className = '', variant = 'default', ...props }: ComponentProps<'span'> & { variant?: BadgeVariant }) {
  return <span data-slot="badge" className={`ui-badge ui-badge-${variant} ${className}`} {...props} />;
}

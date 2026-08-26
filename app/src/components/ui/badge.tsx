import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex w-fit shrink-0 items-center justify-center rounded-full border border-transparent font-medium whitespace-nowrap tabular-nums',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground',
        secondary: 'border-border bg-secondary text-secondary-foreground',
        outline: 'border-border bg-background text-foreground',
        success:
          'border-[var(--color-utility-success-200)] bg-[var(--color-utility-success-50)] text-[var(--color-utility-success-700)]',
      },
      size: {
        default: 'min-h-[22px] px-2 py-0.5 text-xs leading-[18px]',
        sm: 'h-5 px-2 text-xs font-normal leading-none',
        xs: 'h-4 min-w-4 px-1 text-[10px] leading-none',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

function Badge({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  ...props
}: React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : 'span';

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      data-size={size}
      className={cn(badgeVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Badge, badgeVariants };

import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        destructive: 'border-transparent bg-destructive text-destructive-foreground',
        outline: 'text-foreground',
        success: 'border-transparent bg-success/20 text-success',
        warning: 'border-transparent bg-warning/20 text-warning',
        info: 'border-transparent bg-info/20 text-info',
        critical: 'border-transparent bg-destructive/20 text-destructive animate-pulse-critical',
        high: 'border-transparent bg-orange-500/20 text-orange-400',
        medium: 'border-transparent bg-yellow-500/20 text-yellow-400',
        low: 'border-transparent bg-green-500/20 text-green-400',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };

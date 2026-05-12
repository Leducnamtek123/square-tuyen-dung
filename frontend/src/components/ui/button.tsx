import type { ButtonHTMLAttributes, Ref } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-full px-5 text-sm font-semibold tracking-normal transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/25 disabled:pointer-events-none disabled:opacity-50 active:translate-y-0',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-[0_8px_18px_rgba(26,64,125,0.16)] hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-[0_10px_22px_rgba(26,64,125,0.2)]',
        ghost: 'text-foreground hover:bg-accent/80 hover:text-accent-foreground',
        outline:
          'border border-primary/20 bg-white/80 text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] hover:-translate-y-0.5 hover:border-primary/35 hover:bg-white hover:shadow-[0_12px_28px_rgba(26,64,125,0.12)]',
        destructive:
          'bg-destructive text-destructive-foreground shadow-[0_12px_28px_rgba(220,38,38,0.2)] hover:-translate-y-0.5 hover:bg-destructive/90 hover:shadow-[0_16px_34px_rgba(220,38,38,0.26)]',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-5 py-2',
        sm: 'h-8 px-4 text-xs',
        lg: 'h-12 px-6 text-sm',
        icon: 'h-9 w-9',
        'icon-xs': 'h-6 w-6',
        'icon-sm': 'h-7 w-7',
        'icon-lg': 'h-11 w-11',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    ref?: Ref<HTMLButtonElement>;
  };

const Button = ({ className, variant, size, type = 'button', ref, ...props }: ButtonProps) => (
  <button
    ref={ref}
    type={type}
    className={cn(buttonVariants({ variant, size }), className)}
    {...props}
  />
);

export { Button };

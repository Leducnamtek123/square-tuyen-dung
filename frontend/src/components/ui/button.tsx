import type { ButtonHTMLAttributes, Ref } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 border-0 outline-none select-none rounded-xl px-5 text-sm font-semibold tracking-tight transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/30 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] cursor-pointer',
  {
    variants: {
      variant: {
        default:
          'border-0 bg-blue-600 text-white shadow-[0_4px_14px_rgba(37,99,235,0.25)] hover:bg-blue-700 hover:shadow-[0_6px_20px_rgba(37,99,235,0.35)] active:bg-blue-800',
        secondary:
          'border-0 bg-slate-100 text-slate-800 hover:bg-slate-200/80 active:bg-slate-200',
        ghost:
          'border-0 bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200/60',
        outline:
          'border border-slate-200 bg-white text-slate-700 shadow-xs hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900',
        destructive:
          'border-0 bg-rose-600 text-white shadow-[0_4px_14px_rgba(225,29,72,0.25)] hover:bg-rose-700 hover:shadow-[0_6px_20px_rgba(225,29,72,0.35)] active:bg-rose-800',
        link:
          'border-0 bg-transparent text-blue-600 underline-offset-4 hover:underline hover:text-blue-700 p-0 h-auto',
      },
      size: {
        default: 'h-10 px-5 py-2 text-sm',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-12 px-7 text-base font-semibold',
        icon: 'h-10 w-10 p-0',
        'icon-xs': 'h-6 w-6 p-0',
        'icon-sm': 'h-8 w-8 p-0',
        'icon-lg': 'h-12 w-12 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  ref?: Ref<HTMLButtonElement>;
}

const Button = ({
  className,
  variant,
  size,
  asChild = false,
  type = 'button',
  ref,
  ...props
}: ButtonProps) => {
  const Comp = asChild ? Slot : 'button';
  const elementProps = asChild ? props : { type, ...props };
  return (
    <Comp
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...elementProps}
    />
  );
};

export { Button, buttonVariants };


import React from 'react';
import { cn } from '@/voice-ai/lib/utils';

export const ShimmerText = React.forwardRef(function ShimmerText(
  { children, className },
  ref
) {
  return (
    <span
      ref={ref}
      className={cn('animate-text-shimmer inline-block !bg-clip-text text-transparent', className)}
    >
      {children}
    </span>
  );
});

export default ShimmerText;

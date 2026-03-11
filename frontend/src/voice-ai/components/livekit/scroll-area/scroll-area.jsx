import React, { forwardRef, useCallback, useRef } from 'react';
import { cn } from '@/voice-ai/lib/utils';

export const ScrollArea = forwardRef(function ScrollArea(
  { children, className, ...props },
  ref
) {
  const scrollContentRef = useRef(null);

  const mergedRef = useCallback(
    (node) => {
      scrollContentRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    },
    [ref]
  );

  return (
    <div ref={mergedRef} className={cn('overflow-y-scroll scroll-smooth', className)} {...props}>
      <div>{children}</div>
    </div>
  );
});

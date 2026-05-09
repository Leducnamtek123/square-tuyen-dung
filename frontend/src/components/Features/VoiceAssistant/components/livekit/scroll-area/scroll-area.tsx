'use client';

import { useCallback, useRef } from 'react';
import type { MutableRefObject, ReactNode, Ref } from 'react';
import { useAutoScroll } from '@/components/Features/VoiceAssistant/components/livekit/scroll-area/hooks/useAutoScroll';
import { cn } from '@/lib/utils';

interface ScrollAreaProps {
  children?: ReactNode;
  className?: string;
  ref?: Ref<HTMLDivElement>;
}

export function ScrollArea({ className, children, ref }: ScrollAreaProps) {
  const scrollContentRef = useRef<HTMLDivElement | null>(null);

  useAutoScroll(scrollContentRef.current);

  const mergedRef = useCallback(
    (node: HTMLDivElement | null) => {
      scrollContentRef.current = node;

      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        (ref as MutableRefObject<HTMLDivElement | null>).current = node;
      }
    },
    [ref]
  );

  return (
    <div ref={mergedRef} className={cn('overflow-y-scroll scroll-smooth', className)}>
      <div>{children}</div>
    </div>
  );
}

'use client';
import React, { useCallback, useRef, useState } from 'react';

interface LazyLoadSectionProps {
  children: any;
  rootMargin?: string;
  minHeight?: number | string;
}

const LazyLoadSection = ({ children, rootMargin = '200px', minHeight = '300px' }: LazyLoadSectionProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const setSectionRef = useCallback((node: HTMLDivElement | null) => {
    observerRef.current?.disconnect();
    observerRef.current = null;

    if (!node || isVisible) {
      return;
    }

    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
          observerRef.current = null;
        }
      },
      { rootMargin }
    );

    observer.observe(node);
    observerRef.current = observer;
  }, [isVisible, rootMargin]);

  // Once visible, maintain the children without the minHeight wrapper restriction if it's dynamic
  return (
    <div ref={setSectionRef} style={{ minHeight: isVisible ? 'auto' : minHeight }}>
      {isVisible ? children : null}
    </div>
  );
};

export default LazyLoadSection;

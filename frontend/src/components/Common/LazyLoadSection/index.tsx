'use client';
import React, { useCallback, useRef, useState } from 'react';

interface LazyLoadSectionProps {
  children: any;
  rootMargin?: string;
  minHeight?: number | string;
}

const LazyLoadSection = ({ children, rootMargin = '200px', minHeight = '300px' }: LazyLoadSectionProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (isVisible) return;
    const node = containerRef.current;
    if (!node) return;

    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
    };
  }, [isVisible, rootMargin]);

  return (
    <div ref={containerRef} style={{ minHeight: isVisible ? 'auto' : minHeight }}>
      {isVisible ? children : null}
    </div>
  );
};

export default LazyLoadSection;

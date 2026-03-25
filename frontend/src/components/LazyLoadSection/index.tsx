import React, { useState, useEffect, useRef } from 'react';

interface LazyLoadSectionProps {
  children: React.ReactNode;
  rootMargin?: string;
  minHeight?: number | string;
}

const LazyLoadSection = ({ children, rootMargin = '200px', minHeight = '300px' }: LazyLoadSectionProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // If IntersectionObserver is not supported, just render the content
    if (!('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [rootMargin]);

  // Once visible, maintain the children without the minHeight wrapper restriction if it's dynamic
  return (
    <div ref={ref} style={{ minHeight: isVisible ? 'auto' : minHeight }}>
      {isVisible ? children : null}
    </div>
  );
};

export default LazyLoadSection;

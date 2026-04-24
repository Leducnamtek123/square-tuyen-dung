'use client';
import { useEffect } from 'react';

const useTabTitle = (newTitle: string): void => {
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = newTitle;
    }
  }, [newTitle]);
};

export { useTabTitle as TabTitle };

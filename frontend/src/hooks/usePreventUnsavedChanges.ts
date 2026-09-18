'use client';

import { useEffect } from 'react';

/**
 * Custom hook to prevent accidental navigation away from dirty forms.
 * Attaches beforeunload browser event listener when isDirty is true.
 */
export function usePreventUnsavedChanges(isDirty: boolean) {
  useEffect(() => {
    if (!isDirty) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = 'Bạn có thay đổi chưa lưu. Bạn có chắc chắn muốn rời đi?';
      return event.returnValue;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty]);
}

export default usePreventUnsavedChanges;

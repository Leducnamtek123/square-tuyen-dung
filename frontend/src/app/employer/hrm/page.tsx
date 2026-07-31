'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function EmployerHrmPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/employer/hrm/dashboard');
  }, [router]);
  return null;
}

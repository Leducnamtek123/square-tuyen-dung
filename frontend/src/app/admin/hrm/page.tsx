'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminHrmPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/admin/hrm/dashboard');
  }, [router]);
  return null;
}

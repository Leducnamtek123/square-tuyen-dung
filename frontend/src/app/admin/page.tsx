'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import tokenService from '@/services/tokenService';

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    const token = tokenService.getAccessTokenFromCookie();
    if (!token) {
      router.replace('/admin/login');
    } else {
      router.replace('/admin/dashboard');
    }
  }, [router]);

  return null;
}

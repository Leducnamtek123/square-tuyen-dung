import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Quản trị' };

import { useEffect } from 'react';
import tokenService from '@/services/tokenService';

export default function AdminPage() {
  useEffect(() => {
    const token = tokenService.getAccessTokenFromCookie();
    if (!token) {
      window.location.replace('/admin/login');
    } else {
      window.location.replace('/admin/dashboard');
    }
  }, []);

  return null;
}

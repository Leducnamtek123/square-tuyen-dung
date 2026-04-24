'use client';

import { useEffect } from 'react';
import tokenService from '@/services/tokenService';

export default function AdminIndexClient() {
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

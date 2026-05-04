'use client';

import { useEffect } from 'react';
import { getPreferredLanguage, getPortalPrefix } from '@/configs/portalRouting';
import tokenService from '@/services/tokenService';

export default function AdminIndexClient() {
  useEffect(() => {
    const lang = getPreferredLanguage();
    const adminPrefix = getPortalPrefix('admin', lang);
    const token = tokenService.getAccessTokenFromCookie();
    if (!token) {
      window.location.replace(`${adminPrefix}/login`);
    } else {
      window.location.replace(`${adminPrefix}/dashboard`);
    }
  }, []);

  return null;
}

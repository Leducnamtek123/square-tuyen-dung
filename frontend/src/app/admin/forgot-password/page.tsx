'use client';

import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Quên mật khẩu' };

import ForgotPasswordPage from '@/views/authPages/ForgotPasswordPage';

export default function Page() {
  return <ForgotPasswordPage />;
}

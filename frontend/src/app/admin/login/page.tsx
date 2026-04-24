import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Đăng nhập' };

import AdminLogin from '@/views/authPages/AdminLogin';

export default function Page() {
  return <AdminLogin />;
}

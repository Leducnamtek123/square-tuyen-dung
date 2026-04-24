import type { Metadata } from 'next';
import HomeLayout from '@/layouts/HomeLayout';
import HomePage from '@/views/defaultPages/HomePage';

export const metadata: Metadata = {
  title: 'Square - Tim viec nhanh, tuyen dung hieu qua',
  description: 'Square - Nen tang tuyen dung hang dau Viet Nam',
};

export default function Page() {
  return (
    <HomeLayout>
      <HomePage />
    </HomeLayout>
  );
}
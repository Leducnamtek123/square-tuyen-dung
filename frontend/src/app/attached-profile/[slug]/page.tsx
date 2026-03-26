'use client';

import DefaultLayout from '@/layouts/DefaultLayout';
import dynamic from 'next/dynamic';

const AttachedProfilePage = dynamic(
  () => import('@/views/jobSeekerPages/AttachedProfilePage'),
  { ssr: false }
);

export default function Page() {
  return (
    <DefaultLayout>
      <AttachedProfilePage />
    </DefaultLayout>
  );
}

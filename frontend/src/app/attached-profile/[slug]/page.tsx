'use client';


import dynamic from 'next/dynamic';

const AttachedProfilePage = dynamic(
  () => import('@/views/jobSeekerPages/AttachedProfilePage'),
  { ssr: false }
);

export default function Page() {
  return <AttachedProfilePage />;
}

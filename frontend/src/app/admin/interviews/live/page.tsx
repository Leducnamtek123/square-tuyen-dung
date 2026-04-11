'use client';

import dynamic from 'next/dynamic';

const InterviewLivePage = dynamic(
  () => import('@/views/adminPages/InterviewLivePage'),
  { ssr: false }
);

export default function Page() {
  return <InterviewLivePage />;
}

'use client';

import dynamic from 'next/dynamic';

const InterviewLivePage = dynamic(
  () => import('@/views/employerPages/InterviewPages/InterviewLivePage'),
  { ssr: false }
);

export default function Page() {
  return <InterviewLivePage />;
}

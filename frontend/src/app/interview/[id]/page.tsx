'use client';

import dynamic from 'next/dynamic';

const InterviewRoomPage = dynamic(
  () => import('@/views/jobSeekerPages/InterviewRoomPage'),
  { ssr: false }
);

export default function Page() {
  return <InterviewRoomPage />;
}

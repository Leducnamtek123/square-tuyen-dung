'use client';

import JobSeekerLayout from '@/layouts/JobSeekerLayout';
import NotificationPage from '@/views/defaultPages/NotificationPage';

export default function Page() {
  return (
    <JobSeekerLayout>
      <NotificationPage />
    </JobSeekerLayout>
  );
}

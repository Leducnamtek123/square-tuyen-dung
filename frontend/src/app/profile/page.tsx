'use client';

import JobSeekerLayout from '@/layouts/JobSeekerLayout';
import ProfilePage from '@/views/jobSeekerPages/ProfilePage';

export default function Page() {
  return (
    <JobSeekerLayout>
      <ProfilePage />
    </JobSeekerLayout>
  );
}

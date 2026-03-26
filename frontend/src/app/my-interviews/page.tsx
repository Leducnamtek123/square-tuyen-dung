'use client';

import JobSeekerLayout from '@/layouts/JobSeekerLayout';
import MyInterviewsPage from '@/views/jobSeekerPages/MyInterviewsPage';

export default function Page() {
  return (
    <JobSeekerLayout>
      <MyInterviewsPage />
    </JobSeekerLayout>
  );
}

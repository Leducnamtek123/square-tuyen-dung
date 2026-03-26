'use client';

import JobSeekerLayout from '@/layouts/JobSeekerLayout';
import MyCompanyPage from '@/views/jobSeekerPages/MyCompanyPage';

export default function Page() {
  return (
    <JobSeekerLayout>
      <MyCompanyPage />
    </JobSeekerLayout>
  );
}

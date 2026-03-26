'use client';

import DefaultLayout from '@/layouts/DefaultLayout';
import JobSeekerSignUp from '@/views/authPages/JobSeekerSignUp';

export default function Page() {
  return (
    <DefaultLayout>
      <JobSeekerSignUp />
    </DefaultLayout>
  );
}

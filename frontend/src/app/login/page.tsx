'use client';

import DefaultLayout from '@/layouts/DefaultLayout';
import JobSeekerLogin from '@/views/authPages/JobSeekerLogin';

export default function Page() {
  return (
    <DefaultLayout>
      <JobSeekerLogin />
    </DefaultLayout>
  );
}

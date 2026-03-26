'use client';

import DefaultLayout from '@/layouts/DefaultLayout';
import JobsByJobTypePage from '@/views/defaultPages/JobsByJobTypePage';

export default function Page() {
  return (
    <DefaultLayout>
      <JobsByJobTypePage />
    </DefaultLayout>
  );
}

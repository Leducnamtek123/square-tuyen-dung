'use client';

import DefaultLayout from '@/layouts/DefaultLayout';
import JobDetailPage from '@/views/defaultPages/JobDetailPage';

import type { JobPost } from '@/types/models';

interface JobDetailClientPageProps {
  initialJob?: JobPost | null;
}

export default function JobDetailClientPage({ initialJob }: JobDetailClientPageProps) {
  return (
    <DefaultLayout>
      <JobDetailPage initialJob={initialJob} />
    </DefaultLayout>
  );
}

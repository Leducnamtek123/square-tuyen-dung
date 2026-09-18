import React from 'react';
import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import DefaultLayout from '@/layouts/DefaultLayout';
import LegalPolicyViewer from '@/views/defaultPages/LegalPolicyPage/LegalPolicyViewer';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('terms-of-service');
}

export default function Page() {
  return (
    <DefaultLayout>
      <LegalPolicyViewer slug="thoa-thuan-su-dung" portal="jobseeker" />
    </DefaultLayout>
  );
}

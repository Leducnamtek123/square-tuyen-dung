import React from 'react';
import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import DefaultLayout from '@/layouts/DefaultLayout';
import LegalPolicyViewer from '@/views/defaultPages/LegalPolicyPage/LegalPolicyViewer';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('privacy-policy');
}

export default function Page() {
  return (
    <DefaultLayout>
      <LegalPolicyViewer slug="quy-dinh-bao-mat" portal="jobseeker" />
    </DefaultLayout>
  );
}

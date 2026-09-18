import React from 'react';
import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import { CandidateCVListPage } from '@/views/cvBuilderPages/CandidateCVListPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('my-cvs');
}

export default function Page() {
  return <CandidateCVListPage />;
}


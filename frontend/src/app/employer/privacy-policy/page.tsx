import React from 'react';
import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import LegalPolicyViewer from '@/views/defaultPages/LegalPolicyPage/LegalPolicyViewer';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('employer.privacy-policy');
}

export default function Page() {
  return <LegalPolicyViewer slug="quy-dinh-bao-mat" portal="employer" />;
}

import React from 'react';
import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import LegalPolicyViewer from '@/views/defaultPages/LegalPolicyPage/LegalPolicyViewer';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('employer.terms-of-service');
}

export default function Page() {
  return <LegalPolicyViewer slug="thoa-thuan-su-dung" portal="employer" />;
}

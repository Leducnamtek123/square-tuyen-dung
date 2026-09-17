import React from 'react';
import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import DefaultLayout from '@/layouts/DefaultLayout';
import { CVEditorPage } from '@/views/cvBuilderPages/CVEditorPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('cv-builder');
}

export default function Page() {
  return (
    <DefaultLayout>
      <CVEditorPage />
    </DefaultLayout>
  );
}

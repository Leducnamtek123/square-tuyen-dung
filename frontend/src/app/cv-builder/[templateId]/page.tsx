import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import { CVEditorPage } from '@/views/cvBuilderPages/CVEditorPage';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ templateId: string }>;
}): Promise<Metadata> {
  const resolved = await params;
  const baseMeta = await buildPageMetadata('cv-builder');
  const baseTitle = typeof baseMeta.title === 'string' ? baseMeta.title : 'CV Builder';
  return {
    ...baseMeta,
    title: `${baseTitle} - ${resolved.templateId}`,
  };
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[100dvh] w-full flex items-center justify-center bg-slate-100">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
        </div>
      }
    >
      <CVEditorPage />
    </Suspense>
  );
}

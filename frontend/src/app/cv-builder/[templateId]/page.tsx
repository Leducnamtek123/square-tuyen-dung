import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { buildSeoMetadata } from '@/utils/serverI18n';
import { CVEditorPage } from '@/views/cvBuilderPages/CVEditorPage';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ templateId: string }>;
}): Promise<Metadata> {
  const resolved = await params;
  return buildSeoMetadata({
    title: `Tạo CV Trực Tuyến - Mẫu ${resolved.templateId}`,
    description:
      'Trình tạo và trang trí CV trực tuyến thông minh, đồng bộ 1 chạm từ hồ sơ cá nhân, xuất PDF chuẩn in ấn A4 nhanh chóng.',
    path: `/tao-cv/${resolved.templateId}`,
  });
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

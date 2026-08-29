import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { buildSeoMetadata } from '@/utils/serverI18n';
import { CVEditorPage } from '@/views/cvBuilderPages/CVEditorPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildSeoMetadata({
    title: 'Tạo & Trang Trí CV Trực Tuyến',
    description:
      'Trình tạo và trang trí CV trực tuyến thông minh, đồng bộ 1 chạm từ hồ sơ cá nhân, xuất PDF chuẩn in ấn A4 nhanh chóng.',
    path: '/tao-cv',
  });
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-full flex items-center justify-center bg-slate-100">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
        </div>
      }
    >
      <CVEditorPage />
    </Suspense>
  );
}

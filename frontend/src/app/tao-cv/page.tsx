import React from 'react';
import type { Metadata } from 'next';
import { buildSeoMetadata } from '@/utils/serverI18n';
import DefaultLayout from '@/layouts/DefaultLayout';
import { CVEditorPage } from '@/views/cvBuilderPages/CVEditorPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildSeoMetadata({
    title: 'Tạo CV Trực Tuyến & Studio Thiết Kế CV Chuẩn ATS',
    description:
      'Trình tạo và chỉnh sửa CV trực tuyến chuyên nghiệp. Tự động lưu đám mây, gợi ý câu chữ AI theo ngành nghề, xuất PDF sắc nét.',
    path: '/tao-cv',
  });
}

export default function Page() {
  return (
    <DefaultLayout>
      <CVEditorPage />
    </DefaultLayout>
  );
}

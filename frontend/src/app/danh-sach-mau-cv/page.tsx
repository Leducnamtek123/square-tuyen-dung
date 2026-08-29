import React from 'react';
import type { Metadata } from 'next';
import { buildSeoMetadata } from '@/utils/serverI18n';
import DefaultLayout from '@/layouts/DefaultLayout';
import { CVGalleryPage } from '@/views/cvBuilderPages/CVGalleryPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildSeoMetadata({
    title: 'Danh Sách Mẫu CV Xin Việc Đẹp & Chuyên Nghiệp',
    description:
      'Khám phá thư viện mẫu CV xin việc chuẩn chuyên nghiệp, chuẩn ATS, hỗ trợ tạo và trang trí CV trực tuyến hoàn toàn miễn phí.',
    path: '/danh-sach-mau-cv',
  });
}

import { redirect } from 'next/navigation';

export default function Page() {
  redirect('/ung-vien/trang-tri-cv');
}

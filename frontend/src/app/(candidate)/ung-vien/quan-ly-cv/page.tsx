import React from 'react';
import type { Metadata } from 'next';
import { buildSeoMetadata } from '@/utils/serverI18n';
import DefaultLayout from '@/layouts/DefaultLayout';
import { CandidateCVListPage } from '@/views/cvBuilderPages/CandidateCVListPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildSeoMetadata({
    title: 'Quản Lý CV Đã Lưu & Hồ Sơ Trực Tuyến',
    description:
      'Quản lý danh sách CV đã tạo, theo dõi lượt xem của nhà tuyển dụng, chỉnh sửa và tải PDF thuận tiện.',
    path: '/ung-vien/quan-ly-cv',
  });
}

export default function Page() {
  return (
    <DefaultLayout>
      <CandidateCVListPage />
    </DefaultLayout>
  );
}

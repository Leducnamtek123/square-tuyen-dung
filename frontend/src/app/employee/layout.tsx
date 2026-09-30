import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cổng Nhân Viên (ESS) | InfoHR',
  description: 'Cổng thông tin tự phục vụ dành cho nhân sự chính thức của doanh nghiệp',
};

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

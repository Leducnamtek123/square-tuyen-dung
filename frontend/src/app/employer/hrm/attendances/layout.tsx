import React from 'react';
import type { Metadata } from 'next';
import AttendanceWorkspaceLayout from '@/layouts/components/employers/AttendanceWorkspaceLayout';

export const metadata: Metadata = {
  title: 'Chấm công & Ca làm việc | InfoHR Quản lý nhân sự',
  description: 'Phân hệ quản lý chấm công, ca làm việc, bảng tổng hợp công và xét duyệt đơn từ',
};

export default function AttendancesLayout({ children }: { children: React.ReactNode }) {
  return <AttendanceWorkspaceLayout>{children}</AttendanceWorkspaceLayout>;
}

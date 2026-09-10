import React from 'react';
import type { Metadata } from 'next';
import AttendanceOverviewPage from '@/views/hrmPages/AttendancePages/AttendanceOverviewPage';

export const metadata: Metadata = {
  title: 'Tổng quan chấm công | InfoHR Quản lý nhân sự',
  description: 'Tổng quan chuyên cần, ca trực, tỷ lệ đi làm và phê duyệt đơn từ chấm công',
};

export default function EmployerHrmAttendancePage() {
  return <AttendanceOverviewPage />;
}

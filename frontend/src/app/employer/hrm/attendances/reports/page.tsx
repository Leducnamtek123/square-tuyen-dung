import React from 'react';
import type { Metadata } from 'next';
import AttendanceReportsPage from '@/views/hrmPages/AttendancePages/AttendanceReportsPage';

export const metadata: Metadata = {
  title: 'Báo cáo & Thống kê Chuyên cần | InfoHR Quản lý nhân sự',
  description: 'Báo cáo chuyên cần, phân tích tỷ lệ đi làm, số giờ làm thêm và chấp hành thời gian',
};

export default function EmployerAttendanceReportsPage() {
  return <AttendanceReportsPage />;
}

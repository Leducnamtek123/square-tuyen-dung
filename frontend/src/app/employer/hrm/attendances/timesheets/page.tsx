import React from 'react';
import type { Metadata } from 'next';
import DetailedTimesheetPage from '@/views/hrmPages/AttendancePages/DetailedTimesheetPage';

export const metadata: Metadata = {
  title: 'Bảng chấm công chi tiết | InfoHR Quản lý nhân sự',
  description: 'Bảng chấm công chi tiết các ngày trong tháng, theo dõi giờ vào ra và ký hiệu công',
};

export default function EmployerAttendanceTimesheetsPage() {
  return <DetailedTimesheetPage />;
}

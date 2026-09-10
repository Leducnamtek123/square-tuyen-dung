import React from 'react';
import type { Metadata } from 'next';
import SummaryTimesheetPage from '@/views/hrmPages/AttendancePages/SummaryTimesheetPage';

export const metadata: Metadata = {
  title: 'Bảng chấm công tổng hợp | InfoHR Quản lý nhân sự',
  description: 'Bảng tổng hợp công tháng, khóa công và chuyển tính lương tự động sang phân hệ Bảng lương',
};

export default function EmployerAttendanceMonthlySummaryPage() {
  return <SummaryTimesheetPage />;
}

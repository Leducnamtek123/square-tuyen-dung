import React from 'react';
import type { Metadata } from 'next';
import ShiftListPage from '@/views/hrmPages/AttendancePages/ShiftListPage';

export const metadata: Metadata = {
  title: 'Danh sách ca làm việc | InfoHR Quản lý nhân sự',
  description: 'Quản lý và thiết lập các ca làm việc, khung giờ và quy định đi muộn về sớm',
};

export default function EmployerAttendanceShiftsPage() {
  return <ShiftListPage />;
}

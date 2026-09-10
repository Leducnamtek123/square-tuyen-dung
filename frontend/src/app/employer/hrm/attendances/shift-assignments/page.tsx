import React from 'react';
import type { Metadata } from 'next';
import ShiftMatrixPage from '@/views/hrmPages/AttendancePages/ShiftMatrixPage';

export const metadata: Metadata = {
  title: 'Bảng phân ca tổng hợp | InfoHR Quản lý nhân sự',
  description: 'Bảng phân ca làm việc chi tiết theo tháng cho toàn bộ nhân viên',
};

export default function EmployerAttendanceShiftAssignmentsPage() {
  return <ShiftMatrixPage />;
}

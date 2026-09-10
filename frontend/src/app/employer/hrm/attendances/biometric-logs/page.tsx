import React from 'react';
import type { Metadata } from 'next';
import BiometricLogsPage from '@/views/hrmPages/AttendancePages/BiometricLogsPage';

export const metadata: Metadata = {
  title: 'Dữ liệu máy chấm công | InfoHR Quản lý nhân sự',
  description: 'Dữ liệu log quẹt thẻ từ máy chấm công ZKTeco và Import Excel',
};

export default function EmployerAttendanceBiometricLogsPage() {
  return <BiometricLogsPage />;
}

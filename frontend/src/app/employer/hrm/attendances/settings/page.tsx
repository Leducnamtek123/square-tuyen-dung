import React from 'react';
import type { Metadata } from 'next';
import AttendanceSettingsPage from '@/views/hrmPages/AttendancePages/AttendanceSettingsPage';

export const metadata: Metadata = {
  title: 'Thiết lập Quy định Chấm công | InfoHR Quản lý nhân sự',
  description: 'Thiết lập quy định dung sai giờ quẹt thẻ, hệ số làm thêm giờ, quy trình duyệt đơn từ',
};

export default function EmployerAttendanceSettingsPage() {
  return <AttendanceSettingsPage />;
}

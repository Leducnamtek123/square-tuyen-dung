import React from 'react';
import type { Metadata } from 'next';
import DeviceListPage from '@/views/hrmPages/AttendancePages/DeviceListPage';

export const metadata: Metadata = {
  title: 'Quản lý Thiết bị Chấm công | InfoHR Quản lý nhân sự',
  description: 'Quản lý danh mục thiết bị máy chấm công, giám sát trạng thái kết nối mạng và đồng bộ dữ liệu theo chi nhánh',
};

export default function EmployerAttendanceDevicesPage() {
  return <DeviceListPage />;
}

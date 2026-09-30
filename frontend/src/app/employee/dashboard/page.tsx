import React from 'react';
import type { Metadata } from 'next';
import EmployeeDashboardPage from '@/views/employeePages/EmployeeDashboardPage';

export const metadata: Metadata = {
  title: 'Bảng điều khiển Nhân viên | InfoHR ESS',
  description: 'Quản trị chấm công, quỹ phép, hợp đồng và bảng lương cá nhân',
};

export default function Page() {
  return <EmployeeDashboardPage />;
}

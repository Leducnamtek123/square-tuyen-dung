import React from 'react';
import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import DeviceListPage from '@/views/hrmPages/AttendancePages/DeviceListPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('employer.hrm.attendances.devices');
}

export default function EmployerAttendanceDevicesPage() {
  return <DeviceListPage />;
}

import React from 'react';
import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import AttendanceOverviewPage from '@/views/hrmPages/AttendancePages/AttendanceOverviewPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('employer.hrm.attendances');
}

export default function EmployerHrmAttendancePage() {
  return <AttendanceOverviewPage />;
}

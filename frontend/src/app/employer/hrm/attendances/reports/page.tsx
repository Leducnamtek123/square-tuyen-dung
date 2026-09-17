import React from 'react';
import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import AttendanceReportsPage from '@/views/hrmPages/AttendancePages/AttendanceReportsPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('employer.hrm.attendances.reports');
}

export default function EmployerAttendanceReportsPage() {
  return <AttendanceReportsPage />;
}

import React from 'react';
import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import DetailedTimesheetPage from '@/views/hrmPages/AttendancePages/DetailedTimesheetPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('employer.hrm.attendances.timesheets');
}

export default function EmployerAttendanceTimesheetsPage() {
  return <DetailedTimesheetPage />;
}

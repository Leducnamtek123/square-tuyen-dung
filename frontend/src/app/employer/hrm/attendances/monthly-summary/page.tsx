import React from 'react';
import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import SummaryTimesheetPage from '@/views/hrmPages/AttendancePages/SummaryTimesheetPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('employer.hrm.attendances.monthly-summary');
}

export default function EmployerAttendanceMonthlySummaryPage() {
  return <SummaryTimesheetPage />;
}

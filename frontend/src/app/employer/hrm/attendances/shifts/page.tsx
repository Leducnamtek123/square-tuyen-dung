import React from 'react';
import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import ShiftListPage from '@/views/hrmPages/AttendancePages/ShiftListPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('employer.hrm.attendances.shifts');
}

export default function EmployerAttendanceShiftsPage() {
  return <ShiftListPage />;
}

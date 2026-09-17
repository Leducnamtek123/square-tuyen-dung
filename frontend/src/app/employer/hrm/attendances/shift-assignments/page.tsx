import React from 'react';
import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import ShiftMatrixPage from '@/views/hrmPages/AttendancePages/ShiftMatrixPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('employer.hrm.attendances.shift-assignments');
}

export default function EmployerAttendanceShiftAssignmentsPage() {
  return <ShiftMatrixPage />;
}

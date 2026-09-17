import React from 'react';
import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import AttendanceSettingsPage from '@/views/hrmPages/AttendancePages/AttendanceSettingsPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('employer.hrm.attendances.settings');
}

export default function EmployerAttendanceSettingsPage() {
  return <AttendanceSettingsPage />;
}

import React from 'react';
import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import BiometricLogsPage from '@/views/hrmPages/AttendancePages/BiometricLogsPage';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('employer.hrm.attendances.biometric-logs');
}

export default function EmployerAttendanceBiometricLogsPage() {
  return <BiometricLogsPage />;
}

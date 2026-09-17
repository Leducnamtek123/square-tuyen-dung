import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { buildPageMetadata } from '@/utils/serverI18n';
import RequestManagementPage from '@/views/hrmPages/AttendancePages/RequestManagementPage';
import { CircularProgress, Box } from '@mui/material';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('employer.hrm.attendances.requests');
}

export default function EmployerAttendanceRequestsPage() {
  return (
    <Suspense
      fallback={
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={32} sx={{ color: '#2563EB' }} />
        </Box>
      }
    >
      <RequestManagementPage />
    </Suspense>
  );
}

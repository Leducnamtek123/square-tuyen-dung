import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import RequestManagementPage from '@/views/hrmPages/AttendancePages/RequestManagementPage';
import { CircularProgress, Box } from '@mui/material';

export const metadata: Metadata = {
  title: 'Trung tâm quản lý đơn từ | InfoHR Quản lý nhân sự',
  description: 'Quản lý và phê duyệt 2 cấp cho các loại đơn từ chấm công, nghỉ phép, OT, công tác',
};

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

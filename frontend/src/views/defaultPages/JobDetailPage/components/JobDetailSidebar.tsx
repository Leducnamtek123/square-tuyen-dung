import React from 'react';
import { Box, Card, Stack, Typography } from '@mui/material';
import FilterJobPostCard from '@/views/components/defaults/FilterJobPostCard';
import type { Company, JobPost } from '@/types/models';

type JobPostDetail = Partial<JobPost> & {
  companyDict?: Company;
  companyName?: string;
  companyImageUrl?: string;
  companySlug?: string;
  locationName?: string;
};

interface JobDetailSidebarProps {
  jobPostDetail: JobPostDetail;
}

const JobDetailSidebar: React.FC<JobDetailSidebarProps> = ({ jobPostDetail }) => {
  return (
    <Stack spacing={3}>
      {/* -- Similar Jobs Section (Without filter bar) ------------------ */}
      <Card
        variant="outlined"
        sx={{
          borderRadius: 0,
          boxShadow: '0 4px 20px rgba(15, 23, 42, 0.04)',
          borderColor: '#e2e8f0',
          backgroundColor: '#ffffff',
          overflow: 'hidden',
          p: 2.5,
          maxHeight: { lg: 'calc(100dvh - 108px)' },
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box sx={{ flexShrink: 0 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 0.75, fontSize: '1rem' }}>
            Việc làm tương tự cho bạn
          </Typography>
          <Box sx={{ width: 56, height: 3, bgcolor: '#2563eb', borderRadius: 0, mb: 2.5 }} />
        </Box>

        <Box
          sx={{
            overflowY: { lg: 'auto' },
            flex: 1,
            minHeight: 0,
            pr: { lg: 0.5 },
            overscrollBehavior: 'contain',
          }}
          className="custom-scrollbar"
        >
          <FilterJobPostCard
            compact={true}
            hideHeader={true}
            hideFilterBar={true}
            params={{
              excludeSlug: jobPostDetail?.slug,
            }}
          />
        </Box>
      </Card>
    </Stack>
  );
};

export default JobDetailSidebar;

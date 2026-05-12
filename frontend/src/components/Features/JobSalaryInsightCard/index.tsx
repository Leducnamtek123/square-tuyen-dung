'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Box, Card, CardContent, Chip, Divider, Stack, Typography } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { useTranslation } from 'react-i18next';

import jobService from '@/services/jobService';
import { salaryString } from '@/utils/customData';
import type { JobPost } from '@/types/models';

type SalaryInsight = {
  careerId?: number | null;
  cityId?: number | null;
  jobPostId?: number | null;
  count?: number;
  minSalary?: number | null;
  maxSalary?: number | null;
  avgMinSalary?: number | null;
  avgMaxSalary?: number | null;
  relatedJobs?: Array<JobPost & { companyDict?: { companyName?: string } }>;
};

type Props = {
  slug: string | number;
};

const VI_NUMBER_FORMAT = new Intl.NumberFormat('vi-VN');

const formatMoney = (value?: number | null) => {
  if (value == null) return '---';
  return VI_NUMBER_FORMAT.format(value);
};

const JobSalaryInsightCard = ({ slug }: Props) => {
  const { t } = useTranslation('public');
  const { data } = useQuery({
    queryKey: ['job-salary-insight', slug],
    queryFn: async () => {
      const res = await jobService.getJobSalaryInsightBySlug(slug);
      return res as SalaryInsight;
    },
    enabled: !!slug,
    staleTime: 10 * 60_000,
  });

  if (!data) {
    return null;
  }

  return (
    <Card variant="outlined" sx={{ boxShadow: 0 }}>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box sx={{ width: 42, height: 42, borderRadius: 2, display: 'grid', placeItems: 'center', bgcolor: 'primary.main', color: 'white' }}>
              <TrendingUpIcon fontSize="small" />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                {t('jobDetail.salaryInsightTitle', 'Salary insight')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('jobDetail.salaryInsightSubtitle', 'Quick market snapshot from similar active jobs.')}
              </Typography>
            </Box>
          </Stack>

          <Divider />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <Chip label={`${t('jobDetail.salaryInsightListings', 'Listings')}: ${data.count ?? 0}`} variant="outlined" />
            <Chip label={`${t('jobDetail.salaryInsightMin', 'Min')}: ${formatMoney(data.minSalary)}`} variant="outlined" />
            <Chip label={`${t('jobDetail.salaryInsightMax', 'Max')}: ${formatMoney(data.maxSalary)}`} variant="outlined" />
          </Stack>

          <Typography variant="body2" color="text.secondary">
            {t('jobDetail.salaryInsightRange', 'Typical range')}: {salaryString(data.avgMinSalary ?? null, data.avgMaxSalary ?? null)}
          </Typography>

          {Array.isArray(data.relatedJobs) && data.relatedJobs.length > 0 && (
            <Stack spacing={1}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                {t('jobDetail.salaryInsightRelated', 'Related jobs')}
              </Typography>
              <Stack spacing={1}>
                {data.relatedJobs.slice(0, 3).map((job) => (
                  <Box key={job.id} sx={{ p: 1.5, borderRadius: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {job.jobName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {job.companyDict?.companyName} · {salaryString(job.salaryMin, job.salaryMax)}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default JobSalaryInsightCard;

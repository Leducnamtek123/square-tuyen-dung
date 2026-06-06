'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Box, Card, CardContent, Chip, Divider, Stack, Typography } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { useTranslation } from 'react-i18next';

import { ROUTES } from '@/configs/constants';
import { localizeRoutePath } from '@/configs/routeLocalization';
import jobService from '@/services/jobService';
import { formatRoute } from '@/utils/funcUtils';
import type { JobPost } from '@/types/models';
import {
  formatSalaryInsightMoney,
  formatSalaryInsightRange,
} from './salaryInsightFormatting';

type SalaryInsight = {
  careerId?: number | null;
  cityId?: number | null;
  jobPostId?: number | null;
  scope?: 'sameCareerCity' | 'sameCareer' | 'sameCity' | 'allActive' | 'none';
  sampleThreshold?: number;
  confidence?: 'high' | 'medium' | 'low' | 'none';
  count?: number;
  minSalary?: number | null;
  maxSalary?: number | null;
  avgMinSalary?: number | null;
  avgMaxSalary?: number | null;
  medianSalary?: number | null;
  p25Salary?: number | null;
  p75Salary?: number | null;
  currentSalaryMin?: number | null;
  currentSalaryMax?: number | null;
  currentMidSalary?: number | null;
  salaryDelta?: number | null;
  salaryDeltaPercent?: number | null;
  salaryPosition?: 'below' | 'within' | 'above' | 'unknown';
  relatedJobs?: Array<JobPost & { companyDict?: { companyName?: string } }>;
};

type Props = {
  slug: string | number;
};

const clamp = (value: number) => Math.min(100, Math.max(0, value));

const getPercent = (value?: number | null, min?: number | null, max?: number | null) => {
  if (value == null || min == null || max == null || max <= min) return null;
  return clamp(((value - min) / (max - min)) * 100);
};

const JobSalaryInsightCard = ({ slug }: Props) => {
  const { t, i18n } = useTranslation('public');
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

  const scopeLabel = t(`jobDetail.salaryInsightScope.${data.scope || 'none'}`);
  const confidenceLabel = t(`jobDetail.salaryInsightConfidence.${data.confidence || 'none'}`);
  const positionLabel = t(`jobDetail.salaryInsightPosition.${data.salaryPosition || 'unknown'}`);
  const minScale = data.minSalary ?? data.currentSalaryMin ?? null;
  const maxScale = data.maxSalary ?? data.currentSalaryMax ?? null;
  const p25Percent = getPercent(data.p25Salary, minScale, maxScale);
  const p75Percent = getPercent(data.p75Salary, minScale, maxScale);
  const currentPercent = getPercent(data.currentMidSalary, minScale, maxScale);
  const hasMarketData = Number(data.count || 0) > 0;
  const deltaPercent = data.salaryDeltaPercent;
  const deltaPrefix = (data.salaryDelta || 0) > 0 ? '+' : '';
  const language = i18n.language;

  return (
    <Card variant="outlined" sx={{ boxShadow: 0, borderRadius: 3 }}>
      <CardContent>
        <Stack spacing={2.5}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="space-between">
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box sx={{ width: 42, height: 42, borderRadius: 2, display: 'grid', placeItems: 'center', bgcolor: 'primary.main', color: 'white', flex: '0 0 auto' }}>
                <TrendingUpIcon fontSize="small" />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  {t('jobDetail.salaryInsightTitle')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('jobDetail.salaryInsightSubtitle')}
                </Typography>
              </Box>
            </Stack>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip size="small" label={scopeLabel} color={hasMarketData ? 'primary' : 'default'} variant="outlined" />
              <Chip size="small" label={confidenceLabel} color={data.confidence === 'high' ? 'success' : data.confidence === 'medium' ? 'primary' : 'warning'} variant="outlined" />
            </Stack>
          </Stack>

          <Divider />

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
            {[
              [t('jobDetail.salaryInsightListings'), String(data.count ?? 0)],
              [t('jobDetail.salaryInsightMarketRange'), formatSalaryInsightRange(data.minSalary, data.maxSalary, language)],
              [t('jobDetail.salaryInsightMedian'), formatSalaryInsightMoney(data.medianSalary, language)],
              [t('jobDetail.salaryInsightTypicalBand'), formatSalaryInsightRange(data.p25Salary, data.p75Salary, language)],
            ].map(([label, value]) => (
              <Box key={label} sx={{ flex: 1, minWidth: 0, border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 1.5 }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 700 }}>
                  {label}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 900, mt: 0.5, overflowWrap: 'anywhere' }}>
                  {value}
                </Typography>
              </Box>
            ))}
          </Stack>

          <Box sx={{ borderRadius: 2, bgcolor: 'grey.50', p: 2 }}>
            <Stack spacing={1.5}>
              <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1}>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                    {t('jobDetail.salaryInsightCurrentOffer')}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 900 }}>
                    {formatSalaryInsightRange(data.currentSalaryMin, data.currentSalaryMax, language)}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                    {t('jobDetail.salaryInsightComparison')}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 900, color: data.salaryPosition === 'above' ? 'success.main' : data.salaryPosition === 'below' ? 'warning.main' : 'primary.main' }}>
                    {deltaPercent == null ? positionLabel : `${positionLabel} (${deltaPrefix}${deltaPercent}%)`}
                  </Typography>
                </Box>
              </Stack>

              {hasMarketData && minScale != null && maxScale != null ? (
                <Box>
                  <Box sx={{ position: 'relative', height: 12, borderRadius: 999, bgcolor: 'grey.200', overflow: 'hidden' }}>
                    {p25Percent != null && p75Percent != null && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          bottom: 0,
                          left: `${p25Percent}%`,
                          width: `${Math.max(4, p75Percent - p25Percent)}%`,
                          bgcolor: 'primary.light',
                        }}
                      />
                    )}
                    {currentPercent != null && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: -2,
                          bottom: -2,
                          left: `calc(${currentPercent}% - 3px)`,
                          width: 6,
                          borderRadius: 999,
                          bgcolor: 'primary.main',
                        }}
                      />
                    )}
                  </Box>
                  <Stack direction="row" justifyContent="space-between" sx={{ mt: 0.75 }}>
                    <Typography variant="caption" color="text.secondary">{formatSalaryInsightMoney(minScale, language)}</Typography>
                    <Typography variant="caption" color="text.secondary">{formatSalaryInsightMoney(maxScale, language)}</Typography>
                  </Stack>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  {t('jobDetail.salaryInsightInsufficient')}
                </Typography>
              )}
            </Stack>
          </Box>

          {hasMarketData && (
            <Typography variant="body2" color="text.secondary">
              {t('jobDetail.salaryInsightAverageRange')}: {formatSalaryInsightRange(data.avgMinSalary ?? null, data.avgMaxSalary ?? null, language)}
            </Typography>
          )}

          {Array.isArray(data.relatedJobs) && data.relatedJobs.length > 0 && (
            <Stack spacing={1}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                {t('jobDetail.salaryInsightRelated')}
              </Typography>
              <Stack spacing={1}>
                {data.relatedJobs.slice(0, 3).map((job) => {
                  const detailHref = job.slug
                    ? localizeRoutePath(`/${formatRoute(ROUTES.JOB_SEEKER.JOB_DETAIL, job.slug)}`, language)
                    : undefined;

                  return (
                    <Box key={job.id} component={detailHref ? Link : 'div'} href={detailHref} sx={{ p: 1.5, borderRadius: 2, bgcolor: 'grey.50', color: 'inherit', textDecoration: 'none', display: 'block', '&:hover': { bgcolor: detailHref ? 'grey.100' : 'grey.50' } }}>
                      <Typography variant="body2" sx={{ fontWeight: 800 }}>
                        {job.jobName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {job.companyDict?.companyName} - {formatSalaryInsightRange(job.salaryMin, job.salaryMax, language)}
                      </Typography>
                    </Box>
                  );
                })}
              </Stack>
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default JobSalaryInsightCard;

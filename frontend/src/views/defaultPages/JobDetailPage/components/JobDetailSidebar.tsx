import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Box, Card, CardContent, Stack, Typography, Button } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PeopleIcon from '@mui/icons-material/People';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import FilterJobPostCard from '../../../components/defaults/FilterJobPostCard';
import MuiImageCustom from '../../../../components/Common/MuiImageCustom';
import { IMAGES } from '../../../../configs/constants';
import { useConfig } from '@/hooks/useConfig';
import { tConfig } from '@/utils/tConfig';
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
  const { t } = useTranslation(['public', 'common']);
  const { allConfig } = useConfig();

  const company = jobPostDetail?.companyDict;
  const companyName = company?.companyName || jobPostDetail?.companyName || 'Công ty Tuyển Dụng';
  const companyLogo = company?.logoUrl || company?.companyImageUrl || jobPostDetail?.companyImageUrl || IMAGES.companyLogoDefault;
  const companySlug = company?.slug || jobPostDetail?.companySlug || '';
  const companyAddress =
    company?.location?.address ||
    jobPostDetail?.locationName ||
    (typeof (jobPostDetail as any)?.location?.city === 'number'
      ? allConfig?.cityDict?.[(jobPostDetail as any).location.city]
      : (jobPostDetail as any)?.location?.cityName || (jobPostDetail as any)?.locationDict?.cityName) ||
    'Chưa cập nhật địa chỉ';
  const companySize = company?.employeeSize != null
    ? tConfig(allConfig?.employeeSizeDict?.[String(company.employeeSize)])
    : '';

  return (
    <Stack spacing={3}>
      {/* ── 1. Company Info Card ──────────────────────────────────────── */}
      <Card
        variant="outlined"
        sx={{
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(15, 23, 42, 0.04)',
          borderColor: '#e2e8f0',
          backgroundColor: '#ffffff',
          overflow: 'hidden',
        }}
      >
        <CardContent sx={{ p: 2.5 }}>
          <Stack spacing={2} alignItems="center" textAlign="center">
            {/* Logo */}
            <MuiImageCustom
              width={68}
              height={68}
              src={companyLogo}
              fallbackSrc={IMAGES.companyLogoDefault}
              sx={{
                borderRadius: '12px',
                border: '1px solid #f1f5f9',
                objectFit: 'contain',
                p: 0.5,
                backgroundColor: '#ffffff',
              }}
            />

            {/* Company Name */}
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', lineHeight: 1.3, fontSize: '1rem' }}>
              {companyName}
            </Typography>

            {/* Address & Size */}
            <Stack spacing={1} sx={{ width: '100%', textAlign: 'left', pt: 1.5, borderTop: '1px dashed #e2e8f0' }}>
              <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ color: '#475569' }}>
                <LocationOnIcon sx={{ fontSize: 17, color: '#64748b', mt: 0.2, flexShrink: 0 }} />
                <Typography variant="body2" sx={{ fontSize: '0.825rem', lineHeight: 1.4, color: '#475569' }}>
                  <Box component="span" sx={{ fontWeight: 600, color: '#334155' }}>Địa chỉ: </Box>
                  {companyAddress}
                </Typography>
              </Stack>

              <Stack direction="row" spacing={1} alignItems="center" sx={{ color: '#475569' }}>
                <PeopleIcon sx={{ fontSize: 17, color: '#64748b', flexShrink: 0 }} />
                <Typography variant="body2" sx={{ fontSize: '0.825rem', color: '#475569' }}>
                  <Box component="span" sx={{ fontWeight: 600, color: '#334155' }}>Quy mô: </Box>
                  {companySize || '0'}
                </Typography>
              </Stack>
            </Stack>

            {/* Link to Company Page */}
            {companySlug && (
              <Button
                component={Link}
                href={`/cong-ty/${companySlug}`}
                variant="text"
                endIcon={<ArrowForwardIcon sx={{ fontSize: 15 }} />}
                sx={{
                  color: '#2563eb',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  textTransform: 'none',
                  p: 0,
                  pt: 0.5,
                  '&:hover': { backgroundColor: 'transparent', color: '#1d4ed8' },
                }}
              >
                Xem trang công ty
              </Button>
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* ── 2. Similar Jobs Section (Without filter bar) ────────────────── */}
      <Card
        variant="outlined"
        sx={{
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(15, 23, 42, 0.04)',
          borderColor: '#e2e8f0',
          backgroundColor: '#ffffff',
          overflow: 'hidden',
          p: 2.5,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 0.75, fontSize: '1rem' }}>
          Việc làm tương tự cho bạn
        </Typography>
        <Box sx={{ width: 56, height: 3, bgcolor: '#2563eb', borderRadius: 2, mb: 2.5 }} />

        <FilterJobPostCard
          compact={true}
          hideHeader={true}
          hideFilterBar={true}
          params={{
            excludeSlug: jobPostDetail?.slug,
          }}
        />
      </Card>
    </Stack>
  );
};

export default JobDetailSidebar;

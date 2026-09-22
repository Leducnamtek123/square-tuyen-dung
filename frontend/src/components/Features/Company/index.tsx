'use client';

import React from 'react';
import { useTheme } from '@mui/material/styles';
import { Box, Card } from '@mui/material';
import { useConfig } from '@/hooks/useConfig';
import { useTranslation } from 'react-i18next';
import CompanyFollowButton from './CompanyFollowButton';
import CompanyLoading from './CompanyLoading';
import CompanyHero from './CompanyHero';
import CompanyInfoSection from './CompanyInfoSection';

interface CompanyProps {
  id: string | number;
  slug: string;
  companyImageUrl?: string;
  companyCoverImageUrl?: string;
  companyName: string;
  employeeSize: string | number;
  fieldOperation?: string;
  city: string | number;
  followNumber: number;
  jobPostNumber: number;
  isFollowed: boolean;
}

const Company = ({
  slug,
  companyImageUrl,
  companyCoverImageUrl,
  companyName,
  employeeSize,
  fieldOperation,
  city,
  followNumber,
  jobPostNumber,
  isFollowed,
}: CompanyProps) => {
  const theme = useTheme();
  const { t, i18n } = useTranslation('public');
  const { allConfig } = useConfig();

  return (
    <Card
      sx={{
        p: 0,
        width: '100%',
        height: '100%',
        minHeight: { xs: 340, sm: 350 },
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderRadius: '18px',
        border: '1px solid #e2e8f0',
        bgcolor: '#ffffff',
        overflow: 'hidden',
        position: 'relative',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          borderColor: '#93c5fd',
          transform: 'translateY(-4px)',
          boxShadow: '0 16px 32px -4px rgba(15, 23, 42, 0.08), 0 4px 12px -2px rgba(37, 99, 235, 0.08)',
        },
      }}
      elevation={0}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, width: '100%' }}>
        <CompanyHero
          slug={slug}
          companyName={companyName}
          companyImageUrl={companyImageUrl}
          companyCoverImageUrl={companyCoverImageUrl}
          language={i18n.language}
        />

        <CompanyInfoSection
          slug={slug}
          companyName={companyName}
          employeeSize={employeeSize}
          fieldOperation={fieldOperation}
          city={city}
          followNumber={followNumber}
          jobPostNumber={jobPostNumber}
          language={i18n.language}
          allConfig={allConfig}
          theme={theme}
          t={t}
        />
      </Box>

      <CompanyFollowButton slug={slug} isFollowed={isFollowed} />
    </Card>
  );
};

const MemoizedCompany = Object.assign(React.memo(Company), { Loading: CompanyLoading });

export default MemoizedCompany;

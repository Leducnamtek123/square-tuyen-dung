import React from 'react';
import { useSelector } from 'react-redux';
import { useTheme } from '@mui/material/styles';
import { Box, Card, Stack } from "@mui/material";
import { ROLES_NAME } from '@/configs/constants';
import { RootState } from '@/redux/store';
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
  const { isAuthenticated, currentUser } = useSelector((state: RootState) => state.user);

  return (
    <Card
      sx={{
        p: 2,
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          borderColor: (muiTheme) => muiTheme.palette.primary.main,
          transform: 'translateY(-4px)',
          boxShadow: (muiTheme) => muiTheme.customShadows.large,
        },
      }}
      variant="outlined"
    >
      <Stack
        style={{
          height:
            isAuthenticated && currentUser?.roleName === ROLES_NAME.JOB_SEEKER
              ? 480
              : 420,
        }}
        direction="column"
        justifyContent="space-between"
      >
        <Box>
          <CompanyHero
            slug={slug}
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
      </Stack>
    </Card>
  );
};

const MemoizedCompany = Object.assign(React.memo(Company), { Loading: CompanyLoading });

export default MemoizedCompany;

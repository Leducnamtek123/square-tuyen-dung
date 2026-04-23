import React from 'react';
import Link from 'next/link';
import { Box } from '@mui/material';
import { IMAGES, ROUTES } from '@/configs/constants';
import MuiImageCustom from '@/components/Common/MuiImageCustom';
import { formatRoute } from '@/utils/funcUtils';
import { localizeRoutePath } from '@/configs/routeLocalization';

type CompanyHeroProps = {
  slug: string;
  companyImageUrl?: string;
  companyCoverImageUrl?: string;
  language: string;
};

const CompanyHero = ({ slug, companyImageUrl, companyCoverImageUrl, language }: CompanyHeroProps) => {
  return (
    <Box sx={{ position: 'relative' }}>
      <MuiImageCustom
        width="100%"
        height={180}
        fit="cover"
        src={companyCoverImageUrl || IMAGES.companyCoverDefault || IMAGES.coverImageDefault}
        fallbackSrc={IMAGES.companyCoverDefault || IMAGES.coverImageDefault}
        sx={{
          borderRadius: 2,
          filter: 'brightness(0.9)',
        }}
        duration={1500}
      />

      <Box
        sx={{
          position: 'absolute',
          bottom: -40,
          left: 16,
          width: 85,
          height: 85,
          transition: 'transform 0.3s ease',
          '&:hover': {
            transform: 'scale(1.05)',
          },
        }}
        component={Link}
        href={localizeRoutePath(`/${formatRoute(ROUTES.JOB_SEEKER.COMPANY_DETAIL, slug)}`, language)}
      >
        <MuiImageCustom
          width={80}
          height={80}
          src={companyImageUrl || IMAGES.companyLogoDefault}
          fallbackSrc={IMAGES.companyLogoDefault}
          sx={{
            bgcolor: 'white',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            p: 0.75,
            borderRadius: 3,
          }}
        />
      </Box>
    </Box>
  );
};

export default CompanyHero;


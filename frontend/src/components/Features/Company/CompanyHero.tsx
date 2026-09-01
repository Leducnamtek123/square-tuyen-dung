import React from 'react';
import Link from 'next/link';
import { Box } from '@mui/material';
import { IMAGES, ROUTES } from '@/configs/constants';
import MuiImageCustom from '@/components/Common/MuiImageCustom';
import { formatRoute } from '@/utils/funcUtils';
import { localizeRoutePath } from '@/configs/routeLocalization';

type CompanyHeroProps = {
  slug: string;
  companyName?: string;
  companyImageUrl?: string;
  companyCoverImageUrl?: string;
  language: string;
};

const CompanyHero = ({ slug, companyName, companyImageUrl, companyCoverImageUrl, language }: CompanyHeroProps) => {
  const name = companyName || 'Doanh nghiệp';
  return (
    <Box sx={{ position: 'relative' }}>
      <MuiImageCustom
        width="100%"
        fit="cover"
        src={companyCoverImageUrl || IMAGES.companyCoverDefault || IMAGES.coverImageDefault}
        fallbackSrc={IMAGES.companyCoverDefault || IMAGES.coverImageDefault}
        alt={`Ảnh bìa ${name}`}
        sx={{
          height: { xs: 130, sm: 160, md: 180 },
          borderRadius: 2,
          filter: 'brightness(0.9)',
        }}
        duration={1500}
      />

      <Box
        sx={{
          position: 'absolute',
          bottom: { xs: -28, sm: -36 },
          left: 16,
          width: { xs: 68, sm: 80 },
          height: { xs: 68, sm: 80 },
          transition: 'transform 0.3s ease',
          '&:hover': {
            transform: 'scale(1.05)',
          },
        }}
        component={Link}
        href={localizeRoutePath(`/${formatRoute(ROUTES.JOB_SEEKER.COMPANY_DETAIL, slug)}`, language)}
        aria-label={`Chi tiết ${name}`}
      >
        <MuiImageCustom
          src={companyImageUrl || IMAGES.companyLogoDefault}
          fallbackSrc={IMAGES.companyLogoDefault}
          alt={`Logo ${name}`}
          sx={{
            width: '100%',
            height: '100%',
            bgcolor: 'white',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            p: 0.75,
            borderRadius: 2.5,
          }}
        />
      </Box>
    </Box>
  );
};

export default CompanyHero;


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
    <Box sx={{ position: 'relative', width: '100%' }}>
      {/* Cover image banner with flush rounded top corners */}
      <Box
        sx={{
          height: 135,
          width: '100%',
          overflow: 'hidden',
          borderTopLeftRadius: '18px',
          borderTopRightRadius: '18px',
          bgcolor: '#f1f5f9',
          position: 'relative',
        }}
      >
        <MuiImageCustom
          width="100%"
          fit="cover"
          src={companyCoverImageUrl || IMAGES.companyCoverDefault || IMAGES.coverImageDefault}
          fallbackSrc={IMAGES.companyCoverDefault || IMAGES.coverImageDefault}
          alt={`Ảnh bìa ${name}`}
          sx={{
            height: '100%',
            width: '100%',
            filter: 'brightness(0.92)',
            transition: 'transform 0.5s ease',
            '&:hover': {
              transform: 'scale(1.03)',
            },
          }}
          duration={1000}
        />
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.02) 0%, rgba(15, 23, 42, 0.25) 100%)',
            pointerEvents: 'none',
          }}
        />
      </Box>

      {/* Modern floating logo badge overlapping the banner */}
      <Box
        component={Link}
        href={localizeRoutePath(`/${formatRoute(ROUTES.JOB_SEEKER.COMPANY_DETAIL, slug)}`, language)}
        aria-label={`Chi tiết ${name}`}
        sx={{
          position: 'absolute',
          bottom: -24,
          left: 20,
          width: 64,
          height: 64,
          borderRadius: '14px',
          bgcolor: '#ffffff',
          border: '3px solid #ffffff',
          boxShadow: '0 6px 16px -2px rgba(15, 23, 42, 0.12), 0 2px 6px -1px rgba(15, 23, 42, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 0.5,
          zIndex: 2,
          transition: 'transform 0.25s ease, box-shadow 0.25s ease',
          '&:hover': {
            transform: 'scale(1.06)',
            boxShadow: '0 8px 20px -2px rgba(37, 99, 235, 0.2)',
          },
        }}
      >
        <MuiImageCustom
          src={companyImageUrl || IMAGES.companyLogoDefault}
          fallbackSrc={IMAGES.companyLogoDefault}
          alt={`Logo ${name}`}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            borderRadius: '10px',
          }}
        />
      </Box>
    </Box>
  );
};

export default CompanyHero;

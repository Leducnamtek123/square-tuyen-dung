import React from 'react';
import { Box, Typography } from "@mui/material";
import type { TFunction } from 'i18next';
import type { CompanyDetailProps } from './types';
import HtmlContent from '@/components/Common/HtmlContent';

interface CompanyAboutProps {
  companyDetail: CompanyDetailProps;
  safeDescriptionHtml: string;
  t: (key: string) => string;
}

const CompanyAbout: React.FC<CompanyAboutProps> = ({ companyDetail, safeDescriptionHtml, t }) => {
  return (
    <Box>
      <Typography
        variant="h5"
        gutterBottom
        sx={{
          color: "#0f172a",
          fontWeight: 700,
          fontSize: { xs: '1.15rem', sm: '1.25rem', md: '1.4rem' },
          mb: { xs: 2, md: 2.5 },
          letterSpacing: '-0.01em',
          display: 'flex',
          alignItems: 'center',
          gap: 1.25,
          '&::before': {
            content: '""',
            width: 4,
            height: 18,
            borderRadius: 2,
            bgcolor: 'primary.main',
            display: 'inline-block',
          }
        }}
      >
        {t("companyDetail.about")}
      </Typography>
      <Box
        sx={{
          color: "#334155",
          fontSize: { xs: '0.925rem', sm: '0.975rem' },
          lineHeight: 1.85,
          '& p': { mb: 2 },
          '& h1, & h2, & h3, & h4': {
            color: '#0f172a',
            fontWeight: 700,
            mt: 2.5,
            mb: 1.5,
          },
          '& strong': {
            color: '#0f172a',
            fontWeight: 600,
          },
        }}
      >
        {companyDetail?.description ? (
          <HtmlContent html={safeDescriptionHtml} />
        ) : (
          <span style={{ color: "#94a3b8", fontStyle: "italic", fontSize: 14 }}>
            {t("companyDetail.notUpdated")}
          </span>
        )}
      </Box>
    </Box>
  );
};
export default CompanyAbout;

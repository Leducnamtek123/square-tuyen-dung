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
        sx={{ color: "primary.main", fontWeight: 600, mb: 3 }}
      >
        {t("companyDetail.about")}
      </Typography>
      <Box sx={{ p: 2.5, borderRadius: 2, bgcolor: "grey.50" }}>
        <Typography sx={{ textAlign: "justify", color: "text.secondary", lineHeight: 1.8 }}>
          {companyDetail?.description ? (
            <HtmlContent html={safeDescriptionHtml} />
          ) : (
            <span style={{ color: "#e0e0e0", fontStyle: "italic", fontSize: 13 }}>
              {t("companyDetail.notUpdated")}
            </span>
          )}
        </Typography>
      </Box>
    </Box>
  );
};
export default CompanyAbout;

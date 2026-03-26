import React from 'react';
import { Box, Typography, Card, Divider, Rating } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@/redux/hooks';
import { tConfig } from '../../../../utils/tConfig';

interface LanguageSectionProps {
  profileDetail: any;
}

const LanguageSection: React.FC<LanguageSectionProps> = ({ profileDetail }) => {
  const { t } = useTranslation('employer');
  const { allConfig } = useAppSelector((state) => state.config);

  if (!(profileDetail?.languageSkills?.length > 0)) return null;

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h5" sx={{ mb: 1.5 }}>
        {t('profileDetailCard.title.languages')}
      </Typography>
      <Box>
        <Card variant="outlined" sx={{ p: 2, borderWidth: 2, boxShadow: 0 }}>
          <Grid container spacing={1}>
            {profileDetail.languageSkills.map((value: any, index: number) => (
              <React.Fragment key={value.id || index}>
                <Grid size={12}>
                  <Typography sx={{ fontSize: 17.5, fontWeight: "bold", mb: 0.5 }}>
                    {tConfig((allConfig as any)?.languageDict?.[value?.language])}
                  </Typography>
                  <Typography sx={{ fontWeight: "bold", fontSize: 13, color: "gray" }}>
                    {t('profileDetailCard.label.proficiency')}
                  </Typography>
                  <Rating value={value?.level || 0} size="medium" readOnly />
                </Grid>
                {index < profileDetail.languageSkills.length - 1 && (
                  <Grid size={12}>
                    <Divider />
                  </Grid>
                )}
              </React.Fragment>
            ))}
          </Grid>
        </Card>
      </Box>
    </Box>
  );
};

export default LanguageSection;

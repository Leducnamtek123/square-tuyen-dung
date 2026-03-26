import React from 'react';
import { Box, Typography, Card, Divider, Rating } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { useTranslation } from 'react-i18next';

interface AdvancedSkillSectionProps {
  profileDetail: any;
}

const AdvancedSkillSection: React.FC<AdvancedSkillSectionProps> = ({ profileDetail }) => {
  const { t } = useTranslation('employer');

  if (!(profileDetail?.advancedSkills?.length > 0)) return null;

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h5" sx={{ mb: 1.5 }}>
        {t('profileDetailCard.title.advancedSkills')}
      </Typography>
      <Box>
        <Card variant="outlined" sx={{ p: 2, borderWidth: 2, boxShadow: 0 }}>
          <Grid container spacing={1}>
            {profileDetail.advancedSkills.map((value: any, index: number) => (
              <React.Fragment key={value.id || index}>
                <Grid size={12}>
                  <Typography sx={{ fontSize: 17.5, fontWeight: "bold", mb: 0.5 }}>
                    {value?.name}
                  </Typography>
                  <Typography sx={{ fontWeight: "bold", fontSize: 13, color: "gray" }}>
                    {t('profileDetailCard.label.proficiency')}
                  </Typography>
                  <Rating value={value?.level || 0} readOnly size="medium" />
                </Grid>
                {index < profileDetail.advancedSkills.length - 1 && (
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

export default AdvancedSkillSection;

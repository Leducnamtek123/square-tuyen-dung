import React from 'react';
import { Box, Typography, Card, Divider } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { useTranslation } from 'react-i18next';
import TimeAgo from '../../../../components/Common/TimeAgo';

interface ExperienceSectionProps {
  profileDetail: any;
}

const ExperienceSection: React.FC<ExperienceSectionProps> = ({ profileDetail }) => {
  const { t } = useTranslation(['employer', 'common']);

  if (!(profileDetail?.experiencesDetails?.length > 0)) return null;

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h5" sx={{ mb: 1.5 }}>
        {t('profileDetailCard.title.workExperience', { ns: 'employer' })}
      </Typography>
      <Box>
        <Card variant="outlined" sx={{ p: 2, borderWidth: 2, boxShadow: 0 }}>
          <Grid container spacing={1}>
            {profileDetail.experiencesDetails.map((value: any, index: number) => (
              <React.Fragment key={value.id || index}>
                <Grid size={5}>
                  <Typography sx={{ fontSize: 17.5, fontWeight: "bold", mb: 0.5 }}>
                    {value?.jobName}
                  </Typography>
                  <Typography sx={{ fontWeight: "bold", fontSize: 15 }}>
                    {value?.companyName}
                  </Typography>
                  <Typography sx={{ color: "gray" }}>
                    <TimeAgo date={value?.startDate} type="format" /> - <TimeAgo date={value?.endDate} type="format" />
                  </Typography>
                </Grid>
                <Grid size={7}>
                  <Typography>
                    {value?.description || (
                      <span style={{ color: "#e0e0e0", fontStyle: "italic", fontSize: 13 }}>
                        {t('common.notUpdated', { ns: 'common' })}
                      </span>
                    )}
                  </Typography>
                </Grid>
                {index < profileDetail.experiencesDetails.length - 1 && (
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

export default ExperienceSection;

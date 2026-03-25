import React from 'react';
import { Box, Typography, Card, Divider } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { useTranslation } from 'react-i18next';
import TimeAgo from '../../../../components/TimeAgo';

interface EducationSectionProps {
  profileDetail: any;
}

const EducationSection: React.FC<EducationSectionProps> = ({ profileDetail }) => {
  const { t } = useTranslation(['employer', 'common']);

  if (!(profileDetail?.educationDetails?.length > 0)) return null;

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h5" sx={{ mb: 1.5 }}>
        {t('profileDetailCard.title.education', { ns: 'employer' })}
      </Typography>
      <Box>
        <Card variant="outlined" sx={{ p: 2, borderWidth: 2, boxShadow: 0 }}>
          <Grid container spacing={1}>
            {profileDetail.educationDetails.map((value: any, index: number) => (
              <React.Fragment key={value.id || index}>
                <Grid size={12}>
                  <Typography sx={{ fontSize: 17.5, fontWeight: "bold", mb: 0.5 }}>
                    {value?.degreeName} - {t('profileDetailCard.label.major', { ns: 'employer' })}: {value?.major}
                  </Typography>
                  <Typography sx={{ fontWeight: "bold", fontSize: 15 }}>
                    {value?.trainingPlaceName}
                  </Typography>
                  <Typography sx={{ color: "gray" }}>
                    <TimeAgo date={value?.startDate} type="format" /> -{" "}
                    {value.completedDate ? (
                      <TimeAgo date={value?.completedDate} type="format" />
                    ) : (
                      t('common.present', { ns: 'common' })
                    )}
                  </Typography>
                </Grid>
                {index < profileDetail.educationDetails.length - 1 && (
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

export default EducationSection;

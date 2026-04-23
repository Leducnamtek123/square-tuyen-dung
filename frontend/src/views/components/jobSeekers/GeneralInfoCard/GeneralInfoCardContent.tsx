import React from 'react';
import { Box, Divider, Fab, Stack, Typography } from '@mui/material';
import { Grid2 as Grid } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { Theme } from '@mui/material/styles';
import { salaryString } from '../../../../utils/customData';
import { tConfig } from '../../../../utils/tConfig';
import type { ResumeDetail } from './types';

type GeneralInfoCardContentProps = {
  title: string;
  t: (key: string, options?: Record<string, unknown>) => string;
  configDicts: Record<string, Record<string | number, string>> | null;
  resumeDetail: ResumeDetail;
  onEdit: () => void;
};

const GeneralInfoField = ({
  itemTitle,
  value,
  t,
}: {
  itemTitle: string;
  value: string | number | null;
  t: (key: string, options?: Record<string, unknown>) => string;
}) => (
  <Box sx={{ p: 1, backgroundColor: 'background.paper' }}>
    <Typography
      sx={{
        fontWeight: 600,
        color: 'primary.main',
        fontSize: '0.875rem',
        mb: 1,
      }}
    >
      {itemTitle}
    </Typography>
    <Typography
      sx={{
        color: value ? 'text.primary' : 'text.disabled',
        fontStyle: value ? 'normal' : 'italic',
        fontSize: value ? '1rem' : '0.875rem',
      }}
    >
      {value || t('common:noData')}
    </Typography>
  </Box>
);

const GeneralInfoCardContent = ({
  title,
  t,
  configDicts,
  resumeDetail,
  onEdit,
}: GeneralInfoCardContentProps) => (
  <>
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        <Fab
          size="small"
          color="secondary"
          aria-label={t('common:actions.edit')}
          onClick={onEdit}
          sx={{
            boxShadow: (theme: Theme) => theme.customShadows.medium,
            '&:hover': {
              transform: 'scale(1.1)',
            },
            transition: 'all 0.2s ease-in-out',
          }}
        >
          <EditIcon />
        </Fab>
      </Stack>
    </Box>

    <Divider sx={{ my: 0, borderColor: 'grey.500' }} />

    <Stack sx={{ px: 1 }}>
      <Grid container spacing={2}>
        <Grid size={12}>
          <GeneralInfoField itemTitle={t('jobSeeker:profile.fields.objective')} value={resumeDetail.description} t={t} />
          <Divider sx={{ my: 1, borderColor: 'grey.300' }} />
          <GeneralInfoField itemTitle={t('jobSeeker:profile.fields.skillsSummary')} value={resumeDetail.skillsSummary} t={t} />
          <Divider sx={{ my: 1, borderColor: 'grey.300' }} />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <Stack spacing={1.5}>
            <GeneralInfoField itemTitle={t('jobSeeker:profile.fields.desiredPosition')} value={resumeDetail.title} t={t} />
            <GeneralInfoField itemTitle={t('jobSeeker:profile.fields.desiredLevel')} value={tConfig(configDicts?.positionDict?.[resumeDetail.position ?? ''])} t={t} />
            <GeneralInfoField itemTitle={t('jobSeeker:profile.fields.academicLevel')} value={tConfig(configDicts?.academicLevelDict?.[resumeDetail.academicLevel ?? ''])} t={t} />
            <GeneralInfoField itemTitle={t('jobSeeker:profile.fields.experience')} value={tConfig(configDicts?.experienceDict?.[resumeDetail.experience ?? ''])} t={t} />
            <GeneralInfoField itemTitle={t('jobSeeker:profile.fields.career')} value={tConfig(configDicts?.careerDict?.[resumeDetail.career ?? ''])} t={t} />
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <Stack spacing={1.5}>
            <GeneralInfoField itemTitle={t('jobSeeker:profile.fields.workLocation')} value={tConfig(configDicts?.cityDict?.[resumeDetail.city ?? ''])} t={t} />
            <GeneralInfoField itemTitle={t('jobSeeker:profile.fields.desiredSalary')} value={salaryString(resumeDetail.salaryMin ?? null, resumeDetail.salaryMax ?? null)} t={t} />
            <GeneralInfoField
              itemTitle={t('jobSeeker:profile.fields.expectedSalary')}
              value={
                resumeDetail.expectedSalary
                  ? salaryString(resumeDetail.expectedSalary, resumeDetail.expectedSalary)
                  : null
              }
              t={t}
            />
            <GeneralInfoField itemTitle={t('jobSeeker:profile.fields.workplaceType')} value={tConfig(configDicts?.typeOfWorkplaceDict?.[resumeDetail.typeOfWorkplace ?? ''])} t={t} />
            <GeneralInfoField itemTitle={t('jobSeeker:profile.fields.jobType')} value={tConfig(configDicts?.jobTypeDict?.[resumeDetail.jobType ?? ''])} t={t} />
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  </>
);

export default GeneralInfoCardContent;

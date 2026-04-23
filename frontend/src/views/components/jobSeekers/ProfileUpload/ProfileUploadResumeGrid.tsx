import React from 'react';
import { Grid2 as Grid, Box, Stack, Button, Typography, Divider } from '@mui/material';
import PublishIcon from '@mui/icons-material/Publish';
import NoDataCard from '../../../../components/Common/NoDataCard';
import ProfileUploadCard from '../../../../components/Common/ProfileUploadCard';
import type { TFunction } from 'i18next';

type Resume = {
  id: string | number;
  imageUrl?: string;
  fileUrl: string;
  title: string;
  updateAt: string;
  slug: string;
  isActive: boolean;
};

type Props = {
  resumes: Resume[];
  isLoadingResumes: boolean;
  title: string;
  t: TFunction;
  onOpenPopup: () => void;
  onDelete: (slug: string) => void;
  onActive: (slug: string) => void;
};

const LOADING_KEYS = ['loading-1', 'loading-2', 'loading-3'];

const ProfileUploadResumeGrid = ({ resumes, isLoadingResumes, title, t, onOpenPopup, onDelete, onActive }: Props) => {
  return (
    <>
      <Box>
        <Typography variant="h5">
          {title} (<span style={{ color: 'red' }}>{resumes.length}</span>)
        </Typography>
      </Box>

      <Divider sx={{ mt: 2, mb: 3, borderColor: 'grey.500' }} />

      <Box sx={{ px: 1 }}>
        {isLoadingResumes ? (
          <Grid container spacing={2}>
            {LOADING_KEYS.map((loadingKey) => (
              <Grid
                key={loadingKey}
                size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}
              >
                <ProfileUploadCard.Loading />
              </Grid>
            ))}
          </Grid>
        ) : resumes.length === 0 ? (
          <NoDataCard title={t('jobSeeker:profile.messages.noResumeData')} svgKey="ImageSvg2" />
        ) : (
          <Grid container spacing={2}>
            {resumes.map((value) => (
              <Grid
                key={value.id}
                size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}
              >
                <ProfileUploadCard
                  resumeImage={value.imageUrl || ''}
                  fileUrl={value.fileUrl}
                  title={value.title}
                  updateAt={value.updateAt}
                  slug={value.slug}
                  id={value.id}
                  isActive={value.isActive}
                  handleDelete={onDelete}
                  handleActive={onActive}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      <Stack sx={{ pt: 5 }} direction="row" justifyContent="center">
        <Button
          variant="contained"
          startIcon={<PublishIcon />}
          onClick={onOpenPopup}
          sx={{
            px: 4,
            py: 1.5,
            background: (theme) => theme.palette.primary.main,
            '&:hover': {
              background: (theme) => theme.palette.primary.main,
              opacity: 0.9,
            },
          }}
        >
          {t('jobSeeker:attachedProfile.sidebar.cv')}
        </Button>
      </Stack>
    </>
  );
};

export default ProfileUploadResumeGrid;

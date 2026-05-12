import React from 'react';
import { Grid2 as Grid, Box, Stack, Button, Typography, Chip } from '@mui/material';
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
      <Box
        sx={{
          mb: 3,
          p: { xs: 2, sm: 2.5 },
          borderRadius: 4,
          border: '1px solid rgba(26, 64, 125, 0.1)',
          backgroundColor: 'background.paper',
          boxShadow: '0 10px 28px rgba(15, 57, 127, 0.07)',
        }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', sm: 'center' }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary' }}>
              {title}
            </Typography>
            <Chip
              label={resumes.length}
              color="primary"
              size="small"
              sx={{ fontWeight: 800, minWidth: 34 }}
            />
          </Stack>
          <Button
            variant="contained"
            startIcon={<PublishIcon />}
            onClick={onOpenPopup}
            sx={{
              width: { xs: '100%', sm: 'auto' },
              justifyContent: 'center',
              px: 3,
            }}
          >
            {t('jobSeeker:attachedProfile.sidebar.cv')}
          </Button>
        </Stack>
      </Box>

      <Box>
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
    </>
  );
};

export default ProfileUploadResumeGrid;

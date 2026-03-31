import React from 'react';
import Link from 'next/link';
import { Box, Stack, Button, Pagination } from "@mui/material";
import FavoriteIcon from '@mui/icons-material/Favorite';
import { ROUTES } from '../../../../configs/constants';
import NoDataCard from '../../../../components/Common/NoDataCard';
import JobPostAction from '../../../../components/Features/JobPostAction';
import toastMessages from '../../../../utils/toastMessages';
import { useTranslation } from 'react-i18next';
import { useSavedJobs, useToggleSaveJob } from '../hooks/useJobSeekerQueries';

interface JobPost {
  id: string;
  slug: string;
  companyDict?: {
    companyImageUrl?: string;
    companyName?: string;
  };
  jobName: string;
  locationDict?: {
    city?: string;
  };
  deadline: string;
  isUrgent: boolean;
  isHot: boolean;
  salaryMin: number | null;
  salaryMax: number | null;
}

const pageSize = 10;

const SavedJobCard = () => {
  const { t } = useTranslation(['jobSeeker', 'common']);
  const [page, setPage] = React.useState(1);

  const { data, isLoading } = useSavedJobs({ pageSize, page });
  const jobPosts: JobPost[] = (data?.results as unknown as JobPost[]) || [];
  const count = data?.count || 0;

  const toggleSave = useToggleSaveJob();

  const handleChangePage = (event: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage);
  };

  const handleSave = (slug: string) => {
    toggleSave.mutate(slug, {
      onSuccess: (resData: { isSaved: boolean }) => {
        const isSaved = resData.isSaved;
        toastMessages.success(
          isSaved ? t('jobSeeker:jobManagement.messages.saved') : t('jobSeeker:jobManagement.messages.unsaved')
        );
      },
    });
  };

  return (
    <>
      <Box>
        {isLoading ? (
          <Stack spacing={2}>
            {Array.from(Array(5).keys()).map((value) => (
              <JobPostAction.Loading key={value} />
            ))}
          </Stack>
        ) : jobPosts.length === 0 ? (
          <NoDataCard
            title={t('jobSeeker:jobManagement.empty.saved')}
            svgKey="ImageSvg5"
          >
            <Button
              component={Link}
              href={`/${ROUTES.JOB_SEEKER.JOBS}`}
              variant="contained"
              color="primary"
              sx={{ textTransform: 'inherit' }}
            >
              {t('jobSeeker:jobManagement.actions.searchJobs')}
            </Button>
          </NoDataCard>
        ) : (
          <Stack spacing={2}>
            {jobPosts.map((value) => (
              <JobPostAction
                key={value.id}
                id={value.id}
                slug={value.slug}
                companyImageUrl={value?.companyDict?.companyImageUrl}
                companyName={value?.companyDict?.companyName || ''}
                jobName={value?.jobName}
                cityId={value?.locationDict?.city}
                deadline={value?.deadline}
                isUrgent={value?.isUrgent}
                isHot={value?.isHot}
                salaryMin={value.salaryMin ?? undefined}
                salaryMax={value.salaryMax ?? undefined}
              >
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  sx={{ textTransform: 'inherit' }}
                  startIcon={<FavoriteIcon />}
                  onClick={() => handleSave(value.slug)}
                >
                  {t('jobSeeker:jobManagement.actions.unsave')}
                </Button>
              </JobPostAction>
            ))}
            <Stack sx={{ pt: 2 }} alignItems="center">
              {Math.ceil(count / pageSize) > 1 && (
                <Pagination
                  color="primary"
                  size="medium"
                  variant="text"
                  sx={{ margin: '0 auto' }}
                  count={Math.ceil(count / pageSize)}
                  page={page}
                  onChange={handleChangePage}
                />
              )}
            </Stack>
          </Stack>
        )}
      </Box>
    </>
  );
};

export default SavedJobCard;

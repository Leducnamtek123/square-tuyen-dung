import React from 'react';
import { Box, Pagination, Stack, Typography } from "@mui/material";
import { useTranslation } from 'react-i18next';
import JobPostLarge from '../../../../components/Features/JobPostLarge';
import NoDataCard from '../../../../components/Common/NoDataCard';
import { useAppSelector } from '../../../../hooks/useAppStore';
import { useJobPosts } from './hooks/useJobPosts';
import type { JobPost } from '../../../../types/models';

const MainJobPostCardContent = () => {
  const { t } = useTranslation('public');
  const { jobPostFilter } = useAppSelector((state) => state.filter);
  const { pageSize } = jobPostFilter;
  const [page, setPage] = React.useState(1);

  const { data, isLoading } = useJobPosts(jobPostFilter, page);
  const jobPosts = data?.results || [];
  const count = data?.count || 0;

  const handleChangePage = (event: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage);
  };

  return (
    <>
      <Box 
        sx={{ 
          pt: 3, 
          pb: 2,
          display: 'flex',
          alignItems: 'center',
          borderBottom: '1px solid',
          borderColor: 'divider',
          mb: 2,
        }}
      >
        <Typography 
          variant="h5" 
          sx={{
            color: 'text.primary',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          {t('jobSearch.searchResults')}
          <Box 
            component="span"
            sx={{
              color: 'primary.main',
              fontWeight: 600,
              backgroundColor: 'primary.background',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '0.9em'
            }}
          >
            {count.toLocaleString()} {t('jobSearch.posts')}
          </Box>
        </Typography>
      </Box>
      <Stack spacing={2}>
        {isLoading ? (
          Array.from(Array(10).keys()).map((value) => (
            <Box key={value}>
              <JobPostLarge.Loading />
            </Box>
          ))
        ) : jobPosts.length === 0 ? (
          <NoDataCard
            title={t('jobSearch.noJobsFound')}
            svgKey="ImageSvg3"
          />
        ) : (

          <>

            {jobPosts.map((value: JobPost & { companyDict?: any; locationDict?: any; }) => (

              <JobPostLarge

                key={value.id}

                id={value.id}

                slug={value.slug}

                companyImageUrl={value?.companyDict?.companyImageUrl}

                companyName={value?.companyDict?.companyName as string}

                jobName={value?.jobName}

                cityId={Number(value?.locationDict?.city || 0)}

                deadline={value?.deadline}

                isUrgent={value?.isUrgent}

                isHot={value?.isHot}

                salaryMin={value.salaryMin}

                salaryMax={value.salaryMax}

              />

            ))}

            <Stack sx={{ pt: 2 }}>

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

          </>

        )}

      </Stack>

    </>

  );

};

const MainJobPostCard = () => {
  const { jobPostFilter } = useAppSelector((state) => state.filter);
  const filterKey = React.useMemo(() => JSON.stringify(jobPostFilter), [jobPostFilter]);

  return <MainJobPostCardContent key={filterKey} />;
};
export default MainJobPostCard;


// @ts-nocheck
import React from 'react';
import { useSelector } from 'react-redux';
import { Box, Pagination, Stack, Typography } from "@mui/material";
import { useTranslation } from 'react-i18next';

import {} from '../../../../configs/constants';
import JobPostLarge from '../../../../components/JobPostLarge';
import NoDataCard from '../../../../components/NoDataCard';
import jobService from '../../../../services/jobService';

interface Props {
  [key: string]: any;
}



const MainJobPostCard = () => {
  const { t } = useTranslation('public');
  const { jobPostFilter } = useSelector((state) => state.filter);
  const { pageSize } = jobPostFilter;
  const [isLoading, setIsLoading] = React.useState(true);
  const [jobPosts, setJobPosts] = React.useState([]);
  const [page, setPage] = React.useState(1);
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    setPage(1);
  }, [jobPostFilter]);

  React.useEffect(() => {
    const getJobPosts = async () => {
      setIsLoading(true);
      try {
        const resData = await jobService.getJobPosts({
          ...jobPostFilter,
          page: page,
        });
        const data = resData.data;
        setCount(data.count);
        setJobPosts(data?.results || []);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    getJobPosts();
  }, [jobPostFilter, page]);

  const handleChangePage = (event, newPage) => {
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

            {jobPosts.map((value) => (

              <JobPostLarge

                key={value.id}

                id={value.id}

                slug={value.slug}

                companyImageUrl={value?.companyDict?.companyImageUrl}

                companyName={value?.companyDict?.companyName}

                jobName={value?.jobName}

                cityId={value?.locationDict?.city}

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

export default MainJobPostCard;

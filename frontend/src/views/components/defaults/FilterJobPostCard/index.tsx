import React from 'react';
import { Pagination, Stack } from "@mui/material";
import { Grid2 as Grid } from "@mui/material";
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import jobService from '../../../../services/jobService';
import JobPost from '../../../../components/Features/JobPost';
import NoDataCard from '../../../../components/Common/NoDataCard';
import type { JobPost as ModelsJobPost } from '../../../../types/models';
import type { GetJobPostsParams } from '../../../../services/jobService';

interface FilterJobPostCardProps {
  params?: GetJobPostsParams;
}

const pageSize = 12;

const FilterJobPostCard: React.FC<FilterJobPostCardProps> = ({ params = {} }) => {
  const [page, setPage] = React.useState(1);
  const [parentWidth, setParentWidth] = React.useState(0);
  const [col, setCol] = React.useState(12);

  const paramsKey = React.useMemo(() => JSON.stringify(params || {}), [params]);
  const resolvedParams = React.useMemo<GetJobPostsParams>(() => {
    try {
      return JSON.parse(paramsKey) as GetJobPostsParams;
    } catch {
      return {};
    }
  }, [paramsKey]);

  React.useEffect(() => {
    const handleResize = () => {
      const element = document.getElementById("filter-job-post-card");
      if (element) {
        setParentWidth(element.offsetWidth);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  React.useEffect(() => {
    if (parentWidth < 600) {
      setCol(12);
    } else if (parentWidth < 900) {
      setCol(6);
    } else if (parentWidth < 1200) {
      setCol(6);
    } else {
      setCol(4);
    }
  }, [parentWidth]);

  React.useEffect(() => {
    setPage(1);
  }, [paramsKey]);

  const { data, isLoading } = useQuery({
    queryKey: ['filtered-job-posts', paramsKey, page],
    queryFn: async () => {
      const resData = await jobService.getJobPosts({
        ...resolvedParams,
        pageSize,
        page,
      });
      return {
        results: resData?.results || [],
        count: resData?.count || 0,
      };
    },
    staleTime: 5 * 60_000,
    placeholderData: keepPreviousData,
  });

  const jobPosts = data?.results || [];
  const count = data?.count || 0;

  const handleChangePage = (_event: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage);
  };

  return (
    <div id="filter-job-post-card">
      <Stack>
        {isLoading && !data ? (
          <Grid container spacing={2}>
            {Array.from(Array(pageSize).keys()).map((item) => (
              <Grid key={item} size={col}>
                <JobPost.Loading></JobPost.Loading>
              </Grid>
            ))}
          </Grid>
        ) : jobPosts.length === 0 ? (
          <NoDataCard />
        ) : (
          <>
            <Grid container spacing={2}>
              {jobPosts.map((value: ModelsJobPost & { companyDict?: { companyImageUrl?: string; companyName?: string }; locationDict?: { city?: number | string } }) => (
                <Grid key={value.id} size={col}>
                  <JobPost
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
                </Grid>
              ))}
            </Grid>
            <Stack sx={{ mt: 4 }}>
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
    </div>
  );
};

export default React.memo(FilterJobPostCard);

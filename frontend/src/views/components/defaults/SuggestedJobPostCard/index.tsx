 'use client';
import React from "react";
import { Pagination, Stack } from "@mui/material";
import { Grid2 as Grid } from "@mui/material";
import { ROLES_NAME } from "../../../../configs/constants";
import NoDataCard from "../../../../components/Common/NoDataCard";
import JobPost from "../../../../components/Features/JobPost";
import { useAppSelector } from "../../../../hooks/useAppStore";
import { useSuggestedJobPosts } from "../MainJobPostCard/hooks/useJobPosts";
import type { JobPost as ModelsJobPost } from '../../../../types/models';

interface SuggestedJobPostCardProps {
  pageSize?: number;
  fullWidth?: boolean;
}

const SuggestedJobPostCard: React.FC<SuggestedJobPostCardProps> = ({ pageSize = 12, fullWidth = false }) => {

  const { currentUser, isAuthenticated } = useAppSelector((state) => state.user);

  const [page, setPage] = React.useState(1);

  const containerRef = React.useRef<HTMLDivElement>(null);

  const [col, setCol] = React.useState(12);

  const isJobSeeker = isAuthenticated && currentUser?.roleName === ROLES_NAME.JOB_SEEKER;

  // Use ResizeObserver instead of document.getElementById + window resize
  React.useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new ResizeObserver((entries) => {
      const width = entries[0].contentRect.width;
      const nextCol = width < 600 ? 12 : width < 900 ? 6 : fullWidth ? 6 : 4;
      setCol(nextCol);
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, [fullWidth]);

  const { data, isLoading } = useSuggestedJobPosts(
    { pageSize, page },
    isJobSeeker
  );

  const jobPosts = isJobSeeker ? (data?.results || []) : [];
  const count = isJobSeeker ? (data?.count || 0) : 0;
  const showLoading = isJobSeeker && isLoading;

  const handleChangePage = (event: React.ChangeEvent<unknown>, newPage: number) => {

    setPage(newPage);

  };

  return (

    <div ref={containerRef}>

      <Stack>

        {showLoading ? (

          <Grid container spacing={2}>

            {Array.from(Array(pageSize).keys()).map((item) => (

              <Grid key={item} size={col}>

                <JobPost.Loading></JobPost.Loading>

              </Grid>

            ))}

          </Grid>

        ) : jobPosts.length === 0 ? (

          <NoDataCard svgKey="ImageSvg8" />

        ) : (

          <>

            <Grid container spacing={2}>

              {jobPosts.map((value: ModelsJobPost & { companyDict?: any; locationDict?: any; }) => (

                <Grid key={value.id} size={col}>

                  {/* Start: Job post */}

                  <JobPost

                    id={value.id}

                    slug={value.slug}

                    companyImageUrl={value?.companyDict?.companyImageUrl}

                    companyName={value?.companyDict?.companyName}

                    jobName={value?.jobName}

                    cityId={Number(value?.locationDict?.city || 0)}

                    deadline={value?.deadline}

                    isUrgent={value?.isUrgent}

                    isHot={value?.isHot}

                    salaryMin={value.salaryMin}

                    salaryMax={value.salaryMax}

                  />

                  {/* End: Job post */}

                </Grid>

              ))}

            </Grid>

            <Stack sx={{mt: 4}}>

              {Math.ceil(count / pageSize) > 1 && (

                <Pagination

                  color="primary"

                  size="medium"

                  variant="text"

                  sx={{ margin: "0 auto" }}

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

export default SuggestedJobPostCard;

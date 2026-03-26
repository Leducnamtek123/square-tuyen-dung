import React from 'react';
import Link from 'next/link';
import { Box, Stack, Button, Pagination, Chip, Typography } from "@mui/material";
import DoneIcon from '@mui/icons-material/Done';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import {CV_TYPES, ROUTES} from '../../../../configs/constants';
import NoDataCard from '../../../../components/NoDataCard';
import JobPostAction from '../../../../components/JobPostAction';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFile, faFilePdf } from '@fortawesome/free-solid-svg-icons';
import jobPostActivityService from '../../../../services/jobPostActivityService';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

const pageSize = 10;

const AppliedJobCard = () => {
  const { t } = useTranslation(['jobSeeker', 'common']);
  const [page, setPage] = React.useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['applied-jobs', page],
    queryFn: async () => {
      const resData = await jobPostActivityService.getJobPostActivity({
        pageSize: pageSize,
        page: page,
      });
      const result = (resData as any).data;
      return {
        results: result.results || [],
        count: result.count || 0,
      };
    },
    staleTime: 2 * 60_000,
    placeholderData: keepPreviousData,
  });

  const jobPostsApplied = data?.results || [];
  const count = data?.count || 0;

  const handleChangePage = (event: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage);
  };

  return (
    <>
      <Box>
        {isLoading && !data ? (
          <Stack spacing={2}>
            {Array.from(Array(5).keys()).map((value) => (
              <JobPostAction.Loading key={value} />
            ))}
          </Stack>
        ) : jobPostsApplied.length === 0 ? (
          <NoDataCard
            title={t("jobSeeker:jobManagement.empty.applied")}
            svgKey="ImageSvg5"
          >
            <Button
              component={Link}
              href={`/${ROUTES.JOB_SEEKER.JOBS}`}
              variant="contained"
              color="primary"
              sx={{ textTransform: 'inherit' }}
            >
              {t("jobSeeker:jobManagement.actions.searchJobs")}
            </Button>
          </NoDataCard>
        ) : (
          <Stack spacing={2}>
            {jobPostsApplied.map((value: any) => (
              <JobPostAction
                key={value.id}
                id={value?.jobPostDict.id}
                slug={value?.jobPostDict.slug}
                companyImageUrl={value?.jobPostDict?.companyDict?.companyImageUrl}
                companyName={value?.jobPostDict?.companyDict?.companyName}
                jobName={value?.jobPostDict?.jobName}
                cityId={value?.jobPostDict?.locationDict?.city}
                deadline={value?.jobPostDict?.deadline}
                isUrgent={value?.jobPostDict?.isUrgent}
                isHot={value?.jobPostDict?.isHot}
                salaryMin={value?.jobPostDict.salaryMin}
                salaryMax={value?.jobPostDict.salaryMax}
              >
                <Stack spacing={1}>
                  <Chip
                    label={t("jobSeeker:jobManagement.appliedOn", {
                      date: dayjs(value?.createAt).format("DD/MM/YYYY"),
                    })}
                    size="small"
                    color="success"
                    icon={<DoneIcon />}
                  />
                  <Typography variant="subtitle2" color="GrayText">
                    {value?.resumeDict?.type === CV_TYPES.cvWebsite ? (
                      <>
                        <FontAwesomeIcon
                          icon={faFile}
                          style={{ marginRight: 1 }}
                          color="#441da0"
                        />{' '}
                        {t("jobSeeker:jobApplication.onlineProfile")}
                      </>
                    ) : value?.resumeDict?.type === CV_TYPES.cvUpload ? (
                      <>
                        <FontAwesomeIcon
                          icon={faFilePdf}
                          style={{ marginRight: 1 }}
                          color="red"
                        />{' '}
                        {t("jobSeeker:jobApplication.attachedResume")}
                      </>
                    ) : (
                      ''
                    )}
                  </Typography>
                </Stack>
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

export default AppliedJobCard;

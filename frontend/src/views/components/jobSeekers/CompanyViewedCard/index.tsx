import React from 'react';
import { Box, Stack, Pagination, Chip } from "@mui/material";
import CheckIcon from '@mui/icons-material/Check';
import NoDataCard from '../../../../components/Common/NoDataCard';
import CompanyAction from '../../../../components/Features/CompanyAction';
import CompanyActionLoading from '../../../../components/Features/CompanyAction/Loading';
import { useResumeViewed } from '../hooks/useJobSeekerQueries';
import { useTranslation } from 'react-i18next';

const pageSize = 10;

import type { Company, Resume } from '../../../../types/models';
import type { ResumeViewed } from '../../../../services/resumeViewedService';

const CompanyViewedCard = () => {
  const { t } = useTranslation(['jobSeeker']);
  const [page, setPage] = React.useState(1);

  const { data, isLoading } = useResumeViewed({ pageSize, page });
  const resumesViewed = data?.results || [];
  const count = data?.count || 0;
  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  React.useEffect(() => {
    if (count > 0 && page > totalPages) {
      setPage(totalPages);
    }
  }, [count, page, totalPages]);

  const handleChangePage = (event: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage);
  };

  return (
    <>
      <Box>
        {isLoading ? (
          <Stack spacing={2}>
            {Array.from(Array(5).keys()).map((value) => (
              <CompanyActionLoading key={value} />
            ))}
          </Stack>
        ) : resumesViewed.length === 0 ? (
          <NoDataCard
            title={t('jobSeeker:myCompany.empty.viewed')}
            svgKey="ImageSvg6"
          ></NoDataCard>
        ) : (
          <Stack spacing={2}>
            {resumesViewed.map((item) => (
              <CompanyAction
                key={item.id}
                id={item.id}
                views={item.views}
                createAt={item.createAt}
                resume={item.resume}
                company={item.company}
              >
                {item.isSavedResume && (
                  <Chip
                    icon={<CheckIcon />}
                    label={t('jobSeeker:myCompany.savedProfile')}
                    size="small"
                    sx={{
                      backgroundColor: 'rgba(47, 161, 51, 0.15)',
                      color: 'rgb(47, 161, 50)',
                    }}
                  />
                )}
              </CompanyAction>
            ))}
            <Stack sx={{ pt: 2 }} alignItems="center">
              {totalPages > 1 && (
                <Pagination
                  color="primary"
                  size="medium"
                  variant="text"
                  sx={{ margin: '0 auto' }}
                  count={totalPages}
                  page={Math.min(page, totalPages)}
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

export default React.memo(CompanyViewedCard);

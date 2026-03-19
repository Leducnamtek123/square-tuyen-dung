import React from 'react';
import { Box, Stack, Pagination, Chip } from "@mui/material";
import CheckIcon from '@mui/icons-material/Check';
import NoDataCard from '../../../../components/NoDataCard';
import CompanyAction from '../../../../components/CompanyAction';
import resumeViewedService from '../../../../services/resumeViewedService';
import { useTranslation } from 'react-i18next';

const pageSize = 10;

const CompanyViewedCard = () => {
  const { t } = useTranslation(['jobSeeker']);
  const [isLoading, setIsLoading] = React.useState(true);
  const [resumesViewed, setResumesViewed] = React.useState<any[]>([]);
  const [page, setPage] = React.useState(1);
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    const getResumeViewed = async (params: any) => {
      setIsLoading(true);
      try {
        const resData = await resumeViewedService.getResumeViewed(params);
        const data = (resData as any).data;
        setCount(data.count);
        setResumesViewed(data.results);
      } catch (error: any) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    getResumeViewed({
      pageSize: pageSize,
      page: page,
    });
  }, [page]);

  const handleChangePage = (event: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage);
  };

  return (
    <>
      <Box>
        {isLoading ? (
          <Stack spacing={2}>
            {Array.from(Array(5).keys()).map((value) => (
              <CompanyAction.Loading key={value} />
            ))}
          </Stack>
        ) : resumesViewed.length === 0 ? (
          <NoDataCard
            title={t('jobSeeker:myCompany.empty.viewed')}
            svgKey="ImageSvg6"
          ></NoDataCard>
        ) : (
          <Stack spacing={2}>
            {resumesViewed.map((value) => (
              <CompanyAction
                key={value.id}
                id={value.id}
                views={value.views}
                createAt={value.createAt}
                resume={value.resume}
                company={value.company}
              >
                {value.isSavedResume && (
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

export default React.memo(CompanyViewedCard);

import React from 'react';
import Link from 'next/link';
import { Box, Stack, Pagination, Button } from "@mui/material";
import { ROUTES } from '../../../../configs/constants';
import NoDataCard from '../../../../components/NoDataCard';
import CompanyAction from '../../../../components/CompanyAction';
import toastMessages from '../../../../utils/toastMessages';
import { useTranslation } from 'react-i18next';
import { useCompaniesFollowed, useToggleFollowCompany } from '../hooks/useJobSeekerQueries';

const pageSize = 10;

const CompanyFollowedCard = () => {
  const { t } = useTranslation(['jobSeeker', 'common']);
  const [page, setPage] = React.useState(1);

  const { data, isLoading } = useCompaniesFollowed({ pageSize, page });
  const companies = data?.results || [];
  const count = data?.count || 0;

  const toggleFollow = useToggleFollowCompany();

  const handleChangePage = (_event: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage);
  };

  const handleFollow = (slug: string) => {
    toggleFollow.mutate(slug, {
      onSuccess: () => {
        toastMessages.success(t('jobSeeker:myCompany.messages.unfollowSuccess'));
      },
    });
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
        ) : companies.length === 0 ? (
          <NoDataCard
            title={t('jobSeeker:myCompany.empty.followed')}
            svgKey="ImageSvg7"
          >
            <Button
              variant="contained"
              color="primary"
              component={Link}
              href={`/${ROUTES.JOB_SEEKER.COMPANY}`}
            >
              {t('jobSeeker:myCompany.actions.findCompanies')}
            </Button>
          </NoDataCard>
        ) : (
          <Stack spacing={2}>
            {companies.map((value: any) => (
              <CompanyAction.CompanyActionFollow
                key={value.id}
                id={value.id}
                company={value.company}
              >
                <Button
                  sx={{ textTransform: 'inherit' }}
                  variant="outlined"
                  color="error"
                  size="small"
                  onClick={() => handleFollow(value.company?.slug)}
                >
                  {t('jobSeeker:myCompany.actions.unfollow')}
                </Button>
              </CompanyAction.CompanyActionFollow>
            ))}
            <Stack sx={{ pt: 2 }} alignItems="center">
              {Math.ceil(count / pageSize) > 1 && (
                <Pagination
                  color="standard"
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

export default CompanyFollowedCard;

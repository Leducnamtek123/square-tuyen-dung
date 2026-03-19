import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Stack, Pagination, Button } from "@mui/material";
import errorHandling from '../../../../utils/errorHandling';
import toastMessages from '../../../../utils/toastMessages';
import {ROUTES} from '../../../../configs/constants';
import NoDataCard from '../../../../components/NoDataCard';
import CompanyAction from '../../../../components/CompanyAction';
import companyFollowed from '../../../../services/companyFollowed';
import companyService from '../../../../services/companyService';
import { useTranslation } from 'react-i18next';

const pageSize = 10;

const CompanyFollowedCard = () => {
  const { t } = useTranslation(['jobSeeker', 'common']);

  const [isSuccess, setIsSuccess] = React.useState(false);

  const [isLoading, setIsLoading] = React.useState(true);

  const [resumesViewed, setResumesViewed] = React.useState<any[]>([]);

  const [page, setPage] = React.useState(1);

  const [count, setCount] = React.useState(0);

  React.useEffect(() => {

    const getCompaniesFollowed = async (params: any) => {

      setIsLoading(true);

      try {

        const resData: any = await companyFollowed.getCompaniesFollowed(params);

        const data = resData.data;

        setCount(data.count);

        setResumesViewed(data.results);

      } catch (error: any) {
        // Suppress or handle error
      } finally {

        setIsLoading(false);

      }

    };

    getCompaniesFollowed({

      pageSize: pageSize,

      page: page,

    });

  }, [page, isSuccess]);

  const handleChangePage = (_event: React.ChangeEvent<unknown>, newPage: number) => {

    setPage(newPage);

  };

  const handleFollow = (slug: string) => {

    const follow = async (slugCompany: string) => {

      try {

        await companyService.followCompany(slugCompany);

        toastMessages.success(t('jobSeeker:myCompany.messages.unfollowSuccess'));

        setIsSuccess(!isSuccess);

      } catch (error: any) {

        errorHandling(error);

      }

    };

    follow(slug);

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

            title={t('jobSeeker:myCompany.empty.followed')}

            svgKey="ImageSvg7"

          >

            <Button

              variant="contained"

              color="primary"

              component={Link}

              to={`/${ROUTES.JOB_SEEKER.COMPANY}`}

            >

              {t('jobSeeker:myCompany.actions.findCompanies')}

            </Button>

          </NoDataCard>

        ) : (

          <Stack spacing={2}>

            {resumesViewed.map((value: any) => (

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

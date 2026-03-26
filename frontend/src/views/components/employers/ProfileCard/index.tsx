import React from 'react';
import { useAppSelector } from '@/redux/hooks';
import { useTranslation } from 'react-i18next';
import { Box, Card, Pagination, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { } from '../../../../configs/constants';
import NoDataCard from '../../../../components/Common/NoDataCard';
import errorHandling from '../../../../utils/errorHandling';
import toastMessages from '../../../../utils/toastMessages';
import ProfileSearch from '../ProfileSearch';
import JobSeekerProfile from '../../../../components/Features/JobSeekerProfile';
import resumeService from '../../../../services/resumeService';
import { useEmployerResumes, useToggleSaveResumeOptimistic } from '../hooks/useEmployerQueries';

interface ResumeItem {
  id: number;
  slug: string;
  title: string;
  salaryMin: number | null;
  salaryMax: number | null;
  experience: number | null;
  updateAt: string;
  isSaved: boolean;
  viewEmployerNumber: number;
  userDict: object;
  city: number;
  jobSeekerProfileDict: object;
  type: number;
  lastViewedDate: string | null;
}



const ProfileCard = () => {

  const { t } = useTranslation('employer');

  const { resumeFilter } = useAppSelector((state) => state.filter);

  const { pageSize } = resumeFilter;

  const [page, setPage] = React.useState(1);

  const queryParams = React.useMemo(() => ({
    ...resumeFilter,
    page,
  }), [resumeFilter, page]);

  const { data: queryData, isLoading } = useEmployerResumes(queryParams);
  const resumes: ResumeItem[] = queryData?.results || [];
  const count = queryData?.count || 0;

  const saveMutation = useToggleSaveResumeOptimistic();

  const handleChangePage = (event: React.ChangeEvent<unknown>, newPage: number) => {

    setPage(newPage);

  };

  const handleSave = (slug: string) => {
    saveMutation.mutate(slug, {
      onSuccess: (resData: any) => {
        const isSaved = resData.isSaved;
        toastMessages.success(
          isSaved ? t('profileCard.messages.saveSuccess') : t('profileCard.messages.unsaveSuccess')
        );
      },
    });
  };

  return (

    <Grid container spacing={3}>

      {/* Start: Profile search */}

      <ProfileSearch />

      {/* End: Profile search */}

      <Grid

        size={{

          xs: 12,

          sm: 12,

          md: 12,

          lg: 9,

          xl: 9

        }}>

        <Card sx={{ boxShadow: 0 }}>

          <Stack>

            <Box>

              <Typography

                variant="body1"

                sx={{ fontSize: 18, fontWeight: 'bold' }}

              >

                {t('profileCard.label.resultsFound')}{' '}

                <span style={{ color: 'red' }}>{t('profileCard.label.profiles', { count })}</span>

              </Typography>

            </Box>

            <Box sx={{ mt: 3 }}>

              {isLoading ? (

                <Box>

                  <Grid container spacing={2}>

                    {Array.from(Array(pageSize).keys()).map((value) => (

                      <Grid

                        key={value}

                        size={{

                          xs: 12,

                          sm: 12,

                          md: 12,

                          lg: 12,

                          xl: 12

                        }}>

                        <JobSeekerProfile.Loading />

                      </Grid>

                    ))}

                  </Grid>

                </Box>

              ) : resumes.length === 0 ? (

                <NoDataCard

                  title={t('profileCard.title.noresultsfound')}

                  svgKey="ImageSvg11"

                />

              ) : (

                <>

                  {/* Start: Job seeker profiles */}

                  <Box>

                    <Stack spacing={4}>

                      <Grid container spacing={2}>

                        {resumes.map((value) => (

                          <Grid

                            key={value.id}

                            size={{

                              xs: 12,

                              sm: 12,

                              md: 12,

                              lg: 12,

                              xl: 12

                            }}>

                            <JobSeekerProfile

                              key={value.id}

                              id={value.id}

                              slug={value.slug}

                              title={value.title}

                              salaryMin={value.salaryMin ?? undefined}

                              salaryMax={value.salaryMax ?? undefined}

                              experience={value.experience ?? undefined}

                              updateAt={value.updateAt}

                              isSaved={value.isSaved}

                              viewEmployerNumber={value.viewEmployerNumber}

                              user={value.userDict}

                              city={value.city}

                              jobSeekerProfile={value.jobSeekerProfileDict}

                              type={value.type?.toString()}

                              lastViewedDate={value.lastViewedDate ?? undefined}

                              handleSave={handleSave}

                            />

                          </Grid>

                        ))}

                      </Grid>

                      <Stack>

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

                  </Box>

                  {/* End: Job seeker profiles */}

                </>

              )}

            </Box>

          </Stack>

        </Card>

      </Grid>

    </Grid>

  );

};

export default ProfileCard;

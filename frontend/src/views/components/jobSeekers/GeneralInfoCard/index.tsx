import React from 'react';
import { useAppSelector } from '@/redux/hooks';

import { useParams } from 'next/navigation';

import { Box, Divider, Fab, Skeleton, Stack, Typography } from "@mui/material";

import Grid from "@mui/material/Grid2";

import { useTranslation } from 'react-i18next';

import EditIcon from "@mui/icons-material/Edit";

import FormPopup from '../../../../components/Common/Controls/FormPopup';

import GeneralInfoForm from '../GeneralInfoForm';

import toastMessages from '../../../../utils/toastMessages';

import errorHandling from '../../../../utils/errorHandling';

import BackdropLoading from '../../../../components/Common/Loading/BackdropLoading';

import resumeService from '../../../../services/resumeService';

import { salaryString } from '../../../../utils/customData';
import { tConfig } from '../../../../utils/tConfig';
import { useConfig } from '@/hooks/useConfig';

interface ResumeDetail {
  description: string | null;
  skillsSummary: string | null;
  title: string | null;
  position: string;
  academicLevel: string;
  experience: string;
  career: string;
  city: string;
  salaryMin: number | null;
  salaryMax: number | null;
  expectedSalary: number | null;
  typeOfWorkplace: string;
  jobType: string;
}

interface GeneralInfoCardProps {
  title: string;
}



const Loading = (

  <Box sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 'custom.info' }}>

    <Box>

      <Stack

        direction="row"

        justifyContent="space-between"

        alignItems="center"

        spacing={2}

      >

        <Typography variant="h6" flex={1}>

          <Skeleton />

        </Typography>

        <Box>

          <Skeleton variant="circular" width={50} height={50} />

        </Box>

      </Stack>

    </Box>

    <Box sx={{ px: 1 }}>

      <Box sx={{ py: 2 }}>

        <Skeleton height={5} />

      </Box>

      <Grid container spacing={4}>

        <Grid size={6}>

          {Array(8)

            .fill(0)

            .map((_, index) => (

              <Typography component="div" variant="h5" key={index}>

                <Skeleton />

              </Typography>

            ))}

        </Grid>

        <Grid size={6}>

          {Array(8)

            .fill(0)

            .map((_, index) => (

              <Typography component="div" variant="h5" key={index}>

                <Skeleton />

              </Typography>

            ))}

        </Grid>

      </Grid>

    </Box>

  </Box>

);

const GeneralInfoCard = ({ title }: GeneralInfoCardProps) => {

    const { t } = useTranslation(['jobSeeker', 'common']);

    const { slug: resumeSlug } = useParams<{ slug: string }>();

    const { allConfig } = useConfig();

    const [openPopup, setOpenPopup] = React.useState(false);

    const [isSuccess, setIsSuccess] = React.useState(false);

    const [isLoadingResumeDetail, setIsLoadingResumeDetail] =

        React.useState(true);

    const [isFullScreenLoading, setIsFullScreenLoading] = React.useState(false);

    const [resumeDetail, setResumeDetail] = React.useState<ResumeDetail | null>(null);

    const renderItem = (itemTitle: string, value: string | number | null) => {

        return (

            <Box sx={{

                p: 1,

                backgroundColor: 'background.paper',

            }}>

                <Typography

                    sx={{

                        fontWeight: 600,

                        color: 'primary.main',

                        fontSize: '0.875rem',

                        mb: 1

                    }}

                >

                    {itemTitle}

                </Typography>

                <Typography sx={{

                    color: value ? 'text.primary' : 'text.disabled',

                    fontStyle: value ? 'normal' : 'italic',

                    fontSize: value ? '1rem' : '0.875rem',

                }}>

                    {value || t('common:noData')}

                </Typography>

            </Box>

        );

    };

  React.useEffect(() => {

    const getResumeDetail = async (slug: string | undefined) => {
      if (!slug) return;

      try {

        const resData = await resumeService.getResumeOwner(slug) as any;

        setResumeDetail(resData.data);

      } catch (error: any) {

        errorHandling(error);

      } finally {

        setIsLoadingResumeDetail(false);

      }

    };

    getResumeDetail(resumeSlug);

  }, [isSuccess, resumeSlug]);

  const handleUpdateResumeDetail = (data: any) => {

    const updateResume = async (slug: string | undefined, payload: any) => {
      if (!slug) return;

      setIsFullScreenLoading(true);

      try {

        await resumeService.updateResume(slug, payload);

        setIsSuccess(!isSuccess);

        setOpenPopup(false);

        toastMessages.success(t('jobSeeker:profile.messages.profileUpdateSuccess'));

      } catch (error: any) {

        errorHandling(error);

      } finally {

        setIsFullScreenLoading(false);

      }

    };

    updateResume(resumeSlug, data);

  };

  return (

    <Box sx={{ 

      backgroundColor: 'background.paper', 

      borderRadius: 3,

      p: 3,

      boxShadow: (theme: any) => theme.customShadows.card,

    }}>

      <Stack spacing={3}>

        {isLoadingResumeDetail ? (

          Loading

        ) : resumeDetail === null ? (

          <Typography variant="h6" color="error.main" textAlign="center">

            {t('jobSeeker:profile.messages.notFound')}

          </Typography>

        ) : (

          <>

            <Box>

              <Stack

                direction="row"

                justifyContent="space-between"

                alignItems="center"

              >

                <Typography 

                  variant="h5"

                  sx={{ 

                    fontWeight: 600,

                  }}

                >

                  {title}

                </Typography>

                <Fab

                  size="small"

                  color="secondary"

                  aria-label={t('common:actions.edit')}

                  onClick={() => setOpenPopup(true)}

                  sx={{

                    boxShadow: (theme: any) => theme.customShadows.medium,

                    '&:hover': {

                      transform: 'scale(1.1)',

                    },

                    transition: 'all 0.2s ease-in-out',

                  }}

                >

                  <EditIcon />

                </Fab>

              </Stack>

            </Box>

            <Divider sx={{ my: 0, borderColor: 'grey.500' }}/>

            <Stack sx={{ px: 1 }}>

              <Grid container spacing={2}>

                <Grid size={12}>

                  {renderItem(t('jobSeeker:profile.fields.objective'), resumeDetail?.description)}

                  <Divider sx={{ my: 1, borderColor: 'grey.300' }} />

                  {renderItem(

                    t('jobSeeker:profile.fields.skillsSummary'),

                    resumeDetail?.skillsSummary

                  )}

                  <Divider sx={{ my: 1, borderColor: 'grey.300' }} />

                </Grid>

                <Grid

                  size={{

                    xs: 12,

                    sm: 6

                  }}>

                  <Stack spacing={1.5}>

                    {renderItem(t('jobSeeker:profile.fields.desiredPosition'), resumeDetail?.title)}

                    {renderItem(

                      t('jobSeeker:profile.fields.desiredLevel'),
                      tConfig((allConfig as any)?.positionDict?.[resumeDetail?.position ?? ''])
                    )}

                    {renderItem(

                      t('jobSeeker:profile.fields.academicLevel'),
                      tConfig((allConfig as any)?.academicLevelDict?.[resumeDetail?.academicLevel ?? ''])
                    )}

                    {renderItem(

                      t('jobSeeker:profile.fields.experience'),
                      tConfig((allConfig as any)?.experienceDict?.[resumeDetail?.experience ?? ''])
                    )}

                    {renderItem(

                      t('jobSeeker:profile.fields.career'),
                      tConfig((allConfig as any)?.careerDict?.[resumeDetail?.career ?? ''])
                    )}

                  </Stack>

                </Grid>

                <Grid

                  size={{

                    xs: 12,

                    sm: 6
                  }}>

                  <Stack spacing={1.5}>

                    {renderItem(

                      t('jobSeeker:profile.fields.workLocation'),
                      tConfig((allConfig as any)?.cityDict?.[resumeDetail?.city ?? ''])
                    )}

                    {renderItem(

                      t('jobSeeker:profile.fields.desiredSalary'),

                      salaryString(

                        resumeDetail?.salaryMin ?? null,

                        resumeDetail?.salaryMax ?? null

                      )

                    )}

                    {renderItem(

                      t('jobSeeker:profile.fields.expectedSalary'),

                      resumeDetail?.expectedSalary

                        ? salaryString(resumeDetail?.expectedSalary, resumeDetail?.expectedSalary)

                        : null

                    )}

                    {renderItem(

                      t('jobSeeker:profile.fields.workplaceType'),
                      tConfig((allConfig as any)?.typeOfWorkplaceDict?.[
                        resumeDetail?.typeOfWorkplace ?? ''
                      ])
                    )}

                    {renderItem(

                      t('jobSeeker:profile.fields.jobType'),
                      tConfig((allConfig as any)?.jobTypeDict?.[resumeDetail?.jobType ?? ''])
                    )}

                  </Stack>

                </Grid>

              </Grid>

            </Stack>

          </>

        )}

      </Stack>

      {/* Start: form  */}

      <FormPopup

        title={t('jobSeeker:profile.sections.resume')}

        openPopup={openPopup}

        setOpenPopup={setOpenPopup}

      >

        <GeneralInfoForm

          handleUpdate={handleUpdateResumeDetail}

          editData={resumeDetail}

        />

      </FormPopup>

      {/* End: form */}

      {/* Start: full screen loading */}

      {isFullScreenLoading && <BackdropLoading />}

      {/* End: full screen loading */}

    </Box>

  );

};

export default GeneralInfoCard;

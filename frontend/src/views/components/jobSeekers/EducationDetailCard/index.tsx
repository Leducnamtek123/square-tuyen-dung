import React from 'react';

import { useParams } from 'next/navigation';

import { Accordion, AccordionDetails, AccordionSummary, Box, Divider, Fab, IconButton, Skeleton, Stack, Typography } from "@mui/material";

import {

  Timeline,

  TimelineConnector,

  TimelineContent,

  TimelineDot,

  TimelineItem,

  timelineItemClasses,

  TimelineSeparator,

} from '@mui/lab';

import AddIcon from '@mui/icons-material/Add';

import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';

import ModeEditOutlineOutlinedIcon from '@mui/icons-material/ModeEditOutlineOutlined';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { confirmModal } from '../../../../utils/sweetalert2Modal';

import toastMessages from '../../../../utils/toastMessages';

import errorHandling from '../../../../utils/errorHandling';

import BackdropLoading from '../../../../components/Common/Loading/BackdropLoading';

import EmptyCard from '../../../../components/Common/EmptyCard';

import FormPopup from '../../../../components/Common/Controls/FormPopup';

import EducationDetaiForm from '../EducationDetailForm';

import resumeService from '../../../../services/resumeService';

import educationDetailService from '../../../../services/educationDetailService';

import TimeAgo from '../../../../components/Common/TimeAgo';

import { useTranslation } from 'react-i18next';

interface EducationDetail {
  id: string | number;
  startDate: string;
  completedDate: string | null;
  degreeName: string;
  trainingPlaceName: string;
  major: string | null;
  description: string | null;
}

interface EducationDetailCardProps {
  title: string;
}



const Loading = (

  <Stack>

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

      {Array(2)

        .fill(0)

        .map((_, index) => (

          <Box sx={{ py: 1 }} key={index}>

            <Skeleton />

            <Skeleton />

            <Skeleton />

          </Box>

        ))}

    </Box>

  </Stack>

);

const EducationDetailCard = ({ title }: EducationDetailCardProps) => {

  const { t } = useTranslation(['jobSeeker', 'common']);

  const { slug: resumeSlug } = useParams<{ slug: string }>();

  const [openPopup, setOpenPopup] = React.useState(false);

  const [isSuccess, setIsSuccess] = React.useState(false);

  const [isLoadingEducationsDetail, setIsLoadingEductionsDetail] =

    React.useState(true);

  const [isFullScreenLoading, setIsFullScreenLoading] = React.useState(false);

  const [educationsDetail, setEducationsDetail] = React.useState<EducationDetail[]>([]);

  const [editData, setEditData] = React.useState<EducationDetail | null>(null);

  React.useEffect(() => {

    const loadEducationsDetail = async (slug: string | undefined) => {
      if (!slug) return;

      setIsLoadingEductionsDetail(true);

      try {

        const resData = await resumeService.getEducationsDetail(slug) as any;

        setEducationsDetail(resData);

      } catch (error: any) {

        errorHandling(error);

      } finally {

        setIsLoadingEductionsDetail(false);

      }

    };

    loadEducationsDetail(resumeSlug);

  }, [resumeSlug, isSuccess]);

  const handleShowUpdate = (id: string | number) => {

    const loadEducationDetailById = async (eduId: string | number) => {

      setIsFullScreenLoading(true);

      try {

        const resData = await educationDetailService.getEducationDetailById(eduId) as any;

        setEditData(resData);

        setOpenPopup(true);

      } catch (error: any) {

        errorHandling(error);

      } finally {

        setIsFullScreenLoading(false);

      }

    };

    loadEducationDetailById(id);

  };

  const handleShowAdd = () => {

    setEditData(null);

    setOpenPopup(true);

  };

  const handleAddOrUpdate = (data: any) => {

    const create = async (payload: any) => {

      setIsFullScreenLoading(true);

      try {

        await educationDetailService.addEducationsDetail(payload);

        setOpenPopup(false);

        setIsSuccess(!isSuccess);

        toastMessages.success(t('profile.messages.educationAddSuccess'));

      } catch (error: any) {

        errorHandling(error);

      } finally {

        setIsFullScreenLoading(false);

      }

    };

    const update = async (payload: any) => {

      setIsFullScreenLoading(true);

      try {

        await educationDetailService.updateEducationDetailById(payload.id, payload);

        setOpenPopup(false);

        setIsSuccess(!isSuccess);

        toastMessages.success(t('profile.messages.educationUpdateSuccess'));

      } catch (error: any) {

        errorHandling(error);

      } finally {

        setIsFullScreenLoading(false);

      }

    };

    if ('id' in data) {

      update(data);

    } else {

      // create

      const dataCustom = {

        ...data,

        resume: resumeSlug,

      };

      create(dataCustom);

    }

  };

  const handleDeleteducationsDetail = (id: string | number) => {

    const del = async (eduId: string | number) => {

      try {

        await educationDetailService.deleteEducationDetailById(eduId);

        setIsSuccess(!isSuccess);

        toastMessages.success(t('profile.messages.educationDeleteSuccess'));

      } catch (error: any) {

        errorHandling(error);

      } finally {

        setIsFullScreenLoading(false);

      }

    };

    confirmModal(

      () => del(id),

      t('profile.messages.deleteConfirmTitle', { item: t('profile.sections.education') }),

      t('profile.messages.deleteConfirmWarning'),

      'warning'

    );

  };

  return (

    <>

      <Box

        sx={{

          backgroundColor: 'background.paper',

          borderRadius: 3,

          p: 3,

          boxShadow: (theme: any) => theme.customShadows.card,

        }}

      >

        {isLoadingEducationsDetail ? (

          Loading

        ) : (

          <Stack spacing={3}>

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

                  color="primary"

                  aria-label={t('common:actions.add')}

                  onClick={handleShowAdd}

                  sx={{

                    boxShadow: (theme: any) => theme.customShadows.medium,

                    "&:hover": {

                      transform: "scale(1.1)",

                    },

                    transition: "all 0.2s ease-in-out",

                  }}

                >

                  <AddIcon />

                </Fab>

              </Stack>

            </Box>

            <Divider sx={{ my: 0, borderColor: 'grey.500' }} />

            <Box>

              {educationsDetail.length === 0 ? (

                <EmptyCard

                  content={t('profile.messages.noEducationData')}

                  onClick={handleShowAdd}

                />

              ) : (

                <Timeline

                  sx={{

                    [`& .${timelineItemClasses.root}:before`]: {

                      flex: 0,

                      padding: 0,

                    },

                    mt: 0,

                  }}

                >

                  {educationsDetail.map((value) => (

                    <TimelineItem key={value.id}>

                      <TimelineSeparator>

                        <TimelineDot

                          sx={{

                            background: (theme: any) => theme.palette.primary.main,

                            boxShadow: (theme: any) => theme.customShadows.small,

                          }}

                        />

                        <TimelineConnector sx={{ bgcolor: 'primary.light' }} />

                      </TimelineSeparator>

                      <TimelineContent>

                        <Box sx={{ p: 1 }}>

                          <Typography

                            variant="body2"

                            color="primary.main"

                            sx={{ fontWeight: 600, mb: 1 }}

                          >

                            <TimeAgo date={value.startDate} type="format" format="DD/MM/YYYY" />{' '}

                            -{' '}

                            {value.completedDate ? (

                              <TimeAgo date={value.completedDate} type="format" format="DD/MM/YYYY" />

                            ) : (

                              t('profile.fields.present')

                            )}

                          </Typography>

                          <Typography

                            variant="h6"

                            gutterBottom

                            sx={{

                              fontWeight: 'bold',

                              color: 'text.primary'

                            }}

                          >

                            {value?.degreeName}

                          </Typography>

                          <Typography

                            variant="body1"

                            sx={{

                              color: 'text.secondary',

                              mb: 0.5

                            }}

                          >

                            {value?.trainingPlaceName}

                          </Typography>

                          <Typography

                            variant="body2"

                            sx={{

                              color: 'text.secondary',

                              fontStyle: 'italic',

                              mb: 2

                            }}

                          >

                            {value?.major}

                          </Typography>

                          <Stack direction="row" spacing={1}>

                            <IconButton

                              size="small"

                              sx={{

                                color: 'secondary.main',

                                bgcolor: 'secondary.background',

                                '&:hover': {

                                  bgcolor: 'secondary.light',

                                  color: 'white',

                                },

                              }}

                              onClick={() => handleShowUpdate(value.id)}

                            >

                              <ModeEditOutlineOutlinedIcon fontSize="small" />

                            </IconButton>

                            <IconButton

                              size="small"

                              sx={{

                                color: 'error.main',

                                bgcolor: 'error.background',

                                '&:hover': {

                                  bgcolor: 'error.main',

                                  color: 'white',

                                },

                              }}

                              onClick={() => handleDeleteducationsDetail(value.id)}

                            >

                              <DeleteOutlineOutlinedIcon fontSize="small" />

                            </IconButton>

                          </Stack>

                          <Accordion

                            sx={{

                              boxShadow: 'none',

                              bgcolor: 'transparent',

                              '&:before': {

                                display: 'none',

                              },

                            }}

                          >

                            <AccordionSummary

                              expandIcon={

                                <ExpandMoreIcon

                                  sx={{

                                    color: 'primary.main',

                                    fontSize: 20

                                  }}

                                />

                              }

                            >

                              <Typography

                                variant="body2"

                                sx={{

                                  color: 'text.secondary',

                                  fontWeight: 500

                                }}

                              >

                                {t('profile.fields.description')}

                              </Typography>

                            </AccordionSummary>

                            <AccordionDetails>

                              <Typography

                                variant="body2"

                                sx={{

                                  color: value.description ? 'text.primary' : 'text.placeholder',

                                  fontStyle: value.description ? 'normal' : 'italic',

                                }}

                              >

                                {value.description || t('common:noData')}

                              </Typography>

                            </AccordionDetails>

                          </Accordion>

                        </Box>

                      </TimelineContent>

                    </TimelineItem>

                  ))}

                </Timeline>

              )}

            </Box>

          </Stack>

        )}

      </Box>

      {/* Start: form  */}

      <FormPopup

        title={t('profile.sections.education')}

        openPopup={openPopup}

        setOpenPopup={setOpenPopup}

      >

        <EducationDetaiForm

          handleAddOrUpdate={handleAddOrUpdate}

          editData={editData}

        />

      </FormPopup>

      {/* End: form */}

      {/* Start: full screen loading */}

      {isFullScreenLoading && <BackdropLoading />}

      {/* End: full screen loading */}

    </>

  );

};

export default EducationDetailCard;

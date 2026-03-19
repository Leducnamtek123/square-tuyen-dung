import React from 'react';

import { useParams } from 'react-router-dom';

import { useTranslation } from "react-i18next";

import { Box, Divider, Fab, IconButton, Skeleton, Stack, Typography } from "@mui/material";

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

import { confirmModal } from '../../../../utils/sweetalert2Modal';

import toastMessages from '../../../../utils/toastMessages';

import errorHandling from '../../../../utils/errorHandling';

import BackdropLoading from '../../../../components/loading/BackdropLoading';

import EmptyCard from '../../../../components/EmptyCard';

import FormPopup from '../../../../components/controls/FormPopup';

import CertificateForm from '../CertificateForm';

import TimeAgo from '../../../../components/TimeAgo';

import resumeService from '../../../../services/resumeService';

import certificateService from '../../../../services/certificateService';

interface Certificate {
  id: string | number;
  name: string;
  trainingPlace: string;
  startDate: string | Date;
  expirationDate: string | Date | null;
}

interface CertificateCardProps {
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

const CertificateCard = ({ title }: CertificateCardProps) => {

  const { t } = useTranslation(['jobSeeker', 'common']);

  const { slug: resumeSlug } = useParams<{ slug: string }>();

  const [openPopup, setOpenPopup] = React.useState(false);

  const [isSuccess, setIsSuccess] = React.useState(false);

  const [isLoadingCertificates, setIsLoadingCertificatesl] =

    React.useState(true);

  const [isFullScreenLoading, setIsFullScreenLoading] = React.useState(false);

  const [certificates, setCertificates] = React.useState<Certificate[]>([]);

  const [editData, setEditData] = React.useState<Certificate | null>(null);

  const [serverErrors, setServerErrors] = React.useState<any>(null);

  React.useEffect(() => {

    const loadCertificates = async (slug: string | undefined) => {
      if (!slug) return;

      setIsLoadingCertificatesl(true);

      try {

        const resData = await resumeService.getCertificates(slug) as any;

        setCertificates(resData.data);

      } catch (error: any) {

        errorHandling(error);

      } finally {

        setIsLoadingCertificatesl(false);

      }

    };

    loadCertificates(resumeSlug);

  }, [resumeSlug, isSuccess]);

  const handleShowUpdate = (id: string | number) => {

    setServerErrors(null);

    const loadCertificateById = async (certId: string | number) => {

      setIsFullScreenLoading(true);

      try {

        const resData = await certificateService.getCertificateById(certId) as any;

        setEditData(resData.data);

        setOpenPopup(true);

      } catch (error: any) {

        errorHandling(error);

      } finally {

        setIsFullScreenLoading(false);

      }

    };

    loadCertificateById(id);

  };

  const handleShowAdd = () => {

    setServerErrors(null);

    setEditData(null);

    setOpenPopup(true);

  };

  const handleAddOrUpdate = (data: any) => {

    const create = async (payload: any) => {

      setIsFullScreenLoading(true);

      try {

        await certificateService.addCertificates(payload);

        setOpenPopup(false);

        setIsSuccess(!isSuccess);

        toastMessages.success(t('jobSeeker:profile.messages.certificateAddSuccess'));

      } catch (error: any) {

        errorHandling(error, setServerErrors);

      } finally {

        setIsFullScreenLoading(false);

      }

    };

    const update = async (payload: any) => {

      setIsFullScreenLoading(true);

      try {

        await certificateService.updateCertificateById(payload.id, payload);

        setOpenPopup(false);

        setIsSuccess(!isSuccess);

        toastMessages.success(t('jobSeeker:profile.messages.certificateUpdateSuccess'));

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

  const handleDeleteCertificates = (id: string | number) => {

    const del = async (certId: string | number) => {

      try {

        await certificateService.deleteCertificateById(certId);

        setIsSuccess(!isSuccess);

        toastMessages.success(t('jobSeeker:profile.messages.certificateDeleteSuccess'));

      } catch (error: any) {

        errorHandling(error);

      } finally {

        setIsFullScreenLoading(false);

      }

    };

    confirmModal(

      () => del(id),

      t('jobSeeker:profile.messages.deleteConfirmTitle', { item: t('jobSeeker:profile.sections.certificates') }),

      t('jobSeeker:profile.messages.deleteConfirmWarning'),

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

        {isLoadingCertificates ? (

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

                  aria-label={t("common:actions.add")}

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

            <Divider sx={{ my: 0, borderColor: 'grey.500' }}/>

            <Box>

              {certificates.length === 0 ? (

                <EmptyCard

                  content={t('jobSeeker:profile.messages.noCertificateData')}

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

                  {certificates.map((value) => (

                    <TimelineItem key={value.id}>

                      <TimelineSeparator>

                        <TimelineDot 

                          sx={{

                            background: (theme: any) => theme.palette.primary.gradient,

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

                            <TimeAgo date={value.startDate} type="format" format="DD/MM/YYYY"/>{' '}

                            -{' '}

                            {value.expirationDate ? (

                              <TimeAgo date={value.expirationDate} type="format" format="DD/MM/YYYY"/>

                            ) : (

                              t('jobSeeker:profile.fields.noExpiration')

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

                            {value?.name}

                          </Typography>

                          <Typography 

                            variant="body1"

                            sx={{ 

                              color: 'text.secondary',

                              mb: 2

                            }}

                          >

                            {value?.trainingPlace}

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

                              onClick={() => handleDeleteCertificates(value.id)}

                            >

                              <DeleteOutlineOutlinedIcon fontSize="small" />

                            </IconButton>

                          </Stack>

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

        title={t('jobSeeker:profile.sections.certificates')}

        openPopup={openPopup}

        setOpenPopup={setOpenPopup}

      >

        <CertificateForm

          handleAddOrUpdate={handleAddOrUpdate}

          editData={editData}

          serverErrors={serverErrors}

        />

      </FormPopup>

      {/* End: form */}

      {/* Start: full screen loading */}

      {isFullScreenLoading && <BackdropLoading />}

      {/* End: full screen loading */}

    </>

  );

};

export default CertificateCard;

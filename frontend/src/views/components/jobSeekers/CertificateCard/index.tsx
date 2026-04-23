import React from 'react';
import { useParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Box, Divider, Fab, IconButton, Skeleton, Stack, Typography } from '@mui/material';
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
import { Theme } from '@mui/material/styles';
import { confirmModal } from '../../../../utils/sweetalert2Modal';
import toastMessages from '../../../../utils/toastMessages';
import errorHandling from '../../../../utils/errorHandling';
import BackdropLoading from '../../../../components/Common/Loading/BackdropLoading';
import EmptyCard from '../../../../components/Common/EmptyCard';
import FormPopup from '../../../../components/Common/Controls/FormPopup';
import CertificateForm, { FormValues as CertificateFormValues } from '../CertificateForm';
import TimeAgo from '../../../../components/Common/TimeAgo';
import resumeService from '../../../../services/resumeService';
import certificateService from '../../../../services/certificateService';
import type { Certificate } from '../../../../types/models';

interface CertificateCardProps {
  title: string;
}

const Loading = (
  <Stack>
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
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

type CertificateCardState = {
  openPopup: boolean;
  isSuccess: boolean;
  isLoadingCertificates: boolean;
  isFullScreenLoading: boolean;
  certificates: Certificate[];
  editData: Certificate | null;
  serverErrors: Record<string, string[]> | null;
};

type CertificateFormEditData = Partial<CertificateFormValues> | null;

type CertificateCardAction =
  | { type: 'set-open-popup'; value: boolean }
  | { type: 'toggle-success' }
  | { type: 'set-loading'; value: boolean }
  | { type: 'set-fullscreen-loading'; value: boolean }
  | { type: 'set-certificates'; value: Certificate[] }
  | { type: 'set-edit-data'; value: Certificate | null }
  | { type: 'set-server-errors'; value: Record<string, string[]> | null };

const initialState: CertificateCardState = {
  openPopup: false,
  isSuccess: false,
  isLoadingCertificates: true,
  isFullScreenLoading: false,
  certificates: [],
  editData: null,
  serverErrors: null,
};

const reducer = (state: CertificateCardState, action: CertificateCardAction): CertificateCardState => {
  switch (action.type) {
    case 'set-open-popup':
      return { ...state, openPopup: action.value };
    case 'toggle-success':
      return { ...state, isSuccess: !state.isSuccess };
    case 'set-loading':
      return { ...state, isLoadingCertificates: action.value };
    case 'set-fullscreen-loading':
      return { ...state, isFullScreenLoading: action.value };
    case 'set-certificates':
      return { ...state, certificates: action.value };
    case 'set-edit-data':
      return { ...state, editData: action.value };
    case 'set-server-errors':
      return { ...state, serverErrors: action.value };
    default:
      return state;
  }
};

const CertificateCard = ({ title }: CertificateCardProps) => {
  const { t } = useTranslation(['jobSeeker', 'common']);
  const { slug: resumeSlug } = useParams<{ slug: string }>();
  const [state, dispatch] = React.useReducer(reducer, initialState);

  const editData = React.useMemo<CertificateFormEditData>(() => {
    if (!state.editData) return null;
    return {
      name: state.editData.name || state.editData.certificateName || '',
      trainingPlace: state.editData.trainingPlace || state.editData.trainingPlaceName || '',
      startDate: state.editData.startDate ? new Date(state.editData.startDate) : null,
      expirationDate: state.editData.expirationDate ? new Date(state.editData.expirationDate) : null,
    };
  }, [state.editData]);

  React.useEffect(() => {
    const loadCertificates = async (slug: string | undefined) => {
      if (!slug) return;

      dispatch({ type: 'set-loading', value: true });

      try {
        const resData = await resumeService.getCertificates(slug);
        dispatch({ type: 'set-certificates', value: resData });
      } catch (error: unknown) {
        errorHandling(error);
      } finally {
        dispatch({ type: 'set-loading', value: false });
      }
    };

    loadCertificates(resumeSlug);
  }, [resumeSlug, state.isSuccess]);

  const handleShowUpdate = (id: string | number) => {
    dispatch({ type: 'set-server-errors', value: null });

    const loadCertificateById = async (certId: string | number) => {
      dispatch({ type: 'set-fullscreen-loading', value: true });
      try {
        const resData = await certificateService.getCertificateById(certId);
        dispatch({ type: 'set-edit-data', value: resData });
        dispatch({ type: 'set-open-popup', value: true });
      } catch (error: unknown) {
        errorHandling(error);
      } finally {
        dispatch({ type: 'set-fullscreen-loading', value: false });
      }
    };

    loadCertificateById(id);
  };

  const handleShowAdd = () => {
    dispatch({ type: 'set-server-errors', value: null });
    dispatch({ type: 'set-edit-data', value: null });
    dispatch({ type: 'set-open-popup', value: true });
  };

  const handleAddOrUpdate = (data: CertificateFormValues & { id?: string | number }) => {
    const create = async (payload: CertificateFormValues & { resume?: string }) => {
      dispatch({ type: 'set-fullscreen-loading', value: true });
      try {
        await certificateService.addCertificates(payload);
        dispatch({ type: 'set-open-popup', value: false });
        dispatch({ type: 'toggle-success' });
        toastMessages.success(t('jobSeeker:profile.messages.certificateAddSuccess'));
      } catch (error: unknown) {
        errorHandling(error, (errs) => dispatch({ type: 'set-server-errors', value: errs as Record<string, string[]> }));
      } finally {
        dispatch({ type: 'set-fullscreen-loading', value: false });
      }
    };

    const update = async (payload: CertificateFormValues & { id?: string | number }) => {
      dispatch({ type: 'set-fullscreen-loading', value: true });
      try {
        await certificateService.updateCertificateById(payload.id as string | number, payload);
        dispatch({ type: 'set-open-popup', value: false });
        dispatch({ type: 'toggle-success' });
        toastMessages.success(t('jobSeeker:profile.messages.certificateUpdateSuccess'));
      } catch (error: unknown) {
        errorHandling(error);
      } finally {
        dispatch({ type: 'set-fullscreen-loading', value: false });
      }
    };

    if ('id' in data) {
      update(data);
    } else {
      create({
        ...data,
        resume: resumeSlug,
      });
    }
  };

  const handleDeleteCertificates = (id: string | number) => {
    const del = async (certId: string | number) => {
      try {
        await certificateService.deleteCertificateById(certId);
        dispatch({ type: 'toggle-success' });
        toastMessages.success(t('jobSeeker:profile.messages.certificateDeleteSuccess'));
      } catch (error: unknown) {
        errorHandling(error);
      } finally {
        dispatch({ type: 'set-fullscreen-loading', value: false });
      }
    };

    confirmModal(
      () => del(id),
      t('jobSeeker:profile.messages.deleteConfirmTitle', { item: t('jobSeeker:profile.sections.certificates') }),
      t('jobSeeker:profile.messages.deleteConfirmWarning'),
      'warning',
    );
  };

  return (
    <>
      <Box
        sx={{
          backgroundColor: 'background.paper',
          borderRadius: 3,
          p: 3,
          boxShadow: (theme: Theme) => theme.customShadows.card,
        }}
      >
        {state.isLoadingCertificates ? (
          Loading
        ) : (
          <Stack spacing={3}>
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  {title}
                </Typography>
                <Fab
                  size="small"
                  color="primary"
                  aria-label={t('common:actions.add')}
                  onClick={handleShowAdd}
                  sx={{
                    boxShadow: (theme: Theme) => theme.customShadows.medium,
                    '&:hover': {
                      transform: 'scale(1.1)',
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  <AddIcon />
                </Fab>
              </Stack>
            </Box>

            <Divider sx={{ my: 0, borderColor: 'grey.500' }} />

            <Box>
              {state.certificates.length === 0 ? (
                <EmptyCard content={t('jobSeeker:profile.messages.noCertificateData')} onClick={handleShowAdd} />
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
                  {state.certificates.map((value) => (
                    <TimelineItem key={value.id}>
                      <TimelineSeparator>
                        <TimelineDot
                          sx={{
                            background: (theme: Theme) => theme.palette.primary.main,
                            boxShadow: (theme: Theme) => theme.customShadows.small,
                          }}
                        />
                        <TimelineConnector sx={{ bgcolor: 'primary.light' }} />
                      </TimelineSeparator>
                      <TimelineContent>
                        <Box sx={{ p: 1 }}>
                          <Typography variant="body2" color="primary.main" sx={{ fontWeight: 600, mb: 1 }}>
                            {value.startDate && <TimeAgo date={value.startDate} type="format" format="DD/MM/YYYY" />}{' '}
                            -{' '}
                            {value.expirationDate ? (
                              <TimeAgo date={value.expirationDate} type="format" format="DD/MM/YYYY" />
                            ) : (
                              t('jobSeeker:profile.fields.noExpiration')
                            )}
                          </Typography>

                          <Typography
                            variant="h6"
                            gutterBottom
                            sx={{
                              fontWeight: 'bold',
                              color: 'text.primary',
                            }}
                          >
                            {value?.name}
                          </Typography>

                          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2 }}>
                            {value?.trainingPlace}
                          </Typography>

                          <Stack direction="row" spacing={1}>
                            <IconButton
                              color="primary"
                              size="small"
                              onClick={() => handleShowUpdate(value.id)}
                              sx={{
                                border: '1px solid',
                                borderColor: 'divider',
                              }}
                            >
                              <ModeEditOutlineOutlinedIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              color="error"
                              size="small"
                              onClick={() => handleDeleteCertificates(value.id)}
                              sx={{
                                border: '1px solid',
                                borderColor: 'divider',
                              }}
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

      <FormPopup
        title={t('jobSeeker:profile.sections.certificates')}
        openPopup={state.openPopup}
        setOpenPopup={(open) => dispatch({ type: 'set-open-popup', value: open })}
      >
        <CertificateForm
          handleAddOrUpdate={handleAddOrUpdate}
          editData={editData}
          serverErrors={state.serverErrors}
        />
      </FormPopup>

      {state.isFullScreenLoading && <BackdropLoading />}
    </>
  );
};

export default CertificateCard;

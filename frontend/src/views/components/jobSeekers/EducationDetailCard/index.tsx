import React from 'react';
import { useParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Accordion, AccordionDetails, AccordionSummary, Box, Divider, Fab, Skeleton, Stack, Typography } from '@mui/material';
import { Grid2 as Grid } from '@mui/material';
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
import IconButton from '@mui/material/IconButton';
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
import { Theme } from '@mui/material/styles';
import { FormValues } from '../EducationDetailForm';
import type { EducationDetail } from '../../../../types/models';

interface EducationDetailCardProps {
  title: string;
}

type UiState = {
  openPopup: boolean;
  isLoading: boolean;
  isFullScreenLoading: boolean;
  refreshToken: number;
};

type UiAction =
  | { type: 'open_popup' }
  | { type: 'close_popup' }
  | { type: 'set_loading'; payload: boolean }
  | { type: 'set_full_screen_loading'; payload: boolean }
  | { type: 'refresh' };

const initialUiState: UiState = {
  openPopup: false,
  isLoading: true,
  isFullScreenLoading: false,
  refreshToken: 0,
};

const reducer = (state: UiState, action: UiAction): UiState => {
  switch (action.type) {
    case 'open_popup':
      return { ...state, openPopup: true };
    case 'close_popup':
      return { ...state, openPopup: false };
    case 'set_loading':
      return { ...state, isLoading: action.payload };
    case 'set_full_screen_loading':
      return { ...state, isFullScreenLoading: action.payload };
    case 'refresh':
      return { ...state, refreshToken: state.refreshToken + 1 };
    default:
      return state;
  }
};

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
      {Array.from({ length: 2 }).map((_, index) => (
        <Box sx={{ py: 1 }} key={`edu-loading-${index}`}>
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
  const [uiState, dispatch] = React.useReducer(reducer, initialUiState);
  const [educationsDetail, setEducationsDetail] = React.useState<EducationDetail[]>([]);
  const [editData, setEditData] = React.useState<Partial<FormValues> | null>(null);

  React.useEffect(() => {
    const loadEducationsDetail = async (slug: string | undefined) => {
      if (!slug) return;

      dispatch({ type: 'set_loading', payload: true });
      try {
        const resData = await resumeService.getEducationsDetail(slug);
        setEducationsDetail(resData);
      } catch (error: unknown) {
        errorHandling(error);
      } finally {
        dispatch({ type: 'set_loading', payload: false });
      }
    };

    loadEducationsDetail(resumeSlug);
  }, [resumeSlug, uiState.refreshToken]);

  const handleShowUpdate = (id: string | number) => {
    const loadEducationDetailById = async (eduId: string | number) => {
      dispatch({ type: 'set_full_screen_loading', payload: true });
      try {
        const resData = await educationDetailService.getEducationDetailById(eduId);
        setEditData({
          degreeName: resData.degreeName || '',
          major: resData.major || '',
          trainingPlaceName: resData.trainingPlaceName || '',
          startDate: resData.startDate ? new Date(resData.startDate) : null,
          completedDate: resData.completedDate ? new Date(resData.completedDate) : null,
          gradeOrRank: null,
          description: resData.description || null,
        });
        dispatch({ type: 'open_popup' });
      } catch (error: unknown) {
        errorHandling(error);
      } finally {
        dispatch({ type: 'set_full_screen_loading', payload: false });
      }
    };

    loadEducationDetailById(id);
  };

  const handleShowAdd = () => {
    setEditData(null);
    dispatch({ type: 'open_popup' });
  };

  const handleAddOrUpdate = (data: FormValues & { id?: string | number }) => {
    const create = async (payload: FormValues & { resume?: string }) => {
      dispatch({ type: 'set_full_screen_loading', payload: true });
      try {
        await educationDetailService.addEducationsDetail(payload);
        dispatch({ type: 'close_popup' });
        dispatch({ type: 'refresh' });
        toastMessages.success(t('profile.messages.educationAddSuccess'));
      } catch (error: unknown) {
        errorHandling(error);
      } finally {
        dispatch({ type: 'set_full_screen_loading', payload: false });
      }
    };

    const update = async (payload: FormValues & { id?: string | number }) => {
      dispatch({ type: 'set_full_screen_loading', payload: true });
      try {
        await educationDetailService.updateEducationDetailById(payload.id as string | number, payload);
        dispatch({ type: 'close_popup' });
        dispatch({ type: 'refresh' });
        toastMessages.success(t('profile.messages.educationUpdateSuccess'));
      } catch (error: unknown) {
        errorHandling(error);
      } finally {
        dispatch({ type: 'set_full_screen_loading', payload: false });
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

  const handleDeleteEducationDetail = (id: string | number) => {
    const del = async (eduId: string | number) => {
      try {
        await educationDetailService.deleteEducationDetailById(eduId);
        dispatch({ type: 'refresh' });
        toastMessages.success(t('profile.messages.educationDeleteSuccess'));
      } catch (error: unknown) {
        errorHandling(error);
      }
    };

    confirmModal(
      () => del(id),
      t('profile.messages.deleteConfirmTitle', { item: t('profile.sections.education') }),
      t('profile.messages.deleteConfirmWarning'),
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
        {uiState.isLoading ? (
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
              {educationsDetail.length === 0 ? (
                <EmptyCard content={t('profile.messages.noEducationData')} onClick={handleShowAdd} />
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
                            {value.completedDate ? (
                              <TimeAgo date={value.completedDate} type="format" format="DD/MM/YYYY" />
                            ) : (
                              t('jobSeeker:profile.fields.present')
                            )}
                          </Typography>

                          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                            {value.degreeName || t('common:noData')}
                          </Typography>

                          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2 }}>
                            {value.trainingPlaceName}
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
                              onClick={() => handleDeleteEducationDetail(value.id)}
                            >
                              <DeleteOutlineOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Stack>

                          {value.major ? (
                            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                              {value.major}
                            </Typography>
                          ) : null}

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
                                    fontSize: 20,
                                  }}
                                />
                              }
                            >
                              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                                {t('jobSeeker:profile.fields.description')}
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

      <FormPopup title={t('jobSeeker:profile.sections.education')} openPopup={uiState.openPopup} setOpenPopup={(open) => dispatch({ type: open ? 'open_popup' : 'close_popup' })}>
        <EducationDetaiForm
          handleAddOrUpdate={handleAddOrUpdate as (data: FormValues) => void}
          editData={editData}
        />
      </FormPopup>

      {uiState.isFullScreenLoading && <BackdropLoading />}
    </>
  );
};

export default EducationDetailCard;

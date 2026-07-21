'use client';
import React from 'react';
import { useParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Box, Divider, Fab, Stack, Typography } from '@mui/material';
import { Timeline, timelineItemClasses } from '@mui/lab';
import AddIcon from '@mui/icons-material/Add';
import { Theme } from '@mui/material/styles';

import { confirmModal } from '../../../../utils/sweetalert2Modal';
import toastMessages from '../../../../utils/toastMessages';
import errorHandling from '../../../../utils/errorHandling';
import BackdropLoading from '../../../../components/Common/Loading/BackdropLoading';
import EmptyCard from '../../../../components/Common/EmptyCard';
import FormPopup from '../../../../components/Common/Controls/FormPopup';
import ExperienceDetaiForm, { FormValues } from '../ExperienceDetailForm';
import resumeService from '../../../../services/resumeService';
import experienceDetailService from '../../../../services/experienceDetailService';
import type { ExperienceDetail } from '../../../../types/models';
import ExperienceDetailCardLoading from './ExperienceDetailCardLoading';
import ExperienceDetailTimelineItem from './ExperienceDetailTimelineItem';

interface ExperienceDetailCardProps {
  title: string;
}

type UiState = {
  openPopup: boolean;
  isLoadingExperiencesDetail: boolean;
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
  isLoadingExperiencesDetail: true,
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
      return { ...state, isLoadingExperiencesDetail: action.payload };
    case 'set_full_screen_loading':
      return { ...state, isFullScreenLoading: action.payload };
    case 'refresh':
      return { ...state, refreshToken: state.refreshToken + 1 };
    default:
      return state;
  }
};

const ExperienceDetailCard = ({ title }: ExperienceDetailCardProps) => {
  const { t } = useTranslation(['jobSeeker', 'common']);
  const { slug: resumeSlug } = useParams<{ slug: string }>();
  const [uiState, dispatch] = React.useReducer(reducer, initialUiState);
  const [experiencesDetail, setExperiencesDetail] = React.useState<ExperienceDetail[]>([]);
  const [editData, setEditData] = React.useState<ExperienceDetail | null>(null);
  const editFormData = React.useMemo(
    () =>
      editData
        ? {
            jobName: editData.jobName || '',
            companyName: editData.companyName || '',
            startDate: editData.startDate ? new Date(editData.startDate) : null,
            endDate: editData.endDate ? new Date(editData.endDate) : null,
            description: editData.description || null,
            lastSalary: null,
            leaveReason: null,
          }
        : null,
    [editData]
  );

  React.useEffect(() => {
    const loadExperiencesDetail = async (slug: string | undefined) => {
      if (!slug) return;

      dispatch({ type: 'set_loading', payload: true });
      try {
        const resData = await resumeService.getExperiencesDetail(slug);
        setExperiencesDetail(resData);
      } catch (error: unknown) {
        errorHandling(error);
      } finally {
        dispatch({ type: 'set_loading', payload: false });
      }
    };

    loadExperiencesDetail(resumeSlug);
  }, [resumeSlug, uiState.refreshToken]);

  const handleShowUpdate = (id: string | number) => {
    const loadExperienceDetailById = async (experienceId: string | number) => {
      dispatch({ type: 'set_full_screen_loading', payload: true });
      try {
        const resData = await experienceDetailService.getExperienceDetailById(experienceId);
        setEditData(resData);
        dispatch({ type: 'open_popup' });
      } catch (error: unknown) {
        errorHandling(error);
      } finally {
        dispatch({ type: 'set_full_screen_loading', payload: false });
      }
    };

    loadExperienceDetailById(id);
  };

  const handleShowAdd = () => {
    setEditData(null);
    dispatch({ type: 'open_popup' });
  };

  const handleAddOrUpdate = (data: FormValues & { id?: string | number }) => {
    const create = async (payload: FormValues & { resume?: string }) => {
      dispatch({ type: 'set_full_screen_loading', payload: true });
      try {
        await experienceDetailService.addExperienceDetail(payload);
        dispatch({ type: 'close_popup' });
        dispatch({ type: 'refresh' });
        toastMessages.success(t('jobSeeker:profile.messages.experienceAddSuccess'));
      } catch (error: unknown) {
        errorHandling(error);
      } finally {
        dispatch({ type: 'set_full_screen_loading', payload: false });
      }
    };

    const update = async (payload: FormValues & { id?: string | number }) => {
      dispatch({ type: 'set_full_screen_loading', payload: true });
      try {
        await experienceDetailService.updateExperienceDetailById(payload.id as string | number, payload);
        dispatch({ type: 'close_popup' });
        dispatch({ type: 'refresh' });
        toastMessages.success(t('jobSeeker:profile.messages.experienceUpdateSuccess'));
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

  const handleDeleteExperiencesDetail = (id: string | number) => {
    const del = async (experienceId: string | number) => {
      try {
        await experienceDetailService.deleteExperienceDetailById(experienceId);
        dispatch({ type: 'refresh' });
        toastMessages.success(t('jobSeeker:profile.messages.experienceDeleteSuccess'));
      } catch (error: unknown) {
        errorHandling(error);
      }
    };

    confirmModal(
      () => del(id),
      t('jobSeeker:profile.messages.deleteConfirmTitle', { item: t('jobSeeker:profile.sections.experience') }),
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
        {uiState.isLoadingExperiencesDetail ? (
          <ExperienceDetailCardLoading />
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
              {experiencesDetail.length === 0 ? (
                <EmptyCard content={t('jobSeeker:profile.messages.noExperienceData')} onClick={handleShowAdd} />
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
                  {experiencesDetail.map((value) => (
                    <ExperienceDetailTimelineItem
                      key={value.id}
                      value={value}
                      onEdit={handleShowUpdate}
                      onDelete={handleDeleteExperiencesDetail}
                      t={t}
                    />
                  ))}
                </Timeline>
              )}
            </Box>
          </Stack>
        )}
      </Box>

      <FormPopup
        title={t('jobSeeker:profile.sections.experience')}
        openPopup={uiState.openPopup}
        setOpenPopup={(open) => dispatch({ type: open ? 'open_popup' : 'close_popup' })}
      >
        <ExperienceDetaiForm
          handleAddOrUpdate={handleAddOrUpdate as (data: FormValues) => void}
          editData={editFormData}
        />
      </FormPopup>

      {uiState.isFullScreenLoading && <BackdropLoading />}
    </>
  );
};

export default ExperienceDetailCard;

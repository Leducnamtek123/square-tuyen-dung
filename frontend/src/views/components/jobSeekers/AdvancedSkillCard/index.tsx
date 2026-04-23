import React from 'react';
import { useParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Box, Divider, Fab, Stack, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { Theme } from '@mui/material/styles';

import { confirmModal } from '../../../../utils/sweetalert2Modal';
import toastMessages from '../../../../utils/toastMessages';
import errorHandling from '../../../../utils/errorHandling';
import BackdropLoading from '../../../../components/Common/Loading/BackdropLoading';
import EmptyCard from '../../../../components/Common/EmptyCard';
import FormPopup from '../../../../components/Common/Controls/FormPopup';
import AdvancedSkillForm, { FormValues as AdvancedSkillFormValues } from '../AdvancedSkillForm';
import resumeService from '../../../../services/resumeService';
import advancedSkillService from '../../../../services/advancedSkillService';
import type { AdvancedSkill } from '../../../../types/models';
import AdvancedSkillCardLoading from './AdvancedSkillCardLoading';
import AdvancedSkillCardTable from './AdvancedSkillCardTable';

interface AdvancedSkillCardProps {
  title: string;
}

type UiState = {
  openPopup: boolean;
  isLoadingAdvancedSkills: boolean;
  isFullScreenLoading: boolean;
  refreshToken: number;
  serverErrors: Record<string, string[]> | null;
  editData: Partial<AdvancedSkillFormValues> | null;
};

type UiAction =
  | { type: 'open_popup' }
  | { type: 'close_popup' }
  | { type: 'set_loading'; payload: boolean }
  | { type: 'set_full_screen_loading'; payload: boolean }
  | { type: 'refresh' }
  | { type: 'set_server_errors'; payload: Record<string, string[]> | null }
  | { type: 'set_edit_data'; payload: Partial<AdvancedSkillFormValues> | null };

const initialUiState: UiState = {
  openPopup: false,
  isLoadingAdvancedSkills: true,
  isFullScreenLoading: false,
  refreshToken: 0,
  serverErrors: null,
  editData: null,
};

const reducer = (state: UiState, action: UiAction): UiState => {
  switch (action.type) {
    case 'open_popup':
      return { ...state, openPopup: true };
    case 'close_popup':
      return { ...state, openPopup: false };
    case 'set_loading':
      return { ...state, isLoadingAdvancedSkills: action.payload };
    case 'set_full_screen_loading':
      return { ...state, isFullScreenLoading: action.payload };
    case 'refresh':
      return { ...state, refreshToken: state.refreshToken + 1 };
    case 'set_server_errors':
      return { ...state, serverErrors: action.payload };
    case 'set_edit_data':
      return { ...state, editData: action.payload };
    default:
      return state;
  }
};

const toFormValues = (skill: AdvancedSkill | null): Partial<AdvancedSkillFormValues> | null => {
  if (!skill) return null;
  return {
    name: skill.name || skill.skillName || '',
    level: typeof skill.level === 'number' ? skill.level : Number(skill.point || 0),
  };
};

const AdvancedSkillCard = ({ title }: AdvancedSkillCardProps) => {
  const { t } = useTranslation(['jobSeeker', 'common']);
  const { slug: resumeSlug } = useParams<{ slug: string }>();
  const [uiState, dispatch] = React.useReducer(reducer, initialUiState);
  const [advancedSkills, setAdvancedSkills] = React.useState<AdvancedSkill[]>([]);

  React.useEffect(() => {
    const loadAdvancedSkills = async (slug: string | undefined) => {
      if (!slug) return;

      dispatch({ type: 'set_loading', payload: true });
      try {
        const resData = await resumeService.getAdvancedSkills(slug);
        setAdvancedSkills(resData);
      } catch (error: unknown) {
        errorHandling(error);
      } finally {
        dispatch({ type: 'set_loading', payload: false });
      }
    };

    loadAdvancedSkills(resumeSlug);
  }, [resumeSlug, uiState.refreshToken]);

  const handleShowAdd = () => {
    dispatch({ type: 'set_server_errors', payload: null });
    dispatch({ type: 'set_edit_data', payload: null });
    dispatch({ type: 'open_popup' });
  };

  const handleShowUpdate = (id: string | number) => {
    const loadAdvancedSkillById = async (skillId: string | number) => {
      dispatch({ type: 'set_full_screen_loading', payload: true });
      dispatch({ type: 'set_server_errors', payload: null });
      try {
        const resData = await advancedSkillService.getAdvancedSkillById(skillId);
        dispatch({ type: 'set_edit_data', payload: toFormValues(resData) });
        dispatch({ type: 'open_popup' });
      } catch (error: unknown) {
        errorHandling(error);
      } finally {
        dispatch({ type: 'set_full_screen_loading', payload: false });
      }
    };

    loadAdvancedSkillById(id);
  };

  const handleAddOrUpdate = (data: AdvancedSkillFormValues & { id?: string | number }) => {
    const create = async (payload: AdvancedSkillFormValues & { resume?: string }) => {
      dispatch({ type: 'set_full_screen_loading', payload: true });
      try {
        await advancedSkillService.addAdvancedSkills(payload);
        dispatch({ type: 'close_popup' });
        dispatch({ type: 'refresh' });
        toastMessages.success(t('jobSeeker:profile.messages.skillAddSuccess'));
      } catch (error: unknown) {
        errorHandling(error, (errs) => dispatch({ type: 'set_server_errors', payload: errs as Record<string, string[]> }));
      } finally {
        dispatch({ type: 'set_full_screen_loading', payload: false });
      }
    };

    const update = async (payload: AdvancedSkillFormValues & { id?: string | number }) => {
      dispatch({ type: 'set_full_screen_loading', payload: true });
      try {
        await advancedSkillService.updateAdvancedSkillById(payload.id as string | number, payload);
        dispatch({ type: 'close_popup' });
        dispatch({ type: 'refresh' });
        toastMessages.success(t('jobSeeker:profile.messages.skillUpdateSuccess'));
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

  const handleDeleteAdvancedSkill = (id: string | number) => {
    const del = async (skillId: string | number) => {
      try {
        await advancedSkillService.deleteAdvancedSkillById(skillId);
        dispatch({ type: 'refresh' });
        toastMessages.success(t('jobSeeker:profile.messages.skillDeleteSuccess'));
      } catch (error: unknown) {
        errorHandling(error);
      } finally {
        dispatch({ type: 'set_full_screen_loading', payload: false });
      }
    };

    confirmModal(
      () => del(id),
      t('jobSeeker:profile.messages.deleteConfirmTitle', { item: t('jobSeeker:profile.sections.skills') }),
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
        {uiState.isLoadingAdvancedSkills ? (
          <AdvancedSkillCardLoading />
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
              {advancedSkills.length === 0 ? (
                <EmptyCard content={t('jobSeeker:profile.messages.noSkillData')} onClick={handleShowAdd} />
              ) : (
                <AdvancedSkillCardTable
                  data={advancedSkills}
                  onEdit={handleShowUpdate}
                  onDelete={handleDeleteAdvancedSkill}
                  t={t}
                />
              )}
            </Box>
          </Stack>
        )}
      </Box>

      <FormPopup
        title={t('jobSeeker:profile.sections.skills')}
        openPopup={uiState.openPopup}
        setOpenPopup={(open) => dispatch({ type: open ? 'open_popup' : 'close_popup' })}
      >
        <AdvancedSkillForm
          key={`${uiState.openPopup ? 'open' : 'closed'}-${uiState.editData?.name || uiState.editData?.level || 'new'}`}
          handleAddOrUpdate={handleAddOrUpdate as (data: AdvancedSkillFormValues) => void}
          editData={uiState.editData}
          serverErrors={uiState.serverErrors}
        />
      </FormPopup>

      {uiState.isFullScreenLoading && <BackdropLoading />}
    </>
  );
};

export default AdvancedSkillCard;

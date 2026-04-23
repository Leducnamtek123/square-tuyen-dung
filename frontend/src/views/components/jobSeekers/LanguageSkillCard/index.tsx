import React from 'react';
import { useAppSelector } from '@/redux/hooks';
import { useParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Box, Divider, Fab, Stack, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { confirmModal } from '../../../../utils/sweetalert2Modal';
import toastMessages from '../../../../utils/toastMessages';
import errorHandling from '../../../../utils/errorHandling';
import BackdropLoading from '../../../../components/Common/Loading/BackdropLoading';
import EmptyCard from '../../../../components/Common/EmptyCard';
import FormPopup from '../../../../components/Common/Controls/FormPopup';
import LanguageSkillForm from '../LanguageSkillForm';
import resumeService from '../../../../services/resumeService';
import languageSkillService from '../../../../services/languageSkillService';
import { useConfig } from '@/hooks/useConfig';
import type { FormValues as LanguageskillformFormValues } from '../LanguageSkillForm';
import type { Theme as StylesTheme } from '@mui/material/styles';
import type { LanguageSkill } from '../../../../types/models';
import { useLanguageSkillCardColumns } from './useLanguageSkillCardColumns';
import LanguageSkillCardLoading from './LanguageSkillCardLoading';
import DataTable from '../../../../components/Common/DataTable';

interface LanguageSkillCardProps {
  title: string;
}

type LanguageSkillCardState = {
  openPopup: boolean;
  isSuccess: boolean;
  isLoadingLanguageSkills: boolean;
  isFullScreenLoading: boolean;
  languageSkills: LanguageSkill[];
  editData: LanguageSkill | null;
  serverErrors: Record<string, string[]> | null;
};

type LanguageSkillCardAction =
  | { type: 'set-open-popup'; value: boolean }
  | { type: 'toggle-success' }
  | { type: 'set-loading'; value: boolean }
  | { type: 'set-fullscreen-loading'; value: boolean }
  | { type: 'set-language-skills'; value: LanguageSkill[] }
  | { type: 'set-edit-data'; value: LanguageSkill | null }
  | { type: 'set-server-errors'; value: Record<string, string[]> | null };

const initialState: LanguageSkillCardState = {
  openPopup: false,
  isSuccess: false,
  isLoadingLanguageSkills: true,
  isFullScreenLoading: false,
  languageSkills: [],
  editData: null,
  serverErrors: null,
};

function reducer(state: LanguageSkillCardState, action: LanguageSkillCardAction): LanguageSkillCardState {
  switch (action.type) {
    case 'set-open-popup':
      return { ...state, openPopup: action.value };
    case 'toggle-success':
      return { ...state, isSuccess: !state.isSuccess };
    case 'set-loading':
      return { ...state, isLoadingLanguageSkills: action.value };
    case 'set-fullscreen-loading':
      return { ...state, isFullScreenLoading: action.value };
    case 'set-language-skills':
      return { ...state, languageSkills: action.value };
    case 'set-edit-data':
      return { ...state, editData: action.value };
    case 'set-server-errors':
      return { ...state, serverErrors: action.value };
    default:
      return state;
  }
}

const LanguageSkillCard = ({ title }: LanguageSkillCardProps) => {
  const { t } = useTranslation(['jobSeeker', 'common']);
  const { slug: resumeSlug } = useParams<{ slug: string }>();
  const { allConfig } = useConfig();
  const languageDict = (allConfig as { languageDict?: Record<string, string> } | null)?.languageDict;
  const [state, dispatch] = React.useReducer(reducer, initialState);

  React.useEffect(() => {
    let isActive = true;

    const loadLanguageSkills = async (slug: string | undefined) => {
      if (!slug) return;
      dispatch({ type: 'set-loading', value: true });
      try {
        const resData = await resumeService.getLanguageSkills(slug);
        if (isActive) dispatch({ type: 'set-language-skills', value: resData });
      } catch (error: unknown) {
        errorHandling(error);
      } finally {
        if (isActive) dispatch({ type: 'set-loading', value: false });
      }
    };

    loadLanguageSkills(resumeSlug);
    return () => {
      isActive = false;
    };
  }, [resumeSlug, state.isSuccess]);

  const handleShowUpdate = (id: string | number) => {
    dispatch({ type: 'set-server-errors', value: null });

    const loadLanguageSkillById = async (skillId: string | number) => {
      dispatch({ type: 'set-fullscreen-loading', value: true });
      try {
        const resData = await languageSkillService.getLanguageSkillById(skillId);
        dispatch({ type: 'set-edit-data', value: resData });
        dispatch({ type: 'set-open-popup', value: true });
      } catch (error: unknown) {
        errorHandling(error);
      } finally {
        dispatch({ type: 'set-fullscreen-loading', value: false });
      }
    };

    loadLanguageSkillById(id);
  };

  const handleShowAdd = () => {
    dispatch({ type: 'set-server-errors', value: null });
    dispatch({ type: 'set-edit-data', value: null });
    dispatch({ type: 'set-open-popup', value: true });
  };

  const handleAddOrUpdate = (data: LanguageskillformFormValues & { id?: string | number }) => {
    const create = async (payload: LanguageskillformFormValues & { resume?: string }) => {
      dispatch({ type: 'set-fullscreen-loading', value: true });
      try {
        await languageSkillService.addLanguageSkills(payload);
        dispatch({ type: 'set-open-popup', value: false });
        dispatch({ type: 'toggle-success' });
        toastMessages.success(t('jobSeeker:profile.messages.languageAddSuccess'));
      } catch (error: unknown) {
        errorHandling(error, (errs) => dispatch({ type: 'set-server-errors', value: errs as Record<string, string[]> }));
      } finally {
        dispatch({ type: 'set-fullscreen-loading', value: false });
      }
    };

    const update = async (payload: LanguageskillformFormValues & { id?: string | number }) => {
      dispatch({ type: 'set-fullscreen-loading', value: true });
      try {
        await languageSkillService.updateLanguageSkillById(payload.id as string | number, payload);
        dispatch({ type: 'set-open-popup', value: false });
        dispatch({ type: 'toggle-success' });
        toastMessages.success(t('jobSeeker:profile.messages.languageUpdateSuccess'));
      } catch (error: unknown) {
        errorHandling(error);
      } finally {
        dispatch({ type: 'set-fullscreen-loading', value: false });
      }
    };

    if ('id' in data) update(data);
    else create({ ...data, resume: resumeSlug });
  };

  const handleDeleteLanguageSkill = (id: string | number) => {
    const del = async (skillId: string | number) => {
      try {
        await languageSkillService.deleteLanguageSkillById(skillId);
        dispatch({ type: 'toggle-success' });
        toastMessages.success(t('jobSeeker:profile.messages.languageDeleteSuccess'));
      } catch (error: unknown) {
        errorHandling(error);
      } finally {
        dispatch({ type: 'set-fullscreen-loading', value: false });
      }
    };

    confirmModal(
      () => del(id),
      t('jobSeeker:profile.messages.deleteConfirmTitle', { item: t('jobSeeker:profile.sections.language') }),
      t('jobSeeker:profile.messages.deleteConfirmWarning'),
      'warning'
    );
  };

  const columns = useLanguageSkillCardColumns({
    languageDict,
    onEdit: handleShowUpdate,
    onDelete: handleDeleteLanguageSkill,
  });

  return (
    <>
      <Box
        sx={{
          backgroundColor: 'background.paper',
          borderRadius: 3,
          p: 3,
          boxShadow: (theme: StylesTheme) => theme.customShadows.card,
        }}
      >
        {state.isLoadingLanguageSkills ? (
          <LanguageSkillCardLoading />
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
                    boxShadow: (theme: StylesTheme) => theme.customShadows.medium,
                    '&:hover': { transform: 'scale(1.1)' },
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  <AddIcon />
                </Fab>
              </Stack>
            </Box>

            <Divider sx={{ my: 0, borderColor: 'grey.500' }} />

            <Box>
              <DataTable
                columns={columns}
                data={state.languageSkills}
                isLoading={state.isLoadingLanguageSkills}
                hidePagination
                emptyMessage={t('jobSeeker:profile.messages.noLanguageData')}
              />
            </Box>
          </Stack>
        )}
      </Box>

      <FormPopup
        title={t('jobSeeker:profile.sections.language')}
        openPopup={state.openPopup}
        setOpenPopup={(open) => dispatch({ type: 'set-open-popup', value: open })}
      >
        <LanguageSkillForm
          handleAddOrUpdate={handleAddOrUpdate as (data: LanguageskillformFormValues) => void}
          editData={state.editData}
          serverErrors={state.serverErrors}
        />
      </FormPopup>

      {state.isFullScreenLoading && <BackdropLoading />}
    </>
  );
};

export default LanguageSkillCard;

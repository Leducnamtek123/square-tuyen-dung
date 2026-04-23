import React, { Suspense, lazy } from 'react';
import { useParams } from 'next/navigation';
import { Box, Divider, Fab, Stack, Typography } from '@mui/material';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import { useTranslation } from 'react-i18next';
import { Theme } from '@mui/material/styles';
import CVForm, { FormValues as CVFormValues } from '../CVForm';
import BackdropLoading from '../../../../components/Common/Loading/BackdropLoading';
import errorHandling from '../../../../utils/errorHandling';
import FormPopup from '../../../../components/Common/Controls/FormPopup';
import resumeService from '../../../../services/resumeService';
import toastMessages from '../../../../utils/toastMessages';

const LazyPdf = lazy(() => import('../../../../components/Common/Pdf'));

interface CVCardProps {
  title: string;
}

interface CVData {
  title: string;
  fileUrl: string;
}

type CVCardState = {
  openPopup: boolean;
  isLoadingCv: boolean;
  isFullScreenLoading: boolean;
  cv: CVData | null;
  refreshToken: number;
};

type CVCardAction =
  | { type: 'open-popup'; value: boolean }
  | { type: 'set-loading'; value: boolean }
  | { type: 'set-fullscreen-loading'; value: boolean }
  | { type: 'set-cv'; value: CVData | null }
  | { type: 'refresh' };

const initialState: CVCardState = {
  openPopup: false,
  isLoadingCv: true,
  isFullScreenLoading: false,
  cv: null,
  refreshToken: 0,
};

function reducer(state: CVCardState, action: CVCardAction): CVCardState {
  switch (action.type) {
    case 'open-popup':
      return { ...state, openPopup: action.value };
    case 'set-loading':
      return { ...state, isLoadingCv: action.value };
    case 'set-fullscreen-loading':
      return { ...state, isFullScreenLoading: action.value };
    case 'set-cv':
      return { ...state, cv: action.value };
    case 'refresh':
      return { ...state, refreshToken: state.refreshToken + 1 };
    default:
      return state;
  }
}

const CVCard = ({ title }: CVCardProps) => {
  const { t } = useTranslation(['jobSeeker', 'common']);
  const { slug: resumeSlug } = useParams<{ slug: string }>();
  const [state, dispatch] = React.useReducer(reducer, initialState);

  React.useEffect(() => {
    const getResumeDetail = async (slug: string | undefined) => {
      if (!slug) return;

      dispatch({ type: 'set-loading', value: true });
      try {
        const resData = (await resumeService.getCv(slug)) as CVData;
        dispatch({ type: 'set-cv', value: resData });
      } catch (error: unknown) {
        errorHandling(error);
      } finally {
        dispatch({ type: 'set-loading', value: false });
      }
    };

    getResumeDetail(resumeSlug);
  }, [resumeSlug, state.refreshToken]);

  const handleUpdate = (data: CVFormValues) => {
    const updateCV = async (slug: string | undefined, payloadData: CVFormValues) => {
      if (!slug) return;

      dispatch({ type: 'set-fullscreen-loading', value: true });

      const formData = new FormData();
      if (payloadData.files && payloadData.files.length > 0) {
        formData.append('file', payloadData.files[0] as Blob);
      }

      try {
        await resumeService.updateCV(slug, formData);
        dispatch({ type: 'open-popup', value: false });
        dispatch({ type: 'refresh' });
        toastMessages.success(t('jobSeeker:profile.messages.resumeUploadSuccess'));
      } catch (error: unknown) {
        errorHandling(error);
      } finally {
        dispatch({ type: 'set-fullscreen-loading', value: false });
      }
    };

    updateCV(resumeSlug, data);
  };

  return (
    <>
      <Stack
        sx={{
          backgroundColor: 'background.paper',
          borderRadius: 2,
          p: 3,
          boxShadow: (theme: Theme) => theme.customShadows.card,
          '&:hover': {
            boxShadow: (theme: Theme) => theme.customShadows.medium,
          },
        }}
      >
        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {title}
            </Typography>
            <Fab
              size="small"
              color="primary"
              aria-label={t('jobSeeker:profile.actions.uploadCv')}
              onClick={() => dispatch({ type: 'open-popup', value: true })}
              sx={{
                boxShadow: (theme: Theme) => theme.customShadows.medium,
                '&:hover': {
                  transform: 'scale(1.1)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              <FileUploadIcon />
            </Fab>
          </Stack>
        </Box>

        <Divider sx={{ my: 3, borderColor: 'grey.500' }} />

        <Box>
          {state.isLoadingCv ? (
            <Stack alignItems="center" justifyContent="center" sx={{ py: 8 }}>
              <Typography variant="subtitle1" color="text.secondary">
                {t('jobSeeker:profile.cv.loading')}
              </Typography>
            </Stack>
          ) : state.cv === null ? (
            <Stack
              alignItems="center"
              justifyContent="center"
              sx={{
                py: 8,
                backgroundColor: 'primary.background',
                borderRadius: 2,
              }}
            >
              <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 1 }}>
                {t('jobSeeker:profile.cv.emptyTitle')}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                {t('jobSeeker:profile.cv.emptySubtitle')}
              </Typography>
            </Stack>
          ) : (
            <Stack spacing={3}>
              <Box
                sx={{
                  borderRadius: 2,
                  overflow: 'hidden',
                  boxShadow: (theme: Theme) => theme.customShadows.small,
                }}
              >
                <Suspense
                  fallback={
                    <Stack alignItems="center" justifyContent="center" sx={{ py: 6 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        {t('jobSeeker:profile.cv.loadingPreview')}
                      </Typography>
                    </Stack>
                  }
                >
                  <LazyPdf title={state.cv.title} fileUrl={state.cv.fileUrl} />
                </Suspense>
              </Box>
            </Stack>
          )}
        </Box>
      </Stack>

      <FormPopup title={t('jobSeeker:profile.cv.updateTitle')} openPopup={state.openPopup} setOpenPopup={(open) => dispatch({ type: 'open-popup', value: open })}>
        <CVForm handleUpdate={handleUpdate as (data: CVFormValues) => void} />
      </FormPopup>

      {state.isFullScreenLoading && <BackdropLoading />}
    </>
  );
};

export default CVCard;

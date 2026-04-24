'use client';
import React from 'react';
import { useParams } from 'next/navigation';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import FormPopup from '../../../../components/Common/Controls/FormPopup';
import GeneralInfoForm from '../GeneralInfoForm';
import toastMessages from '../../../../utils/toastMessages';
import errorHandling from '../../../../utils/errorHandling';
import BackdropLoading from '../../../../components/Common/Loading/BackdropLoading';
import resumeService from '../../../../services/resumeService';
import { useConfig } from '@/hooks/useConfig';
import GeneralInfoCardContent from './GeneralInfoCardContent';
import GeneralInfoCardLoading from './GeneralInfoCardLoading';
import type { FormValues } from '../GeneralInfoForm';
import type { ResumeDetail } from './types';

interface GeneralInfoCardProps {
  title: string;
}

type GeneralInfoCardState = {
  openPopup: boolean;
  refreshToken: number;
  isLoadingResumeDetail: boolean;
  isFullScreenLoading: boolean;
  resumeDetail: ResumeDetail | null;
};

type GeneralInfoCardAction =
  | { type: 'open-popup' }
  | { type: 'close-popup' }
  | { type: 'refresh' }
  | { type: 'set-loading'; value: boolean }
  | { type: 'set-fullscreen-loading'; value: boolean }
  | { type: 'set-resume-detail'; value: ResumeDetail | null };

const defaultState: GeneralInfoCardState = {
  openPopup: false,
  refreshToken: 0,
  isLoadingResumeDetail: true,
  isFullScreenLoading: false,
  resumeDetail: null,
};

const reducer = (state: GeneralInfoCardState, action: GeneralInfoCardAction): GeneralInfoCardState => {
  switch (action.type) {
    case 'open-popup':
      return { ...state, openPopup: true };
    case 'close-popup':
      return { ...state, openPopup: false };
    case 'refresh':
      return { ...state, refreshToken: state.refreshToken + 1 };
    case 'set-loading':
      return { ...state, isLoadingResumeDetail: action.value };
    case 'set-fullscreen-loading':
      return { ...state, isFullScreenLoading: action.value };
    case 'set-resume-detail':
      return { ...state, resumeDetail: action.value };
    default:
      return state;
  }
};

const GeneralInfoCard = ({ title }: GeneralInfoCardProps) => {
  const { t } = useTranslation(['jobSeeker', 'common']);
  const { slug: resumeSlug } = useParams<{ slug: string }>();
  const { allConfig } = useConfig();
  const configDicts = allConfig as Record<string, Record<string | number, string>> | null;
  const [state, dispatch] = React.useReducer(reducer, defaultState);

  React.useEffect(() => {
    let isActive = true;

    const getResumeDetail = async (slug: string | undefined) => {
      if (!slug) return;

      dispatch({ type: 'set-loading', value: true });

      try {
        const resData = await resumeService.getResumeOwner(slug);
        if (!isActive) return;

        dispatch({ type: 'set-resume-detail', value: resData as ResumeDetail });
      } catch (error: unknown) {
        errorHandling(error);
      } finally {
        if (isActive) {
          dispatch({ type: 'set-loading', value: false });
        }
      }
    };

    getResumeDetail(resumeSlug);

    return () => {
      isActive = false;
    };
  }, [resumeSlug, state.refreshToken]);

  const handleUpdateResumeDetail = (data: FormValues) => {
    const updateResume = async (slug: string | undefined, payload: FormValues) => {
      if (!slug) return;

      dispatch({ type: 'set-fullscreen-loading', value: true });

      try {
        const apiPayload = {
          title: payload.title,
          description: payload.description,
          skillsSummary: payload.skillsSummary,
          salaryMin: Number(payload.salaryMin) || undefined,
          salaryMax: Number(payload.salaryMax) || undefined,
          expectedSalary: Number(payload.expectedSalary) || undefined,
          position: Number(payload.position) || undefined,
          experience: Number(payload.experience) || undefined,
          academicLevel: Number(payload.academicLevel) || undefined,
          typeOfWorkplace: Number(payload.typeOfWorkplace) || undefined,
          jobType: Number(payload.jobType) || undefined,
          city: Number(payload.city) || undefined,
          career: Number(payload.career) || undefined,
        };

        await resumeService.updateResume(slug, apiPayload);
        dispatch({ type: 'refresh' });
        dispatch({ type: 'close-popup' });
        toastMessages.success(t('jobSeeker:profile.messages.profileUpdateSuccess'));
      } catch (error: unknown) {
        errorHandling(error);
      } finally {
        dispatch({ type: 'set-fullscreen-loading', value: false });
      }
    };

    updateResume(resumeSlug, data);
  };

  if (state.isLoadingResumeDetail) {
    return <GeneralInfoCardLoading />;
  }

  if (state.resumeDetail === null) {
    return (
      <Box sx={{ p: 3, backgroundColor: 'background.paper', borderRadius: 3, boxShadow: (theme) => theme.customShadows.card }}>
        <Typography variant="h6" color="error.main" textAlign="center">
          {t('jobSeeker:profile.messages.notFound')}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: 'background.paper', borderRadius: 3, p: 3, boxShadow: (theme) => theme.customShadows.card }}>
      <GeneralInfoCardContent
        title={title}
        t={t}
        configDicts={configDicts}
        resumeDetail={state.resumeDetail}
        onEdit={() => dispatch({ type: 'open-popup' })}
      />

      <FormPopup
        title={t('jobSeeker:profile.sections.generalInfo')}
        openPopup={state.openPopup}
        setOpenPopup={(open) => dispatch({ type: open ? 'open-popup' : 'close-popup' })}
      >
        <GeneralInfoForm
          handleUpdate={handleUpdateResumeDetail}
          editData={
            state.resumeDetail
              ? {
                  title: state.resumeDetail.title || '',
                  position: state.resumeDetail.position || '',
                  academicLevel: state.resumeDetail.academicLevel || '',
                  experience: state.resumeDetail.experience || '',
                  career: state.resumeDetail.career || '',
                  city: state.resumeDetail.city || '',
                  salaryMin: state.resumeDetail.salaryMin?.toString() || '',
                  salaryMax: state.resumeDetail.salaryMax?.toString() || '',
                  expectedSalary: state.resumeDetail.expectedSalary?.toString() || '',
                  typeOfWorkplace: state.resumeDetail.typeOfWorkplace || '',
                  jobType: state.resumeDetail.jobType || '',
                  description: state.resumeDetail.description || '',
                  skillsSummary: state.resumeDetail.skillsSummary || '',
                }
              : null
          }
        />
      </FormPopup>

      <BackdropLoading open={state.isFullScreenLoading} />
    </Box>
  );
};

export default GeneralInfoCard;

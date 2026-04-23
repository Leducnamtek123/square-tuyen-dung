import React from 'react';
import { useAppSelector } from '@/redux/hooks';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { AxiosError } from 'axios';
import { PaginatedResponse } from '../../../../types/api';
import toastMessages from '../../../../utils/toastMessages';
import errorHandling from '../../../../utils/errorHandling';
import BackdropLoading from '../../../../components/Common/Loading/BackdropLoading';
import FormPopup from '../../../../components/Common/Controls/FormPopup';
import ProfileUploadForm from '../ProfileUploadForm';
import jobSeekerProfileService from '../../../../services/jobSeekerProfileService';
import resumeService from '../../../../services/resumeService';
import { confirmModal } from '../../../../utils/sweetalert2Modal';
import NoDataCard from '../../../../components/Common/NoDataCard';
import { reloadResume } from '../../../../redux/profileSlice';
import { CV_TYPES } from '../../../../configs/constants';
import ProfileUploadResumeGrid from './ProfileUploadResumeGrid';
import type { FormValues as ProfileUploadFormValues } from '../ProfileUploadForm';
import type { JobSeekerProfileResumeParams } from '../../../../services/jobSeekerProfileService';

interface Resume {
  id: string | number;
  imageUrl?: string;
  fileUrl: string;
  title: string;
  updateAt: string;
  slug: string;
  isActive: boolean;
}

interface ProfileUploadProps {
  title: string;
}

type State = {
  isLoadingResumes: boolean;
  resumes: Resume[];
  openPopup: boolean;
  isSuccess: boolean;
  isFullScreenLoading: boolean;
};

type Action =
  | { type: 'set_loading_resumes'; payload: boolean }
  | { type: 'set_resumes'; payload: Resume[] }
  | { type: 'set_open_popup'; payload: boolean }
  | { type: 'toggle_success' }
  | { type: 'set_fullscreen_loading'; payload: boolean };

const initialState: State = {
  isLoadingResumes: false,
  resumes: [],
  openPopup: false,
  isSuccess: false,
  isFullScreenLoading: false,
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'set_loading_resumes':
      return { ...state, isLoadingResumes: action.payload };
    case 'set_resumes':
      return { ...state, resumes: action.payload };
    case 'set_open_popup':
      return { ...state, openPopup: action.payload };
    case 'toggle_success':
      return { ...state, isSuccess: !state.isSuccess };
    case 'set_fullscreen_loading':
      return { ...state, isFullScreenLoading: action.payload };
    default:
      return state;
  }
};

const ProfileUpload = ({ title }: ProfileUploadProps) => {
  const { t } = useTranslation(['jobSeeker', 'common']);
  const dispatch = useDispatch();
  const {
    resume: { reloadCounter },
  } = useAppSelector((state) => state.profile);
  const { currentUser } = useAppSelector((state) => state.user);
  const [state, uiDispatch] = React.useReducer(reducer, initialState);

  React.useEffect(() => {
    const getOnlineProfile = async (jobSeekerProfileId: string | number | undefined, params: JobSeekerProfileResumeParams) => {
      if (!jobSeekerProfileId) return;
      uiDispatch({ type: 'set_loading_resumes', payload: true });
      try {
        const resData = (await jobSeekerProfileService.getResumes(jobSeekerProfileId, params)) as PaginatedResponse<Resume>;
        uiDispatch({ type: 'set_resumes', payload: resData?.results || [] });
      } catch (error: unknown) {
        errorHandling(error);
      } finally {
        uiDispatch({ type: 'set_loading_resumes', payload: false });
      }
    };

    getOnlineProfile(currentUser?.jobSeekerProfile?.id ?? currentUser?.jobSeekerProfileId ?? undefined, {
      resumeType: CV_TYPES.cvUpload,
    });
  }, [currentUser, reloadCounter, state.isSuccess]);

  const handleAdd = (data: ProfileUploadFormValues) => {
    const formData = new FormData();

    for (const key in data) {
      const value = data[key as keyof ProfileUploadFormValues];
      if (key === 'file' && Array.isArray(value) && value.length > 0) {
        formData.append(key, value[0]);
      } else if (value !== null && value !== undefined) {
        formData.append(key, value as string | Blob);
      }
    }

    const addResumeUpload = async (fd: FormData) => {
      uiDispatch({ type: 'set_fullscreen_loading', payload: true });
      try {
        await resumeService.addResume(fd);
        uiDispatch({ type: 'set_open_popup', payload: false });
        uiDispatch({ type: 'toggle_success' });
        toastMessages.success(t('jobSeeker:profile.messages.resumeUploadSuccess'));
      } catch (error: unknown) {
        errorHandling(error);
      } finally {
        uiDispatch({ type: 'set_fullscreen_loading', payload: false });
      }
    };

    addResumeUpload(formData);
  };

  const handleDelete = (slug: string) => {
    const del = async (resumeSlug: string) => {
      try {
        await resumeService.deleteResume(resumeSlug);
        uiDispatch({ type: 'toggle_success' });
        toastMessages.success(t('jobSeeker:profile.messages.resumeDeleteSuccess'));
      } catch (error: unknown) {
        errorHandling(error);
      } finally {
        uiDispatch({ type: 'set_fullscreen_loading', payload: false });
      }
    };

    confirmModal(
      () => del(slug),
      t('jobSeeker:profile.messages.deleteConfirmTitle', { item: t('jobSeeker:attachedProfile.sections.cv') }),
      t('jobSeeker:profile.messages.deleteConfirmWarning'),
      'warning'
    );
  };

  const handleActive = (slug: string) => {
    const activeResume = async (resumeSlug: string) => {
      uiDispatch({ type: 'set_fullscreen_loading', payload: true });
      try {
        await resumeService.activeResume(resumeSlug);
        dispatch(reloadResume());
        toastMessages.success(t('jobSeeker:profile.messages.profileStatusUpdateSuccess'));
      } catch (error: unknown) {
        errorHandling(error);
      } finally {
        uiDispatch({ type: 'set_fullscreen_loading', payload: false });
      }
    };

    activeResume(slug);
  };

  return (
    <>
      <ProfileUploadResumeGrid
        resumes={state.resumes}
        isLoadingResumes={state.isLoadingResumes}
        title={title}
        t={t}
        onOpenPopup={() => uiDispatch({ type: 'set_open_popup', payload: true })}
        onDelete={handleDelete}
        onActive={handleActive}
      />

      <FormPopup title={t('jobSeeker:profile.sections.resume')} openPopup={state.openPopup} setOpenPopup={(value) => uiDispatch({ type: 'set_open_popup', payload: value })}>
        <ProfileUploadForm handleAdd={handleAdd} />
      </FormPopup>

      {state.isFullScreenLoading && <BackdropLoading />}
    </>
  );
};

export default ProfileUpload;

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import authService from '@/services/authService';
import { useConfig } from '@/hooks/useConfig';
import { setUserInfo } from '@/redux/userSlice';
import type { CandidateFullFormValues } from '../schemas/candidateOnboardingSchema';
import {
  createCandidateStep1Schema,
  createCandidateStep2Schema,
} from '../schemas/candidateOnboardingSchema';
import type { RecommendedJobPreview } from '@/types/auth';

const INITIAL_FORM_VALUES: CandidateFullFormValues = {
  desiredJobTitle: '',
  careerId: '',
  cityId: '',
  typeOfWorkplace: 1,
  address: '',
  lat: null,
  lng: null,
  skills: [],
  experience: 1,
  isSalaryNegotiable: true,
  salaryMin: 0,
  salaryMax: 0,
  academicLevel: 3,
  fileId: null,
  fileName: '',
  fileUrl: '',
};

export function useCandidateOnboarding() {
  const { t } = useTranslation('jobSeeker');
  const router = useRouter();
  const dispatch = useDispatch();
  const { allConfig } = useConfig();

  const [activeStep, setActiveStep] = useState<number>(0);
  const [formData, setFormData] = useState<CandidateFullFormValues>(INITIAL_FORM_VALUES);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [generalError, setGeneralError] = useState<string>('');
  const [completeness, setCompleteness] = useState<number>(20);
  const [recommendedJobs, setRecommendedJobs] = useState<RecommendedJobPreview[]>([]);

  // 1. Restore draft and verify onboarded status on mount
  useEffect(() => {
    let isMounted = true;

    async function loadStatus() {
      try {
        const res = await authService.getOnboardingStatus();
        if (!isMounted) return;

        if (res.isOnboarded) {
          router.replace('/jobs');
          return;
        }

        if (res.profileCompleteness) {
          setCompleteness(res.profileCompleteness);
        }

        if (res.candidateDraft) {
          const draft = res.candidateDraft;
          setFormData((prev) => ({
            ...prev,
            desiredJobTitle: draft.desiredJobTitle || prev.desiredJobTitle,
            careerId: draft.careerId || prev.careerId,
            cityId: draft.cityId || prev.cityId,
            typeOfWorkplace: draft.typeOfWorkplace || prev.typeOfWorkplace,
            address: draft.address || prev.address,
            lat: draft.lat !== undefined ? draft.lat : prev.lat,
            lng: draft.lng !== undefined ? draft.lng : prev.lng,
            skills: draft.skills?.length ? draft.skills : prev.skills,
            experience: draft.experience || prev.experience,
            isSalaryNegotiable: draft.isSalaryNegotiable !== undefined ? draft.isSalaryNegotiable : prev.isSalaryNegotiable,
            salaryMin: draft.salaryMin ?? prev.salaryMin,
            salaryMax: draft.salaryMax ?? prev.salaryMax,
            academicLevel: draft.academicLevel || prev.academicLevel,
            fileId: draft.fileId ?? prev.fileId,
            fileName: draft.fileName || prev.fileName,
            fileUrl: draft.fileUrl || prev.fileUrl,
          }));

          // Resume stepper position
          if (res.onboardingStep && res.onboardingStep > 1 && res.onboardingStep < 4) {
            setActiveStep(res.onboardingStep - 1);
          }
        }
      } catch (err) {
        console.error('Failed to load onboarding status:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void loadStatus();

    return () => {
      isMounted = false;
    };
  }, [router]);

  // Update single form field
  const updateFormField = useCallback((field: keyof CandidateFullFormValues, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      if (prev[field]) {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      }
      return prev;
    });
  }, []);

  // Step 1: Validate & Save Step 1
  const handleNextStep1 = async () => {
    try {
      const schema = createCandidateStep1Schema(t);
      await schema.validate(formData, { abortEarly: false });
      setErrors({});
      setIsSaving(true);
      setGeneralError('');

      await authService.saveCandidateOnboardingStep({
        step: 1,
        desiredJobTitle: formData.desiredJobTitle,
        careerId: formData.careerId,
        cityId: formData.cityId,
        typeOfWorkplace: formData.typeOfWorkplace,
        address: formData.address,
        lat: formData.lat,
        lng: formData.lng,
      });

      setActiveStep(1);
    } catch (err: any) {
      if (err.inner) {
        const newErrors: Record<string, string> = {};
        err.inner.forEach((e: any) => {
          if (e.path) newErrors[e.path] = e.message;
        });
        setErrors(newErrors);
      } else {
        setGeneralError(t('onboarding.validation.saveFailed', 'Không thể lưu thông tin. Vui lòng thử lại.'));
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Step 2: Validate & Save Step 2
  const handleNextStep2 = async () => {
    try {
      const schema = createCandidateStep2Schema(t);
      await schema.validate(formData, { abortEarly: false });
      setErrors({});
      setIsSaving(true);
      setGeneralError('');

      await authService.saveCandidateOnboardingStep({
        step: 2,
        skills: formData.skills,
        experience: formData.experience,
        academicLevel: formData.academicLevel,
        salaryMin: formData.isSalaryNegotiable ? 0 : formData.salaryMin,
        salaryMax: formData.isSalaryNegotiable ? 0 : formData.salaryMax,
      });

      setActiveStep(2);
    } catch (err: any) {
      if (err.inner) {
        const newErrors: Record<string, string> = {};
        err.inner.forEach((e: any) => {
          if (e.path) newErrors[e.path] = e.message;
        });
        setErrors(newErrors);
      } else {
        setGeneralError(t('onboarding.validation.saveFailed', 'Không thể lưu thông tin. Vui lòng thử lại.'));
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Step 3: Complete candidate onboarding
  const handleCompleteCandidate = async () => {
    setIsSaving(true);
    setGeneralError('');

    try {
      const payload = {
        desiredJobTitle: formData.desiredJobTitle,
        careerId: formData.careerId,
        cityId: formData.cityId,
        typeOfWorkplace: formData.typeOfWorkplace,
        address: formData.address,
        lat: formData.lat,
        lng: formData.lng,
        skills: formData.skills,
        experience: formData.experience,
        academicLevel: formData.academicLevel,
        salaryMin: formData.isSalaryNegotiable ? 0 : formData.salaryMin,
        salaryMax: formData.isSalaryNegotiable ? 0 : formData.salaryMax,
        fileId: formData.fileId || null,
      };

      const res = await authService.candidateOnboarding(payload);
      if (res.user) {
        dispatch(setUserInfo(res.user));
      }
      if (res.recommendedJobs) {
        setRecommendedJobs(res.recommendedJobs);
      }
      setCompleteness(100);
      setActiveStep(3); // Step 4 Complete
    } catch (err: any) {
      console.error('Candidate onboarding completion error:', err);
      const apiErrors = err.response?.data;
      if (apiErrors && typeof apiErrors === 'object') {
        const fieldErrors: Record<string, string> = {};
        Object.keys(apiErrors).forEach((k) => {
          fieldErrors[k] = Array.isArray(apiErrors[k]) ? apiErrors[k][0] : String(apiErrors[k]);
        });
        setErrors(fieldErrors);
      } else {
        setGeneralError(t('onboarding.validation.saveFailed', 'Không thể lưu thông tin. Vui lòng thử lại.'));
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep((prev) => prev - 1);
      setErrors({});
      setGeneralError('');
    }
  };

  const handleExploreJobs = () => {
    router.push('/jobs');
  };

  const handleViewDashboard = () => {
    router.push('/profile');
  };

  return {
    activeStep,
    formData,
    errors,
    isLoading,
    isSaving,
    isUploading,
    setIsUploading,
    generalError,
    setGeneralError,
    completeness,
    recommendedJobs,
    allConfig,
    updateFormField,
    handleNextStep1,
    handleNextStep2,
    handleCompleteCandidate,
    handleBack,
    handleExploreJobs,
    handleViewDashboard,
  };
}

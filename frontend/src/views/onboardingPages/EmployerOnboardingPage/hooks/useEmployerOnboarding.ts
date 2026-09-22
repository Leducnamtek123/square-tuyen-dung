'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import authService from '@/services/authService';
import { useConfig } from '@/hooks/useConfig';
import { setUserInfo } from '@/redux/userSlice';
import type { RootState } from '@/redux/store';
import type { EmployerFullFormValues } from '../schemas/employerOnboardingSchema';
import {
  createEmployerStep1Schema,
  createEmployerStep2Schema,
} from '../schemas/employerOnboardingSchema';

const INITIAL_FORM_VALUES: EmployerFullFormValues = {
  companyName: '',
  taxCode: '',
  employeeSize: 2,
  fieldOperation: '',
  cityId: '',
  districtId: '',
  address: '',
  websiteUrl: '',
  logoId: null,
  logoUrl: '',
  recruiterName: '',
  recruiterTitle: '',
  recruiterPhone: '',
  recruiterEmail: '',
  hiringNeeds: [],
  description: '',
  gpkdFileId: null,
  gpkdFileName: '',
  gpkdFileUrl: '',
};

export function useEmployerOnboarding() {
  const { t } = useTranslation('employer');
  const router = useRouter();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const { allConfig } = useConfig();

  const [activeStep, setActiveStep] = useState<number>(0);
  const [formData, setFormData] = useState<EmployerFullFormValues>(INITIAL_FORM_VALUES);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isLookingUpTax, setIsLookingUpTax] = useState<boolean>(false);
  const [taxLookupResult, setTaxLookupResult] = useState<import('@/types/auth').TaxCodeLookupResult | null>(null);
  const [isRequestingJoin, setIsRequestingJoin] = useState<boolean>(false);
  const [isSkipping, setIsSkipping] = useState<boolean>(false);
  const [generalError, setGeneralError] = useState<string>('');
  const [hasExistingMembership, setHasExistingMembership] = useState<boolean>(false);
  const [existingCompany, setExistingCompany] = useState<{
    companyId: number;
    companyName: string;
    roleName: string;
  } | null>(null);

  // 1. Restore draft and status on mount
  useEffect(() => {
    let isMounted = true;

    async function loadStatus() {
      try {
        const res = await authService.getOnboardingStatus();
        if (!isMounted) return;

        const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
        const isPreview = searchParams?.get('preview') === '1';
        const isEdit = searchParams?.get('edit') === '1';

        // Chỉ điều hướng nếu nhà tuyển dụng ĐÃ hoàn thành bước 4 và hồ sơ đạt 100%, không ở preview/edit
        if (
          res.isOnboarded &&
          res.onboardingStep === 4 &&
          (res.profileCompleteness ?? 0) >= 100 &&
          !isPreview &&
          !isEdit
        ) {
          router.replace('/employer/dashboard');
          return;
        }

        if (res.hasExistingMembership && res.existingCompany) {
          setHasExistingMembership(true);
          setExistingCompany(res.existingCompany);
        }

        if (res.employerDraft) {
          const draft = res.employerDraft;
          setFormData((prev) => ({
            ...prev,
            companyName: draft.companyName || prev.companyName,
            taxCode: draft.taxCode || prev.taxCode,
            employeeSize: draft.employeeSize || prev.employeeSize,
            fieldOperation: draft.fieldOperation || prev.fieldOperation,
            cityId: draft.cityId || prev.cityId,
            districtId: draft.districtId || prev.districtId,
            address: draft.address || prev.address,
            websiteUrl: draft.websiteUrl || prev.websiteUrl,
            logoId: draft.logoId ?? prev.logoId,
            logoUrl: draft.logoUrl || prev.logoUrl,
            recruiterName: draft.recruiterName || currentUser?.fullName || prev.recruiterName,
            recruiterTitle: draft.recruiterTitle || prev.recruiterTitle,
            recruiterPhone: draft.recruiterPhone || currentUser?.phoneNumber || prev.recruiterPhone,
            recruiterEmail: draft.recruiterEmail || currentUser?.email || prev.recruiterEmail,
            description: draft.description || prev.description,
            gpkdFileId: draft.gpkdFileId ?? prev.gpkdFileId,
            gpkdFileName: draft.gpkdFileName || prev.gpkdFileName,
            gpkdFileUrl: draft.gpkdFileUrl || prev.gpkdFileUrl,
          }));

          // Resume stepper position
          if (!isEdit && res.onboardingStep === 4) {
            setActiveStep(3);
          } else if (res.onboardingStep && res.onboardingStep > 1 && res.onboardingStep < 4) {
            setActiveStep(res.onboardingStep - 1);
          }
        } else if (typeof window !== 'undefined') {
          // LocalStorage fallback restore
          try {
            const savedDraft = localStorage.getItem('infohr_employer_draft');
            if (savedDraft) {
              const parsed = JSON.parse(savedDraft);
              setFormData((prev) => ({ ...prev, ...parsed }));
            } else if (currentUser) {
              setFormData((prev) => ({
                ...prev,
                recruiterName: currentUser.fullName || prev.recruiterName,
                recruiterPhone: currentUser.phoneNumber || prev.recruiterPhone,
                recruiterEmail: currentUser.email || prev.recruiterEmail,
              }));
            }
          } catch (e) {
            console.error('LocalStorage draft read error:', e);
          }
        } else if (currentUser) {
          setFormData((prev) => ({
            ...prev,
            recruiterName: currentUser.fullName || prev.recruiterName,
            recruiterPhone: currentUser.phoneNumber || prev.recruiterPhone,
            recruiterEmail: currentUser.email || prev.recruiterEmail,
          }));
        }
      } catch (err) {
        console.error('Failed to load employer onboarding status:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void loadStatus();

    return () => {
      isMounted = false;
    };
  }, [router, currentUser]);

  // Sync formData to localStorage for resilience
  useEffect(() => {
    if (typeof window !== 'undefined' && !isLoading && activeStep < 3) {
      try {
        localStorage.setItem('infohr_employer_draft', JSON.stringify(formData));
      } catch (e) {
        // quota exceeded or private mode
      }
    }
  }, [formData, isLoading, activeStep]);

  // Update single form field
  const updateFormField = useCallback((field: keyof EmployerFullFormValues, value: any) => {
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
      const schema = createEmployerStep1Schema(t);
      await schema.validate(formData, { abortEarly: false });
      setErrors({});
      setIsSaving(true);
      setGeneralError('');

      await authService.saveEmployerOnboardingStep({
        step: 1,
        companyName: formData.companyName,
        taxCode: formData.taxCode,
        employeeSize: formData.employeeSize,
        fieldOperation: formData.fieldOperation,
        cityId: formData.cityId,
        districtId: formData.districtId,
        address: formData.address,
        websiteUrl: formData.websiteUrl,
        logoId: formData.logoId,
      });

      void queryClient.invalidateQueries({ queryKey: ['onboardingStatus'] });
      setActiveStep(1);
    } catch (err: any) {
      if (err.inner) {
        const newErrors: Record<string, string> = {};
        err.inner.forEach((e: any) => {
          if (e.path) newErrors[e.path] = e.message;
        });
        setErrors(newErrors);
      } else {
        setGeneralError(t('employerOnboarding.validation.saveFailed', 'Không thể lưu thông tin doanh nghiệp. Vui lòng thử lại.'));
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Step 2: Validate & Save Step 2
  const handleNextStep2 = async () => {
    try {
      const schema = createEmployerStep2Schema(t);
      await schema.validate(formData, { abortEarly: false });
      setErrors({});
      setIsSaving(true);
      setGeneralError('');

      await authService.saveEmployerOnboardingStep({
        step: 2,
        recruiterName: formData.recruiterName,
        recruiterTitle: formData.recruiterTitle,
        recruiterPhone: formData.recruiterPhone,
        recruiterEmail: formData.recruiterEmail,
        hiringNeeds: formData.hiringNeeds,
        description: formData.description,
      });

      void queryClient.invalidateQueries({ queryKey: ['onboardingStatus'] });
      setActiveStep(2);
    } catch (err: any) {
      if (err.inner) {
        const newErrors: Record<string, string> = {};
        err.inner.forEach((e: any) => {
          if (e.path) newErrors[e.path] = e.message;
        });
        setErrors(newErrors);
      } else {
        setGeneralError(t('employerOnboarding.validation.saveFailed', 'Không thể lưu thông tin doanh nghiệp. Vui lòng thử lại.'));
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Step 3 / Finalize: Complete Employer Onboarding
  const handleCompleteEmployer = async (skipGpkd = false) => {
    setIsSaving(true);
    setGeneralError('');

    try {
      const payload = {
        companyName: formData.companyName,
        taxCode: formData.taxCode,
        employeeSize: formData.employeeSize,
        fieldOperation: formData.fieldOperation,
        cityId: formData.cityId,
        districtId: formData.districtId,
        address: formData.address,
        websiteUrl: formData.websiteUrl,
        logoId: formData.logoId,
        recruiterName: formData.recruiterName,
        recruiterPhone: formData.recruiterPhone,
        recruiterEmail: formData.recruiterEmail,
        description: formData.description,
        gpkdFileId: skipGpkd ? null : formData.gpkdFileId || null,
      };

      const res = await authService.employerOnboarding(payload);
      if (res.user) {
        dispatch(setUserInfo(res.user));
      }
      void queryClient.invalidateQueries({ queryKey: ['onboardingStatus'] });
      if (typeof window !== 'undefined') {
        localStorage.removeItem('infohr_employer_draft');
      }
      setActiveStep(3); // Step 4 Complete
    } catch (err: any) {
      console.error('Employer onboarding completion error:', err);
      const apiErrors = err.response?.data;
      if (apiErrors && typeof apiErrors === 'object') {
        const fieldErrors: Record<string, string> = {};
        Object.keys(apiErrors).forEach((k) => {
          fieldErrors[k] = Array.isArray(apiErrors[k]) ? apiErrors[k][0] : String(apiErrors[k]);
        });
        setErrors(fieldErrors);
      } else {
        setGeneralError(t('employerOnboarding.validation.saveFailed', 'Không thể lưu thông tin doanh nghiệp. Vui lòng thử lại.'));
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Tax Code Lookup (VietQR & InfoHR duplicate check)
  const handleLookupTaxCode = async (taxCodeOverride?: string) => {
    const code = (taxCodeOverride || formData.taxCode || '').trim();
    if (!code) {
      setErrors((prev) => ({ ...prev, taxCode: 'Vui lòng nhập mã số thuế để tra cứu.' }));
      return null;
    }

    setIsLookingUpTax(true);
    setGeneralError('');
    try {
      const res = await authService.lookupTaxCode(code);
      setTaxLookupResult(res);

      if (res.exists && res.company) {
        // Duplicate company found on InfoHR
        return res;
      }

      if (!res.exists && res.company) {
        // Auto-fill company details from VietQR
        setFormData((prev) => ({
          ...prev,
          companyName: res.company?.companyName || prev.companyName,
          address: res.company?.address || prev.address,
        }));
        // clear errors for companyName
        setErrors((prev) => {
          const c = { ...prev };
          delete c.companyName;
          delete c.taxCode;
          return c;
        });
      }
      return res;
    } catch (err) {
      console.error('Tax code lookup error:', err);
      // Soft fail: do not block user
    } finally {
      setIsLookingUpTax(false);
    }
  };

  // Request to join existing company
  const handleRequestJoinCompany = async (companyId: number) => {
    setIsRequestingJoin(true);
    setGeneralError('');
    try {
      const res = await authService.requestJoinCompany(companyId);
      if (res.user) {
        dispatch(setUserInfo(res.user));
      }
      void queryClient.invalidateQueries({ queryKey: ['onboardingStatus'] });
      if (typeof window !== 'undefined') {
        localStorage.removeItem('infohr_employer_draft');
      }
      router.replace('/employer/dashboard');
    } catch (err: any) {
      console.error('Request join company error:', err);
      setGeneralError(err.response?.data?.message || 'Không thể gửi yêu cầu tham gia. Vui lòng thử lại.');
    } finally {
      setIsRequestingJoin(false);
    }
  };

  // Skip onboarding
  const handleSkipOnboarding = async () => {
    setIsSkipping(true);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('infohr_onboarding_banner_dismissed_employer', 'false');
    }
    try {
      const res = await authService.skipOnboarding();
      if (res.user) {
        dispatch(setUserInfo(res.user));
      }
      void queryClient.invalidateQueries({ queryKey: ['onboardingStatus'] });
      router.replace('/employer/dashboard');
    } catch (err) {
      console.error('Error skipping employer onboarding:', err);
      void queryClient.invalidateQueries({ queryKey: ['onboardingStatus'] });
      router.replace('/employer/dashboard');
    } finally {
      setIsSkipping(false);
    }
  };

  // Accept Invitation flow
  const handleAcceptInvitation = async () => {
    setIsSaving(true);
    try {
      const res = await authService.employerOnboarding({
        recruiterName: formData.recruiterName || currentUser?.fullName,
        recruiterPhone: formData.recruiterPhone || currentUser?.phoneNumber,
      });
      if (res.user) {
        dispatch(setUserInfo(res.user));
      }
      void queryClient.invalidateQueries({ queryKey: ['onboardingStatus'] });
      if (typeof window !== 'undefined') {
        localStorage.removeItem('infohr_employer_draft');
      }
      router.replace('/employer/dashboard');
    } catch (err) {
      console.error('Error accepting company invitation:', err);
      setGeneralError('Không thể chấp nhận lời mời. Vui lòng thử lại.');
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

  const handlePostJob = () => {
    router.push('/employer/job-posts');
  };

  const handleViewDashboard = () => {
    router.push('/employer/dashboard');
  };

  return {
    activeStep,
    formData,
    errors,
    isLoading,
    isSaving,
    isUploading,
    setIsUploading,
    isLookingUpTax,
    taxLookupResult,
    isRequestingJoin,
    isSkipping,
    generalError,
    setGeneralError,
    hasExistingMembership,
    existingCompany,
    allConfig,
    updateFormField,
    handleNextStep1,
    handleNextStep2,
    handleCompleteEmployer,
    handleAcceptInvitation,
    handleLookupTaxCode,
    handleRequestJoinCompany,
    handleSkipOnboarding,
    handleBack,
    handlePostJob,
    handleViewDashboard,
  };
}


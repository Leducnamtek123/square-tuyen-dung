'use client';

import React from 'react';
import {
  Box,
  Stack,
  Button,
  CircularProgress,
  Alert,
  Fade,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useTranslation } from 'react-i18next';
import type { SelectOption } from '@/types/models';
import OnboardingShell from '../components/OnboardingShell';
import CandidateStepper from './components/CandidateStepper';
import StepCareerGoals from './components/StepCareerGoals';
import StepSkillsExperience from './components/StepSkillsExperience';
import StepResumeUpload from './components/StepResumeUpload';
import StepCandidateComplete from './components/StepCandidateComplete';
import { useCandidateOnboarding } from './hooks/useCandidateOnboarding';

export default function CandidateOnboardingPage() {
  const { t } = useTranslation('jobSeeker');
  const {
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
  } = useCandidateOnboarding();

  const steps = [
    t('onboarding.steps.careerGoals', 'Mục tiêu & Nguyện vọng'),
    t('onboarding.steps.skillsExperience', 'Kỹ năng & Kinh nghiệm'),
    t('onboarding.steps.resumeUpload', 'Tải CV / Hồ sơ'),
    t('onboarding.steps.complete', 'Hoàn tất'),
  ];

  const careersList: SelectOption[] = allConfig?.careerOptions || [];
  const citiesList: SelectOption[] = allConfig?.cityOptions || [];
  const experienceOptions: SelectOption[] = allConfig?.experienceOptions || [];
  const academicLevelOptions: SelectOption[] = allConfig?.academicLevelOptions || [];

  const selectedCareer = careersList.find((c: SelectOption) => Number(c.id) === Number(formData.careerId));
  const selectedCity = citiesList.find((ct: SelectOption) => Number(ct.id) === Number(formData.cityId));

  if (isLoading) {
    return (
      <OnboardingShell maxWidth="md">
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 10 }}>
          <CircularProgress size={40} thickness={4} sx={{ color: '#2563EB', mb: 2 }} />
        </Box>
      </OnboardingShell>
    );
  }

  return (
    <OnboardingShell maxWidth="md">
      {/* Top Stepper */}
      <CandidateStepper activeStep={activeStep} steps={steps} />

      {generalError && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2.5 }} onClose={() => setGeneralError('')}>
          {generalError}
        </Alert>
      )}

      {/* Step Content */}
      <Box sx={{ my: 1, minHeight: 340 }}>
        {activeStep === 0 && (
          <Fade in timeout={300}>
            <div>
              <StepCareerGoals
                values={{
                  desiredJobTitle: formData.desiredJobTitle,
                  careerId: formData.careerId,
                  cityId: formData.cityId,
                  typeOfWorkplace: formData.typeOfWorkplace,
                }}
                onChange={updateFormField}
                errors={errors}
                careersList={careersList}
                citiesList={citiesList}
              />
            </div>
          </Fade>
        )}

        {activeStep === 1 && (
          <Fade in timeout={300}>
            <div>
              <StepSkillsExperience
                values={{
                  skills: formData.skills,
                  experience: formData.experience,
                  isSalaryNegotiable: formData.isSalaryNegotiable,
                  salaryMin: formData.salaryMin,
                  salaryMax: formData.salaryMax,
                  academicLevel: formData.academicLevel,
                }}
                onChange={updateFormField}
                errors={errors}
                experienceOptions={experienceOptions}
                academicLevelOptions={academicLevelOptions}
              />
            </div>
          </Fade>
        )}

        {activeStep === 2 && (
          <Fade in timeout={300}>
            <div>
              <StepResumeUpload
                values={{
                  fileId: formData.fileId,
                  fileName: formData.fileName,
                  fileUrl: formData.fileUrl,
                }}
                onChange={updateFormField}
                isUploading={isUploading}
                setIsUploading={setIsUploading}
                errorMsg={generalError}
                setErrorMsg={setGeneralError}
              />
            </div>
          </Fade>
        )}

        {activeStep === 3 && (
          <Fade in timeout={300}>
            <div>
              <StepCandidateComplete
                formData={formData}
                careerName={selectedCareer?.name || ''}
                cityName={selectedCity?.name || ''}
                completeness={completeness}
                recommendedJobs={recommendedJobs}
                onExploreJobs={handleExploreJobs}
                onViewDashboard={handleViewDashboard}
              />
            </div>
          </Fade>
        )}
      </Box>

      {/* Navigation Actions Footer (Steps 0, 1, 2) */}
      {activeStep < 3 && (
        <Box
          sx={{
            mt: 4.5,
            pt: 3,
            borderTop: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {activeStep > 0 ? (
            <Button
              variant="outlined"
              color="inherit"
              onClick={handleBack}
              disabled={isSaving || isUploading}
              startIcon={<ArrowBackIcon />}
              sx={{
                borderRadius: 2.5,
                px: 2.5,
                py: 1.25,
                fontWeight: 600,
                borderColor: '#CBD5E1',
                color: '#475569',
              }}
            >
              {t('onboarding.actions.back', 'Quay lại')}
            </Button>
          ) : (
            <Box />
          )}

          <Stack direction="row" spacing={1.5}>
            {activeStep === 0 && (
              <Button
                variant="contained"
                color="primary"
                onClick={handleNextStep1}
                disabled={isSaving}
                endIcon={isSaving ? <CircularProgress size={18} color="inherit" /> : <ArrowForwardIcon />}
                sx={{
                  borderRadius: 2.5,
                  px: 3.5,
                  py: 1.25,
                  fontWeight: 700,
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
                }}
              >
                {isSaving ? t('onboarding.actions.saving', 'Đang lưu...') : t('onboarding.actions.next', 'Tiếp theo')}
              </Button>
            )}

            {activeStep === 1 && (
              <Button
                variant="contained"
                color="primary"
                onClick={handleNextStep2}
                disabled={isSaving}
                endIcon={isSaving ? <CircularProgress size={18} color="inherit" /> : <ArrowForwardIcon />}
                sx={{
                  borderRadius: 2.5,
                  px: 3.5,
                  py: 1.25,
                  fontWeight: 700,
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
                }}
              >
                {isSaving ? t('onboarding.actions.saving', 'Đang lưu...') : t('onboarding.actions.next', 'Tiếp theo')}
              </Button>
            )}

            {activeStep === 2 && (
              <Button
                variant="contained"
                color="primary"
                onClick={handleCompleteCandidate}
                disabled={isSaving || isUploading}
                endIcon={isSaving ? <CircularProgress size={18} color="inherit" /> : <CheckCircleIcon />}
                sx={{
                  borderRadius: 2.5,
                  px: 3.5,
                  py: 1.25,
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.28)',
                }}
              >
                {isSaving
                  ? t('onboarding.actions.submitting', 'Đang hoàn tất...')
                  : t('onboarding.actions.complete', 'Hoàn tất hồ sơ cơ bản')}
              </Button>
            )}
          </Stack>
        </Box>
      )}
    </OnboardingShell>
  );
}

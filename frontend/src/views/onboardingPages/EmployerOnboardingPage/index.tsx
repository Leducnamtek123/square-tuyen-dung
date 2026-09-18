'use client';

import React from 'react';
import {
  Box,
  Stack,
  Button,
  CircularProgress,
  Alert,
  Fade,
  Card,
  Typography,
  Avatar,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BusinessIcon from '@mui/icons-material/Business';
import { useTranslation } from 'react-i18next';
import type { SelectOption } from '@/types/models';
import OnboardingShell from '../components/OnboardingShell';
import EmployerStepper from './components/EmployerStepper';
import StepCompanyProfile from './components/StepCompanyProfile';
import StepRecruiterProfile from './components/StepRecruiterProfile';
import StepVerificationGPKD from './components/StepVerificationGPKD';
import StepEmployerComplete from './components/StepEmployerComplete';
import { useEmployerOnboarding } from './hooks/useEmployerOnboarding';

export default function EmployerOnboardingPage() {
  const { t } = useTranslation('employer');
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
    hasExistingMembership,
    existingCompany,
    allConfig,
    updateFormField,
    handleNextStep1,
    handleNextStep2,
    handleCompleteEmployer,
    handleAcceptInvitation,
    handleBack,
    handlePostJob,
    handleViewDashboard,
  } = useEmployerOnboarding();

  const steps = [
    t('employerOnboarding.steps.companyProfile', 'Thương hiệu Doanh nghiệp'),
    t('employerOnboarding.steps.recruiterProfile', 'Đại diện Tuyển dụng'),
    t('employerOnboarding.steps.verification', 'Xác thực GPKD'),
    t('employerOnboarding.steps.complete', 'Hoàn tất'),
  ];

  const citiesList: SelectOption[] = allConfig?.cityOptions || [];
  const employeeSizeOptions: SelectOption[] = allConfig?.employeeSizeOptions || [];
  const selectedCity = citiesList.find((c: SelectOption) => Number(c.id) === Number(formData.cityId));

  if (isLoading) {
    return (
      <OnboardingShell maxWidth="md">
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 10 }}>
          <CircularProgress size={40} thickness={4} sx={{ color: '#2563EB', mb: 2 }} />
        </Box>
      </OnboardingShell>
    );
  }

  // If user has an invited membership to a company
  if (hasExistingMembership && existingCompany) {
    return (
      <OnboardingShell maxWidth="sm">
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <Avatar
            sx={{
              width: 64,
              height: 64,
              borderRadius: 3,
              backgroundColor: '#EFF6FF',
              color: '#2563EB',
              mx: 'auto',
              mb: 2,
            }}
          >
            <BusinessIcon fontSize="large" />
          </Avatar>

          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', mb: 1 }}>
            {t('employerOnboarding.invitation.title', 'Bạn đã được mời tham gia doanh nghiệp')}
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', mb: 3 }}>
            {t('employerOnboarding.invitation.subtitle', 'Tài khoản của bạn đã được mời làm việc tại doanh nghiệp với vai trò được cấp sẵn.')}
          </Typography>

          <Card
            variant="outlined"
            sx={{
              p: 3,
              mb: 4,
              borderRadius: 3,
              backgroundColor: '#F8FAFC',
              textAlign: 'left',
            }}
          >
            <Stack spacing={1.5}>
              <Box>
                <Typography variant="caption" sx={{ color: '#64748B' }}>
                  {t('employerOnboarding.invitation.company', 'Doanh nghiệp')}
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0F172A' }}>
                  {existingCompany.companyName}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#64748B' }}>
                  {t('employerOnboarding.invitation.role', 'Vai trò')}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#2563EB' }}>
                  {existingCompany.roleName}
                </Typography>
              </Box>
            </Stack>
          </Card>

          <Button
            variant="contained"
            color="primary"
            size="large"
            fullWidth
            disabled={isSaving}
            onClick={handleAcceptInvitation}
            sx={{
              borderRadius: 3,
              py: 1.5,
              fontWeight: 800,
              boxShadow: '0 8px 20px rgba(37, 99, 235, 0.25)',
            }}
          >
            {isSaving ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              t('employerOnboarding.invitation.acceptAndContinue', 'Chấp nhận & Tiếp tục')
            )}
          </Button>
        </Box>
      </OnboardingShell>
    );
  }

  return (
    <OnboardingShell maxWidth="md">
      {/* Stepper Header */}
      <EmployerStepper activeStep={activeStep} steps={steps} />

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
              <StepCompanyProfile
                values={{
                  companyName: formData.companyName,
                  taxCode: formData.taxCode,
                  employeeSize: formData.employeeSize,
                  fieldOperation: formData.fieldOperation,
                  cityId: formData.cityId,
                  districtId: formData.districtId,
                  address: formData.address,
                  websiteUrl: formData.websiteUrl,
                  logoId: formData.logoId,
                  logoUrl: formData.logoUrl,
                }}
                onChange={updateFormField}
                errors={errors}
                citiesList={citiesList}
                employeeSizeOptions={employeeSizeOptions}
              />
            </div>
          </Fade>
        )}

        {activeStep === 1 && (
          <Fade in timeout={300}>
            <div>
              <StepRecruiterProfile
                values={{
                  recruiterName: formData.recruiterName,
                  recruiterTitle: formData.recruiterTitle,
                  recruiterPhone: formData.recruiterPhone,
                  recruiterEmail: formData.recruiterEmail,
                  hiringNeeds: formData.hiringNeeds,
                  description: formData.description,
                }}
                onChange={updateFormField}
                errors={errors}
              />
            </div>
          </Fade>
        )}

        {activeStep === 2 && (
          <Fade in timeout={300}>
            <div>
              <StepVerificationGPKD
                values={{
                  gpkdFileId: formData.gpkdFileId,
                  gpkdFileName: formData.gpkdFileName,
                  gpkdFileUrl: formData.gpkdFileUrl,
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
              <StepEmployerComplete
                formData={formData}
                cityName={selectedCity?.name || ''}
                onPostJob={handlePostJob}
                onViewDashboard={handleViewDashboard}
              />
            </div>
          </Fade>
        )}
      </Box>

      {/* Navigation Actions Footer (Steps 0, 1, 2) */}
      {activeStep < 3 && (
        <>
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
              {t('employerOnboarding.actions.back', 'Quay lại')}
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
                {isSaving
                  ? t('employerOnboarding.actions.saving', 'Đang lưu...')
                  : t('employerOnboarding.actions.next', 'Tiếp theo')}
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
                {isSaving
                  ? t('employerOnboarding.actions.saving', 'Đang lưu...')
                  : t('employerOnboarding.actions.next', 'Tiếp theo')}
              </Button>
            )}

            {activeStep === 2 && (
              <>
                <Button
                  variant="outlined"
                  color="inherit"
                  onClick={() => handleCompleteEmployer(true)}
                  disabled={isSaving || isUploading}
                  sx={{
                    borderRadius: 2.5,
                    px: 2.5,
                    py: 1.25,
                    fontWeight: 600,
                    borderColor: '#CBD5E1',
                    color: '#475569',
                  }}
                >
                  {t('employerOnboarding.actions.skipVerification', 'Bỏ qua & Xác thực sau')}
                </Button>

                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleCompleteEmployer(false)}
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
                    ? t('employerOnboarding.actions.submitting', 'Đang hoàn tất...')
                    : t('employerOnboarding.actions.complete', 'Hoàn thành thiết lập')}
                </Button>
              </>
            )}
          </Stack>
        </Box>

        <Box
          sx={{
            mt: 2.5,
            p: 1.75,
            borderRadius: 2.5,
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            textAlign: 'center',
          }}
        >
          <Typography variant="caption" sx={{ color: '#475569', fontSize: '0.8125rem', lineHeight: 1.6 }}>
            {t('employerOnboarding.consentNotice.text', 'Bằng việc tiếp tục thiết lập, bạn đồng ý với')}{' '}
            <Box
              component="a"
              href="/employer/thoa-thuan-su-dung.html"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ color: '#2563EB', fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
            >
              {t('employerOnboarding.consentNotice.terms', 'Điều khoản sử dụng')}
            </Box>
            ,{' '}
            <Box
              component="a"
              href="/employer/chinh-sach-bao-mat.html"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ color: '#2563EB', fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
            >
              {t('employerOnboarding.consentNotice.privacy', 'Chính sách bảo mật')}
            </Box>{' '}
            {t('employerOnboarding.consentNotice.and', 'và')}{' '}
            <Box
              component="a"
              href="/employer/quy-dinh-dang-tin.html"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ color: '#2563EB', fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
            >
              {t('employerOnboarding.consentNotice.postPolicy', 'Quy định đăng tin')}
            </Box>{' '}
            {t('employerOnboarding.consentNotice.ofInfoHR', 'của InfoHR.')}
          </Typography>
        </Box>
      </>
      )}
    </OnboardingShell>
  );
}

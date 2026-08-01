'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Paper,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  TextField,
  Grid,
  MenuItem,
  Card,
  LinearProgress,
  Avatar,
  Stack,
  Alert,
  Chip
} from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AddTaskIcon from '@mui/icons-material/AddTask';

import tokenService from '@/services/tokenService';
import commonService from '@/services/commonService';
import authService from '@/services/authService';
import { useConfig } from '@/hooks/useConfig';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { getUserInfo, setUserInfo } from '@/redux/userSlice';
import { getSafeRedirectPath } from '@/utils/safeExternalUrl';
import { TabTitle } from '@/utils/generalFunction';

const STEPS = ['Thương hiệu Doanh nghiệp', 'Đại diện Tuyển dụng', 'Xác thực GPKD (Tuỳ chọn)', 'Hoàn tất'];

export default function EmployerOnboardingPage() {
  TabTitle('Quy trình Onboarding Nhà tuyển dụng | InfoHR');
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { allConfig } = useConfig();
  const gpkdFileInputRef = useRef<HTMLInputElement>(null);

  const { currentUser } = useAppSelector((state) => state.user);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Pre-mount Route Protection (Rule 1)
  React.useEffect(() => {
    const checkAuth = async () => {
      const token = tokenService.getAccessTokenFromCookie();
      if (!token) {
        const targetUrl = getSafeRedirectPath('/employer/login?redirect=/onboarding/employer');
        router.replace(targetUrl);
        return;
      }

      let user = currentUser;
      if (!user) {
        try {
          user = await dispatch(getUserInfo()).unwrap();
        } catch {
          const targetUrl = getSafeRedirectPath('/employer/login?redirect=/onboarding/employer');
          router.replace(targetUrl);
          return;
        }
      }
      setCheckingAuth(false);
    };

    void checkAuth();
  }, [currentUser, dispatch, router]);

  // Form state
  const [formData, setFormData] = useState({
    companyName: '',
    taxCode: '',
    companyEmail: '',
    companyPhone: '',
    employeeSize: 2, // 50-200
    fieldOperation: 'Xây dựng & Kiến trúc',
    description: '',
    gpkdFileName: '',
    gpkdFileId: null as number | null,
    recruiterName: '',
    recruiterPhone: ''
  });

  const handleGpkdUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('Dung lượng file GPKD không được vượt quá 10MB.');
      return;
    }

    setUploadingFile(true);
    setErrorMsg('');
    try {
      const res = await commonService.uploadFile(file, 'BUSINESS_LICENSE');
      setFormData((prev) => ({
        ...prev,
        gpkdFileId: res.id,
        gpkdFileName: file.name
      }));
    } catch (err) {
      console.error('GPKD upload failed:', err);
      setErrorMsg('Không thể tải file Giấy phép kinh doanh. Vui lòng thử lại.');
    } finally {
      setUploadingFile(false);
      if (gpkdFileInputRef.current) {
        gpkdFileInputRef.current.value = '';
      }
    }
  };

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};

    if (step === 0) {
      if (!formData.companyName.trim()) {
        errors.companyName = 'Vui lòng nhập Tên doanh nghiệp / Công ty đầy đủ.';
      }
    }

    if (step === 1) {
      if (!formData.recruiterName.trim()) {
        errors.recruiterName = 'Vui lòng nhập Họ tên người phụ trách tuyển dụng.';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = async () => {
    if (!validateStep(activeStep)) return;

    if (activeStep < STEPS.length - 2) {
      setActiveStep((prev) => prev + 1);
      return;
    }

    if (activeStep === STEPS.length - 2) {
      setLoading(true);
      setErrorMsg('');
      try {
        const res = await authService.employerOnboarding({
          companyName: formData.companyName || 'Công ty TNHH mới',
          taxCode: formData.taxCode,
          companyPhone: formData.companyPhone,
          companyEmail: formData.companyEmail,
          employeeSize: Number(formData.employeeSize),
          fieldOperation: formData.fieldOperation,
          description: formData.description,
          gpkdFileId: formData.gpkdFileId,
          recruiterName: formData.recruiterName,
          recruiterPhone: formData.recruiterPhone
        });

        if (res.user) {
          dispatch(setUserInfo(res.user));
        }
        setActiveStep(3);
      } catch (err: unknown) {
        console.error('Employer onboarding error:', err);
        setErrorMsg('Có lỗi xảy ra khi hoàn tất Onboarding. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSkipGpkd = async () => {
    setFormData({ ...formData, gpkdFileId: null, gpkdFileName: '' });
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await authService.employerOnboarding({
        companyName: formData.companyName || 'Công ty TNHH mới',
        taxCode: formData.taxCode,
        companyPhone: formData.companyPhone,
        companyEmail: formData.companyEmail,
        employeeSize: Number(formData.employeeSize),
        fieldOperation: formData.fieldOperation,
        description: formData.description,
        gpkdFileId: null,
        recruiterName: formData.recruiterName,
        recruiterPhone: formData.recruiterPhone
      });

      if (res.user) {
        dispatch(setUserInfo(res.user));
      }
      setActiveStep(3);
    } catch (err: unknown) {
      console.error('Employer onboarding error:', err);
      setErrorMsg('Có lỗi xảy ra khi hoàn tất Onboarding.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleGoToDashboard = () => {
    router.push('/employer/dashboard');
  };

  const handleCreateJob = () => {
    router.push('/employer/job-posts');
  };

  if (checkingAuth) {
    return null;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f0f4fd 0%, #e6eefc 100%)',
        py: 6,
        display: 'flex',
        alignItems: 'center'
      }}
    >
      <Container maxWidth="md">
        <Paper
          elevation={4}
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: 4,
            background: 'rgba(255, 255, 255, 0.96)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(220, 230, 245, 0.8)',
            color: 'text.primary'
          }}
        >
          {/* Header */}
          <Box textAlign="center" mb={4}>
            <Avatar
              sx={{
                width: 64,
                height: 64,
                bgcolor: 'primary.main',
                mx: 'auto',
                mb: 1.5,
                boxShadow: '0 8px 20px rgba(37, 99, 235, 0.25)'
              }}
            >
              <BusinessIcon fontSize="large" />
            </Avatar>
            <Typography variant="h4" fontWeight={700} color="text.primary" gutterBottom>
              Thiết lập Tài khoản Nhà tuyển dụng
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              Hoàn tất thông tin doanh nghiệp để xây dựng thương hiệu tuyển dụng chuyên nghiệp & đăng tin tuyển dụng không giới hạn.
            </Typography>
          </Box>

          {/* Stepper */}
          <Stepper
            activeStep={activeStep}
            alternativeLabel
            sx={{
              mb: 4,
              '& .MuiStepLabel-label': { color: 'text.secondary' },
              '& .MuiStepLabel-label.Mui-active': { color: 'primary.main', fontWeight: 600 },
              '& .MuiStepLabel-label.Mui-completed': { color: 'success.main' }
            }}
          >
            {STEPS.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {loading && <LinearProgress color="primary" sx={{ mb: 3, borderRadius: 1 }} />}
          {errorMsg && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {errorMsg}
            </Alert>
          )}

          {/* Step 1: Company Profile */}
          {activeStep === 0 && (
            <Box>
              <Typography variant="h6" fontWeight={600} mb={3} display="flex" alignItems="center" gap={1} color="primary.main">
                <BusinessIcon /> Thông tin Thương hiệu Doanh nghiệp
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={8}>
                  <TextField
                    fullWidth
                    required
                    label="Tên doanh nghiệp / Công ty đầy đủ"
                    placeholder="VD: Công ty Cổ phần Tập đoàn Square"
                    value={formData.companyName}
                    onChange={(e) => handleFieldChange('companyName', e.target.value)}
                    error={Boolean(fieldErrors.companyName)}
                    helperText={fieldErrors.companyName || 'Nhập tên doanh nghiệp đăng ký kinh doanh'}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Mã số thuế (MST)"
                    placeholder="VD: 0101234567"
                    value={formData.taxCode}
                    onChange={(e) => handleFieldChange('taxCode', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Quy mô nhân sự"
                    value={formData.employeeSize}
                    onChange={(e) => handleFieldChange('employeeSize', Number(e.target.value))}
                  >
                    {(allConfig?.employeeSizeOptions || []).map((sz) => (
                      <MenuItem key={sz.id ?? ''} value={sz.id ?? ''}>{sz.name}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Lĩnh vực hoạt động chính"
                    value={formData.fieldOperation}
                    onChange={(e) => handleFieldChange('fieldOperation', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email liên hệ công ty"
                    value={formData.companyEmail}
                    onChange={(e) => handleFieldChange('companyEmail', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Số điện thoại hotline"
                    value={formData.companyPhone}
                    onChange={(e) => handleFieldChange('companyPhone', e.target.value)}
                  />
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Step 2: Recruiter Info */}
          {activeStep === 1 && (
            <Box>
              <Typography variant="h6" fontWeight={600} mb={3} display="flex" alignItems="center" gap={1} color="primary.main">
                <PersonOutlineIcon /> Thông tin Đại diện Tuyển dụng
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    label="Họ tên người phụ trách tuyển dụng"
                    placeholder="VD: Nguyễn Văn A"
                    value={formData.recruiterName}
                    onChange={(e) => handleFieldChange('recruiterName', e.target.value)}
                    error={Boolean(fieldErrors.recruiterName)}
                    helperText={fieldErrors.recruiterName || ''}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Số điện thoại cá nhân / Zalo"
                    placeholder="VD: 0912345678"
                    value={formData.recruiterPhone}
                    onChange={(e) => setFormData({ ...formData, recruiterPhone: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Mô tả ngắn gọn về môi trường làm việc / Văn hóa công ty"
                    placeholder="Giới thiệu điểm thu hút ứng viên gia nhập công ty bạn..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Step 3: Verification (GPKD) */}
          {activeStep === 2 && (
            <Box textAlign="center">
              <Typography variant="h6" fontWeight={600} mb={2} display="flex" alignItems="center" justifyContent="center" gap={1} color="primary.main">
                <VerifiedUserIcon /> Tải Giấy phép kinh doanh (Xác minh Doanh nghiệp)
              </Typography>

              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                Doanh nghiệp có tích xanh xác thực sẽ thu hút nhiều ứng viên tiềm năng hơn gấp 3 lần.
              </Typography>

              {/* Hidden File Input */}
              <input
                type="file"
                ref={gpkdFileInputRef}
                accept="image/*,.pdf"
                style={{ display: 'none' }}
                onChange={handleGpkdUpload}
              />

              <Card
                variant="outlined"
                onClick={() => gpkdFileInputRef.current?.click()}
                sx={{
                  p: 4,
                  border: '2px dashed',
                  borderColor: 'primary.main',
                  bgcolor: 'rgba(37, 99, 235, 0.04)',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': { bgcolor: 'rgba(37, 99, 235, 0.08)', borderColor: 'primary.dark' }
                }}
              >
                <CloudUploadIcon sx={{ fontSize: 52, color: 'primary.main', mb: 1 }} />
                <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                  Kéo thả file GPKD (Ảnh hoặc PDF) vào đây hoặc bấm để chọn file
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Định dạng hỗ trợ: JPG, PNG, PDF (Dưới 10MB)
                </Typography>

                {formData.gpkdFileName && (
                  <Box mt={2}>
                    <Chip label={`Đã đính kèm: ${formData.gpkdFileName}`} color="primary" onDelete={() => setFormData({ ...formData, gpkdFileName: '', gpkdFileId: null })} />
                  </Box>
                )}
              </Card>

              <Stack direction="row" spacing={2} justifyContent="center" mt={4}>
                <Button variant="text" color="inherit" onClick={handleSkipGpkd}>
                  Bỏ qua & Cập nhật GPKD sau
                </Button>
              </Stack>
            </Box>
          )}

          {/* Step 4: Ready */}
          {activeStep === 3 && (
            <Box textAlign="center" py={3}>
              <CheckCircleOutlineIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
              <Typography variant="h4" fontWeight={700} color="success.main" gutterBottom>
                Onboarding Hoàn tất thành công!
              </Typography>

              <Alert severity="info" sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}>
                Hệ thống hiện tại hỗ trợ Nhà tuyển dụng đăng tin và quản lý ứng viên hoàn toàn <b>miễn phí & thoải mái không giới hạn</b>.
              </Alert>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                <Button variant="contained" color="primary" size="large" onClick={handleCreateJob} startIcon={<AddTaskIcon />}>
                  Đăng tin Tuyển dụng ngay
                </Button>
                <Button variant="outlined" color="primary" size="large" onClick={handleGoToDashboard}>
                  Vào Bảng điều khiển Quản trị
                </Button>
              </Stack>
            </Box>
          )}

          {/* Footer Actions */}
          {activeStep < 3 && (
            <Stack direction="row" justifyContent="space-between" mt={5}>
              <Button disabled={activeStep === 0} onClick={handleBack} variant="outlined" color="inherit">
                Quay lại
              </Button>
              <Button variant="contained" color="primary" onClick={handleNext} size="large">
                {activeStep === STEPS.length - 2 ? 'Hoàn thành thiết lập' : 'Tiếp theo'}
              </Button>
            </Stack>
          )}
        </Paper>
      </Container>
    </Box>
  );
}

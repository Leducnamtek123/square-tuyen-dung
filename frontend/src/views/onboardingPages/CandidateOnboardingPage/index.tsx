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
  Chip,
  Card,
  LinearProgress,
  Avatar,
  Stack,
  Alert,
  Divider,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  InputAdornment,
  IconButton,
  Tooltip,
  CircularProgress
} from '@mui/material';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import SchoolIcon from '@mui/icons-material/School';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import MyLocationIcon from '@mui/icons-material/MyLocation';

import tokenService from '@/services/tokenService';
import authService from '@/services/authService';
import commonService from '@/services/commonService';
import { useConfig } from '@/hooks/useConfig';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { getUserInfo, setUserInfo } from '@/redux/userSlice';
import { getSafeRedirectPath } from '@/utils/safeExternalUrl';
import { TabTitle } from '@/utils/generalFunction';

const STEPS = ['Mục tiêu nghề nghiệp', 'Kinh nghiệm & Kỹ năng', 'Tải CV / Hồ sơ', 'Hoàn tất'];

export default function CandidateOnboardingPage() {
  TabTitle('Quy trình Hướng dẫn Ứng viên | InfoHR');
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { allConfig } = useConfig();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { currentUser } = useAppSelector((state) => state.user);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [careersList, setCareersList] = useState<{ id: number; name: string }[]>([]);
  const [citiesList, setCitiesList] = useState<{ id: number; name: string }[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Pre-mount Route Protection (Rule 1)
  React.useEffect(() => {
    const checkAuth = async () => {
      const token = tokenService.getAccessTokenFromCookie();
      if (!token) {
        const targetUrl = getSafeRedirectPath('/login?redirect=/onboarding/candidate');
        router.replace(targetUrl);
        return;
      }

      let user = currentUser;
      if (!user) {
        try {
          user = await dispatch(getUserInfo()).unwrap();
        } catch {
          const targetUrl = getSafeRedirectPath('/login?redirect=/onboarding/candidate');
          router.replace(targetUrl);
          return;
        }
      }
      setCheckingAuth(false);
    };

    void checkAuth();
  }, [currentUser, dispatch, router]);

  // Form State
  const [formData, setFormData] = useState({
    desiredJobTitle: '',
    careerId: '' as number | string,
    cityId: '' as number | string,
    salaryMin: 10000000,
    salaryMax: 20000000,
    experience: 1,
    academicLevel: 3,
    skillsSummary: '',
    fileId: null as number | null,
    fileName: ''
  });

  React.useEffect(() => {
    if (checkingAuth) return;
    const loadDynamicData = async () => {
      let validCareers = (allConfig?.careerOptions || allConfig?.careers || []) as { id: number; name: string }[];
      let validCities = (allConfig?.cityOptions || allConfig?.cities || []) as { id: number; name: string }[];

      if (!validCareers.length || !validCities.length) {
        try {
          const [cList, ctList] = await Promise.all([
            commonService.getAllCareersSimple({ pageSize: 100 }),
            commonService.getAllCitiesSimple({ pageSize: 100 }),
          ]);
          if (cList?.length) validCareers = cList;
          if (ctList?.length) validCities = ctList;
        } catch (err) {
          console.error('Error fetching onboarding options:', err);
        }
      }

      setCareersList(validCareers);
      setCitiesList(validCities);

      setFormData((prev) => ({
        ...prev,
        careerId: prev.careerId || (validCareers.length > 0 ? validCareers[0].id : ''),
        cityId: prev.cityId || (validCities.length > 0 ? validCities[0].id : '')
      }));
    };
    void loadDynamicData();
  }, [checkingAuth, allConfig]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('Dung lượng file CV không vượt quá 10MB.');
      return;
    }

    setUploadingFile(true);
    setErrorMsg('');
    try {
      const res = await commonService.uploadFile(file, 'CV');
      setFormData((prev) => ({
        ...prev,
        fileId: res.id,
        fileName: file.name
      }));
    } catch (err) {
      console.error('File upload failed:', err);
      setErrorMsg('Không thể tải file CV. Vui lòng thử lại.');
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

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
      if (!formData.desiredJobTitle.trim()) {
        errors.desiredJobTitle = 'Vui lòng nhập vị trí công việc mong muốn.';
      }
      if (!formData.careerId) {
        errors.careerId = 'Vui lòng chọn ngành nghề chính.';
      }
      if (!formData.cityId) {
        errors.cityId = 'Vui lòng chọn địa điểm làm việc mong muốn.';
      }
      if (formData.salaryMin && formData.salaryMax && Number(formData.salaryMin) > Number(formData.salaryMax)) {
        errors.salaryMin = 'Lương tối thiểu không được lớn hơn lương tối đa.';
      }
    }

    if (step === 1) {
      if (formData.experience === undefined || formData.experience === null) {
        errors.experience = 'Vui lòng chọn kinh nghiệm làm việc.';
      }
      if (formData.academicLevel === undefined || formData.academicLevel === null) {
        errors.academicLevel = 'Vui lòng chọn trình độ học vấn.';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = async () => {
    setErrorMsg('');

    if (!validateStep(activeStep)) {
      return;
    }

    if (activeStep < STEPS.length - 2) {
      setActiveStep((prev) => prev + 1);
    } else if (activeStep === STEPS.length - 2) {
      // Complete Onboarding via API
      setLoading(true);
      setErrorMsg('');
      try {
        const res = await authService.candidateOnboarding({
          desiredJobTitle: formData.desiredJobTitle.trim() || 'Chuyên viên',
          careerId: Number(formData.careerId),
          cityId: Number(formData.cityId),
          salaryMin: Number(formData.salaryMin),
          salaryMax: Number(formData.salaryMax),
          experience: Number(formData.experience),
          academicLevel: Number(formData.academicLevel),
          skillsSummary: formData.skillsSummary,
          fileId: formData.fileId
        });

        if (res.user) {
          dispatch(setUserInfo(res.user));
        }
        if (typeof window !== 'undefined') {
          localStorage.setItem('sq_onboarding_done', 'true');
        }
        setActiveStep(3); // Step 4: Success
      } catch (err: unknown) {
        console.error('Candidate onboarding failed:', err);
        setErrorMsg('Không thể hoàn tất onboarding. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBack = () => {
    setErrorMsg('');
    setActiveStep((prev) => prev - 1);
  };

  const handleFinishJobs = () => {
    router.push('/jobs');
  };

  const handleFinishDashboard = () => {
    router.push('/dashboard');
  };

  const selectedCareerName = careersList.find((c) => Number(c.id) === Number(formData.careerId))?.name || 'Tất cả ngành nghề';
  const selectedCityName = citiesList.find((ct) => Number(ct.id) === Number(formData.cityId))?.name || 'Toàn quốc';

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
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".pdf,.doc,.docx"
        style={{ display: 'none' }}
        onChange={handleFileUpload}
      />

      <Container maxWidth="md">
        <Paper
          elevation={4}
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: 4,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(220, 230, 245, 0.8)'
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
                boxShadow: '0 8px 20px rgba(25, 118, 210, 0.25)'
              }}
            >
              <RocketLaunchIcon fontSize="large" />
            </Avatar>
            <Typography variant="h4" fontWeight={700} color="primary.dark" gutterBottom>
              Chào mừng bạn đến với InfoHR!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Chỉ mất 1 phút để thiết lập mục tiêu tìm việc và nhận các cơ hội việc làm phù hợp nhất
            </Typography>
          </Box>

          {/* Stepper */}
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
            {STEPS.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {(loading || uploadingFile) && <LinearProgress sx={{ mb: 3, borderRadius: 1 }} />}
          {errorMsg && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setErrorMsg('')}>
              {errorMsg}
            </Alert>
          )}

          {/* Step 1: Desired Job */}
          {activeStep === 0 && (
            <Box>
              <Typography variant="h6" fontWeight={600} mb={3} display="flex" alignItems="center" gap={1}>
                <WorkOutlineIcon color="primary" /> Vị trí & Nguyện vọng công việc
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    label="Vị trí công việc mong muốn"
                    placeholder="VD: Nhân viên Marketing, Kỹ sư phần mềm, Quản trị Nhân sự..."
                    value={formData.desiredJobTitle}
                    onChange={(e) => handleFieldChange('desiredJobTitle', e.target.value)}
                    error={Boolean(fieldErrors.desiredJobTitle)}
                    helperText={fieldErrors.desiredJobTitle || 'Nhập tên vị trí công việc bạn tìm kiếm'}
                    FormHelperTextProps={{
                      sx: {
                        position: 'relative',
                        zIndex: 2,
                        mt: 0.5,
                        color: fieldErrors.desiredJobTitle ? '#d32f2f' : '#64748b',
                        fontWeight: fieldErrors.desiredJobTitle ? 600 : 400
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required error={Boolean(fieldErrors.careerId)}>
                    <InputLabel id="career-select-label">Ngành nghề chính</InputLabel>
                    <Select
                      labelId="career-select-label"
                      id="career-select-input"
                      name="candidate_career_select_no_autofill"
                      label="Ngành nghề chính"
                      value={formData.careerId}
                      onChange={(e) => handleFieldChange('careerId', Number(e.target.value))}
                      inputProps={{
                        autoComplete: 'new-password',
                        'data-lpignore': 'true',
                        'data-1p-ignore': 'true',
                      }}
                    >
                      {careersList.map((c) => (
                        <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                      ))}
                    </Select>
                    <FormHelperText sx={{ mx: 0, mt: 0.75, color: fieldErrors.careerId ? '#d32f2f' : '#64748b', fontWeight: fieldErrors.careerId ? 600 : 400 }}>
                      {fieldErrors.careerId || 'Chọn ngành nghề thuộc chuyên môn'}
                    </FormHelperText>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required error={Boolean(fieldErrors.cityId)}>
                    <InputLabel id="city-select-label">Địa điểm làm việc mong muốn</InputLabel>
                    <Select
                      labelId="city-select-label"
                      id="city-select-input"
                      name="candidate_city_select_no_autofill"
                      label="Địa điểm làm việc mong muốn"
                      value={formData.cityId}
                      onChange={(e) => handleFieldChange('cityId', Number(e.target.value))}
                      inputProps={{
                        autoComplete: 'new-password',
                        'data-lpignore': 'true',
                        'data-1p-ignore': 'true',
                      }}
                    >
                      {citiesList.length > 0 ? (
                        citiesList.map((ct) => (
                          <MenuItem key={ct.id} value={ct.id}>{ct.name}</MenuItem>
                        ))
                      ) : (
                        <MenuItem value="" disabled>Đang tải danh sách địa điểm...</MenuItem>
                      )}
                    </Select>
                    <FormHelperText sx={{ mx: 0, mt: 0.75, color: fieldErrors.cityId ? '#d32f2f' : '#64748b', fontWeight: fieldErrors.cityId ? 600 : 400 }}>
                      {fieldErrors.cityId || 'Chọn thành phố bạn mong muốn làm việc'}
                    </FormHelperText>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Mức lương tối thiểu (VNĐ/tháng)"
                    type="number"
                    value={formData.salaryMin}
                    onChange={(e) => handleFieldChange('salaryMin', Number(e.target.value))}
                    error={Boolean(fieldErrors.salaryMin)}
                    helperText={fieldErrors.salaryMin || ''}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Mức lương tối đa (VNĐ/tháng)"
                    type="number"
                    value={formData.salaryMax}
                    onChange={(e) => handleFieldChange('salaryMax', Number(e.target.value))}
                  />
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Step 2: Experience & Skills */}
          {activeStep === 1 && (
            <Box>
              <Typography variant="h6" fontWeight={600} mb={3} display="flex" alignItems="center" gap={1}>
                <SchoolIcon color="primary" /> Kinh nghiệm & Trình độ
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Kinh nghiệm làm việc"
                    value={formData.experience}
                    onChange={(e) => handleFieldChange('experience', Number(e.target.value))}
                    error={Boolean(fieldErrors.experience)}
                    helperText={fieldErrors.experience || ''}
                  >
                    {(allConfig?.experienceOptions || []).map((exp) => (
                      <MenuItem key={exp.id ?? ''} value={exp.id ?? ''}>{exp.name}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Trình độ học vấn"
                    value={formData.academicLevel}
                    onChange={(e) => handleFieldChange('academicLevel', Number(e.target.value))}
                    error={Boolean(fieldErrors.academicLevel)}
                    helperText={fieldErrors.academicLevel || ''}
                  >
                    {(allConfig?.academicLevelOptions || []).map((ac) => (
                      <MenuItem key={ac.id ?? ''} value={ac.id ?? ''}>{ac.name}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Tóm tắt Kỹ năng thế mạnh"
                    placeholder="Liệt kê các kỹ năng chính của bạn (VD: Giao tiếp, Tiếng Anh B2, Photoshop, Python...)"
                    value={formData.skillsSummary}
                    onChange={(e) => setFormData({ ...formData, skillsSummary: e.target.value })}
                  />
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Step 3: Resume / Upload */}
          {activeStep === 2 && (
            <Box textAlign="center">
              <Typography variant="h6" fontWeight={600} mb={3} display="flex" alignItems="center" justifyContent="center" gap={1}>
                <DescriptionIcon color="primary" /> Tải CV hoặc Tạo hồ sơ nhanh
              </Typography>

              <Card
                variant="outlined"
                onClick={() => fileInputRef.current?.click()}
                sx={{
                  p: 4,
                  border: '2px dashed #90caf9',
                  bgcolor: '#f8faff',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': { bgcolor: '#f0f7ff', borderColor: '#1976d2', transform: 'scale(1.01)' }
                }}
              >
                <CloudUploadIcon sx={{ fontSize: 52, color: 'primary.main', mb: 1 }} />
                <Typography variant="subtitle1" fontWeight={600}>
                  Kéo thả file CV của bạn vào đây hoặc bấm để chọn file
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                  Hỗ trợ định dạng PDF, DOC, DOCX (Dưới 10MB)
                </Typography>

                {formData.fileName ? (
                  <Box mt={2}>
                    <Chip
                      icon={<InsertDriveFileIcon />}
                      label={`CV đã chọn: ${formData.fileName}`}
                      color="success"
                      onDelete={(e) => {
                        e.stopPropagation();
                        setFormData({ ...formData, fileName: '', fileId: null });
                      }}
                    />
                  </Box>
                ) : (
                  <Button variant="outlined" size="small" sx={{ mt: 1 }}>
                    Chọn tệp từ máy tính
                  </Button>
                )}
              </Card>

              <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
                * Bạn có thể nhấn <strong>"Hoàn thành Onboarding"</strong> để tiếp tục kể cả khi chưa có file CV đính kèm.
              </Typography>
            </Box>
          )}

          {/* Step 4: Complete */}
          {activeStep === 3 && (
            <Box textAlign="center" py={2}>
              <CheckCircleOutlineIcon sx={{ fontSize: 72, color: 'success.main', mb: 1 }} />
              <Typography variant="h5" fontWeight={700} color="success.dark" gutterBottom>
                Chúc mừng! Hồ sơ Onboarding của bạn đã hoàn tất!
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 520, mx: 'auto', mb: 3 }}>
                Hệ thống đã lưu thành công các thông tin nguyện vọng và sẵn sàng tự động đề xuất việc làm phù hợp cho bạn.
              </Typography>

              {/* Data Summary Card */}
              <Card variant="outlined" sx={{ p: 3, mb: 4, textAlign: 'left', bgcolor: '#f8fafc', borderRadius: 3 }}>
                <Typography variant="subtitle2" color="primary" fontWeight={700} mb={2} textTransform="uppercase">
                  Tóm tắt mục tiêu công việc đã lưu:
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <WorkOutlineIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        <strong>Vị trí:</strong> {formData.desiredJobTitle || 'Chưa cập nhật'}
                      </Typography>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <BusinessCenterIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        <strong>Ngành nghề:</strong> {selectedCareerName}
                      </Typography>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <LocationOnIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        <strong>Địa điểm:</strong> {selectedCityName}
                      </Typography>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <AttachMoneyIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        <strong>Mức lương:</strong> {formData.salaryMin.toLocaleString('vi-VN')} - {formData.salaryMax.toLocaleString('vi-VN')} VNĐ
                      </Typography>
                    </Stack>
                  </Grid>
                  {formData.fileName && (
                    <Grid item xs={12}>
                      <Divider sx={{ my: 1 }} />
                      <Stack direction="row" spacing={1} alignItems="center">
                        <InsertDriveFileIcon fontSize="small" color="success" />
                        <Typography variant="body2" color="success.main" fontWeight={600}>
                          CV đã đính kèm: {formData.fileName}
                        </Typography>
                      </Stack>
                    </Grid>
                  )}
                </Grid>
              </Card>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={handleFinishJobs}
                  sx={{ borderRadius: 3, px: 4, py: 1.5, fontWeight: 700 }}
                >
                  Khám phá Việc làm Phù hợp ngay
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  size="large"
                  onClick={handleFinishDashboard}
                  sx={{ borderRadius: 3, px: 4, py: 1.5 }}
                >
                  Trang cá nhân của tôi
                </Button>
              </Stack>
            </Box>
          )}

          {/* Footer Actions */}
          {activeStep < 3 && (
            <Stack direction="row" justifyContent="space-between" mt={5}>
              <Button disabled={activeStep === 0} onClick={handleBack} variant="outlined">
                Quay lại
              </Button>
              <Button variant="contained" onClick={handleNext} size="large" disabled={loading || uploadingFile}>
                {activeStep === STEPS.length - 2 ? 'Hoàn thành Onboarding' : 'Tiếp theo'}
              </Button>
            </Stack>
          )}
        </Paper>
      </Container>
    </Box>
  );
}

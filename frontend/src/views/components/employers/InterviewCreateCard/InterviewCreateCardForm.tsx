import React from 'react';
import { Box, Button, Chip, Paper, TextField, Typography, InputAdornment, Divider, MenuItem, alpha, type Theme } from '@mui/material';
import { Grid2 as Grid } from '@mui/material';
import { Controller, type Control, type FieldErrors, type UseFormHandleSubmit } from 'react-hook-form';
import EventIcon from '@mui/icons-material/Event';
import WorkIcon from '@mui/icons-material/Work';
import PersonIcon from '@mui/icons-material/Person';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import WallpaperOutlinedIcon from '@mui/icons-material/WallpaperOutlined';
import SpeedOutlinedIcon from '@mui/icons-material/SpeedOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import type { FormValues } from './types';
import type { JobPostActivity, Question, QuestionGroup, VoiceProfile } from '@/types/models';
import type { TFunction } from 'i18next';
import InterviewCreateCardQuestionSection from './InterviewCreateCardQuestionSection';
import { ProductTourTrigger } from '@/components/Features/ProductTour';

type Props = {
  title?: string;
  sessionId?: string | number;
  t: TFunction;
  theme: Theme;
  inputSx: Record<string, unknown>;
  control: Control<FormValues>;
  errors: FieldErrors<FormValues>;
  handleSubmit: UseFormHandleSubmit<FormValues>;
  onSubmit: (data: FormValues) => Promise<void>;
  jobs: Array<{ id: string | number; jobName?: string }>;
  questions: Question[];
  questionGroups: QuestionGroup[];
  candidates: JobPostActivity[];
  voiceProfiles: VoiceProfile[];
  isLoadingJobs: boolean;
  isLoadingCandidates: boolean;
  isLoadingVoiceProfiles: boolean;
  isInterviewMutating: boolean;
  isStartingMock?: boolean;
  selectedJobPostId: string | number;
  selectedQuestionsCount: number;
  onCancel: () => void;
  onJobPostChange: (value: string | number) => void;
  onQuestionGroupChange: (value: string | number) => void;
  onOpenAddQuestion: () => void;
  onOpenEditQuestion: () => void;
  onTestMockInterview?: () => void;
};

const InterviewCreateCardForm = ({
  title,
  sessionId,
  t,
  theme,
  inputSx,
  control,
  errors,
  handleSubmit,
  onSubmit,
  jobs,
  questionGroups,
  questions,
  candidates,
  voiceProfiles,
  isLoadingJobs,
  isLoadingCandidates,
  isLoadingVoiceProfiles,
  isInterviewMutating,
  isStartingMock,
  selectedJobPostId,
  selectedQuestionsCount,
  onCancel,
  onJobPostChange,
  onQuestionGroupChange,
  onOpenAddQuestion,
  onOpenEditQuestion,
  onTestMockInterview,
}: Props) => {
  const getCandidateUserId = React.useCallback((candidate: JobPostActivity) => {
    return candidate.userId ?? candidate.userDict?.id ?? null;
  }, []);

  const getCandidateLabel = React.useCallback((candidate: JobPostActivity) => {
    const name = candidate.userDict?.fullName || candidate.fullName || '';
    const email = candidate.userDict?.email || candidate.email || '';
    return [name, email].filter(Boolean).join(' - ');
  }, []);

  const isDefaultVoiceProfile = React.useCallback((profile: VoiceProfile) => {
    return Boolean(profile.grants?.some((grant) => grant.isDefault ?? grant.is_default));
  }, []);

  const hasSelectValue = React.useCallback((value: unknown) => value !== '' && value != null, []);

  const jobPostSlotProps = React.useMemo(() => ({
    input: {
      startAdornment: (
        <InputAdornment position="start">
          <WorkIcon sx={{ fontSize: 20, color: 'primary.main' }} />
        </InputAdornment>
      ),
    },
    inputLabel: { sx: { fontWeight: 600 } },
  }), []);

  const candidateSlotProps = React.useMemo(() => ({
    input: {
      startAdornment: (
        <InputAdornment position="start">
          <PersonIcon sx={{ fontSize: 20, color: 'secondary.main' }} />
        </InputAdornment>
      ),
    },
    inputLabel: { sx: { fontWeight: 600 } },
  }), []);

  const voiceProfileSlotProps = React.useMemo(() => ({
    input: {
      startAdornment: (
        <InputAdornment position="start">
          <RecordVoiceOverIcon sx={{ fontSize: 20, color: 'success.main' }} />
        </InputAdornment>
      ),
    },
    inputLabel: { sx: { fontWeight: 600 } },
  }), []);

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 3, md: 5 },
        borderRadius: 4,
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: (muiTheme) => muiTheme.customShadows?.z1,
        bgcolor: 'background.paper',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ p: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                bgcolor: 'primary.extralight',
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: (muiTheme) => alpha(muiTheme.palette.primary.main, 0.1),
                mr: 2.5,
              }}
            >
              <EventIcon sx={{ fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 900, color: 'text.primary', letterSpacing: '-1px' }}>
                {title || (sessionId ? t('interview:interviewCreateCard.title.editOnlineInterview') : t('interview:interviewCreateCard.title.scheduleOnlineInterview'))}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mt: 0.5, opacity: 0.8 }}>
                {t('interview:interviewCreateCard.description.schedulingHelper')}
              </Typography>
            </Box>
          </Box>
          <ProductTourTrigger tourKey="employer_interview_create" variant="chip" label="Hướng dẫn tạo phỏng vấn" />
        </Box>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={5}>
            <Grid size={12}>
              <Divider sx={{ mb: 1, borderStyle: 'dashed' }}>
                <Chip
                  label={t('interview:interviewCreateCard.label.basicInfo').toUpperCase()}
                  size="small"
                  sx={{ fontWeight: 900, bgcolor: 'background.neutral', color: 'text.secondary', letterSpacing: 1.5, px: 2 }}
                />
              </Divider>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }} data-tour="interview-create-job">
              <Controller
                name="job_post"
                control={control}
                rules={{ required: t('interview:interviewCreateCard.validation.selectJobPost') }}
                render={({ field }) => {
                  const jobValueHasOption = jobs.some((job) => String(job.id) === String(field.value));
                  const shouldRenderSelectedJobFallback = hasSelectValue(field.value) && !jobValueHasOption;

                  return (
                    <TextField
                      {...field}
                      onChange={(e) => onJobPostChange(e.target.value)}
                      select
                      fullWidth
                      label={t('interview:interviewCreateCard.label.selectjobpost')}
                      error={!!errors.job_post}
                      helperText={errors.job_post?.message}
                      disabled={isLoadingJobs}
                      sx={inputSx}
                      slotProps={jobPostSlotProps}
                    >
                      {shouldRenderSelectedJobFallback ? (
                        <MenuItem disabled value={field.value} sx={{ fontWeight: 600 }}>
                          <em>
                            {isLoadingJobs
                              ? t('interview:interviewCreateCard.loadingSelectedJobPost')
                              : t('interview:interviewCreateCard.missingSelectedJobPost', { id: field.value })}
                          </em>
                        </MenuItem>
                      ) : null}
                      {jobs.map((job) => (
                        <MenuItem key={job.id} value={job.id} sx={{ fontWeight: 600 }}>
                          {job.jobName}
                        </MenuItem>
                      ))}
                    </TextField>
                  );
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }} data-tour="interview-create-candidates">
              <Controller
                name="candidate"
                control={control}
                rules={{ required: t('interview:interviewCreateCard.validation.selectCandidate') }}
                render={({ field }) => {
                  const candidateValueHasOption = candidates.some((candidate) => {
                    const candidateUserId = getCandidateUserId(candidate);
                    return candidateUserId != null && String(candidateUserId) === String(field.value);
                  });
                  const shouldRenderSelectedCandidateFallback = hasSelectValue(field.value) && !candidateValueHasOption;

                  return (
                    <TextField
                      {...field}
                      select
                      fullWidth
                      label={t('interview:interviewCreateCard.label.selectcandidate')}
                      disabled={!selectedJobPostId || isLoadingCandidates}
                      error={!!errors.candidate}
                      helperText={errors.candidate?.message}
                      sx={inputSx}
                      slotProps={candidateSlotProps}
                    >
                      {shouldRenderSelectedCandidateFallback ? (
                        <MenuItem disabled value={field.value} sx={{ fontWeight: 600 }}>
                          <em>
                            {isLoadingCandidates
                              ? t('interview:interviewCreateCard.loadingSelectedCandidate')
                              : t('interview:interviewCreateCard.missingSelectedCandidate', { id: field.value })}
                          </em>
                        </MenuItem>
                      ) : null}
                      {candidates.length === 0 && !isLoadingCandidates && selectedJobPostId ? (
                        <MenuItem disabled value="">
                          <em>{t('interview:interviewCreateCard.noCandidates')}</em>
                        </MenuItem>
                      ) : null}
                      {candidates.map((candidate) => {
                        const candidateUserId = getCandidateUserId(candidate);
                        if (candidateUserId == null) return null;

                        return (
                          <MenuItem key={candidateUserId} value={candidateUserId} sx={{ fontWeight: 600 }}>
                            {getCandidateLabel(candidate)}
                          </MenuItem>
                        );
                      })}
                    </TextField>
                  );
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }} data-tour="interview-create-agent">
              <Controller
                name="voice_profile"
                control={control}
                render={({ field }) => (
                  <TextField
                    name={field.name}
                    inputRef={field.ref}
                    onBlur={field.onBlur}
                    value={field.value || 'auto'}
                    onChange={(e) => field.onChange(e.target.value === 'auto' ? '' : e.target.value)}
                    select
                    fullWidth
                    label={t('interview:interviewCreateCard.label.aiVoice')}
                    disabled={isLoadingVoiceProfiles}
                    helperText={t('interview:interviewCreateCard.helperText.voiceProfileAuto')}
                    sx={inputSx}
                    slotProps={voiceProfileSlotProps}
                  >
                    <MenuItem value="auto" sx={{ fontWeight: 600 }}>
                      <em>{t('interview:interviewCreateCard.label.autoDefaultVoice')}</em>
                    </MenuItem>
                    {voiceProfiles.map((profile) => (
                      <MenuItem key={profile.id} value={profile.id} sx={{ fontWeight: 600 }}>
                        {profile.name}{isDefaultVoiceProfile(profile) ? ` (${t('interview:interviewCreateCard.label.defaultVoiceSuffix')})` : ''}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>

            <Grid size={12}>
              <Divider sx={{ mb: 1, borderStyle: 'dashed' }}>
                <Chip
                  label="CẤU HÌNH TRỢ LÝ & KHÔNG GIAN AI"
                  size="small"
                  sx={{ fontWeight: 900, bgcolor: 'background.neutral', color: 'text.secondary', letterSpacing: 1.5, px: 2 }}
                />
              </Divider>
            </Grid>

            {/* AI Character Presets */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="ai_avatar_id"
                control={control}
                render={({ field }) => (
                  <TextField
                    name={field.name}
                    inputRef={field.ref}
                    onBlur={field.onBlur}
                    onChange={field.onChange}
                    select
                    fullWidth
                    label="Mẫu nhân vật AI phỏng vấn"
                    sx={inputSx}
                    value={field.value || 'ly_3d'}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <SmartToyOutlinedIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                          </InputAdornment>
                        ),
                      },
                      inputLabel: { sx: { fontWeight: 600 } },
                    }}
                    helperText="Chọn hình tượng Trợ lý AI tương tác với ứng viên"
                  >
                    <MenuItem value="ly_3d" sx={{ fontWeight: 600 }}>
                      Trợ lý AI Ly - Phong cách 3D chuẩn mực
                    </MenuItem>
                    <MenuItem value="male_exec" sx={{ fontWeight: 600 }}>
                      Chuyên viên Nam - Phong cách công sở đĩnh đạc
                    </MenuItem>
                    <MenuItem value="female_pro" sx={{ fontWeight: 600 }}>
                      Chuyên viên Nữ - Phong cách chuyên nghiệp hiện đại
                    </MenuItem>
                    <MenuItem value="custom" sx={{ fontWeight: 600 }}>
                      Tùy chỉnh tải ảnh nhân vật AI
                    </MenuItem>
                  </TextField>
                )}
              />
            </Grid>

            {/* Studio Backdrop Presets */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="avatar_backdrop"
                control={control}
                render={({ field }) => (
                  <TextField
                    name={field.name}
                    inputRef={field.ref}
                    onBlur={field.onBlur}
                    onChange={field.onChange}
                    select
                    fullWidth
                    label="Không gian phòng phỏng vấn AI"
                    sx={inputSx}
                    value={field.value || 'modern_office'}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <WallpaperOutlinedIcon sx={{ fontSize: 20, color: 'secondary.main' }} />
                          </InputAdornment>
                        ),
                      },
                      inputLabel: { sx: { fontWeight: 600 } },
                    }}
                    helperText="Bối cảnh studio phía sau AI, thay thế nền trắng mặc định"
                  >
                    <MenuItem value="modern_office" sx={{ fontWeight: 600 }}>
                      Văn phòng hiện đại ban ngày
                    </MenuItem>
                    <MenuItem value="executive_boardroom" sx={{ fontWeight: 600 }}>
                      Phòng hội đồng điều hành cao cấp
                    </MenuItem>
                    <MenuItem value="warm_studio" sx={{ fontWeight: 600 }}>
                      Studio sáng tạo ấm áp
                    </MenuItem>
                    <MenuItem value="tech_minimal" sx={{ fontWeight: 600 }}>
                      Không gian công nghệ tối giản
                    </MenuItem>
                    <MenuItem value="custom" sx={{ fontWeight: 600 }}>
                      Tùy chỉnh ảnh nền không gian
                    </MenuItem>
                  </TextField>
                )}
              />
            </Grid>

            {/* Custom AI Avatar Image Upload / URL */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="avatar_image_url"
                control={control}
                render={({ field }) => (
                  <Box>
                    <TextField
                      name={field.name}
                      inputRef={field.ref}
                      onBlur={field.onBlur}
                      onChange={field.onChange}
                      fullWidth
                      label="Ảnh đại diện nhân vật AI tùy chỉnh"
                      placeholder="Nhập link ảnh hoặc bấm Tải tệp"
                      value={field.value || ''}
                      sx={inputSx}
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <SmartToyOutlinedIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <Button
                                component="label"
                                size="small"
                                variant="text"
                                sx={{ minWidth: 'auto', p: 0.5, fontWeight: 700, fontSize: '0.75rem', textTransform: 'none' }}
                              >
                                Tải tệp
                                <input
                                  type="file"
                                  hidden
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onload = (ev) => {
                                        field.onChange(ev.target?.result as string);
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                />
                              </Button>
                            </InputAdornment>
                          ),
                        },
                        inputLabel: { sx: { fontWeight: 600 } },
                      }}
                      helperText="Nhập đường dẫn trực tiếp hoặc tải tệp ảnh từ máy tính"
                    />
                    {field.value ? (
                      <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box
                          component="img"
                          src={field.value}
                          alt="AI Avatar Preview"
                          sx={{ width: 40, height: 40, borderRadius: '8px', objectFit: 'contain', border: '1px solid #e2e8f0', bgcolor: '#f8fafc' }}
                        />
                        <Button
                          size="small"
                          color="error"
                          onClick={() => field.onChange('')}
                          sx={{ textTransform: 'none', fontSize: '0.75rem', fontWeight: 600 }}
                        >
                          Xóa ảnh tùy chỉnh
                        </Button>
                      </Box>
                    ) : null}
                  </Box>
                )}
              />
            </Grid>

            {/* Custom Backdrop Background Image Upload / URL */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="avatar_background_url"
                control={control}
                render={({ field }) => (
                  <Box>
                    <TextField
                      name={field.name}
                      inputRef={field.ref}
                      onBlur={field.onBlur}
                      onChange={field.onChange}
                      fullWidth
                      label="Ảnh nền không gian phòng phỏng vấn"
                      placeholder="Nhập link ảnh nền hoặc bấm Tải tệp"
                      value={field.value || ''}
                      sx={inputSx}
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <WallpaperOutlinedIcon sx={{ fontSize: 20, color: 'secondary.main' }} />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <Button
                                component="label"
                                size="small"
                                variant="text"
                                sx={{ minWidth: 'auto', p: 0.5, fontWeight: 700, fontSize: '0.75rem', textTransform: 'none' }}
                              >
                                Tải tệp
                                <input
                                  type="file"
                                  hidden
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onload = (ev) => {
                                        field.onChange(ev.target?.result as string);
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                />
                              </Button>
                            </InputAdornment>
                          ),
                        },
                        inputLabel: { sx: { fontWeight: 600 } },
                      }}
                      helperText="Ảnh nền thực tế hoặc studio để thay thế nền trắng"
                    />
                    {field.value ? (
                      <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box
                          component="img"
                          src={field.value}
                          alt="Studio Backdrop Preview"
                          sx={{ width: 60, height: 40, borderRadius: '8px', objectFit: 'cover', border: '1px solid #e2e8f0' }}
                        />
                        <Button
                          size="small"
                          color="error"
                          onClick={() => field.onChange('')}
                          sx={{ textTransform: 'none', fontSize: '0.75rem', fontWeight: 600 }}
                        >
                          Xóa ảnh nền
                        </Button>
                      </Box>
                    ) : null}
                  </Box>
                )}
              />
            </Grid>

            {/* Assistant Name */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Controller
                name="interviewer_name"
                control={control}
                render={({ field }) => (
                  <TextField
                    name={field.name}
                    inputRef={field.ref}
                    onBlur={field.onBlur}
                    onChange={field.onChange}
                    fullWidth
                    label="Tên gọi Trợ lý AI"
                    placeholder="Trợ lý AI Ly"
                    value={field.value || 'Trợ lý AI Ly'}
                    sx={inputSx}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <BadgeOutlinedIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                          </InputAdornment>
                        ),
                      },
                      inputLabel: { sx: { fontWeight: 600 } },
                    }}
                    helperText="Tên hiển thị với ứng viên trong phiên phỏng vấn"
                  />
                )}
              />
            </Grid>

            {/* AI Voice Selection */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Controller
                name="ai_voice"
                control={control}
                render={({ field }) => (
                  <TextField
                    name={field.name}
                    inputRef={field.ref}
                    onBlur={field.onBlur}
                    onChange={field.onChange}
                    select
                    fullWidth
                    label="Chất giọng Trợ lý AI"
                    value={field.value || 'Trúc Ly'}
                    sx={inputSx}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <RecordVoiceOverIcon sx={{ fontSize: 20, color: 'success.main' }} />
                          </InputAdornment>
                        ),
                      },
                      inputLabel: { sx: { fontWeight: 600 } },
                    }}
                    helperText="Giọng phát âm câu hỏi tiếng Việt tự nhiên"
                  >
                    <MenuItem value="Trúc Ly" sx={{ fontWeight: 600 }}>
                      Trúc Ly - Giọng nữ miền Bắc truyền cảm
                    </MenuItem>
                    <MenuItem value="Mạnh Dũng" sx={{ fontWeight: 600 }}>
                      Mạnh Dũng - Giọng nam miền Bắc đĩnh đạc
                    </MenuItem>
                    <MenuItem value="Minh Triết" sx={{ fontWeight: 600 }}>
                      Minh Triết - Giọng nam miền Nam phong độ
                    </MenuItem>
                    <MenuItem value="Quang Sơn" sx={{ fontWeight: 600 }}>
                      Quang Sơn - Giọng nam miền Trung ấm áp
                    </MenuItem>
                    <MenuItem value="Thùy Dung" sx={{ fontWeight: 600 }}>
                      Thùy Dung - Giọng nữ miền Nam thanh lịch
                    </MenuItem>
                    <MenuItem value="Ngọc Trân" sx={{ fontWeight: 600 }}>
                      Ngọc Trân - Giọng nữ miền Trung dịu dàng
                    </MenuItem>
                    <MenuItem value="vi-VN-Standard-A" sx={{ display: 'none' }}>
                      Trúc Ly
                    </MenuItem>
                    <MenuItem value="vi-VN-Standard-B" sx={{ display: 'none' }}>
                      Mạnh Dũng
                    </MenuItem>
                    <MenuItem value="vi-VN-Standard-C" sx={{ display: 'none' }}>
                      Thùy Dung
                    </MenuItem>
                    <MenuItem value="vi-VN-Standard-D" sx={{ display: 'none' }}>
                      Quang Sơn
                    </MenuItem>
                  </TextField>
                )}
              />
            </Grid>

            {/* AI Speed Selection */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Controller
                name="ai_speed"
                control={control}
                render={({ field }) => (
                  <TextField
                    name={field.name}
                    inputRef={field.ref}
                    onBlur={field.onBlur}
                    select
                    fullWidth
                    label="Tốc độ phát biểu AI"
                    value={field.value ?? 1.0}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    sx={inputSx}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <SpeedOutlinedIcon sx={{ fontSize: 20, color: 'warning.main' }} />
                          </InputAdornment>
                        ),
                      },
                      inputLabel: { sx: { fontWeight: 600 } },
                    }}
                    helperText="Điều chỉnh nhịp điệu phát âm phù hợp"
                  >
                    <MenuItem value={0.9} sx={{ fontWeight: 600 }}>
                      0.9x - Chậm rãi dễ nghe
                    </MenuItem>
                    <MenuItem value={1.0} sx={{ fontWeight: 600 }}>
                      1.0x - Tiêu chuẩn tự nhiên
                    </MenuItem>
                    <MenuItem value={1.1} sx={{ fontWeight: 600 }}>
                      1.1x - Nhanh nhẹn lưu loát
                    </MenuItem>
                  </TextField>
                )}
              />
            </Grid>

            <InterviewCreateCardQuestionSection
              t={t}
              theme={theme}
              control={control}
              errors={errors}
              inputSx={inputSx}
              questionGroups={questionGroups}
              questions={questions}
              selectedJobPostId={selectedJobPostId}
              selectedQuestionsCount={selectedQuestionsCount}
              isInterviewMutating={isInterviewMutating}
              isStartingMock={isStartingMock}
              sessionId={sessionId}
              onCancel={onCancel}
              onOpenAddQuestion={onOpenAddQuestion}
              onOpenEditQuestion={onOpenEditQuestion}
              onQuestionGroupChange={onQuestionGroupChange}
              onTestMockInterview={onTestMockInterview}
            />
          </Grid>
        </form>
      </Box>
    </Paper>
  );
};

export default InterviewCreateCardForm;

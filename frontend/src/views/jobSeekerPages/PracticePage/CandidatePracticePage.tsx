'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Box,
  Card,
  Typography,
  Button,
  Avatar,
  Chip,
  CircularProgress,
  Stack,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  InputAdornment,
  Collapse,
} from '@mui/material';
import { Grid2 as Grid } from '@mui/material';
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined';
import VideoCameraFrontIcon from '@mui/icons-material/VideoCameraFront';
import SearchIcon from '@mui/icons-material/Search';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import VerifiedIcon from '@mui/icons-material/Verified';
import BusinessIcon from '@mui/icons-material/Business';
import TuneIcon from '@mui/icons-material/Tune';
import { toast } from 'sonner';

import { useAppSelector } from '@/redux/hooks';
import { useResumes } from '@/views/components/jobSeekers/hooks/useJobSeekerQueries';
import commonService from '@/services/commonService';
import { interviewService } from '@/services/interviewService';
import {
  QuestionBankItem,
  CompanyQuestionSet,
  CreateMockSessionPayload,
  Career,
} from '@/types/models';
import QuestionDetailModal from './components/QuestionDetailModal';
import CompanyQuestionSetModal from './components/CompanyQuestionSetModal';
import { ProductTourTrigger, useTourAutoStart } from '@/components/Features/ProductTour';

const SENIORITY_OPTIONS = [
  { value: '', label: 'Tất cả cấp bậc' },
  { value: 'junior', label: 'Cấp độ Fresher và Junior' },
  { value: 'middle', label: 'Cấp độ Middle' },
  { value: 'senior', label: 'Cấp độ Senior và Quản lý' },
];

export const CandidatePracticePage: React.FC = () => {
  const router = useRouter();

  // Auto-start practice room tour on first visit
  useTourAutoStart('practice_room', 800);

  // User Profile & Resumes Integration (Zero Hardcode)
  const { currentUser } = useAppSelector((state) => state.user);
  const profileId = currentUser?.jobSeekerProfile?.id || currentUser?.jobSeekerProfileId;
  const { data: resumes } = useResumes(profileId ? String(profileId) : undefined);

  // Dynamic system careers list
  const [careers, setCareers] = useState<Career[]>([]);
  const [_isCareersLoading, setIsCareersLoading] = useState<boolean>(true);

  // Company Question Sets state (Primary)
  const [questionSets, setQuestionSets] = useState<CompanyQuestionSet[]>([]);
  const [isSetsLoading, setIsSetsLoading] = useState<boolean>(true);
  const [activeModalSet, setActiveModalSet] = useState<CompanyQuestionSet | null>(null);

  // Question bank items state (Secondary modal inspection)
  const [_questions, setQuestions] = useState<QuestionBankItem[]>([]);
  const [activeModalQuestion, setActiveModalQuestion] = useState<QuestionBankItem | null>(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCareerId, setSelectedCareerId] = useState<number | null>(null);
  const [selectedSeniority, setSelectedSeniority] = useState<string>('');
  const [isStartingMock, setIsStartingMock] = useState<boolean>(false);

  // Custom Studio Accordion
  const [showCustomStudio, setShowCustomStudio] = useState<boolean>(false);
  const [mockJobTitle, setMockJobTitle] = useState<string>('');
  const [mockCareerId, setMockCareerId] = useState<number | null>(null);
  const [mockSeniority, setMockSeniority] = useState<string>('middle');
  const [mockCount, setMockCount] = useState<number>(5);
  const [isPrefilledFromResume, setIsPrefilledFromResume] = useState<boolean>(false);

  // 1. Fetch system careers dynamically
  useEffect(() => {
    let isMounted = true;
    const loadCareers = async () => {
      try {
        const data = await commonService.getAllCareersSimple({ pageSize: 200 });
        if (isMounted) {
          const validCareers = Array.isArray(data) ? data.filter((c) => Boolean(c && c.name)) : [];
          setCareers(validCareers);
        }
      } catch (err) {
        console.error('Failed to load dynamic careers:', err);
      } finally {
        if (isMounted) setIsCareersLoading(false);
      }
    };
    void loadCareers();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Prefill target position and career from candidate resume if available
  useEffect(() => {
    if (resumes && resumes.length > 0 && !isPrefilledFromResume) {
      const primaryResume = resumes.find((r) => r.isActive || (r as any).is_active) || resumes[0];
      if (primaryResume) {
        if (primaryResume.title && !mockJobTitle) {
          setMockJobTitle(primaryResume.title);
          setIsPrefilledFromResume(true);
        }
        if (primaryResume.career?.id && mockCareerId === null) {
          const resumeCareerId = primaryResume.career.id;
          setMockCareerId(resumeCareerId);
          setSelectedCareerId(resumeCareerId);
        }
      }
    }
  }, [resumes, isPrefilledFromResume, mockJobTitle, mockCareerId]);

  // 3. Fetch Company Question Sets
  const fetchQuestionSets = async () => {
    setIsSetsLoading(true);
    try {
      const data = await interviewService.getCompanyQuestionSets({
        search: searchQuery.trim() || undefined,
        career_id: selectedCareerId || undefined,
        seniority: selectedSeniority || undefined,
      });
      setQuestionSets(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load company question sets:', err);
      toast.error('Không thể tải danh sách bộ câu hỏi. Vui lòng thử lại!');
    } finally {
      setIsSetsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchQuestionSets();
    }, 250);
    return () => clearTimeout(timer);
  }, [selectedCareerId, selectedSeniority, searchQuery]);

  // 4. Start Mock Session with a Company Question Set
  const handleStartSetMock = async (set: CompanyQuestionSet) => {
    setIsStartingMock(true);
    try {
      const payload: CreateMockSessionPayload = {
        job_title: set.name,
        position_title: set.name,
        career_id: set.careerId || set.career_id || undefined,
        category: set.careerName || set.career_name || undefined,
        question_group_id: set.id,
        question_count: set.questionsCount ?? set.questions_count ?? (set.questions?.length || 5),
      };

      const session = await interviewService.createMockSession(payload);
      toast.success(`Đã khởi tạo phòng phỏng vấn bộ ${set.name} thành công!`);

      const targetUrl =
        session.interview_url ||
        session.interviewUrl ||
        (session.invite_token ? `/interview/${session.invite_token}` : undefined) ||
        (session.inviteToken ? `/interview/${session.inviteToken}` : undefined) ||
        (session.id ? `/interview/${session.id}` : undefined);

      if (targetUrl) {
        router.push(targetUrl);
      } else {
        router.push('/my-interviews');
      }
    } catch (err) {
      console.error('Failed to create mock session with set:', err);
      toast.error('Khởi tạo buổi phỏng vấn thử thất bại. Vui lòng thử lại!');
      setIsStartingMock(false);
    }
  };

  // 5. Start Custom Mock Session
  const handleStartCustomMockSession = async (customPayload?: Partial<CreateMockSessionPayload>) => {
    setIsStartingMock(true);
    try {
      const activeCareer = careers.find((c) => c.id === (customPayload?.career_id ?? mockCareerId));
      const chosenJobTitle =
        customPayload?.job_title ||
        mockJobTitle.trim() ||
        (activeCareer ? `Vị trí ${activeCareer.name}` : 'Phỏng vấn thử AI');

      const payload: CreateMockSessionPayload = {
        job_title: chosenJobTitle,
        position_title: chosenJobTitle,
        career_id: customPayload?.career_id !== undefined ? customPayload.career_id : (mockCareerId || undefined),
        category: customPayload?.category || activeCareer?.name || undefined,
        seniority: customPayload?.seniority || mockSeniority,
        question_count: customPayload?.question_count || mockCount,
        question_ids: customPayload?.question_ids,
      };

      const session = await interviewService.createMockSession(payload);
      toast.success('Đã khởi tạo phòng phỏng vấn thử thành công!');

      const targetUrl =
        session.interview_url ||
        session.interviewUrl ||
        (session.invite_token ? `/interview/${session.invite_token}` : undefined) ||
        (session.inviteToken ? `/interview/${session.inviteToken}` : undefined) ||
        (session.id ? `/interview/${session.id}` : undefined);

      if (targetUrl) {
        router.push(targetUrl);
      } else {
        router.push('/my-interviews');
      }
    } catch (err) {
      console.error('Failed to create custom mock session:', err);
      toast.error('Khởi tạo buổi phỏng vấn thử thất bại. Vui lòng thử lại!');
      setIsStartingMock(false);
    }
  };

  return (
    <Box>
      <Card
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 4 },
          borderRadius: '20px',
          border: '1px solid #e2e8f0',
          backgroundColor: '#ffffff',
          boxShadow: '0 4px 20px -2px rgba(0,0,0,0.03)',
        }}
      >
        {/* Header Title Section */}
        <Box sx={{ mb: 3.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: '#eff6ff', color: '#2563eb', width: 50, height: 50, boxShadow: '0 4px 14px rgba(37,99,235,0.15)' }}>
              <PsychologyOutlinedIcon sx={{ fontSize: 30 }} />
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', lineHeight: 1.3 }}>
                Luyện phỏng vấn AI theo bộ câu hỏi tuyển dụng doanh nghiệp
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.875rem', mt: 0.5 }}>
                Thực hành phỏng vấn trực tiếp cùng trợ lý AI theo đúng bộ câu hỏi chuẩn của các doanh nghiệp, rèn luyện phản xạ và nhận đánh giá chuyên sâu.
              </Typography>
            </Box>
          </Box>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Button
              variant="outlined"
              size="small"
              startIcon={<TuneIcon sx={{ fontSize: 16 }} />}
              onClick={() => setShowCustomStudio((prev) => !prev)}
              sx={{
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 700,
                borderColor: '#cbd5e1',
                color: '#475569',
                '&:hover': { borderColor: '#94a3b8', bgcolor: '#f8fafc' },
                '&:active': { transform: 'scale(0.98)' },
              }}
            >
              {showCustomStudio ? 'Thu gọn tùy chỉnh' : 'Tự tạo phòng tùy chỉnh'}
            </Button>
            <ProductTourTrigger tourKey="practice_room" variant="chip" label="Hướng dẫn luyện tập" />
          </Stack>
        </Box>

        {/* Collapsible Custom Studio Box */}
        <Collapse in={showCustomStudio}>
          <Card
            variant="outlined"
            sx={{
              p: { xs: 2.5, md: 3 },
              borderRadius: '16px',
              borderColor: '#bfdbfe',
              backgroundColor: '#f8faff',
              mb: 3.5,
              boxShadow: '0 4px 16px rgba(37,99,235,0.06)',
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, mb: 2, gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1e3a8a' }}>
                  Thiết lập phòng luyện tập tự do
                </Typography>
                <Chip size="small" label="Tương tác cùng AI" sx={{ bgcolor: '#eff6ff', color: '#1d4ed8', fontWeight: 700, fontSize: '0.7rem', border: '1px solid #bfdbfe' }} />
                <Chip size="small" label="Miễn phí & Riêng tư" sx={{ bgcolor: '#ecfdf5', color: '#059669', fontWeight: 700, fontSize: '0.7rem', border: '1px solid #a7f3d0' }} />
                {isPrefilledFromResume && (
                  <Chip
                    size="small"
                    icon={<AutoAwesomeIcon sx={{ fontSize: '13px !important', color: '#2563eb' }} />}
                    label="Theo hồ sơ của bạn"
                    sx={{ bgcolor: '#eff6ff', color: '#1d4ed8', fontWeight: 600, fontSize: '0.7rem', border: '1px solid #bfdbfe' }}
                  />
                )}
              </Box>
            </Box>

            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Vị trí ứng tuyển mong muốn"
                  placeholder="Ví dụ: Kỹ sư Xây dựng, Lập trình viên Full-stack..."
                  value={mockJobTitle}
                  onChange={(e) => setMockJobTitle(e.target.value)}
                  sx={{ bgcolor: '#ffffff', borderRadius: '8px' }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControl fullWidth size="small" sx={{ bgcolor: '#ffffff', borderRadius: '8px' }}>
                  <InputLabel>Ngành nghề</InputLabel>
                  <Select
                    value={mockCareerId ?? ''}
                    label="Ngành nghề"
                    onChange={(e) => {
                      const val = e.target.value ? Number(e.target.value) : null;
                      setMockCareerId(val);
                    }}
                  >
                    <MenuItem value="">Tất cả ngành nghề</MenuItem>
                    {careers.map((c) => (
                      <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <FormControl fullWidth size="small" sx={{ bgcolor: '#ffffff', borderRadius: '8px' }}>
                  <InputLabel>Cấp bậc</InputLabel>
                  <Select
                    value={mockSeniority}
                    label="Cấp bậc"
                    onChange={(e) => setMockSeniority(e.target.value)}
                  >
                    {SENIORITY_OPTIONS.filter((s) => s.value).map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControl fullWidth size="small" sx={{ bgcolor: '#ffffff', borderRadius: '8px' }}>
                  <InputLabel>Số lượng câu hỏi</InputLabel>
                  <Select
                    value={mockCount}
                    label="Số lượng câu hỏi"
                    onChange={(e) => setMockCount(Number(e.target.value))}
                  >
                    <MenuItem value={3}>3 câu - Khởi động trong 6 phút</MenuItem>
                    <MenuItem value={5}>5 câu - Tiêu chuẩn trong 10 phút</MenuItem>
                    <MenuItem value={8}>8 câu - Chuyên sâu trong 16 phút</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 0.5 }}>
              <Button
                variant="contained"
                disabled={isStartingMock}
                onClick={() => handleStartCustomMockSession()}
                sx={{
                  borderRadius: '12px',
                  backgroundColor: '#2563eb',
                  fontWeight: 700,
                  px: 3.5,
                  py: 1,
                  textTransform: 'none',
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
                  '&:hover': { backgroundColor: '#1d4ed8' },
                  '&:active': { transform: 'scale(0.98)' },
                }}
              >
                {isStartingMock ? <CircularProgress size={20} color="inherit" /> : 'Bắt đầu phòng tự do với AI'}
              </Button>
            </Box>
          </Card>
        </Collapse>

        {/* Filter and Search Bar */}
        <Box data-tour="practice-bank" sx={{ mb: 3 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
            <TextField
              size="small"
              placeholder="Tìm kiếm theo tên bộ câu hỏi, doanh nghiệp hoặc vị trí..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ flex: 1, bgcolor: '#ffffff', borderRadius: '10px' }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#94a3b8', fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
            />
            <FormControl size="small" sx={{ minWidth: 200, bgcolor: '#ffffff', borderRadius: '10px' }}>
              <InputLabel>Cấp bậc</InputLabel>
              <Select
                value={selectedSeniority}
                label="Cấp bậc"
                onChange={(e) => setSelectedSeniority(e.target.value)}
              >
                {SENIORITY_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          {/* Dynamic Career Tabs */}
          <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 1 }}>
            <Chip
              label="Tất cả doanh nghiệp & ngành nghề"
              onClick={() => setSelectedCareerId(null)}
              sx={{
                fontWeight: selectedCareerId === null ? 800 : 500,
                bgcolor: selectedCareerId === null ? '#2563eb' : '#f1f5f9',
                color: selectedCareerId === null ? '#ffffff' : '#475569',
                borderRadius: '10px',
                cursor: 'pointer',
                px: 1,
                '&:hover': {
                  bgcolor: selectedCareerId === null ? '#1d4ed8' : '#e2e8f0',
                },
              }}
            />
            {careers.map((career) => {
              const isSelected = selectedCareerId === career.id;
              return (
                <Chip
                  key={career.id}
                  label={career.name}
                  onClick={() => setSelectedCareerId(career.id)}
                  sx={{
                    fontWeight: isSelected ? 800 : 500,
                    bgcolor: isSelected ? '#2563eb' : '#f1f5f9',
                    color: isSelected ? '#ffffff' : '#475569',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    px: 1,
                    '&:hover': {
                      bgcolor: isSelected ? '#1d4ed8' : '#e2e8f0',
                    },
                  }}
                />
              );
            })}
          </Box>
        </Box>

        {/* Company Question Sets Card Grid */}
        {isSetsLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress size={36} />
          </Box>
        ) : questionSets.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8, maxWidth: 460, mx: 'auto' }}>
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: '20px',
                bgcolor: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
              }}
            >
              <BusinessIcon sx={{ fontSize: 36 }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', mb: 0.5 }}>
              Chưa tìm thấy bộ câu hỏi phù hợp
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b' }}>
              Hãy thử chọn ngành nghề khác hoặc nhập từ khóa tìm kiếm khác.
            </Typography>
          </Box>
        ) : (
          <Stack spacing={2.5} sx={{ width: '100%' }}>
            {questionSets.map((set) => (
              <Card
                key={set.id}
                variant="outlined"
                sx={{
                  p: { xs: 2.5, sm: 3 },
                  borderRadius: '16px',
                  borderColor: '#e2e8f0',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                  transition: 'all 0.25s ease',
                  '&:hover': {
                    borderColor: '#2563eb',
                    boxShadow: '0 10px 30px -4px rgba(37,99,235,0.1)',
                    transform: 'translateY(-1px)',
                  },
                }}
              >
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { xs: 'flex-start', md: 'center' }, justifyContent: 'space-between', gap: 2.5 }}>
                  {/* Company Info and Set Details */}
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2.5, flex: 1 }}>
                    <Avatar
                      src={set.companyLogo || set.company_logo || undefined}
                      sx={{
                        width: 56,
                        height: 56,
                        bgcolor: '#eff6ff',
                        color: '#2563eb',
                        border: '2px solid #e0e7ff',
                        boxShadow: '0 4px 12px rgba(37,99,235,0.08)',
                        flexShrink: 0,
                        fontSize: '1.4rem',
                        fontWeight: 800,
                      }}
                    >
                      {(set.companyName || set.company_name) ? (set.companyName || set.company_name)!.charAt(0).toUpperCase() : <BusinessIcon />}
                    </Avatar>

                    <Box sx={{ flex: 1 }}>
                      {/* Company Name & Career Pill */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexWrap: 'wrap', mb: 0.5 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          {set.companyName || set.company_name || 'Square Tuyển Dụng'}
                          <VerifiedIcon sx={{ fontSize: 16, color: '#0284c7' }} />
                        </Typography>
                        {(set.careerName || set.career_name) && (
                          <Chip
                            size="small"
                            label={set.careerName || set.career_name}
                            sx={{
                              bgcolor: '#eff6ff',
                              color: '#1d4ed8',
                              fontWeight: 700,
                              fontSize: '0.725rem',
                              borderRadius: '6px',
                              height: 22,
                            }}
                          />
                        )}
                        <Chip
                          size="small"
                          label={set.seniority || 'Mọi cấp độ'}
                          sx={{
                            bgcolor: '#f8fafc',
                            color: '#475569',
                            fontWeight: 600,
                            fontSize: '0.725rem',
                            borderRadius: '6px',
                            height: 22,
                            border: '1px solid #e2e8f0',
                          }}
                        />
                      </Box>

                      {/* Question Set Title */}
                      <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 0.75, lineHeight: 1.35, fontSize: '1.05rem' }}>
                        {set.name}
                      </Typography>

                      {/* Set Description */}
                      {set.description && (
                        <Typography
                          variant="body2"
                          sx={{
                            color: '#64748b',
                            fontSize: '0.825rem',
                            lineHeight: 1.5,
                            mb: 1.25,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {set.description}
                        </Typography>
                      )}

                      {/* 100% Vietnamese Category Tags & Metadata */}
                      <Stack direction="row" spacing={1} flexWrap="wrap" gap={0.75} alignItems="center">
                        {(set.categoryTags || set.category_tags || []).map((tag, tIdx) => (
                          <Chip
                            key={tIdx}
                            size="small"
                            label={tag}
                            sx={{
                              bgcolor: '#f1f5f9',
                              color: '#334155',
                              fontWeight: 700,
                              fontSize: '0.725rem',
                              borderRadius: '6px',
                              height: 22,
                            }}
                          />
                        ))}
                        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, ml: 0.5 }}>
                          <AccessTimeIcon sx={{ fontSize: 14, color: '#64748b' }} />
                          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, fontSize: '0.75rem' }}>
                            {set.questionsCount ?? set.questions_count ?? (set.questions?.length || 5)} câu • Khoảng {set.totalDurationMinutes ?? set.total_duration_minutes ?? 10} phút
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>
                  </Box>

                  {/* Action Buttons */}
                  <Stack direction={{ xs: 'row', md: 'column' }} spacing={1.25} sx={{ width: { xs: '100%', md: 220 }, flexShrink: 0, justifyContent: 'center' }}>
                    <Button
                      variant="contained"
                      data-testid="start-set-mock-btn"
                      onClick={() => handleStartSetMock(set)}
                      disabled={isStartingMock}
                      startIcon={<VideoCameraFrontIcon sx={{ fontSize: 18 }} />}
                      sx={{
                        borderRadius: '12px',
                        textTransform: 'none',
                        fontWeight: 800,
                        fontSize: '0.85rem',
                        bgcolor: '#2563eb',
                        py: 1.1,
                        boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
                        '&:hover': { bgcolor: '#1d4ed8', boxShadow: '0 6px 18px rgba(37, 99, 235, 0.35)' },
                        '&:active': { transform: 'scale(0.98)' },
                      }}
                    >
                      Luyện tập bộ này với AI
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => setActiveModalSet(set)}
                      sx={{
                        borderRadius: '12px',
                        textTransform: 'none',
                        fontWeight: 700,
                        fontSize: '0.825rem',
                        borderColor: '#cbd5e1',
                        color: '#475569',
                        py: 0.9,
                        '&:hover': { borderColor: '#94a3b8', bgcolor: '#f8fafc' },
                        '&:active': { transform: 'scale(0.98)' },
                      }}
                    >
                      Xem câu hỏi trong bộ
                    </Button>
                  </Stack>
                </Box>
              </Card>
            ))}
          </Stack>
        )}

        {/* Bottom Tra Cứu Lương Callout */}
        <Box
          sx={{
            mt: 4,
            p: 3,
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            bgcolor: '#f8fafc',
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' },
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ bgcolor: '#eff6ff', color: '#2563eb', width: 42, height: 42 }}>
              <TrendingUpOutlinedIcon sx={{ fontSize: 22 }} />
            </Avatar>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                Khảo sát dải lương thị trường để chuẩn bị đàm phán
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                Báo cáo dải lương năm 2026 chi tiết theo từng vị trí và kinh nghiệm thực tế.
              </Typography>
            </Box>
          </Box>
          <Button
            component={Link}
            href="/tra-cuu-luong"
            variant="outlined"
            endIcon={<ArrowForwardOutlinedIcon sx={{ fontSize: 14 }} />}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 700,
              borderColor: '#2563eb',
              color: '#2563eb',
              '&:hover': { borderColor: '#1d4ed8', bgcolor: '#eff6ff' },
              '&:active': { transform: 'scale(0.98)' },
              flexShrink: 0,
            }}
          >
            Tra cứu bảng lương 2026
          </Button>
        </Box>
      </Card>

      {/* Modal Preview Questions in Company Question Set */}
      <CompanyQuestionSetModal
        open={Boolean(activeModalSet)}
        questionSet={activeModalSet}
        onClose={() => setActiveModalSet(null)}
        isStarting={isStartingMock}
        onPracticeSet={(set) => {
          setActiveModalSet(null);
          handleStartSetMock(set);
        }}
      />

      {/* Modal Single Question Fallback */}
      <QuestionDetailModal
        open={Boolean(activeModalQuestion)}
        question={activeModalQuestion}
        onClose={() => setActiveModalQuestion(null)}
        isStarting={isStartingMock}
        onPracticeQuestion={(q) => {
          setActiveModalQuestion(null);
          handleStartCustomMockSession({
            job_title: q.question_text || q.text,
            career_id: typeof q.career === 'number' ? q.career : undefined,
            category: q.career_name || q.category,
            question_ids: [q.id],
          });
        }}
      />
    </Box>
  );
};

export default CandidatePracticePage;

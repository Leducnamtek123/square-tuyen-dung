'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Box,
  Container,
  Typography,
  Button,
  Avatar,
  Chip,
  Card,
  CircularProgress,
  Stack,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import { Grid2 as Grid } from '@mui/material';

// Icons
import VideoCameraFrontIcon from '@mui/icons-material/VideoCameraFront';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import BusinessIcon from '@mui/icons-material/Business';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import SearchIcon from '@mui/icons-material/Search';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CloseIcon from '@mui/icons-material/Close';
import PlayCircleFilledWhiteOutlinedIcon from '@mui/icons-material/PlayCircleFilledWhiteOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { toast } from 'sonner';

import { useAppSelector } from '@/redux/hooks';
import commonService from '@/services/commonService';
import { interviewService } from '@/services/interviewService';
import type { CompanyQuestionSet, Career, CreateMockSessionPayload } from '@/types/models';
import { CompanyQuestionSetModal } from '@/views/jobSeekerPages/PracticePage/components/CompanyQuestionSetModal';

// Static / fallback featured question sets
const FEATURED_FALLBACK_SETS: CompanyQuestionSet[] = [
  {
    id: 101,
    name: 'Phỏng vấn Frontend Developer (React, Next.js & UI/UX)',
    companyName: 'FPT Software & Đối tác',
    company_name: 'FPT Software & Đối tác',
    careerName: 'Công nghệ thông tin',
    career_name: 'Công nghệ thông tin',
    seniority: 'Middle',
    description: 'Bộ câu hỏi kiểm tra tư duy component, tối ưu hiệu năng web Core Web Vitals, xử lý bất đồng bộ và kỹ năng giải quyết tình huống kỹ thuật.',
    categoryTags: ['React', 'Next.js', 'TypeScript', 'System Design'],
    category_tags: ['React', 'Next.js', 'TypeScript', 'System Design'],
    questionsCount: 5,
    questions_count: 5,
    totalDurationMinutes: 15,
    total_duration_minutes: 15,
  },
  {
    id: 102,
    name: 'Phỏng vấn Chuyên viên Digital Marketing & Growth',
    companyName: 'VNG Group Ecosystem',
    company_name: 'VNG Group Ecosystem',
    careerName: 'Marketing / Truyền thông',
    career_name: 'Marketing / Truyền thông',
    seniority: 'Junior - Middle',
    description: 'Tình huống tối ưu chi phí quảng cáo (CPA, ROAS), lập kế hoạch ra mắt chiến dịch sản phẩm mới và phân tích hành vi người dùng.',
    categoryTags: ['Performance Ads', 'Content Strategy', 'Data Analytics'],
    category_tags: ['Performance Ads', 'Content Strategy', 'Data Analytics'],
    questionsCount: 5,
    questions_count: 5,
    totalDurationMinutes: 12,
    total_duration_minutes: 12,
  },
  {
    id: 103,
    name: 'Phỏng vấn Quản lý Kinh doanh B2B & Enterprise Sales',
    companyName: 'Tập đoàn Công nghệ InfoHR',
    company_name: 'Tập đoàn Công nghệ InfoHR',
    careerName: 'Kinh doanh / Bán hàng',
    career_name: 'Kinh doanh / Bán hàng',
    seniority: 'Senior',
    description: 'Đàm phán hợp đồng lớn, kỹ năng thấu cảm khách hàng doanh nghiệp, xử lý phản đối giá và xây dựng phễu khách hàng tiềm năng.',
    categoryTags: ['B2B Sales', 'Negotiation', 'Account Management'],
    category_tags: ['B2B Sales', 'Negotiation', 'Account Management'],
    questionsCount: 5,
    questions_count: 5,
    totalDurationMinutes: 15,
    total_duration_minutes: 15,
  },
  {
    id: 104,
    name: 'Phỏng vấn Chuyên viên Tuyển dụng & Đào tạo Nhân sự (HR)',
    companyName: 'VinGroup Talent Network',
    company_name: 'VinGroup Talent Network',
    careerName: 'Hành chính / Nhân sự',
    career_name: 'Hành chính / Nhân sự',
    seniority: 'Middle',
    description: 'Chiến lược tìm nguồn ứng viên thụ động (Headhunting), kỹ thuật phỏng vấn hành vi STAR và xử lý quan hệ lao động nội bộ.',
    categoryTags: ['Talent Acquisition', 'STAR Interview', 'Employee Relations'],
    category_tags: ['Talent Acquisition', 'STAR Interview', 'Employee Relations'],
    questionsCount: 5,
    questions_count: 5,
    totalDurationMinutes: 12,
    total_duration_minutes: 12,
  },
];

const TRUST_METRICS = [
  { value: '100.000+', label: 'Lượt phỏng vấn thử thành công' },
  { value: '94%', label: 'Ứng viên vượt qua phỏng vấn thật' },
  { value: '1.200+', label: 'Bộ câu hỏi chuẩn doanh nghiệp' },
  { value: '< 300ms', label: 'Độ trễ AI phản hồi giọng nói' },
];

const BENTO_FEATURES = [
  {
    icon: <GraphicEqIcon sx={{ fontSize: 26, color: '#2563EB' }} />,
    title: 'Mô phỏng giọng nói 1-1 tự nhiên',
    description:
      'Công nghệ AI Voice-to-Voice thời gian thực. Trợ lý AI tương tác mượt mà bằng tiếng Việt, phản hồi linh hoạt theo câu trả lời của bạn thay vì đọc kịch bản cứng nhắc.',
    tag: 'Voice AI 2026',
    iconBg: '#EFF6FF',
    iconBorder: '#DBEAFE',
  },
  {
    icon: <AssessmentOutlinedIcon sx={{ fontSize: 26, color: '#DC2626' }} />,
    title: 'Báo cáo chấm điểm đa chiều tức thì',
    description:
      'Đánh giá toàn diện 5 tiêu chuẩn: Kiến thức chuyên môn, Độ tự tin (Confidence), Phát âm & Ngữ điệu, Độ trôi chảy (Fluency), và Tốc độ nhả chữ chuẩn xác.',
    tag: 'Real-time Scoring',
    iconBg: 'rgba(239, 68, 68, 0.08)',
    iconBorder: 'rgba(239, 68, 68, 0.2)',
  },
  {
    icon: <BusinessIcon sx={{ fontSize: 26, color: '#16A34A' }} />,
    title: 'Ngân hàng câu hỏi chuẩn thực chiến',
    description:
      'Hơn 1.200 bộ câu hỏi được tổng hợp từ các đợt tuyển dụng thực tế của hàng trăm doanh nghiệp hàng đầu: IT, Marketing, Sales, Tài chính, Kế toán, HR...',
    tag: 'Enterprise Sets',
    iconBg: 'rgba(34, 197, 94, 0.08)',
    iconBorder: 'rgba(34, 197, 94, 0.2)',
  },
  {
    icon: <LockOpenIcon sx={{ fontSize: 26, color: '#4F46E5' }} />,
    title: 'Không gian riêng tư, không áp lực',
    description:
      'Thoải mái thử nghiệm, luyện tập nhiều lần và sửa chữa lỗi sai trong phòng phỏng vấn riêng biệt trước khi bước vào cuộc gặp trực tiếp với nhà tuyển dụng.',
    tag: '100% Private & Free',
    iconBg: 'rgba(79, 70, 229, 0.08)',
    iconBorder: 'rgba(79, 70, 229, 0.2)',
  },
];

const STEPS = [
  {
    step: '01',
    title: 'Chọn vị trí & bộ câu hỏi',
    description: 'Lựa chọn ngành nghề mục tiêu hoặc tải CV để Trợ lý AI tự động cá nhân hóa câu hỏi phù hợp nhất với bạn.',
    image: '/images/practice/step1_select_job.jpg',
  },
  {
    step: '02',
    title: 'Bật micro & camera thực hành',
    description: 'Trò chuyện trực tiếp cùng AI Interviewer trong phòng phỏng vấn ảo, rèn luyện phản xạ và thần thái trả lời.',
    image: '/images/practice/step2_interview_session.jpg',
  },
  {
    step: '03',
    title: 'Xem bảng điểm & gợi ý trả lời',
    description: 'Nhận ngay báo cáo phân tích điểm mạnh, điểm cần khắc phục cùng câu trả lời mẫu tối ưu từ chuyên gia.',
    image: '/images/practice/step3_score_report.jpg',
  },
];

const PracticeLandingPage: React.FC = () => {
  const router = useRouter();
  const { currentUser } = useAppSelector((state) => state.user);

  // Careers and Filter states
  const [careers, setCareers] = useState<Career[]>([]);
  const [selectedCareerId, setSelectedCareerId] = useState<number | null>(null);
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  // Question sets state
  const [questionSets, setQuestionSets] = useState<CompanyQuestionSet[]>(FEATURED_FALLBACK_SETS);
  const [isLoadingSets, setIsLoadingSets] = useState<boolean>(false);

  // Modals state
  const [activeModalSet, setActiveModalSet] = useState<CompanyQuestionSet | null>(null);
  const [isAuthPromptOpen, setIsAuthPromptOpen] = useState<boolean>(false);
  const [_pendingSet, setPendingSet] = useState<CompanyQuestionSet | null>(null);
  const [isStartingMock, setIsStartingMock] = useState<boolean>(false);

  // Load careers
  useEffect(() => {
    let isMounted = true;
    commonService
      .getAllCareersSimple({ pageSize: 50 })
      .then((data) => {
        if (isMounted && Array.isArray(data)) {
          setCareers(data.filter((c) => Boolean(c && c.name)));
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch real question sets with fallback
  useEffect(() => {
    let isMounted = true;
    setIsLoadingSets(true);
    interviewService
      .getCompanyQuestionSets({
        search: searchKeyword.trim() || undefined,
        career_id: selectedCareerId || undefined,
      })
      .then((data) => {
        if (isMounted) {
          if (Array.isArray(data) && data.length > 0) {
            setQuestionSets(data);
          } else {
            let filtered = FEATURED_FALLBACK_SETS;
            if (searchKeyword.trim()) {
              const kw = searchKeyword.toLowerCase();
              filtered = filtered.filter(
                (s) =>
                  s.name.toLowerCase().includes(kw) ||
                  (s.companyName && s.companyName.toLowerCase().includes(kw))
              );
            }
            setQuestionSets(filtered);
          }
        }
      })
      .catch(() => {
        if (isMounted) {
          setQuestionSets(FEATURED_FALLBACK_SETS);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoadingSets(false);
      });

    return () => {
      isMounted = false;
    };
  }, [searchKeyword, selectedCareerId]);

  // Handle CTA "Tham gia phỏng vấn thử ngay"
  const handlePrimaryCTA = () => {
    if (!currentUser) {
      setIsAuthPromptOpen(true);
      return;
    }
    const el = document.getElementById('question-sets-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Handle start practice with a specific set
  const handleStartSet = async (set: CompanyQuestionSet) => {
    if (!currentUser) {
      setPendingSet(set);
      setIsAuthPromptOpen(true);
      return;
    }

    setIsStartingMock(true);
    try {
      const payload: CreateMockSessionPayload = {
        job_title: set.name,
        position_title: set.name,
        career_id: set.careerId || set.career_id || undefined,
        category: set.careerName || set.career_name || undefined,
        question_group_id: set.id,
        question_count: set.questionsCount ?? set.questions_count ?? 5,
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
      console.error('Failed to start mock session:', err);
      toast.error('Khởi tạo buổi phỏng vấn thử thất bại. Vui lòng thử lại sau!');
    } finally {
      setIsStartingMock(false);
    }
  };

  return (
    <Box sx={{ bgcolor: '#F8FAFC', color: '#0F172A', overflow: 'hidden' }}>
      {/* 1. HERO SECTION */}
      <Box
        sx={{
          position: 'relative',
          pt: { xs: 4, sm: 6, md: 8 },
          pb: { xs: 5, sm: 7, md: 9 },
          background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)',
          borderBottom: '1px solid #E2E8F0',
        }}
      >
        <Container maxWidth="lg">
          {/* Top Pill Badge with Brand Red Accent */}
          <Box sx={{ textAlign: 'center', mb: 2.5 }}>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                px: 2,
                py: 0.75,
                borderRadius: '999px',
                backgroundColor: '#EFF6FF',
                border: '1px solid #DBEAFE',
                boxShadow: '0 2px 8px rgba(37, 99, 235, 0.06)',
              }}
            >
              <Box
                component="span"
                sx={{
                  bgcolor: '#EF4444',
                  color: '#FFFFFF',
                  fontSize: '10px',
                  fontWeight: 900,
                  px: 0.75,
                  py: 0.25,
                  borderRadius: '4px',
                  lineHeight: 1,
                }}
              >
                HOT
              </Box>
              <Typography
                sx={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#1D4ED8',
                  letterSpacing: '0.01em',
                }}
              >
                Công nghệ Phỏng vấn thử AI 1-1 • Độc quyền InfoHR
              </Typography>
            </Box>
          </Box>

          {/* Main Headline */}
          <Typography
            component="h1"
            sx={{
              fontWeight: 900,
              fontSize: { xs: '24px', sm: '38px', md: '46px' },
              lineHeight: 1.25,
              textAlign: 'center',
              letterSpacing: '-0.03em',
              color: '#0F172A',
              maxWidth: '860px',
              mx: 'auto',
              mb: 2.5,
            }}
          >
            Luyện Phỏng Vấn Thử{' '}
            <Box component="span" sx={{ whiteSpace: 'nowrap' }}>
              AI 1-1
            </Box>{' '}
            <Box
              component="span"
              sx={{
                color: '#2563EB',
                display: { xs: 'block', sm: 'inline' },
              }}
            >
              Chuẩn Doanh Nghiệp
            </Box>
          </Typography>

          {/* Subtitle */}
          <Typography
            sx={{
              fontSize: { xs: '14.5px', sm: '16px', md: '17px' },
              color: '#475569',
              textAlign: 'center',
              maxWidth: '680px',
              mx: 'auto',
              lineHeight: 1.6,
              mb: 4,
            }}
          >
            Tự tin chinh phục mọi nhà tuyển dụng với trợ lý ảo AI phỏng vấn giọng nói hai chiều thời gian thực,
            phân tích biểu cảm camera, chấm điểm độ tự tin và gợi ý hoàn thiện câu trả lời tức thì.
          </Typography>

          {/* Primary Action Buttons */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="center"
            alignItems="center"
            sx={{ mb: 5.5 }}
          >
            <Button
              variant="contained"
              size="large"
              onClick={handlePrimaryCTA}
              startIcon={<VideoCameraFrontIcon sx={{ fontSize: 22 }} />}
              sx={{
                py: 1.5,
                px: 3.5,
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: '15px',
                textTransform: 'none',
                backgroundColor: '#2563EB',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.28)',
                transition: 'all 0.2s ease',
                width: { xs: '100%', sm: 'auto' },
                '&:hover': {
                  backgroundColor: '#1D4ED8',
                  boxShadow: '0 8px 20px rgba(37, 99, 235, 0.35)',
                  transform: 'translateY(-1px)',
                },
              }}
            >
              Tham gia phỏng vấn thử ngay
            </Button>

            <Button
              variant="outlined"
              size="large"
              onClick={() => {
                const el = document.getElementById('question-sets-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              startIcon={<SearchIcon sx={{ fontSize: 20 }} />}
              sx={{
                py: 1.5,
                px: 3,
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '15px',
                textTransform: 'none',
                borderColor: '#CBD5E1',
                color: '#334155',
                backgroundColor: '#FFFFFF',
                width: { xs: '100%', sm: 'auto' },
                '&:hover': {
                  borderColor: '#94A3B8',
                  backgroundColor: '#F8FAFC',
                },
              }}
            >
              Khám phá ngân hàng câu hỏi
            </Button>
          </Stack>

          {/* Trust Metrics Bar */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
              p: { xs: 2, sm: 2.5 },
              borderRadius: '18px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.04)',
              maxWidth: '960px',
              mx: 'auto',
            }}
          >
            {TRUST_METRICS.map((metric, idx) => (
              <Box
                key={idx}
                sx={{
                  textAlign: 'center',
                  p: { xs: 1.5, sm: 2 },
                  borderRight: {
                    xs: idx % 2 === 0 ? '1px solid #F1F5F9' : 'none',
                    md: idx < 3 ? '1px solid #F1F5F9' : 'none',
                  },
                  borderBottom: {
                    xs: idx < 2 ? '1px solid #F1F5F9' : 'none',
                    md: 'none',
                  },
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 900,
                    fontSize: { xs: '20px', sm: '24px', md: '26px' },
                    color: '#0F172A',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {metric.value}
                </Typography>
                <Typography
                  sx={{
                    fontSize: '12.5px',
                    color: '#64748B',
                    fontWeight: 500,
                    mt: 0.5,
                  }}
                >
                  {metric.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* 2. PRODUCT SHOWCASE SECTION (CLEAN LIGHT STUDIO FRAME) */}
      <Box
        sx={{
          py: { xs: 6, sm: 8, md: 10 },
          bgcolor: '#F8FAFC',
          borderBottom: '1px solid #E2E8F0',
          position: 'relative',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 5.5 } }}>
            <Chip
              label="TRỰC QUAN GIAO DIỆN PHÒNG PHỎNG VẤN ẢO"
              size="small"
              sx={{
                bgcolor: '#EFF6FF',
                color: '#2563EB',
                fontWeight: 700,
                fontSize: '11.5px',
                border: '1px solid #DBEAFE',
                mb: 1.5,
              }}
            />
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                fontSize: { xs: '22px', sm: '28px', md: '34px' },
                color: '#0F172A',
                letterSpacing: '-0.02em',
                mb: 1.5,
              }}
            >
              Mô Phỏng Trải Nghiệm Phỏng Vấn Chuyên Nghiệp
            </Typography>
            <Typography
              sx={{
                color: '#64748B',
                fontSize: { xs: '14px', sm: '15.5px' },
                maxWidth: '680px',
                mx: 'auto',
                lineHeight: 1.6,
              }}
            >
              Hệ thống tích hợp công nghệ AI Vision & Voice thông minh, phân tích độ tự tin và kỹ năng của ứng viên
              ngay trong từng câu trả lời.
            </Typography>
          </Box>

          {/* Banana Mockup Display Frame with Clean Light Device Wrapper */}
          <Box
            sx={{
              borderRadius: { xs: '16px', sm: '22px' },
              overflow: 'hidden',
              boxShadow: '0 20px 45px -15px rgba(15, 23, 42, 0.10), 0 0 0 1px rgba(226, 232, 240, 0.9)',
              border: '1px solid #E2E8F0',
              backgroundColor: '#FFFFFF',
              maxWidth: '1040px',
              mx: 'auto',
            }}
          >
            <Box
              component="img"
              src="/images/practice/ai_mock_interview_showcase.webp"
              alt="InfoHR AI Mock Interview Studio Interface Mockup"
              loading="lazy"
              decoding="async"
              sx={{
                width: '100%',
                height: 'auto',
                display: 'block',
              }}
            />
          </Box>

          {/* 3 Unified Brand Feature Cards Under Mockup */}
          <Grid container spacing={2.5} sx={{ mt: 3, maxWidth: '1040px', mx: 'auto' }}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Card
                variant="outlined"
                sx={{
                  p: 2.25,
                  borderRadius: '16px',
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E2E8F0',
                  boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.75,
                }}
              >
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '12px',
                    bgcolor: '#EFF6FF',
                    color: '#2563EB',
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                    border: '1px solid #DBEAFE',
                  }}
                >
                  <GraphicEqIcon sx={{ fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A' }}>
                    Giọng nói AI hai chiều
                  </Typography>
                  <Typography sx={{ fontSize: '12px', color: '#64748B', mt: 0.25 }}>
                    Phản hồi tức thì &lt;300ms
                  </Typography>
                </Box>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <Card
                variant="outlined"
                sx={{
                  p: 2.25,
                  borderRadius: '16px',
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E2E8F0',
                  boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.75,
                }}
              >
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '12px',
                    bgcolor: 'rgba(239, 68, 68, 0.08)',
                    color: '#EF4444',
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                  }}
                >
                  <AssessmentOutlinedIcon sx={{ fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A' }}>
                    Báo cáo chấm điểm đa chiều
                  </Typography>
                  <Typography sx={{ fontSize: '12px', color: '#64748B', mt: 0.25 }}>
                    Đánh giá tự tin &amp; chuyên môn
                  </Typography>
                </Box>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <Card
                variant="outlined"
                sx={{
                  p: 2.25,
                  borderRadius: '16px',
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E2E8F0',
                  boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.75,
                }}
              >
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '12px',
                    bgcolor: 'rgba(34, 197, 94, 0.08)',
                    color: '#16A34A',
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                    border: '1px solid rgba(34, 197, 94, 0.2)',
                  }}
                >
                  <VerifiedUserOutlinedIcon sx={{ fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A' }}>
                    Gợi ý trả lời tối ưu
                  </Typography>
                  <Typography sx={{ fontSize: '12px', color: '#64748B', mt: 0.25 }}>
                    Khắc phục lỗi sai chuẩn STAR
                  </Typography>
                </Box>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* 3. BENTO CORE ADVANTAGES */}
      <Box sx={{ py: { xs: 6, sm: 8, md: 10 }, bgcolor: '#FFFFFF' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 6 } }}>
            <Typography
              sx={{
                fontSize: '13px',
                fontWeight: 700,
                color: '#2563EB',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                mb: 1,
              }}
            >
              Ưu Thế Vượt Trội
            </Typography>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                fontSize: { xs: '24px', sm: '30px', md: '34px' },
                color: '#0F172A',
                letterSpacing: '-0.02em',
                mb: 1.5,
              }}
            >
              Tại Sao Nên Luyện Phỏng Vấn Cùng InfoHR AI?
            </Typography>
            <Typography sx={{ color: '#64748B', fontSize: '15.5px', maxWidth: '640px', mx: 'auto', lineHeight: 1.6 }}>
              Giải pháp đột phá giúp loại bỏ hoàn toàn tâm lý lo âu, sẵn sàng câu trả lời sắc sảo trước mọi nhà tuyển dụng.
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {BENTO_FEATURES.map((feat, idx) => (
              <Grid key={idx} size={{ xs: 12, sm: 6 }}>
                <Card
                  variant="outlined"
                  sx={{
                    p: { xs: 3, sm: 3.5 },
                    height: '100%',
                    borderRadius: '18px',
                    borderColor: '#E2E8F0',
                    backgroundColor: '#FFFFFF',
                    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                    boxShadow: '0 2px 8px rgba(15, 23, 42, 0.02)',
                    '&:hover': {
                      borderColor: '#BFDBFE',
                      boxShadow: '0 10px 24px -4px rgba(37, 99, 235, 0.08)',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '14px',
                      backgroundColor: feat.iconBg,
                      border: `1px solid ${feat.iconBorder}`,
                      display: 'grid',
                      placeItems: 'center',
                      mb: 2.5,
                    }}
                  >
                    {feat.icon}
                  </Box>

                  <Chip
                    label={feat.tag}
                    size="small"
                    sx={{
                      bgcolor: '#F1F5F9',
                      color: '#475569',
                      fontWeight: 700,
                      fontSize: '11px',
                      borderRadius: '6px',
                      mb: 1.5,
                      border: '1px solid #E2E8F0',
                    }}
                  />

                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 800,
                      fontSize: '17px',
                      color: '#0F172A',
                      mb: 1,
                    }}
                  >
                    {feat.title}
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      color: '#64748B',
                      fontSize: '14px',
                      lineHeight: 1.6,
                    }}
                  >
                    {feat.description}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* 4. 3-STEP PROCESS SECTION WITH RICH 3D ILLUSTRATIONS */}
      <Box sx={{ py: { xs: 6, sm: 8, md: 10 }, bgcolor: '#F8FAFC', borderTop: '1px solid #E2E8F0' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 6 } }}>
            <Typography
              sx={{
                fontSize: '13px',
                fontWeight: 700,
                color: '#2563EB',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                mb: 1,
              }}
            >
              Quy Trình Nhanh Gọn
            </Typography>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                fontSize: { xs: '24px', sm: '30px', md: '34px' },
                color: '#0F172A',
                letterSpacing: '-0.02em',
                mb: 1.5,
              }}
            >
              3 Bước Bắt Đầu Luyện Phỏng Vấn
            </Typography>
            <Typography sx={{ color: '#64748B', fontSize: '15px', maxWidth: '600px', mx: 'auto' }}>
              Trải nghiệm tập dượt thực chiến nhanh chóng chỉ trong vài thao tác đơn giản
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {STEPS.map((s, idx) => (
              <Grid key={idx} size={{ xs: 12, md: 4 }}>
                <Card
                  variant="outlined"
                  sx={{
                    borderRadius: '20px',
                    borderColor: '#E2E8F0',
                    backgroundColor: '#FFFFFF',
                    boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)',
                    overflow: 'hidden',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.25s ease',
                    '&:hover': {
                      borderColor: '#BFDBFE',
                      boxShadow: '0 12px 28px -6px rgba(37, 99, 235, 0.10)',
                      transform: 'translateY(-3px)',
                    },
                  }}
                >
                  {/* Step 3D Illustration Frame */}
                  <Box
                    sx={{
                      width: '100%',
                      height: { xs: 170, sm: 190 },
                      backgroundColor: '#F8FAFC',
                      borderBottom: '1px solid #F1F5F9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      position: 'relative',
                    }}
                  >
                    <Box
                      component="img"
                      src={s.image}
                      alt={s.title}
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        p: 1.5,
                        transition: 'transform 0.3s ease',
                        '&:hover': {
                          transform: 'scale(1.04)',
                        },
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 14,
                        left: 14,
                        width: 36,
                        height: 36,
                        borderRadius: '10px',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #DBEAFE',
                        color: '#2563EB',
                        fontWeight: 900,
                        fontSize: '15px',
                        display: 'grid',
                        placeItems: 'center',
                        boxShadow: '0 2px 6px rgba(15, 23, 42, 0.08)',
                      }}
                    >
                      {s.step}
                    </Box>
                  </Box>

                  <Box sx={{ p: { xs: 2.5, sm: 3 }, flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <Typography
                      sx={{
                        fontWeight: 800,
                        fontSize: '17px',
                        color: '#0F172A',
                        mb: 1,
                      }}
                    >
                      {s.title}
                    </Typography>
                    <Typography
                      sx={{
                        color: '#64748B',
                        fontSize: '14px',
                        lineHeight: 1.6,
                      }}
                    >
                      {s.description}
                    </Typography>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* 5. INTERACTIVE QUESTION SETS EXPLORER */}
      <Box
        id="question-sets-section"
        sx={{
          py: { xs: 6, sm: 8, md: 10 },
          bgcolor: '#FFFFFF',
          borderTop: '1px solid #E2E8F0',
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: { xs: 'flex-start', md: 'center' },
              justifyContent: 'space-between',
              gap: 2,
              mb: 4,
            }}
          >
            <Box>
              <Typography
                sx={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#2563EB',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  mb: 0.5,
                }}
              >
                Ngân Hàng Câu Hỏi Thực Tế
              </Typography>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: '22px', sm: '26px', md: '28px' },
                  color: '#0F172A',
                  letterSpacing: '-0.02em',
                }}
              >
                Chọn Bộ Câu Hỏi Của Doanh Nghiệp Bạn Quan Tâm
              </Typography>
            </Box>

            {/* Search Input */}
            <TextField
              size="small"
              placeholder="Tìm kiếm vị trí, câu hỏi, doanh nghiệp..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#94A3B8', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                width: { xs: '100%', md: 320 },
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  backgroundColor: '#F8FAFC',
                },
              }}
            />
          </Box>

          {/* Careers Filter Chips */}
          {careers.length > 0 && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                overflowX: 'auto',
                pb: 2,
                mb: 3,
                scrollbarWidth: 'none',
                '&::-webkit-scrollbar': { display: 'none' },
              }}
            >
              <Chip
                label="Tất cả ngành nghề"
                onClick={() => setSelectedCareerId(null)}
                variant={selectedCareerId === null ? 'filled' : 'outlined'}
                sx={{
                  fontWeight: 700,
                  borderRadius: '8px',
                  backgroundColor: selectedCareerId === null ? '#2563EB' : 'transparent',
                  color: selectedCareerId === null ? '#FFFFFF' : '#475569',
                  borderColor: selectedCareerId === null ? '#2563EB' : '#CBD5E1',
                  '&:hover': {
                    backgroundColor: selectedCareerId === null ? '#1D4ED8' : '#F1F5F9',
                  },
                }}
              />
              {careers.slice(0, 8).map((c) => (
                <Chip
                  key={c.id}
                  label={c.name}
                  onClick={() => setSelectedCareerId(c.id)}
                  variant={selectedCareerId === c.id ? 'filled' : 'outlined'}
                  sx={{
                    fontWeight: 600,
                    borderRadius: '8px',
                    backgroundColor: selectedCareerId === c.id ? '#2563EB' : 'transparent',
                    color: selectedCareerId === c.id ? '#FFFFFF' : '#475569',
                    borderColor: selectedCareerId === c.id ? '#2563EB' : '#CBD5E1',
                    '&:hover': {
                      backgroundColor: selectedCareerId === c.id ? '#1D4ED8' : '#F1F5F9',
                    },
                  }}
                />
              ))}
            </Box>
          )}

          {/* List of Question Set Cards */}
          {isLoadingSets ? (
            <Box sx={{ py: 8, textAlign: 'center' }}>
              <CircularProgress size={36} sx={{ color: '#2563EB' }} />
              <Typography sx={{ mt: 2, color: '#64748B', fontSize: '14px' }}>
                Đang tải các bộ câu hỏi tuyển dụng...
              </Typography>
            </Box>
          ) : (
            <Stack spacing={2.5}>
              {questionSets.map((set) => (
                <Card
                  key={set.id}
                  variant="outlined"
                  sx={{
                    p: { xs: 2.5, sm: 3 },
                    borderRadius: '16px',
                    borderColor: '#E2E8F0',
                    backgroundColor: '#FFFFFF',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: '#BFDBFE',
                      boxShadow: '0 8px 24px -4px rgba(37, 99, 235, 0.08)',
                      transform: 'translateY(-1px)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: { xs: 'column', md: 'row' },
                      alignItems: { xs: 'flex-start', md: 'center' },
                      justifyContent: 'space-between',
                      gap: 2.5,
                    }}
                  >
                    {/* Company info & set title */}
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, flex: 1 }}>
                      <Avatar
                        src={set.companyLogo || set.company_logo || undefined}
                        sx={{
                          width: 50,
                          height: 50,
                          bgcolor: '#EFF6FF',
                          color: '#2563EB',
                          fontWeight: 800,
                          fontSize: '18px',
                          border: '1.5px solid #DBEAFE',
                        }}
                      >
                        {(set.companyName || set.company_name || 'HR').charAt(0).toUpperCase()}
                      </Avatar>

                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
                          <Typography
                            sx={{
                              fontWeight: 700,
                              fontSize: '13px',
                              color: '#0F172A',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 0.5,
                            }}
                          >
                            {set.companyName || set.company_name || 'Square Tuyển Dụng'}
                          </Typography>
                          {(set.careerName || set.career_name) && (
                            <Chip
                              size="small"
                              label={set.careerName || set.career_name}
                              sx={{
                                bgcolor: '#EFF6FF',
                                color: '#1D4ED8',
                                fontWeight: 700,
                                fontSize: '11px',
                                height: 20,
                                border: '1px solid #DBEAFE',
                              }}
                            />
                          )}
                          <Chip
                            size="small"
                            label={set.seniority || 'Mọi cấp độ'}
                            sx={{
                              bgcolor: '#F8FAFC',
                              color: '#475569',
                              fontWeight: 600,
                              fontSize: '11px',
                              height: 20,
                              border: '1px solid #E2E8F0',
                            }}
                          />
                        </Box>

                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 800,
                            fontSize: '16px',
                            color: '#0F172A',
                            lineHeight: 1.4,
                            mb: 0.75,
                          }}
                        >
                          {set.name}
                        </Typography>

                        {set.description && (
                          <Typography
                            sx={{
                              color: '#64748B',
                              fontSize: '13.5px',
                              lineHeight: 1.5,
                              mb: 1.5,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {set.description}
                          </Typography>
                        )}

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                          {(set.categoryTags || set.category_tags || []).map((tag, tIdx) => (
                            <Chip
                              key={tIdx}
                              size="small"
                              label={tag}
                              sx={{
                                bgcolor: '#F1F5F9',
                                color: '#334155',
                                fontWeight: 600,
                                fontSize: '11px',
                                height: 22,
                                border: '1px solid #E2E8F0',
                              }}
                            />
                          ))}
                          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, color: '#64748B' }}>
                            <AccessTimeIcon sx={{ fontSize: 14 }} />
                            <Typography sx={{ fontSize: '12px', fontWeight: 600 }}>
                              {set.questionsCount ?? set.questions_count ?? 5} câu • Khoảng{' '}
                              {set.totalDurationMinutes ?? set.total_duration_minutes ?? 12} phút
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Box>

                    {/* Action buttons */}
                    <Stack
                      direction={{ xs: 'row', sm: 'row', md: 'column' }}
                      spacing={1.25}
                      sx={{ width: { xs: '100%', md: 190 }, flexShrink: 0 }}
                    >
                      <Button
                        variant="contained"
                        onClick={() => handleStartSet(set)}
                        disabled={isStartingMock}
                        startIcon={<VideoCameraFrontIcon sx={{ fontSize: 18 }} />}
                        sx={{
                          borderRadius: '10px',
                          textTransform: 'none',
                          fontWeight: 800,
                          fontSize: '13px',
                          backgroundColor: '#2563EB',
                          py: 1,
                          boxShadow: '0 2px 8px rgba(37, 99, 235, 0.2)',
                          '&:hover': {
                            backgroundColor: '#1D4ED8',
                          },
                        }}
                      >
                        Luyện tập bộ này
                      </Button>

                      <Button
                        variant="outlined"
                        onClick={() => setActiveModalSet(set)}
                        startIcon={<LayersOutlinedIcon sx={{ fontSize: 16 }} />}
                        sx={{
                          borderRadius: '10px',
                          textTransform: 'none',
                          fontWeight: 600,
                          fontSize: '13px',
                          borderColor: '#CBD5E1',
                          color: '#475569',
                          backgroundColor: '#FFFFFF',
                          '&:hover': {
                            borderColor: '#94A3B8',
                            backgroundColor: '#F8FAFC',
                          },
                        }}
                      >
                        Xem câu hỏi mẫu
                      </Button>
                    </Stack>
                  </Box>
                </Card>
              ))}
            </Stack>
          )}
        </Container>
      </Box>

      {/* 6. BOTTOM BANNER CTA (HIGH-END 3D ILLUSTRATED BANNER) */}
      <Box sx={{ py: { xs: 6, sm: 8 }, bgcolor: '#FFFFFF', borderTop: '1px solid #E2E8F0' }}>
        <Container maxWidth="lg">
          <Box
            sx={{
              position: 'relative',
              borderRadius: { xs: '20px', md: '28px' },
              overflow: 'hidden',
              minHeight: { xs: 340, sm: 360, md: 380 },
              backgroundImage: 'url(/images/practice/practice_cta_banner.webp)',
              backgroundSize: 'cover',
              backgroundPosition: { xs: '68% center', sm: 'center center' },
              boxShadow: '0 20px 45px -12px rgba(37, 99, 235, 0.28)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {/* Left Gradient Overlay for Perfect Typography Contrast */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: {
                  xs: 'linear-gradient(180deg, rgba(14, 42, 122, 0.94) 0%, rgba(20, 55, 150, 0.88) 60%, rgba(37, 99, 235, 0.4) 100%)',
                  md: 'linear-gradient(90deg, #0d369f 0%, rgba(13, 54, 159, 0.96) 42%, rgba(13, 54, 159, 0.75) 60%, rgba(37, 99, 235, 0.15) 80%, transparent 100%)',
                },
                zIndex: 1,
              }}
            />

            {/* Content cleanly aligned on the LEFT */}
            <Box
              sx={{
                position: 'relative',
                zIndex: 2,
                p: { xs: 3.5, sm: 5, md: 6 },
                maxWidth: { xs: '100%', md: '58%' },
                textAlign: { xs: 'center', md: 'left' },
              }}
            >
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.75,
                  px: 1.5,
                  py: 0.5,
                  borderRadius: '999px',
                  bgcolor: 'rgba(255, 255, 255, 0.18)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  color: '#FFFFFF',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  mb: 2,
                }}
              >
                <AutoAwesomeIcon sx={{ fontSize: 14, color: '#FDE047' }} />
                Bắt đầu hoàn toàn miễn phí
              </Box>

              <Typography
                variant="h3"
                sx={{
                  fontWeight: 900,
                  fontSize: { xs: '22px', sm: '28px', md: '34px' },
                  lineHeight: 1.25,
                  color: '#FFFFFF',
                  letterSpacing: '-0.02em',
                  textShadow: '0 2px 10px rgba(15, 23, 42, 0.25)',
                  mb: 1.5,
                }}
              >
                Sẵn Sàng Nâng Tầm Kỹ Năng Phỏng Vấn Của Bạn?
              </Typography>

              <Typography
                sx={{
                  color: 'rgba(255, 255, 255, 0.92)',
                  fontSize: { xs: '14px', sm: '15.5px' },
                  lineHeight: 1.6,
                  mb: 3.5,
                  maxWidth: '520px',
                  mx: { xs: 'auto', md: 0 },
                }}
              >
                Hàng ngàn ứng viên đã tự tin nắm bắt cơ hội nghề nghiệp mơ ước nhờ luyện tập trước cùng Trợ lý AI InfoHR.
              </Typography>

              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                alignItems={{ xs: 'center', md: 'flex-start' }}
                justifyContent={{ xs: 'center', md: 'flex-start' }}
              >
                <Button
                  variant="contained"
                  size="large"
                  onClick={handlePrimaryCTA}
                  startIcon={<PlayCircleFilledWhiteOutlinedIcon sx={{ fontSize: 22 }} />}
                  sx={{
                    py: 1.5,
                    px: 3.5,
                    borderRadius: '12px',
                    fontWeight: 800,
                    fontSize: '15px',
                    textTransform: 'none',
                    backgroundColor: '#FFFFFF',
                    color: '#1D4ED8',
                    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.18)',
                    transition: 'all 0.2s ease',
                    width: { xs: '100%', sm: 'auto' },
                    '&:hover': {
                      backgroundColor: '#F8FAFC',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 10px 24px rgba(0, 0, 0, 0.25)',
                    },
                  }}
                >
                  Bắt đầu phỏng vấn thử miễn phí ngay
                </Button>
              </Stack>

              {/* Small trust badges under button */}
              <Box
                sx={{
                  mt: 2.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: { xs: 'center', md: 'flex-start' },
                  gap: { xs: 1.5, sm: 2.5 },
                  flexWrap: 'wrap',
                }}
              >
                <Typography
                  sx={{
                    fontSize: '12px',
                    color: 'rgba(255, 255, 255, 0.85)',
                    fontWeight: 500,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.5,
                  }}
                >
                  <CheckCircleOutlineIcon sx={{ fontSize: 15, color: '#34D399' }} />
                  Miễn phí 100%
                </Typography>
                <Typography
                  sx={{
                    fontSize: '12px',
                    color: 'rgba(255, 255, 255, 0.85)',
                    fontWeight: 500,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.5,
                  }}
                >
                  <CheckCircleOutlineIcon sx={{ fontSize: 15, color: '#34D399' }} />
                  Không giới hạn số lần
                </Typography>
                <Typography
                  sx={{
                    fontSize: '12px',
                    color: 'rgba(255, 255, 255, 0.85)',
                    fontWeight: 500,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.5,
                  }}
                >
                  <CheckCircleOutlineIcon sx={{ fontSize: 15, color: '#34D399' }} />
                  Đánh giá chuẩn STAR
                </Typography>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Active Question Set Modal (Publicly accessible to preview questions) */}
      <CompanyQuestionSetModal
        open={Boolean(activeModalSet)}
        questionSet={activeModalSet}
        onClose={() => setActiveModalSet(null)}
        onPracticeSet={(set) => {
          setActiveModalSet(null);
          void handleStartSet(set);
        }}
        isStarting={isStartingMock}
      />

      {/* Guest Auth Prompt Dialog (Gentle guidance instead of forced redirect) */}
      <Dialog
        open={isAuthPromptOpen}
        onClose={() => setIsAuthPromptOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            p: 1.5,
            boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
          },
        }}
      >
        <DialogTitle sx={{ pb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ bgcolor: '#EFF6FF', color: '#2563EB', width: 36, height: 36, border: '1px solid #DBEAFE' }}>
              <AutoAwesomeIcon sx={{ fontSize: 20 }} />
            </Avatar>
            <Typography sx={{ fontWeight: 800, fontSize: '17px', color: '#0F172A' }}>
              Bắt Đầu Phỏng Vấn Cùng AI
            </Typography>
          </Box>
          <IconButton size="small" onClick={() => setIsAuthPromptOpen(false)}>
            <CloseIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 1.5 }}>
          <Typography sx={{ fontSize: '14px', color: '#475569', lineHeight: 1.6, mb: 2 }}>
            Đăng nhập tài khoản Ứng viên để Trợ lý AI có thể cá nhân hóa bộ câu hỏi theo hồ sơ của bạn, lưu lại lịch sử
            phỏng vấn và xuất bảng phân tích năng lực chi tiết.
          </Typography>

          <Box
            sx={{
              p: 2,
              borderRadius: '12px',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              mb: 1,
            }}
          >
            <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#334155', mb: 0.5, display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <CheckCircleOutlineIcon sx={{ fontSize: 16, color: '#16A34A' }} />
              Miễn phí 100% cho mọi ứng viên
            </Typography>
            <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#334155', display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <CheckCircleOutlineIcon sx={{ fontSize: 16, color: '#16A34A' }} />
              Không giới hạn số lần luyện tập lại
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Stack spacing={1} sx={{ width: '100%' }}>
            <Button
              fullWidth
              variant="contained"
              component={Link}
              href={`/login?redirect=/practice`}
              sx={{
                py: 1.3,
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: '14px',
                textTransform: 'none',
                backgroundColor: '#2563EB',
                '&:hover': { backgroundColor: '#1D4ED8' },
              }}
            >
              Đăng nhập ngay
            </Button>

            <Button
              fullWidth
              variant="outlined"
              component={Link}
              href={`/register?redirect=/practice`}
              sx={{
                py: 1.3,
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '14px',
                textTransform: 'none',
                borderColor: '#CBD5E1',
                color: '#334155',
                '&:hover': { backgroundColor: '#F8FAFC', borderColor: '#94A3B8' },
              }}
            >
              Đăng ký tài khoản mới
            </Button>

            <Button
              fullWidth
              variant="text"
              onClick={() => setIsAuthPromptOpen(false)}
              sx={{
                color: '#64748B',
                fontSize: '13px',
                textTransform: 'none',
                mt: 0.5,
              }}
            >
              Để sau, tôi muốn xem trước câu hỏi
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PracticeLandingPage;

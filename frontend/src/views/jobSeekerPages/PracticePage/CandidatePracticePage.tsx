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
} from '@mui/material';
import { Grid2 as Grid } from '@mui/material';
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined';
import VideoCameraFrontIcon from '@mui/icons-material/VideoCameraFront';
import SearchIcon from '@mui/icons-material/Search';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import { toast } from 'sonner';

import { interviewService } from '@/services/interviewService';
import { QuestionBankItem, CreateMockSessionPayload } from '@/types/models';
import QuestionDetailModal from './components/QuestionDetailModal';

const CATEGORY_OPTIONS = [
  'Tất cả ngành nghề',
  'Xây dựng & Kiến trúc',
  'Thiết kế & Nội thất',
  'Công nghệ thông tin',
  'Nhân sự & Tuyển dụng',
  'Kinh doanh & Bán hàng',
];

const SENIORITY_OPTIONS = [
  { value: '', label: 'Tất cả cấp bậc' },
  { value: 'junior', label: 'Junior / Fresher' },
  { value: 'middle', label: 'Trung cấp (Middle)' },
  { value: 'senior', label: 'Senior / Quản lý' },
];

export const CandidatePracticePage: React.FC = () => {
  const router = useRouter();
  const [questions, setQuestions] = useState<QuestionBankItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả ngành nghề');
  const [selectedSeniority, setSelectedSeniority] = useState<string>('');
  const [activeModalQuestion, setActiveModalQuestion] = useState<QuestionBankItem | null>(null);
  const [isStartingMock, setIsStartingMock] = useState<boolean>(false);

  // Quick studio form state
  const [mockJobTitle, setMockJobTitle] = useState<string>('Kỹ sư giám sát công trình');
  const [mockCategory, setMockCategory] = useState<string>('Xây dựng & Kiến trúc');
  const [mockSeniority, setMockSeniority] = useState<string>('middle');
  const [mockCount, setMockCount] = useState<number>(5);

  const fetchQuestions = async () => {
    setIsLoading(true);
    try {
      const res = await interviewService.getQuestionBank({
        category: selectedCategory === 'Tất cả ngành nghề' ? undefined : selectedCategory,
        seniority: selectedSeniority || undefined,
        search: searchQuery.trim() || undefined,
      });

      const results = Array.isArray(res)
        ? res
        : (res?.results ?? []);
      setQuestions(results);
    } catch (err: unknown) {
      console.error('Failed to fetch question bank:', err);
      toast.error('Không thể tải danh sách câu hỏi. Vui lòng thử lại!');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchQuestions();
    }, 250);
    return () => clearTimeout(timer);
  }, [selectedCategory, selectedSeniority, searchQuery]);

  const handleStartMockSession = async (customPayload?: Partial<CreateMockSessionPayload>) => {
    setIsStartingMock(true);
    try {
      const payload: CreateMockSessionPayload = {
        job_title: customPayload?.job_title || mockJobTitle.trim() || 'Vị trí thử thách',
        category: customPayload?.category || mockCategory,
        seniority: customPayload?.seniority || mockSeniority,
        question_count: customPayload?.question_count || mockCount,
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
    } catch (err: unknown) {
      console.error('Failed to create mock interview session:', err);
      toast.error('Khởi tạo buổi phỏng vấn thử thất bại. Vui lòng thử lại!');
      setIsStartingMock(false);
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '02:00';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <Box>
      <Card
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 4 },
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          backgroundColor: '#ffffff',
          boxShadow: '0 4px 20px -2px rgba(0,0,0,0.03)',
        }}
      >
        {/* Header Title Section */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Avatar sx={{ bgcolor: '#eff6ff', color: '#2563eb', width: 48, height: 48 }}>
              <PsychologyOutlinedIcon sx={{ fontSize: 28 }} />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', lineHeight: 1.3 }}>
                Luyện phỏng vấn AI &amp; Ngân hàng câu hỏi
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.875rem', mt: 0.25 }}>
                Luyện tập phản xạ trực tiếp với AI chuẩn WebRTC, xem cấu trúc dàn bài STAR và bộ mẹo ghi điểm với nhà tuyển dụng.
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Quick Mock Studio Box - InfoHR Light Blue Style */}
        <Card
          variant="outlined"
          sx={{
            p: { xs: 2.5, md: 3 },
            borderRadius: '12px',
            borderColor: '#bfdbfe',
            backgroundColor: '#f0f7ff',
            mb: 3.5,
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, mb: 2, gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1e3a8a' }}>
                Thiết lập phòng phỏng vấn thử AI
              </Typography>
              <Chip size="small" label="LiveKit WebRTC" sx={{ bgcolor: '#dbeafe', color: '#1d4ed8', fontWeight: 700, fontSize: '0.7rem' }} />
              <Chip size="small" label="Miễn phí" sx={{ bgcolor: '#ecfdf5', color: '#059669', fontWeight: 700, fontSize: '0.7rem' }} />
            </Box>
            <Typography variant="caption" sx={{ color: '#64748b' }}>
              Hệ thống tự động sinh phòng và trợ lý phỏng vấn
            </Typography>
          </Box>

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                size="small"
                label="Vị trí / Chức danh"
                value={mockJobTitle}
                onChange={(e) => setMockJobTitle(e.target.value)}
                sx={{ bgcolor: '#ffffff', borderRadius: '8px' }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth size="small" sx={{ bgcolor: '#ffffff', borderRadius: '8px' }}>
                <InputLabel>Ngành nghề chuyên môn</InputLabel>
                <Select
                  value={mockCategory}
                  label="Ngành nghề chuyên môn"
                  onChange={(e) => setMockCategory(e.target.value)}
                >
                  {CATEGORY_OPTIONS.filter((c) => c !== 'Tất cả ngành nghề').map((cat) => (
                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth size="small" sx={{ bgcolor: '#ffffff', borderRadius: '8px' }}>
                <InputLabel>Cấp bậc mong muốn</InputLabel>
                <Select
                  value={mockSeniority}
                  label="Cấp bậc mong muốn"
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
                  <MenuItem value={3}>3 câu (Khởi động - 6 phút)</MenuItem>
                  <MenuItem value={5}>5 câu (Tiêu chuẩn - 10 phút)</MenuItem>
                  <MenuItem value={8}>8 câu (Chuyên sâu - 16 phút)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, gap: 1.5, pt: 0.5 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography variant="caption" sx={{ color: '#475569', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <CheckCircleOutlineIcon sx={{ fontSize: 16, color: '#2563eb' }} />
                HUD gợi ý trả lời STAR
              </Typography>
              <Typography variant="caption" sx={{ color: '#475569', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <CheckCircleOutlineIcon sx={{ fontSize: 16, color: '#2563eb' }} />
                Đồng hồ đếm ngược từng câu
              </Typography>
            </Stack>
            <Button
              variant="contained"
              disabled={isStartingMock}
              onClick={() => handleStartMockSession()}
              sx={{
                borderRadius: '8px',
                backgroundColor: '#2563eb',
                fontWeight: 700,
                px: 3.5,
                py: 1.1,
                textTransform: 'none',
                boxShadow: 'none',
                '&:hover': {
                  backgroundColor: '#1d4ed8',
                  boxShadow: 'none',
                },
              }}
            >
              {isStartingMock ? <CircularProgress size={20} color="inherit" /> : 'Bắt đầu phỏng vấn thử ngay'}
            </Button>
          </Box>
        </Card>

        {/* Filter and Question Bank Section */}
        <Box sx={{ mb: 2.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a' }}>
              Ngân hàng câu hỏi tuyển dụng thực tế
            </Typography>
            <Button
              component={Link}
              href="/tra-cuu-luong"
              size="small"
              sx={{ textTransform: 'none', fontWeight: 600, color: '#2563eb' }}
            >
              Tra cứu dải lương thị trường 2026 &rarr;
            </Button>
          </Box>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
            <TextField
              size="small"
              placeholder="Tìm kiếm câu hỏi (VD: xung đột bản vẽ, tiến độ công trình, xử lý lỗi...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ flex: 1, bgcolor: '#ffffff', borderRadius: '8px' }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#94a3b8', fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
            />
            <FormControl size="small" sx={{ minWidth: 180, bgcolor: '#ffffff', borderRadius: '8px' }}>
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

          <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 1, mb: 1 }}>
            {CATEGORY_OPTIONS.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <Chip
                  key={cat}
                  label={cat}
                  onClick={() => setSelectedCategory(cat)}
                  sx={{
                    fontWeight: isSelected ? 700 : 500,
                    bgcolor: isSelected ? '#2563eb' : '#f1f5f9',
                    color: isSelected ? '#ffffff' : '#475569',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: isSelected ? '#1d4ed8' : '#e2e8f0',
                    },
                  }}
                />
              );
            })}
          </Box>
        </Box>

        {/* Question Cards List matching MyInterviewsPage */}
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress size={36} />
          </Box>
        ) : questions.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8, maxWidth: 420, mx: 'auto' }}>
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
              <PsychologyOutlinedIcon sx={{ fontSize: 36 }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', mb: 0.5 }}>
              Chưa tìm thấy câu hỏi phù hợp
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b' }}>
              Hãy thử chọn danh mục khác hoặc nhập từ khóa tìm kiếm khác.
            </Typography>
          </Box>
        ) : (
          <Stack spacing={2} sx={{ width: '100%' }}>
            {questions.map((q) => (
              <Card
                key={q.id}
                variant="outlined"
                sx={{
                  p: 2.5,
                  borderRadius: '12px',
                  borderColor: '#e2e8f0',
                  backgroundColor: '#ffffff',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: '#2563eb',
                    boxShadow: '0 4px 16px -2px rgba(37,99,235,0.08)',
                  },
                }}
              >
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { xs: 'flex-start', md: 'center' }, justifyContent: 'space-between', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, flex: 1 }}>
                    <Avatar sx={{ bgcolor: '#eff6ff', color: '#2563eb', width: 44, height: 44, flexShrink: 0, mt: 0.25 }}>
                      <VideoCameraFrontIcon sx={{ fontSize: 22 }} />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a', mb: 0.75, lineHeight: 1.4 }}>
                        {q.question_text || q.text}
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap" gap={0.75}>
                        <Chip
                          size="small"
                          label={q.category_display || q.category}
                          sx={{ bgcolor: '#f1f5f9', color: '#475569', fontWeight: 600, fontSize: '0.75rem', borderRadius: '6px' }}
                        />
                        <Chip
                          size="small"
                          label={q.difficulty_display || q.difficulty}
                          sx={{ bgcolor: '#eff6ff', color: '#2563eb', fontWeight: 600, fontSize: '0.75rem', borderRadius: '6px' }}
                        />
                        <Chip
                          size="small"
                          icon={<AccessTimeIcon sx={{ fontSize: '14px !important', color: '#64748b' }} />}
                          label={formatDuration(q.default_duration_seconds)}
                          sx={{ bgcolor: '#f8fafc', color: '#64748b', fontSize: '0.75rem', borderRadius: '6px' }}
                        />
                      </Stack>
                    </Box>
                  </Box>
                  <Stack direction="row" spacing={1.5} sx={{ width: { xs: '100%', md: 'auto' }, justifyContent: 'flex-end', flexShrink: 0 }}>
                    <Button
                      variant="outlined"
                      onClick={() => setActiveModalQuestion(q)}
                      sx={{
                        borderRadius: '8px',
                        textTransform: 'none',
                        fontWeight: 600,
                        borderColor: '#cbd5e1',
                        color: '#475569',
                        px: 2,
                        '&:hover': { borderColor: '#94a3b8', bgcolor: '#f8fafc' },
                      }}
                    >
                      Xem dàn ý &amp; mẹo
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => handleStartMockSession({ job_title: q.question_text || q.text, category: q.category })}
                      disabled={isStartingMock}
                      sx={{
                        borderRadius: '8px',
                        textTransform: 'none',
                        fontWeight: 700,
                        bgcolor: '#2563eb',
                        px: 2.5,
                        boxShadow: 'none',
                        '&:hover': { bgcolor: '#1d4ed8', boxShadow: 'none' },
                      }}
                    >
                      Luyện câu này
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
            borderRadius: '12px',
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
            <Avatar sx={{ bgcolor: '#eff6ff', color: '#2563eb', width: 40, height: 40 }}>
              <TrendingUpOutlinedIcon sx={{ fontSize: 22 }} />
            </Avatar>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                Khảo sát mức lương thị trường để đàm phán khi phỏng vấn
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                Báo cáo dải lương năm 2026 chi tiết theo vị trí &amp; năm kinh nghiệm từ InfoHR.
              </Typography>
            </Box>
          </Box>
          <Button
            component={Link}
            href="/tra-cuu-luong"
            variant="outlined"
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 700,
              borderColor: '#2563eb',
              color: '#2563eb',
              '&:hover': { borderColor: '#1d4ed8', bgcolor: '#eff6ff' },
              flexShrink: 0,
            }}
          >
            Tra cứu bảng lương 2026 ngay
          </Button>
        </Box>
      </Card>

      {/* Modal Detail */}
      <QuestionDetailModal
        open={Boolean(activeModalQuestion)}
        question={activeModalQuestion}
        onClose={() => setActiveModalQuestion(null)}
        isStarting={isStartingMock}
        onPracticeQuestion={(q) => {
          setActiveModalQuestion(null);
          handleStartMockSession({ job_title: q.question_text || q.text, category: q.category });
        }}
      />
    </Box>
  );
};

export default CandidatePracticePage;

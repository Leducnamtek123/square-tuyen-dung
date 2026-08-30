import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Fade,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  useTheme,
  alpha,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SparklesIcon from '@mui/icons-material/AutoFixHigh';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ReplayIcon from '@mui/icons-material/Replay';
import CheckIcon from '@mui/icons-material/Check';
import TranslateIcon from '@mui/icons-material/Translate';
import SpellcheckIcon from '@mui/icons-material/Spellcheck';
import ShortTextIcon from '@mui/icons-material/ShortText';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import AddTaskIcon from '@mui/icons-material/AddTask';
import CodeIcon from '@mui/icons-material/Code';
import VisibilityIcon from '@mui/icons-material/Visibility';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import TuneIcon from '@mui/icons-material/Tune';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PostAddIcon from '@mui/icons-material/PostAdd';
import SendIcon from '@mui/icons-material/Send';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import BusinessIcon from '@mui/icons-material/Business';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import { useTranslation } from 'react-i18next';
import {
  AIActionType,
  AIContentType,
  AILength,
  AITone,
  generateWithAI,
} from './aiAssistantEngine';

interface AIAssistantModalProps {
  open: boolean;
  onClose: () => void;
  currentContent: string;
  onApplyContent: (html: string, mode: 'replace' | 'insert' | 'append') => void;
  detectedContext?: AIContentType;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  open,
  onClose,
  currentContent,
  onApplyContent,
  detectedContext = 'general',
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { t } = useTranslation('common');

  // State
  const [selectedAction, setSelectedAction] = useState<AIActionType>('generate');
  const [contentType, setContentType] = useState<AIContentType>(detectedContext);
  const [tone, setTone] = useState<AITone>('professional');
  const [length, setLength] = useState<AILength>('medium');
  const [userPrompt, setUserPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [generatedResult, setGeneratedResult] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [previewTab, setPreviewTab] = useState<'preview' | 'code'>('preview');
  const [contextMenuAnchor, setContextMenuAnchor] = useState<null | HTMLElement>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setContentType(detectedContext);
  }, [detectedContext]);

  // Loading steps animation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev < 2 ? prev + 1 : 0));
      }, 1200);
    }
    return () => clearInterval(interval);
  }, [loading]);

  // Keyboard shortcut Ctrl + Enter to trigger generation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (open && (e.ctrlKey || e.metaKey) && e.key === 'Enter' && !loading) {
        e.preventDefault();
        handleGenerate();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, selectedAction, contentType, currentContent, userPrompt, tone, length, loading]);

  const CONTEXT_CONFIG: Record<
    AIContentType,
    { label: string; icon: React.ReactNode; color: string; desc: string }
  > = {
    job_desc: {
      label: t('editor.templates.categories.job', 'Mô tả công việc (JD)'),
      icon: <WorkOutlineIcon fontSize="small" />,
      color: '#3b82f6',
      desc: 'Bản mô tả chi tiết nhiệm vụ và trách nhiệm vị trí tuyển dụng',
    },
    job_req: {
      label: t('editor.ai.context.jobReq', 'Yêu cầu ứng viên'),
      icon: <AssignmentTurnedInIcon fontSize="small" />,
      color: '#8b5cf6',
      desc: 'Khung năng lực chuyên môn, kinh nghiệm và kỹ năng mềm',
    },
    benefits: {
      label: t('editor.templates.categories.policy', 'Chính sách & Phúc lợi'),
      icon: <CardGiftcardIcon fontSize="small" />,
      color: '#10b981',
      desc: 'Gói đãi ngộ, lương thưởng, bảo hiểm và môi trường làm việc',
    },
    company: {
      label: t('editor.templates.categories.company', 'Giới thiệu công ty'),
      icon: <BusinessIcon fontSize="small" />,
      color: '#f59e0b',
      desc: 'Tầm nhìn, sứ mệnh, văn hóa và giá trị cốt lõi doanh nghiệp',
    },
    email: {
      label: t('editor.ai.context.email', 'Thư gửi ứng viên'),
      icon: <EmailOutlinedIcon fontSize="small" />,
      color: '#ec4899',
      desc: 'Email mời phỏng vấn, thư trúng tuyển hoặc thư cảm ơn',
    },
    blog: {
      label: t('editor.ai.context.blog', 'Bài viết / Tin tức'),
      icon: <DescriptionOutlinedIcon fontSize="small" />,
      color: '#06b6d4',
      desc: 'Bài viết chia sẻ văn hóa, xu hướng nghề nghiệp và tuyển dụng',
    },
    general: {
      label: t('editor.ai.context.general', 'Soạn thảo tổng hợp'),
      icon: <DescriptionOutlinedIcon fontSize="small" />,
      color: '#6366f1',
      desc: 'Soạn thảo văn bản tự do theo mọi chủ đề doanh nghiệp',
    },
  };

  const ACTION_TABS: Array<{
    id: AIActionType;
    label: string;
    icon: React.ReactNode;
    desc: string;
    badge?: string;
  }> = [
    {
      id: 'generate',
      label: t('editor.ai.tabs.generate', 'Tạo mới'),
      icon: <AutoAwesomeIcon sx={{ fontSize: 17 }} />,
      desc: t('editor.ai.tabs.generateDesc', 'Soạn thảo bài viết hoàn chỉnh chuẩn cấu trúc chuyên nghiệp'),
      badge: 'Phổ biến',
    },
    {
      id: 'improve',
      label: t('editor.ai.tabs.improve', 'Cải thiện'),
      icon: <SparklesIcon sx={{ fontSize: 17 }} />,
      desc: t('editor.ai.tabs.improveDesc', 'Nâng cấp văn phong mượt mà, chuyên nghiệp và giàu sức hút hơn'),
    },
    {
      id: 'fix_spelling',
      label: t('editor.ai.actions.grammar', 'Sửa chính tả & ngữ pháp'),
      icon: <SpellcheckIcon sx={{ fontSize: 17 }} />,
      desc: t('editor.ai.tabs.fixSpellingDesc', 'Rà soát và chuẩn hóa chính tả, lỗi dấu tiếng Việt và ngữ pháp'),
    },
    {
      id: 'shorten',
      label: t('editor.ai.actions.shorten', 'Tóm tắt & cô đọng'),
      icon: <ShortTextIcon sx={{ fontSize: 17 }} />,
      desc: t('editor.ai.tabs.shortenDesc', 'Chắt lọc các ý quan trọng nhất thành dạng bullet points súc tích'),
    },
    {
      id: 'expand',
      label: t('editor.ai.actions.expand', 'Mở rộng chi tiết'),
      icon: <FormatQuoteIcon sx={{ fontSize: 17 }} />,
      desc: t('editor.ai.tabs.expandDesc', 'Bổ sung thêm luận điểm, ví dụ thực tế và giải thích chuyên sâu'),
    },
    {
      id: 'change_tone',
      label: t('editor.ai.tabs.changeTone', 'Đổi giọng văn'),
      icon: <TuneIcon sx={{ fontSize: 17 }} />,
      desc: t('editor.ai.tabs.changeToneDesc', 'Chuyển đổi phong cách sang Trang trọng, Thân thiện hoặc Thuyết phục'),
    },
    {
      id: 'translate_en',
      label: t('editor.ai.tabs.translateEn', 'Dịch sang English'),
      icon: <TranslateIcon sx={{ fontSize: 17 }} />,
      desc: t('editor.ai.tabs.translateEnDesc', 'Dịch thuật chuẩn Business English giữ nguyên định dạng HTML'),
    },
    {
      id: 'translate_vi',
      label: t('editor.ai.tabs.translateVi', 'Dịch sang Tiếng Việt'),
      icon: <TranslateIcon sx={{ fontSize: 17 }} />,
      desc: t('editor.ai.tabs.translateViDesc', 'Dịch thuật sang tiếng Việt tự nhiên và chuẩn văn phong HR'),
    },
    {
      id: 'custom',
      label: t('editor.ai.tabs.custom', 'Tùy chỉnh Prompt'),
      icon: <PostAddIcon sx={{ fontSize: 17 }} />,
      desc: t('editor.ai.tabs.customDesc', 'Yêu cầu AI xử lý bất kỳ tác vụ đặc thù nào bạn mong muốn'),
    },
  ];

  const QUICK_PROMPT_TAGS: Record<AIContentType, string[]> = {
    job_desc: ['Kỹ năng React & TypeScript', 'Làm việc Hybrid', 'Senior 3+ năm', 'Quản lý nhóm 5 người', 'KPIs rõ ràng'],
    job_req: ['Tư duy phản biện', 'Tiếng Anh giao tiếp', 'Chủ động giải quyết vấn đề', 'Kinh nghiệm Agile/Scrum'],
    benefits: ['Bảo hiểm sức khỏe VIP', 'Thưởng tháng 13+', 'Cấp MacBook Pro', 'Review lương 2 lần/năm', 'Du lịch 5 sao'],
    company: ['Môi trường phẳng', 'Công nghệ tiên phong', 'Khách hàng toàn cầu', 'Đào tạo chuyên sâu'],
    email: ['Phỏng vấn online Meet', 'Đề nghị nhận việc (Offer)', 'Hạn phản hồi 3 ngày', 'Trực tiếp tại trụ sở'],
    blog: ['Xu hướng HR 2026', 'Bí quyết giữ chân nhân tài', 'Văn hóa doanh nghiệp'],
    general: ['Định dạng gạch đầu dòng', 'Văn phong trang trọng', 'Ngắn gọn dễ hiểu'],
  };

  const PROMPT_SUGGESTIONS: Record<AIContentType, string[]> = {
    company: [
      t('editor.ai.suggestions.comp1', 'Viết bài giới thiệu doanh nghiệp công nghệ năng động, lấy con người làm trọng tâm'),
      t('editor.ai.suggestions.comp2', 'Tập trung vào sứ mệnh chuyển đổi số và các cam kết chất lượng với khách hàng'),
      t('editor.ai.suggestions.comp3', 'Nêu bật văn hóa phẳng, cởi mở và các chính sách phát triển nhân tài vượt trội'),
    ],
    job_desc: [
      t('editor.ai.suggestions.jd1', 'Tạo mô tả công việc (JD) thu hút cho vị trí Senior Fullstack Developer'),
      t('editor.ai.suggestions.jd2', 'Soạn bản mô tả công việc Chuyên viên Marketing đa kênh (Digital Marketing)'),
      t('editor.ai.suggestions.jd3', 'Viết nhiệm vụ chính cho vị trí Chuyên viên Tư vấn & Kinh doanh B2B'),
    ],
    job_req: [
      t('editor.ai.suggestions.req1', 'Yêu cầu 2+ năm kinh nghiệm, tư duy phản biện tốt và chủ động trong công việc'),
      t('editor.ai.suggestions.req2', 'Khung kỹ năng chuyên môn vững vàng, khả năng giao tiếp tiếng Anh lưu loát'),
      t('editor.ai.suggestions.req3', 'Đòi hỏi tinh thần trách nhiệm cao và khả năng giải quyết vấn đề dưới áp lực'),
    ],
    benefits: [
      t('editor.ai.suggestions.ben1', 'Gói đãi ngộ hấp dẫn: Review lương 2 lần/năm, thưởng tháng 13+ và bảo hiểm sức khỏe VIP'),
      t('editor.ai.suggestions.ben2', 'Môi trường làm việc Hybrid linh hoạt, cung cấp MacBook Pro và đào tạo chuyên sâu'),
      t('editor.ai.suggestions.ben3', 'Du lịch resort 5 sao hàng năm, phụ cấp cơm trưa và teambuilding sôi nổi'),
    ],
    email: [
      t('editor.ai.suggestions.mail1', 'Thư mời phỏng vấn trực tiếp tại văn phòng vào 9h sáng thứ Hai tuần tới'),
      t('editor.ai.suggestions.mail2', 'Thư mời phỏng vấn online qua Google Meet kèm hướng dẫn chuẩn bị'),
      t('editor.ai.suggestions.mail3', 'Thư đề nghị nhận việc (Offer Letter) kèm mức lương và chế độ đãi ngộ'),
      t('editor.ai.suggestions.mail4', 'Thư từ chối ứng viên lịch sự và lưu hồ sơ vào Talent Pool tương lai'),
    ],
    blog: [
      t('editor.ai.suggestions.blog1', 'Viết bài phân tích xu hướng tuyển dụng nhân sự công nghệ năm 2026'),
      t('editor.ai.suggestions.blog2', 'Bí quyết phỏng vấn và giữ chân nhân tài cho các doanh nghiệp vừa và nhỏ'),
    ],
    general: [
      t('editor.ai.suggestions.gen1', 'Viết văn bản chuyên nghiệp, cấu trúc rõ ràng với các gạch đầu dòng nổi bật'),
      t('editor.ai.suggestions.gen2', 'Tối ưu hóa nội dung cho người đọc dễ nắm bắt thông tin quan trọng nhất'),
    ],
  };

  const TONE_OPTIONS: Array<{ id: AITone; label: string; icon: string; desc: string }> = [
    { id: 'professional', label: 'Trang trọng', icon: '🎯', desc: 'Chuẩn mực, uy tín' },
    { id: 'friendly', label: 'Thân thiện', icon: '🤝', desc: 'Gần gũi, cởi mở' },
    { id: 'persuasive', label: 'Thuyết phục', icon: '🚀', desc: 'Thu hút, tạo động lực' },
    { id: 'creative', label: 'Sáng tạo', icon: '💡', desc: 'Đột phá, tươi mới' },
  ];

  const LENGTH_OPTIONS: Array<{ id: AILength; label: string; desc: string; icon: string }> = [
    { id: 'short', label: 'Ngắn gọn', desc: '~150 từ', icon: '⚡' },
    { id: 'medium', label: 'Vừa phải', desc: '~400 từ', icon: '📄' },
    { id: 'detailed', label: 'Chi tiết', desc: '~750 từ', icon: '📚' },
  ];

  const currentTabInfo = useMemo(() => {
    return ACTION_TABS.find((t) => t.id === selectedAction) || ACTION_TABS[0];
  }, [selectedAction]);

  const suggestions = useMemo(() => {
    return PROMPT_SUGGESTIONS[contentType] || PROMPT_SUGGESTIONS.general;
  }, [contentType]);

  const quickTags = useMemo(() => {
    return QUICK_PROMPT_TAGS[contentType] || QUICK_PROMPT_TAGS.general;
  }, [contentType]);

  // Statistics
  const resultStats = useMemo(() => {
    if (!generatedResult) return null;
    const textOnly = generatedResult.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
    const wordCount = textOnly ? textOnly.split(/\s+/).length : 0;
    const charCount = textOnly.length;
    const readingTimeMin = Math.max(1, Math.ceil(wordCount / 200));
    return { wordCount, charCount, readingTimeMin };
  }, [generatedResult]);

  const handleGenerate = async (overridePrompt?: string) => {
    setLoading(true);
    try {
      const promptToUse = overridePrompt !== undefined ? overridePrompt : userPrompt;
      const result = await generateWithAI({
        action: selectedAction,
        contentType,
        currentContent,
        userPrompt: promptToUse,
        tone,
        length,
      });
      setGeneratedResult(result);
    } catch (error) {
      console.error('AI Generation Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickTagClick = (tag: string) => {
    setUserPrompt((prev) => (prev ? `${prev}, ${tag}` : tag));
  };

  const handleCopy = () => {
    if (generatedResult) {
      navigator.clipboard.writeText(generatedResult);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleApply = (mode: 'replace' | 'insert' | 'append') => {
    if (generatedResult) {
      onApplyContent(generatedResult, mode);
      onClose();
    }
  };

  const currentContextObj = CONTEXT_CONFIG[contentType] || CONTEXT_CONFIG.general;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      slotProps={{
        backdrop: {
          sx: {
            backdropFilter: 'blur(10px)',
            backgroundColor: isDark ? 'rgba(15, 23, 42, 0.75)' : 'rgba(15, 23, 42, 0.45)',
          },
        },
      }}
      PaperProps={{
        sx: {
          borderRadius: '20px',
          overflow: 'hidden',
          minHeight: '680px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(226, 232, 240, 0.9)',
          boxShadow: isDark
            ? '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(99, 102, 241, 0.2)'
            : '0 25px 50px -12px rgba(15, 23, 42, 0.2), 0 0 0 1px rgba(99, 102, 241, 0.08)',
          bgcolor: isDark ? '#0f172a' : '#ffffff',
        },
      }}
    >
      {/* 1. Header: AI Copilot Studio Bar */}
      <DialogTitle
        sx={{
          p: 0,
          borderBottom: '1px solid',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(226, 232, 240, 0.8)',
          background: isDark
            ? 'linear-gradient(180deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)'
            : 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: { xs: 2, sm: 3 },
            py: 1.8,
          }}
        >
          {/* Left Title & Status */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.8 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                color: '#ffffff',
                boxShadow: '0 6px 18px rgba(79, 70, 229, 0.35)',
                position: 'relative',
              }}
            >
              <AutoAwesomeIcon sx={{ fontSize: 24 }} />
              <Box
                sx={{
                  position: 'absolute',
                  top: -2,
                  right: -2,
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  bgcolor: '#10b981',
                  border: '2px solid',
                  borderColor: isDark ? '#0f172a' : '#ffffff',
                }}
              />
            </Box>

            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, flexWrap: 'wrap' }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: '1rem', sm: '1.15rem' },
                    letterSpacing: '-0.02em',
                    color: isDark ? '#f8fafc' : '#0f172a',
                  }}
                >
                  {t('editor.ai.modalTitle', 'Trợ Lý Soạn Thảo AI (AI Writing Assistant)')}
                </Typography>
                <Chip
                  label="AILA v2.5 Copilot"
                  size="small"
                  sx={{
                    height: 22,
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    bgcolor: isDark ? 'rgba(99, 102, 241, 0.25)' : 'rgba(79, 70, 229, 0.1)',
                    color: isDark ? '#a5b4fc' : '#4f46e5',
                    border: '1px solid',
                    borderColor: isDark ? 'rgba(99, 102, 241, 0.4)' : 'rgba(79, 70, 229, 0.2)',
                  }}
                />
              </Box>
              <Typography variant="caption" sx={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '0.8rem' }}>
                {t('editor.ai.subtitle', 'Tối ưu hóa, mở rộng và hoàn thiện nội dung tuyển dụng chuyên nghiệp')}
              </Typography>
            </Box>
          </Box>

          {/* Right Context Switcher & Close */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {/* Context Dropdown Button */}
            <Button
              size="small"
              onClick={(e) => setContextMenuAnchor(e.currentTarget)}
              endIcon={<KeyboardArrowDownIcon />}
              startIcon={currentContextObj.icon}
              sx={{
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.82rem',
                px: 1.5,
                py: 0.6,
                bgcolor: isDark ? 'rgba(30, 41, 59, 0.8)' : 'rgba(241, 245, 249, 0.9)',
                color: isDark ? '#f1f5f9' : '#1e293b',
                border: '1px solid',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(203, 213, 225, 0.8)',
                '&:hover': {
                  bgcolor: isDark ? 'rgba(51, 65, 85, 0.8)' : 'rgba(226, 232, 240, 0.9)',
                },
              }}
            >
              {currentContextObj.label}
            </Button>

            <Menu
              anchorEl={contextMenuAnchor}
              open={Boolean(contextMenuAnchor)}
              onClose={() => setContextMenuAnchor(null)}
              PaperProps={{
                sx: {
                  borderRadius: '12px',
                  mt: 0.5,
                  minWidth: 240,
                  boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                  border: '1px solid',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(226, 232, 240, 0.8)',
                },
              }}
            >
              {(Object.keys(CONTEXT_CONFIG) as AIContentType[]).map((cKey) => {
                const item = CONTEXT_CONFIG[cKey];
                const isSelected = contentType === cKey;
                return (
                  <MenuItem
                    key={cKey}
                    selected={isSelected}
                    onClick={() => {
                      setContentType(cKey);
                      setContextMenuAnchor(null);
                    }}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      py: 1,
                      px: 2,
                      fontSize: '0.85rem',
                      fontWeight: isSelected ? 700 : 500,
                    }}
                  >
                    <Box sx={{ color: item.color, display: 'flex' }}>{item.icon}</Box>
                    <Box>
                      <Typography variant="body2" fontWeight={isSelected ? 700 : 500}>
                        {item.label}
                      </Typography>
                    </Box>
                  </MenuItem>
                );
              })}
            </Menu>

            <Tooltip title="Đóng (Esc)">
              <IconButton
                onClick={onClose}
                size="small"
                sx={{
                  color: isDark ? '#94a3b8' : '#64748b',
                  borderRadius: '10px',
                  bgcolor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
                    color: isDark ? '#ffffff' : '#0f172a',
                    transform: 'rotate(90deg)',
                  },
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* 2. Action Tabs Toolbar */}
        <Box
          sx={{
            px: { xs: 1.5, sm: 3 },
            pb: 1.2,
            pt: 0.5,
            display: 'flex',
            gap: 0.8,
            overflowX: 'auto',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
          }}
        >
          {ACTION_TABS.map((tab) => {
            const isSelected = tab.id === selectedAction;
            return (
              <Button
                key={tab.id}
                onClick={() => setSelectedAction(tab.id)}
                startIcon={tab.icon}
                size="small"
                sx={{
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontWeight: isSelected ? 700 : 500,
                  whiteSpace: 'nowrap',
                  px: 1.6,
                  py: 0.7,
                  fontSize: '0.82rem',
                  transition: 'all 0.2s ease',
                  flexShrink: 0,
                  ...(isSelected
                    ? {
                        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                        color: '#ffffff',
                        boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #4338ca 0%, #6d28d9 100%)',
                        },
                      }
                    : {
                        color: isDark ? '#94a3b8' : '#475569',
                        bgcolor: isDark ? 'rgba(30, 41, 59, 0.5)' : 'rgba(241, 245, 249, 0.8)',
                        border: '1px solid',
                        borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(226, 232, 240, 0.8)',
                        '&:hover': {
                          color: isDark ? '#f1f5f9' : '#0f172a',
                          bgcolor: isDark ? 'rgba(51, 65, 85, 0.7)' : 'rgba(226, 232, 240, 0.9)',
                          borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(203, 213, 225, 1)',
                        },
                      }),
                }}
              >
                {tab.label}
              </Button>
            );
          })}
        </Box>
      </DialogTitle>

      {/* 3. Main Workspace Grid */}
      <DialogContent sx={{ p: 0, flex: 1, display: 'flex', overflow: 'hidden' }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            width: '100%',
            height: '100%',
            overflow: 'hidden',
          }}
        >
          {/* Left Panel: Prompt & Controls */}
          <Box
            sx={{
              width: { xs: '100%', md: '44%' },
              p: { xs: 2.5, sm: 3 },
              borderRight: { xs: 'none', md: '1px solid' },
              borderBottom: { xs: '1px solid', md: 'none' },
              borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(226, 232, 240, 0.8)',
              display: 'flex',
              flexDirection: 'column',
              gap: 2.2,
              overflowY: 'auto',
              bgcolor: isDark ? '#0b1329' : '#fafafa',
            }}
          >
            {/* Action Banner */}
            <Box
              sx={{
                p: 1.5,
                px: 2,
                borderRadius: '12px',
                bgcolor: isDark ? 'rgba(79, 70, 229, 0.12)' : 'rgba(79, 70, 229, 0.06)',
                border: '1px solid',
                borderColor: isDark ? 'rgba(99, 102, 241, 0.25)' : 'rgba(79, 70, 229, 0.15)',
                display: 'flex',
                alignItems: 'center',
                gap: 1.2,
              }}
            >
              <Box sx={{ color: '#6366f1', display: 'flex' }}>{currentTabInfo.icon}</Box>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: isDark ? '#c7d2fe' : '#4338ca', fontSize: '0.85rem' }}>
                  {currentTabInfo.label}
                </Typography>
                <Typography variant="caption" sx={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '0.75rem' }}>
                  {currentTabInfo.desc}
                </Typography>
              </Box>
            </Box>

            {/* Tone & Length Segmented Selectors */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
              {/* Tone Control */}
              <Box>
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 700, color: isDark ? '#94a3b8' : '#475569', display: 'block', mb: 0.8, fontSize: '0.75rem' }}
                >
                  🎭 Phong cách diễn đạt:
                </Typography>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 0.6,
                  }}
                >
                  {TONE_OPTIONS.map((item) => {
                    const isSelected = tone === item.id;
                    return (
                      <Paper
                        key={item.id}
                        elevation={0}
                        onClick={() => setTone(item.id)}
                        sx={{
                          p: 0.8,
                          borderRadius: '8px',
                          cursor: 'pointer',
                          textAlign: 'center',
                          border: '1px solid',
                          borderColor: isSelected
                            ? '#4f46e5'
                            : isDark
                            ? 'rgba(255, 255, 255, 0.08)'
                            : 'rgba(226, 232, 240, 0.9)',
                          bgcolor: isSelected
                            ? isDark
                              ? 'rgba(79, 70, 229, 0.25)'
                              : 'rgba(79, 70, 229, 0.08)'
                            : isDark
                            ? 'rgba(30, 41, 59, 0.4)'
                            : '#ffffff',
                          transition: 'all 0.15s ease',
                          '&:hover': {
                            borderColor: '#6366f1',
                          },
                        }}
                      >
                        <Typography variant="caption" sx={{ fontWeight: isSelected ? 700 : 500, fontSize: '0.75rem', display: 'block' }}>
                          {item.icon} {item.label}
                        </Typography>
                      </Paper>
                    );
                  })}
                </Box>
              </Box>

              {/* Length Control */}
              <Box>
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 700, color: isDark ? '#94a3b8' : '#475569', display: 'block', mb: 0.8, fontSize: '0.75rem' }}
                >
                  📏 Độ dài (Length):
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.6 }}>
                  {LENGTH_OPTIONS.map((item) => {
                    const isSelected = length === item.id;
                    return (
                      <Paper
                        key={item.id}
                        elevation={0}
                        onClick={() => setLength(item.id)}
                        sx={{
                          p: 0.7,
                          px: 1.2,
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          border: '1px solid',
                          borderColor: isSelected
                            ? '#4f46e5'
                            : isDark
                            ? 'rgba(255, 255, 255, 0.08)'
                            : 'rgba(226, 232, 240, 0.9)',
                          bgcolor: isSelected
                            ? isDark
                              ? 'rgba(79, 70, 229, 0.25)'
                              : 'rgba(79, 70, 229, 0.08)'
                            : isDark
                            ? 'rgba(30, 41, 59, 0.4)'
                            : '#ffffff',
                          transition: 'all 0.15s ease',
                          '&:hover': {
                            borderColor: '#6366f1',
                          },
                        }}
                      >
                        <Typography variant="caption" sx={{ fontWeight: isSelected ? 700 : 500, fontSize: '0.75rem' }}>
                          {item.icon} {item.label}
                        </Typography>
                        <Typography variant="caption" sx={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '0.7rem' }}>
                          {item.desc}
                        </Typography>
                      </Paper>
                    );
                  })}
                </Box>
              </Box>
            </Box>

            {/* Prompt Input Section */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.8 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: isDark ? '#e2e8f0' : '#334155', fontSize: '0.78rem' }}>
                  💬 {t('editor.ai.customPromptLabel', 'Hoặc nhập yêu cầu riêng của bạn cho AI:')}
                </Typography>
                {userPrompt && (
                  <Button
                    size="small"
                    onClick={() => setUserPrompt('')}
                    startIcon={<DeleteOutlineIcon sx={{ fontSize: 14 }} />}
                    sx={{ textTransform: 'none', fontSize: '0.72rem', py: 0, color: 'text.secondary' }}
                  >
                    Xóa
                  </Button>
                )}
              </Box>

              {/* Quick Tags Bar */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6, mb: 1 }}>
                {quickTags.map((tag) => (
                  <Chip
                    key={tag}
                    label={`+ ${tag}`}
                    size="small"
                    onClick={() => handleQuickTagClick(tag)}
                    sx={{
                      height: 22,
                      fontSize: '0.72rem',
                      cursor: 'pointer',
                      bgcolor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                      border: '1px dashed',
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)',
                      '&:hover': {
                        borderColor: '#6366f1',
                        color: '#6366f1',
                        bgcolor: isDark ? 'rgba(99, 102, 241, 0.15)' : 'rgba(79, 70, 229, 0.06)',
                      },
                    }}
                  />
                ))}
              </Box>

              <TextField
                inputRef={inputRef}
                multiline
                rows={3.5}
                fullWidth
                size="small"
                placeholder={
                  selectedAction === 'generate'
                    ? t(
                        'editor.ai.customPromptPlaceholder',
                        'Ví dụ: Hãy viết thêm phần yêu cầu kỹ năng ReactJS, TypeScript và chế độ làm việc Hybrid...'
                      )
                    : t('editor.ai.customPromptPlaceholderSecondary', 'Nhập hướng dẫn bổ sung cho AI (tùy chọn)...')
                }
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                sx={{
                  bgcolor: isDark ? '#111c38' : '#ffffff',
                  borderRadius: '12px',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    fontSize: '0.88rem',
                    lineHeight: 1.5,
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(203, 213, 225, 0.8)',
                    '&:hover fieldset': {
                      borderColor: '#6366f1',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#4f46e5',
                      borderWidth: '1.5px',
                    },
                  },
                }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                <Typography variant="caption" sx={{ color: isDark ? '#64748b' : '#94a3b8', fontSize: '0.7rem' }}>
                  Phím tắt: <strong style={{ color: '#6366f1' }}>Ctrl + Enter</strong> để xử lý
                </Typography>
                <Typography variant="caption" sx={{ color: isDark ? '#64748b' : '#94a3b8', fontSize: '0.7rem' }}>
                  {userPrompt.length} ký tự
                </Typography>
              </Box>
            </Box>

            {/* Smart Suggestions */}
            <Box>
              <Typography
                variant="caption"
                sx={{ fontWeight: 700, color: isDark ? '#94a3b8' : '#475569', display: 'block', mb: 1, fontSize: '0.75rem' }}
              >
                💡 Gợi ý nhanh cho {currentContextObj.label}:
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                {suggestions.map((sug, idx) => (
                  <Paper
                    key={idx}
                    elevation={0}
                    onClick={() => {
                      setUserPrompt(sug);
                      handleGenerate(sug);
                    }}
                    sx={{
                      p: 1.1,
                      px: 1.4,
                      borderRadius: '10px',
                      border: '1px solid',
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(226, 232, 240, 0.9)',
                      cursor: 'pointer',
                      fontSize: '0.78rem',
                      color: isDark ? '#cbd5e1' : '#475569',
                      bgcolor: isDark ? 'rgba(30, 41, 59, 0.3)' : '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      transition: 'all 0.15s ease',
                      '&:hover': {
                        borderColor: '#6366f1',
                        color: '#4f46e5',
                        bgcolor: isDark ? 'rgba(79, 70, 229, 0.15)' : 'rgba(79, 70, 229, 0.04)',
                        transform: 'translateX(3px)',
                      },
                    }}
                  >
                    <AutoAwesomeIcon sx={{ fontSize: 13, color: '#6366f1', flexShrink: 0 }} />
                    <Typography variant="caption" sx={{ fontSize: '0.78rem', lineHeight: 1.4 }}>
                      {sug}
                    </Typography>
                  </Paper>
                ))}
              </Box>
            </Box>

            {/* Generate CTA Button */}
            <Button
              variant="contained"
              onClick={() => handleGenerate()}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <AutoAwesomeIcon />}
              fullWidth
              sx={{
                py: 1.3,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                boxShadow: '0 6px 20px rgba(79, 70, 229, 0.35)',
                fontWeight: 700,
                fontSize: '0.92rem',
                textTransform: 'none',
                mt: 'auto',
                transition: 'all 0.2s ease',
                '&:hover': {
                  background: 'linear-gradient(135deg, #4338ca 0%, #6d28d9 100%)',
                  boxShadow: '0 8px 25px rgba(79, 70, 229, 0.45)',
                  transform: 'translateY(-1px)',
                },
                '&:active': {
                  transform: 'translateY(0px)',
                },
              }}
            >
              {loading
                ? loadingStep === 0
                  ? 'AILA đang phân tích yêu cầu...'
                  : loadingStep === 1
                  ? 'Đang soạn thảo cấu trúc chuẩn HR...'
                  : 'Đang hoàn thiện định dạng HTML...'
                : t('editor.ai.generateButton', 'Xử lý bằng AI')}
            </Button>
          </Box>

          {/* Right Panel: Output Canvas & Preview */}
          <Box
            sx={{
              flex: 1,
              p: { xs: 2.5, sm: 3 },
              display: 'flex',
              flexDirection: 'column',
              bgcolor: isDark ? '#0f172a' : '#f8fafc',
              overflowY: 'auto',
            }}
          >
            {/* Output Header Bar */}
            <Box
              sx={{
                mb: 1.8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 1,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: isDark ? '#f8fafc' : '#0f172a', fontSize: '0.9rem' }}>
                  {t('editor.ai.resultTitle', 'Kết quả do AI đề xuất:')}
                </Typography>

                {resultStats && (
                  <Chip
                    label={`${resultStats.wordCount} từ • ~${resultStats.readingTimeMin}p đọc`}
                    size="small"
                    sx={{
                      height: 22,
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      bgcolor: isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)',
                      color: isDark ? '#6ee7b7' : '#059669',
                    }}
                  />
                )}
              </Box>

              {/* View Switcher & Action Tools */}
              {generatedResult && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Tabs
                    value={previewTab}
                    onChange={(_, v) => setPreviewTab(v)}
                    sx={{
                      minHeight: 32,
                      bgcolor: isDark ? 'rgba(30, 41, 59, 0.6)' : 'rgba(241, 245, 249, 0.9)',
                      borderRadius: '8px',
                      p: 0.3,
                      '& .MuiTabs-indicator': { display: 'none' },
                    }}
                  >
                    <Tab
                      value="preview"
                      label="Xem trước"
                      icon={<VisibilityIcon sx={{ fontSize: 14 }} />}
                      iconPosition="start"
                      sx={{
                        minHeight: 26,
                        py: 0.3,
                        px: 1.2,
                        fontSize: '0.75rem',
                        textTransform: 'none',
                        fontWeight: previewTab === 'preview' ? 700 : 500,
                        borderRadius: '6px',
                        color: isDark ? '#94a3b8' : '#64748b',
                        ...(previewTab === 'preview' && {
                          bgcolor: isDark ? '#1e293b' : '#ffffff',
                          color: '#4f46e5',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        }),
                      }}
                    />
                    <Tab
                      value="code"
                      label="Mã HTML"
                      icon={<CodeIcon sx={{ fontSize: 14 }} />}
                      iconPosition="start"
                      sx={{
                        minHeight: 26,
                        py: 0.3,
                        px: 1.2,
                        fontSize: '0.75rem',
                        textTransform: 'none',
                        fontWeight: previewTab === 'code' ? 700 : 500,
                        borderRadius: '6px',
                        color: isDark ? '#94a3b8' : '#64748b',
                        ...(previewTab === 'code' && {
                          bgcolor: isDark ? '#1e293b' : '#ffffff',
                          color: '#4f46e5',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        }),
                      }}
                    />
                  </Tabs>

                  <Tooltip title="Tạo lại nội dung khác">
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<ReplayIcon fontSize="small" />}
                      onClick={() => handleGenerate()}
                      disabled={loading}
                      sx={{
                        borderRadius: '8px',
                        textTransform: 'none',
                        fontSize: '0.75rem',
                        py: 0.5,
                        borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(203, 213, 225, 0.9)',
                      }}
                    >
                      {t('common.actions.retry', 'Thử lại')}
                    </Button>
                  </Tooltip>

                  <Tooltip title="Sao chép toàn bộ nội dung">
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={copied ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
                      onClick={handleCopy}
                      color={copied ? 'success' : 'inherit'}
                      sx={{
                        borderRadius: '8px',
                        textTransform: 'none',
                        fontSize: '0.75rem',
                        py: 0.5,
                        borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(203, 213, 225, 0.9)',
                      }}
                    >
                      {copied ? t('editor.ai.copied', 'Đã sao chép') : t('editor.ai.copy', 'Sao chép')}
                    </Button>
                  </Tooltip>
                </Box>
              )}
            </Box>

            {/* Content Output Box */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: '16px',
                border: '1px solid',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(226, 232, 240, 0.9)',
                bgcolor: isDark ? '#111827' : '#ffffff',
                flex: 1,
                overflowY: 'auto',
                minHeight: '340px',
                position: 'relative',
                boxShadow: isDark ? 'inset 0 2px 4px rgba(0,0,0,0.2)' : 'inset 0 1px 3px rgba(0,0,0,0.03)',
                '& h1, & h2, & h3': {
                  color: isDark ? '#818cf8' : '#4338ca',
                  fontWeight: 700,
                  mt: 1.8,
                  mb: 0.8,
                  '&:first-of-type': { mt: 0 },
                },
                '& h1': { fontSize: '1.3rem' },
                '& h2': { fontSize: '1.15rem' },
                '& h3': { fontSize: '1.02rem', borderBottom: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)', pb: 0.5 },
                '& p': { fontSize: '0.9rem', lineHeight: 1.65, mb: 1.2, color: isDark ? '#e2e8f0' : '#334155' },
                '& ul, & ol': { pl: 2.8, mb: 1.2 },
                '& li': { fontSize: '0.9rem', mb: 0.6, lineHeight: 1.6, color: isDark ? '#e2e8f0' : '#334155' },
                '& strong': { color: isDark ? '#f8fafc' : '#0f172a', fontWeight: 600 },
                '& blockquote': {
                  pl: 2,
                  py: 0.5,
                  borderLeft: '3px solid #6366f1',
                  bgcolor: isDark ? 'rgba(99, 102, 241, 0.1)' : 'rgba(79, 70, 229, 0.04)',
                  borderRadius: '0 8px 8px 0',
                  my: 1.5,
                  fontStyle: 'italic',
                },
              }}
            >
              {loading ? (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    py: 8,
                    gap: 2.5,
                  }}
                >
                  <Box
                    sx={{
                      width: 72,
                      height: 72,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.2) 0%, rgba(124, 58, 237, 0.2) 100%)',
                      border: '2px solid',
                      borderColor: 'rgba(99, 102, 241, 0.4)',
                      boxShadow: '0 0 25px rgba(99, 102, 241, 0.25)',
                      animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                      '@keyframes pulse': {
                        '0%, 100%': { transform: 'scale(1)', opacity: 1 },
                        '50%': { transform: 'scale(1.08)', opacity: 0.7 },
                      },
                    }}
                  >
                    <AutoAwesomeIcon sx={{ fontSize: 36, color: '#6366f1' }} />
                  </Box>

                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body1" sx={{ fontWeight: 700, color: isDark ? '#f8fafc' : '#0f172a', mb: 0.5 }}>
                      {loadingStep === 0 && '⚡ Đang phân tích ngữ cảnh & yêu cầu...'}
                      {loadingStep === 1 && '✨ Đang tối ưu cấu trúc & văn phong chuyên nghiệp...'}
                      {loadingStep === 2 && '🪄 Đang hoàn tất và xuất bản mã HTML...'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                      AILA Copilot v2.5 được tối ưu riêng cho định dạng tuyển dụng InfoHR
                    </Typography>
                  </Box>

                  <CircularProgress size={26} thickness={4} sx={{ color: '#6366f1' }} />
                </Box>
              ) : generatedResult ? (
                previewTab === 'preview' ? (
                  <div dangerouslySetInnerHTML={{ __html: generatedResult }} />
                ) : (
                  <Box
                    component="pre"
                    sx={{
                      fontSize: '0.8rem',
                      fontFamily: 'monospace',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-all',
                      color: isDark ? '#a5b4fc' : '#4338ca',
                      p: 1.5,
                      borderRadius: '8px',
                      bgcolor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.03)',
                      overflowX: 'auto',
                    }}
                  >
                    {generatedResult}
                  </Box>
                )
              ) : (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    py: 8,
                    color: isDark ? '#64748b' : '#94a3b8',
                    textAlign: 'center',
                    gap: 1.5,
                  }}
                >
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: '16px',
                      bgcolor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px dashed',
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                    }}
                  >
                    <AutoAwesomeIcon sx={{ fontSize: 32, color: isDark ? '#475569' : '#cbd5e1' }} />
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: isDark ? '#cbd5e1' : '#475569' }}>
                    {t('editor.ai.emptyResult', 'Chưa có nội dung tạo từ AI')}
                  </Typography>
                  <Typography variant="caption" sx={{ maxWidth: 360, lineHeight: 1.5 }}>
                    {t('editor.ai.emptyResultInstruction', 'Chọn tác vụ ở cột bên trái, nhập yêu cầu và nhấn nút "Xử lý bằng AI" để bắt đầu.')}
                  </Typography>

                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<AutoAwesomeIcon sx={{ fontSize: 15 }} />}
                    onClick={() => handleGenerate(suggestions[0])}
                    sx={{
                      mt: 1,
                      borderRadius: '10px',
                      textTransform: 'none',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      borderColor: '#6366f1',
                      color: '#4f46e5',
                      '&:hover': {
                        bgcolor: 'rgba(99, 102, 241, 0.08)',
                        borderColor: '#4f46e5',
                      },
                    }}
                  >
                    Thử ngay gợi ý đầu tiên
                  </Button>
                </Box>
              )}
            </Paper>

            {/* Quick Refine & Apply Toolbar */}
            {generatedResult && (
              <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {/* Quick Tweak Pills */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap' }}>
                  <Typography variant="caption" sx={{ color: isDark ? '#94a3b8' : '#64748b', fontWeight: 600, fontSize: '0.72rem' }}>
                    Chỉnh nhanh:
                  </Typography>
                  <Chip
                    label="⚡ Rút ngắn hơn"
                    size="small"
                    onClick={() => {
                      setSelectedAction('shorten');
                      handleGenerate();
                    }}
                    sx={{ height: 22, fontSize: '0.72rem', cursor: 'pointer' }}
                  />
                  <Chip
                    label="📖 Mở rộng thêm"
                    size="small"
                    onClick={() => {
                      setSelectedAction('expand');
                      handleGenerate();
                    }}
                    sx={{ height: 22, fontSize: '0.72rem', cursor: 'pointer' }}
                  />
                  <Chip
                    label="🎯 Trang trọng hơn"
                    size="small"
                    onClick={() => {
                      setTone('professional');
                      setSelectedAction('change_tone');
                      handleGenerate();
                    }}
                    sx={{ height: 22, fontSize: '0.72rem', cursor: 'pointer' }}
                  />
                  <Chip
                    label="🇬🇧 Dịch English"
                    size="small"
                    onClick={() => {
                      setSelectedAction('translate_en');
                      handleGenerate();
                    }}
                    sx={{ height: 22, fontSize: '0.72rem', cursor: 'pointer' }}
                  />
                </Box>

                {/* Main Apply Actions */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: 1.2,
                    flexWrap: 'wrap',
                  }}
                >
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<AddTaskIcon sx={{ fontSize: 16 }} />}
                    onClick={() => handleApply('insert')}
                    sx={{
                      borderRadius: '10px',
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: '0.82rem',
                      px: 1.8,
                      py: 0.8,
                    }}
                  >
                    {t('editor.ai.insertCursor', 'Chèn tại con trỏ')}
                  </Button>

                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<AddTaskIcon sx={{ fontSize: 16 }} />}
                    onClick={() => handleApply('append')}
                    sx={{
                      borderRadius: '10px',
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: '0.82rem',
                      px: 1.8,
                      py: 0.8,
                    }}
                  >
                    {t('editor.ai.insert', 'Thêm vào cuối bài')}
                  </Button>

                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<CheckIcon sx={{ fontSize: 16 }} />}
                    onClick={() => handleApply('replace')}
                    sx={{
                      borderRadius: '10px',
                      textTransform: 'none',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      px: 2.4,
                      py: 0.8,
                      background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                      boxShadow: '0 4px 14px rgba(79, 70, 229, 0.35)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #4338ca 0%, #6d28d9 100%)',
                      },
                    }}
                  >
                    {t('editor.ai.replace', 'Thay thế nội dung')}
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>

      {/* 4. Footer Status Bar */}
      <DialogActions
        sx={{
          px: 3,
          py: 1.4,
          borderTop: '1px solid',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(226, 232, 240, 0.8)',
          justifyContent: 'space-between',
          bgcolor: isDark ? '#0b1329' : '#fafafa',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AutoAwesomeIcon sx={{ fontSize: 14, color: '#6366f1' }} />
          <Typography variant="caption" sx={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '0.75rem' }}>
            {t('editor.ai.footerNote', 'Nội dung do AI tạo, vui lòng kiểm tra và hiệu chỉnh trước khi phát hành.')}
          </Typography>
        </Box>

        <Button
          onClick={onClose}
          size="small"
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            color: isDark ? '#cbd5e1' : '#64748b',
            borderRadius: '8px',
            px: 2,
          }}
        >
          {t('editor.ai.close', 'Đóng')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AIAssistantModal;

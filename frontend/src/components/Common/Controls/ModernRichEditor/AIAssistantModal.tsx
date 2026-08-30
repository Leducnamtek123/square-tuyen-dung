import React, { useState, useEffect } from 'react';
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
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
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

const CONTEXT_LABELS: Record<AIContentType, string> = {
  company: '🏢 Giới thiệu doanh nghiệp',
  job_desc: '💼 Mô tả công việc (JD)',
  job_req: '🎯 Yêu cầu ứng viên',
  benefits: '🎁 Quyền lợi & Phúc lợi',
  email: '✉️ Thư gửi ứng viên',
  blog: '📝 Bài viết / Tin tức',
  general: '📄 Soạn thảo tổng hợp',
};

const ACTION_TABS: Array<{ id: AIActionType; label: string; icon: React.ReactNode; desc: string }> = [
  { id: 'generate', label: 'Viết Mới Toàn Diện', icon: <AutoAwesomeIcon fontSize="small" />, desc: 'Tạo bài viết hoàn chỉnh chuẩn cấu trúc theo chủ đề của bạn' },
  { id: 'improve', label: 'Nâng Cấp Văn Phong', icon: <SparklesIcon fontSize="small" />, desc: 'Chỉnh sửa câu từ mượt mà, chuyên nghiệp và cuốn hút hơn' },
  { id: 'fix_spelling', label: 'Sửa Lỗi Chính Tả', icon: <SpellcheckIcon fontSize="small" />, desc: 'Rà soát và chuẩn hóa chính tả, ngữ pháp tiếng Việt / Anh' },
  { id: 'shorten', label: 'Rút Gọn Súc Tích', icon: <ShortTextIcon fontSize="small" />, desc: 'Tóm tắt các ý quan trọng nhất thành dạng ngắn gọn dễ nhớ' },
  { id: 'expand', label: 'Mở Rộng Chi Tiết', icon: <FormatQuoteIcon fontSize="small" />, desc: 'Bổ sung thêm luận điểm, ví dụ thực tế và giải thích chi tiết' },
  { id: 'change_tone', label: 'Đổi Giọng Văn', icon: <SparklesIcon fontSize="small" />, desc: 'Chuyển đổi phong cách sang: Trang trọng, Thân thiện, Thu hút' },
  { id: 'translate_en', label: 'Dịch sang Tiếng Anh', icon: <TranslateIcon fontSize="small" />, desc: 'Dịch thuật chuẩn ngữ cảnh doanh nghiệp giữ nguyên định dạng' },
  { id: 'translate_vi', label: 'Dịch sang Tiếng Việt', icon: <TranslateIcon fontSize="small" />, desc: 'Dịch thuật sang tiếng Việt tự nhiên và chuẩn mực' },
  { id: 'custom', label: 'Tùy Chỉnh Prompt', icon: <AutoAwesomeIcon fontSize="small" />, desc: 'Yêu cầu AI làm bất cứ điều gì bạn mong muốn' },
];

const PROMPT_SUGGESTIONS: Record<AIContentType, string[]> = {
  company: [
    'Viết bài giới thiệu doanh nghiệp công nghệ năng động, lấy con người làm trọng tâm',
    'Tập trung vào sứ mệnh chuyển đổi số và các cam kết chất lượng với khách hàng',
    'Nêu bật văn hóa phẳng, cởi mở và các chính sách phát triển nhân tài vượt trội',
  ],
  job_desc: [
    'Tạo mô tả công việc (JD) thu hút cho vị trí Senior Fullstack Developer',
    'Soạn bản mô tả công việc Chuyên viên Marketing đa kênh (Digital Marketing)',
    'Viết nhiệm vụ chính cho vị trí Chuyên viên Tư vấn & Kinh doanh B2B',
  ],
  job_req: [
    'Yêu cầu 2+ năm kinh nghiệm, tư duy phản biện tốt và chủ động trong công việc',
    'Khung kỹ năng chuyên môn vững vàng, khả năng giao tiếp tiếng Anh lưu loát',
    'Đòi hỏi tinh thần trách nhiệm cao và khả năng giải quyết vấn đề dưới áp lực',
  ],
  benefits: [
    'Gói đãi ngộ hấp dẫn: Review lương 2 lần/năm, thưởng tháng 13+ và bảo hiểm sức khỏe VIP',
    'Môi trường làm việc Hybrid linh hoạt, cung cấp MacBook Pro và đào tạo chuyên sâu',
    'Du lịch resort 5 sao hàng năm, phụ cấp cơm trưa và teambuilding sôi nổi',
  ],
  email: [
    'Thư mời phỏng vấn trực tiếp tại văn phòng vào 9h sáng thứ Hai tuần tới',
    'Thư mời phỏng vấn online qua Google Meet kèm hướng dẫn chuẩn bị',
    'Thư đề nghị nhận việc (Offer Letter) kèm mức lương và chế độ đãi ngộ',
    'Thư từ chối ứng viên lịch sự và lưu hồ sơ vào Talent Pool tương lai',
  ],
  blog: [
    'Viết bài phân tích xu hướng tuyển dụng nhân sự công nghệ năm 2026',
    'Bí quyết phỏng vấn và giữ chân nhân tài cho các doanh nghiệp vừa và nhỏ',
  ],
  general: [
    'Viết văn bản chuyên nghiệp, cấu trúc rõ ràng với các gạch đầu dòng nổi bật',
    'Tối ưu hóa nội dung cho người đọc dễ nắm bắt thông tin quan trọng nhất',
  ],
};

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  open,
  onClose,
  currentContent,
  onApplyContent,
  detectedContext = 'general',
}) => {
  const [selectedAction, setSelectedAction] = useState<AIActionType>('generate');
  const [contentType, setContentType] = useState<AIContentType>(detectedContext);
  const [tone, setTone] = useState<AITone>('professional');
  const [length, setLength] = useState<AILength>('medium');
  const [userPrompt, setUserPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setContentType(detectedContext);
  }, [detectedContext]);

  const currentTabInfo = ACTION_TABS.find((t) => t.id === selectedAction) || ACTION_TABS[0];
  const suggestions = PROMPT_SUGGESTIONS[contentType] || PROMPT_SUGGESTIONS.general;

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const result = await generateWithAI({
        action: selectedAction,
        contentType,
        currentContent,
        userPrompt,
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

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: 'hidden',
          minHeight: '640px',
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(168, 85, 247, 0.08) 100%)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
              color: '#fff',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
            }}
          >
            <AutoAwesomeIcon />
          </Box>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="subtitle1" fontWeight={700}>
                AILA AI Writing Assistant
              </Typography>
              <Chip
                label="AI v2.0"
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  bgcolor: 'rgba(99, 102, 241, 0.15)',
                  color: 'primary.main',
                }}
              />
            </Box>
            <Typography variant="caption" color="text.secondary">
              Trợ lý trí tuệ nhân tạo chuyên biệt cho soạn thảo văn bản doanh nghiệp và tuyển dụng
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            label={CONTEXT_LABELS[contentType] || CONTEXT_LABELS.general}
            variant="outlined"
            size="small"
            sx={{ fontWeight: 600, borderColor: 'primary.main', color: 'primary.main' }}
          />
          <IconButton onClick={onClose} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {/* Action Selector Pills */}
        <Box
          sx={{
            p: 2,
            px: 3,
            borderBottom: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            gap: 1,
            overflowX: 'auto',
            bgcolor: 'background.paper',
          }}
        >
          {ACTION_TABS.map((tab) => {
            const isSelected = tab.id === selectedAction;
            return (
              <Button
                key={tab.id}
                size="small"
                onClick={() => setSelectedAction(tab.id)}
                startIcon={tab.icon}
                variant={isSelected ? 'contained' : 'outlined'}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  px: 1.8,
                  py: 0.8,
                  fontSize: '0.82rem',
                  ...(isSelected
                    ? {
                        background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                        boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)',
                      }
                    : {
                        borderColor: 'divider',
                        color: 'text.primary',
                        '&:hover': {
                          borderColor: 'primary.main',
                          bgcolor: 'rgba(99, 102, 241, 0.04)',
                        },
                      }),
                }}
              >
                {tab.label}
              </Button>
            );
          })}
        </Box>

        {/* Workspace Layout */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, minHeight: '480px' }}>
          {/* Left Column: Prompt & Parameters */}
          <Box
            sx={{
              width: { xs: '100%', md: '42%' },
              p: 3,
              borderRight: { xs: 'none', md: '1px solid' },
              borderBottom: { xs: '1px solid', md: 'none' },
              borderColor: 'divider',
              display: 'flex',
              flexDirection: 'column',
              gap: 2.5,
              overflowY: 'auto',
            }}
          >
            <Box>
              <Typography variant="subtitle2" fontWeight={700} color="primary.main">
                {currentTabInfo.label}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {currentTabInfo.desc}
              </Typography>
            </Box>

            {/* Parameter Controls */}
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <FormControl size="small" fullWidth>
                <InputLabel>Văn phong (Tone)</InputLabel>
                <Select value={tone} label="Văn phong (Tone)" onChange={(e) => setTone(e.target.value as AITone)}>
                  <MenuItem value="professional">Trang trọng & Chuẩn mực</MenuItem>
                  <MenuItem value="friendly">Thân thiện & Truyền cảm hứng</MenuItem>
                  <MenuItem value="persuasive">Thu hút & Thuyết phục</MenuItem>
                  <MenuItem value="creative">Hiện đại & Sáng tạo</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" fullWidth>
                <InputLabel>Độ dài (Length)</InputLabel>
                <Select value={length} label="Độ dài (Length)" onChange={(e) => setLength(e.target.value as AILength)}>
                  <MenuItem value="short">Ngắn gọn (2-3 đoạn)</MenuItem>
                  <MenuItem value="medium">Tiêu chuẩn (300-500 từ)</MenuItem>
                  <MenuItem value="detailed">Chi tiết toàn diện (500-800 từ)</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Prompt Input */}
            <Box>
              <Typography variant="caption" fontWeight={600} color="text.secondary" gutterBottom>
                Yêu cầu cụ thể / Từ khóa chính:
              </Typography>
              <TextField
                multiline
                rows={4}
                fullWidth
                size="small"
                placeholder={
                  selectedAction === 'generate'
                    ? 'Ví dụ: Viết bài giới thiệu doanh nghiệp công nghệ, định hướng phát triển sản phẩm SaaS B2B, văn hóa năng động...'
                    : 'Nhập hướng dẫn bổ sung cho AI (tùy chọn)...'
                }
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                sx={{ mt: 0.5 }}
              />
            </Box>

            {/* Suggestion Prompts */}
            <Box>
              <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                💡 Gợi ý nhanh cho {CONTEXT_LABELS[contentType]}:
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                {suggestions.map((sug, idx) => (
                  <Paper
                    key={idx}
                    elevation={0}
                    onClick={() => setUserPrompt(sug)}
                    sx={{
                      p: 1.2,
                      px: 1.5,
                      borderRadius: 1.5,
                      border: '1px dashed',
                      borderColor: 'divider',
                      cursor: 'pointer',
                      fontSize: '0.78rem',
                      color: 'text.secondary',
                      transition: 'all 0.15s ease',
                      '&:hover': {
                        borderColor: 'primary.main',
                        color: 'primary.main',
                        bgcolor: 'rgba(99, 102, 241, 0.04)',
                      },
                    }}
                  >
                    • {sug}
                  </Paper>
                ))}
              </Box>
            </Box>

            {/* Generate Button */}
            <Button
              variant="contained"
              onClick={handleGenerate}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <AutoAwesomeIcon />}
              fullWidth
              sx={{
                py: 1.2,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
                fontWeight: 700,
                fontSize: '0.9rem',
                textTransform: 'none',
                mt: 'auto',
              }}
            >
              {loading ? 'AI Đang Soạn Thảo...' : 'Tạo Nội Dung Với AI'}
            </Button>
          </Box>

          {/* Right Column: Live Result & Actions */}
          <Box
            sx={{
              flex: 1,
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50'),
              overflowY: 'auto',
            }}
          >
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="subtitle2" fontWeight={700}>
                  Kết Quả Do AI Tạo Ra
                </Typography>
                {generatedResult && (
                  <Chip label="Đã hoàn thành" color="success" size="small" sx={{ height: 20, fontSize: '0.72rem' }} />
                )}
              </Box>

              {generatedResult && (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<ReplayIcon fontSize="small" />}
                    onClick={handleGenerate}
                    disabled={loading}
                  >
                    Tạo lại
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={copied ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
                    onClick={handleCopy}
                    color={copied ? 'success' : 'inherit'}
                  >
                    {copied ? 'Đã sao chép' : 'Sao chép'}
                  </Button>
                </Box>
              )}
            </Box>

            <Divider sx={{ mb: 2 }} />

            {/* Content Output Card */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                flex: 1,
                overflowY: 'auto',
                minHeight: '300px',
                position: 'relative',
                '& h1, & h2, & h3': { color: 'primary.main', fontWeight: 700, mt: 1.5, mb: 1 },
                '& h3': { fontSize: '1.05rem' },
                '& p': { fontSize: '0.9rem', lineHeight: 1.6, mb: 1.2 },
                '& ul, & ol': { pl: 2.5, mb: 1.2 },
                '& li': { fontSize: '0.9rem', mb: 0.6, lineHeight: 1.5 },
                '& strong': { color: 'text.primary', fontWeight: 600 },
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
                    gap: 2,
                  }}
                >
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)',
                      animation: 'pulse 1.5s infinite',
                    }}
                  >
                    <AutoAwesomeIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                  </Box>
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>
                    AILA đang tổng hợp và trau chuốt nội dung...
                  </Typography>
                  <CircularProgress size={24} />
                </Box>
              ) : generatedResult ? (
                <div dangerouslySetInnerHTML={{ __html: generatedResult }} />
              ) : (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    py: 8,
                    color: 'text.secondary',
                    textAlign: 'center',
                    gap: 1.5,
                  }}
                >
                  <AutoAwesomeIcon sx={{ fontSize: 44, color: 'text.disabled' }} />
                  <Typography variant="body2" fontWeight={600}>
                    Chưa có nội dung nào được tạo
                  </Typography>
                  <Typography variant="caption" sx={{ maxWidth: 360 }}>
                    Chọn tác vụ ở cột bên trái, nhập yêu cầu và nhấn nút <strong>"Tạo Nội Dung Với AI"</strong> để bắt đầu.
                  </Typography>
                </Box>
              )}
            </Paper>

            {/* Apply Action Buttons */}
            {generatedResult && (
              <Box sx={{ mt: 2.5, display: 'flex', gap: 1.5, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AddTaskIcon />}
                  onClick={() => handleApply('insert')}
                >
                  Chèn Vào Vị Trí Con Trỏ
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AddTaskIcon />}
                  onClick={() => handleApply('append')}
                >
                  Thêm Vào Cuối
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => handleApply('replace')}
                  sx={{
                    background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                    fontWeight: 700,
                    px: 2.5,
                  }}
                >
                  Thay Thế Toàn Bộ
                </Button>
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 1.5, borderTop: '1px solid', borderColor: 'divider', justifyContent: 'space-between' }}>
        <Typography variant="caption" color="text.secondary">
          ⚡ AI được huấn luyện chuyên sâu cho quy trình tuyển dụng và thương hiệu doanh nghiệp
        </Typography>
        <Button onClick={onClose} color="inherit">
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AIAssistantModal;

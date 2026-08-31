'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  TextField,
  MenuItem,
  Chip,
  InputAdornment,
  CircularProgress,
  Divider,
} from '@mui/material';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import FormatQuoteOutlinedIcon from '@mui/icons-material/FormatQuoteOutlined';
import StarsOutlinedIcon from '@mui/icons-material/StarsOutlined';

import cvBuilderService from '@/services/cvBuilderService';
import { CVSuggestionRecord } from '@/types/cvBuilder';
import toastMessages from '@/utils/toastMessages';

interface AIAssistantTabProps {
  onApplyBio: (text: string) => void;
}

const INDUSTRY_OPTIONS = [
  { value: 'all', label: 'Tất cả ngành nghề' },
  { value: 'IT', label: 'Công nghệ thông tin / IT' },
  { value: 'Marketing', label: 'Marketing & Truyền thông' },
  { value: 'Sales', label: 'Kinh doanh & B2B Sales' },
  { value: 'HR', label: 'Nhân sự & Tuyển dụng' },
  { value: 'Finance', label: 'Tài chính & Kế toán' },
  { value: 'Construction', label: 'Xây dựng & Kiến trúc' },
];

interface GeneratedAICity {
  bio: string;
  bullets: string[];
  skills: string[];
}

export const AIAssistantTab: React.FC<AIAssistantTabProps> = ({ onApplyBio }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // AI Generator state
  const [targetRole, setTargetRole] = useState<string>('Senior Marketing Executive');
  const [expYears, setExpYears] = useState<string>('3-5 năm');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedAI, setGeneratedAI] = useState<GeneratedAICity | null>(null);

  const { data: suggestions = [], isLoading } = useQuery<CVSuggestionRecord[]>({
    queryKey: ['cv-suggestions', selectedIndustry, searchQuery],
    queryFn: () =>
      cvBuilderService.getSuggestions({
        industry: selectedIndustry === 'all' ? undefined : selectedIndustry,
        search: searchQuery.trim() || undefined,
      }),
    staleTime: 5 * 60 * 1000,
  });

  const handleGenerateWithAI = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const role = targetRole.trim() || 'Chuyên viên';
      const isDev = /developer|frontend|backend|fullstack|it|kỹ sư phần mềm/i.test(role);
      const isMarketing = /marketing|truyền thông|seo|content|growth/i.test(role);
      const isSales = /sales|kinh doanh|bán hàng|b2b/i.test(role);
      const isHR = /hr|nhân sự|tuyển dụng|recruiter/i.test(role);
      const isConstruction = /kiến trúc|xây dựng|mep|công trình|kỹ sư/i.test(role);

      let genBio = `Hơn ${expYears} kinh nghiệm trong lĩnh vực ${role}, có thế mạnh chuyên sâu về tối ưu quy trình, quản trị mục tiêu và phát triển hiệu quả công việc. Tinh thần trách nhiệm cao, tư duy phân tích nhạy bén, luôn chủ động giải quyết vấn đề và đóng góp giá trị đo lường được cho tổ chức.`;
      let genBullets = [
        `• Hoạch định và triển khai các hạng mục trọng điểm cho vị trí ${role}, nâng cao hiệu suất làm việc nhóm lên 35%.`,
        `• Trực tiếp quản lý và tối ưu hóa quy trình làm việc, giảm thời gian xử lý thủ công 25% và tiết kiệm chi phí vận hành.`,
        `• Phối hợp liên phòng ban để hoàn thành 100% chỉ tiêu KPI đề ra, nhận đánh giá nhân sự xuất sắc từ cấp quản lý.`,
      ];
      let genSkills = ['Kỹ năng giao tiếp', 'Tư duy chiến lược', 'Giải quyết vấn đề', 'Quản lý thời gian', 'Làm việc nhóm'];

      if (isDev) {
        genBio = `Lập trình viên ${role} với ${expYears} kinh nghiệm phát triển các hệ thống web quy mô lớn, kiến trúc vi dịch vụ và tối ưu trải nghiệm người dùng (UX/UI). Am hiểu quy trình CI/CD, viết mã nguồn sạch (Clean Code), tư duy logic vững chắc và khả năng thích ứng công nghệ mới nhanh chóng.`;
        genBullets = [
          `• Thiết kế và phát triển các module frontend/backend hiệu năng cao, tối ưu điểm Core Web Vitals từ 65 lên 95/100.`,
          `• Tái cấu trúc mã nguồn và chuẩn hóa Design System, giảm 40% thời gian phát triển tính năng mới của toàn đội ngũ.`,
          `• Xây dựng và duy trì luồng kiểm thử tự động (Unit Test / E2E Test) đạt tỷ lệ bao phủ hơn 85%, hạn chế tối đa lỗi phát sinh.`,
        ];
        genSkills = ['React/Next.js', 'TypeScript', 'Node.js/Python', 'RESTful API/GraphQL', 'Git & CI/CD', 'Agile/Scrum'];
      } else if (isMarketing) {
        genBio = `Chuyên viên ${role} với ${expYears} kinh nghiệm thực chiến trong việc lập chiến lược Marketing đa kênh, tối ưu phễu chuyển đổi và xây dựng thương hiệu. Sở hữu tư duy phân tích số liệu (Data-Driven), nhạy bén với xu hướng thị trường và năng lực tối ưu ngân sách quảng cáo hiệu quả.`;
        genBullets = [
          `• Lên kế hoạch và thực thi chiến dịch Performance Marketing đa kênh (Google Ads, Meta, TikTok), tăng trưởng doanh thu 45%.`,
          `• Tối ưu phễu chuyển đổi (Conversion Rate Optimization), giảm chỉ số CPA 28% và tăng lượng khách hàng tiềm năng chất lượng.`,
          `• Quản trị hệ thống Content & SEO, thúc đẩy lưu lượng truy cập tự nhiên (Organic Traffic) tăng 120.000 lượt xem/tháng.`,
        ];
        genSkills = ['Digital Marketing', 'SEO & SEM', 'Google Analytics / GA4', 'Content Strategy', 'Conversion Rate (CRO)', 'Meta Ads'];
      } else if (isSales) {
        genBio = `Chuyên viên ${role} với ${expYears} kinh nghiệm phát triển thị trường, đàm phán hợp đồng B2B và duy trì mối quan hệ khách hàng chiến lược. Kỹ năng giao tiếp thuyết phục, định hướng mục tiêu doanh số rõ ràng và khả năng xử lý tình huống linh hoạt.`;
        genBullets = [
          `• Mở rộng danh mục khách hàng mới, vượt chỉ tiêu doanh số năm liên tục đạt 130% - 150% KPI được giao.`,
          `• Đàm phán và chốt thành công 25+ hợp đồng doanh nghiệp lớn với giá trị hợp đồng trung bình tăng 35%.`,
          `• Xây dựng quy trình chăm sóc khách hàng sau bán hàng, tăng tỷ lệ gia hạn dịch vụ (Retention Rate) lên 88%.`,
        ];
        genSkills = ['B2B Sales', 'Kỹ năng đàm phán', 'CRM (HubSpot/Salesforce)', 'Chăm sóc khách hàng', 'Thuyết trình & Pitching'];
      } else if (isConstruction) {
        genBio = `${role} với ${expYears} kinh nghiệm tham gia giám sát, thiết kế và quản lý các công trình dân dụng & công nghiệp. Thành thạo phần mềm chuyên ngành, nắm vững quy chuẩn xây dựng Việt Nam và quốc tế, đảm bảo an toàn lao động và tiến độ chất lượng.`;
        genBullets = [
          `• Giám sát thi công và nghiệm thu các gói thầu trọng điểm, đảm bảo tiến độ bàn giao sớm 15 ngày so với kế hoạch.`,
          `• Rà soát hồ sơ thiết kế kỹ thuật, phát hiện và xử lý kịp thời các xung đột kết cấu giúp tiết kiệm 8% chi phí vật tư.`,
          `• Phối hợp chặt chẽ với Chủ đầu tư và Tư vấn giám sát, thực hiện nghiêm ngặt quy trình ATLĐ & VSMT.`,
        ];
        genSkills = ['AutoCAD / Revit', 'BIM / SketchUp', 'Đọc bản vẽ kỹ thuật', 'Giám sát công trình', 'An toàn lao động (HSE)'];
      }

      setGeneratedAI({
        bio: genBio,
        bullets: genBullets,
        skills: genSkills,
      });
      setIsGenerating(false);
      toastMessages.success('AI đã tạo xong gợi ý mục tiêu & kinh nghiệm chuẩn ATS!');
    }, 600);
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toastMessages.success('Đã sao chép vào bộ nhớ tạm!');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* ── AI Generator Interactive Box ──────────────────────────────────── */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          borderRadius: '16px',
          bgcolor: '#f8fafc',
          border: '1.5px solid #cbd5e1',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <Box sx={{ p: 0.75, borderRadius: '8px', bgcolor: '#7c3aed', color: '#ffffff', display: 'flex' }}>
            <AutoAwesomeOutlinedIcon sx={{ fontSize: 18 }} />
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.875rem' }}>
              Trợ Lý AI Tạo Tóm Tắt & Mô Tả Công Việc
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.725rem' }}>
              Nhập chức danh của bạn để AI tự động biên soạn đoạn tóm tắt và các thành tích kèm số liệu KPI chuẩn ATS.
            </Typography>
          </Box>
        </Stack>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '2fr 1fr' }, gap: 1.5 }}>
          <TextField
            size="small"
            label="Chức danh / Vị trí mục tiêu"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            placeholder="VD: Senior React Developer, Marketing Manager..."
            fullWidth
            sx={{ bgcolor: '#ffffff' }}
          />
          <TextField
            select
            size="small"
            label="Kinh nghiệm"
            value={expYears}
            onChange={(e) => setExpYears(e.target.value)}
            sx={{ bgcolor: '#ffffff' }}
          >
            <MenuItem value="Chưa có kinh nghiệm">Mới tốt nghiệp / Fresher</MenuItem>
            <MenuItem value="1-2 năm">1 - 2 năm</MenuItem>
            <MenuItem value="3-5 năm">3 - 5 năm</MenuItem>
            <MenuItem value="Trên 5 năm">Trên 5 năm (Senior/Lead)</MenuItem>
          </TextField>
        </Box>

        <Button
          variant="contained"
          disabled={isGenerating}
          onClick={handleGenerateWithAI}
          startIcon={<BoltOutlinedIcon sx={{ fontSize: 18 }} />}
          sx={{
            bgcolor: '#7c3aed',
            color: '#ffffff',
            fontWeight: 800,
            fontSize: '0.8rem',
            borderRadius: '10px',
            textTransform: 'none',
            py: 1,
            boxShadow: '0 4px 12px rgba(124, 58, 237, 0.25)',
            '&:hover': { bgcolor: '#6d28d9' },
          }}
        >
          {isGenerating ? 'AI đang biên soạn...' : 'Tạo gợi ý với AI'}
        </Button>

        {/* AI Generated Result Box */}
        {generatedAI && (
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: '12px',
              bgcolor: '#ffffff',
              border: '1.5px solid #ddd6fe',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            {/* 1. Bio Generated */}
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Stack direction="row" spacing={0.75} alignItems="center">
                  <FormatQuoteOutlinedIcon sx={{ fontSize: 16, color: '#7c3aed' }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#5b21b6', fontSize: '0.8rem' }}>
                    Tóm tắt nghề nghiệp đề xuất:
                  </Typography>
                </Stack>
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => onApplyBio(generatedAI.bio)}
                  startIcon={<CheckCircleOutlineIcon sx={{ fontSize: 14 }} />}
                  sx={{
                    borderRadius: '8px',
                    bgcolor: '#7c3aed',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.7rem',
                    textTransform: 'none',
                    py: 0.3,
                    px: 1.25,
                    '&:hover': { bgcolor: '#6d28d9' },
                  }}
                >
                  Áp dụng vào Tóm tắt
                </Button>
              </Stack>
              <Box sx={{ p: 1.5, bgcolor: '#f5f3ff', borderRadius: '8px', border: '1px solid #ede9fe' }}>
                <Typography variant="body2" sx={{ color: '#334155', fontSize: '0.775rem', lineHeight: 1.55 }}>
                  {generatedAI.bio}
                </Typography>
              </Box>
            </Box>

            {/* 2. Bullets Generated */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.8rem', mb: 1 }}>
                Mẫu mô tả thành tích kinh nghiệm (kèm KPI số liệu):
              </Typography>
              <Stack spacing={1}>
                {generatedAI.bullets.map((b, bIdx) => (
                  <Box
                    key={bIdx}
                    sx={{
                      p: 1.25,
                      bgcolor: '#f8fafc',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <Typography variant="body2" sx={{ color: '#334155', fontSize: '0.75rem', lineHeight: 1.45, flex: 1 }}>
                      {b}
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleCopy(b, 1000 + bIdx)}
                      startIcon={<ContentCopyOutlinedIcon sx={{ fontSize: 12 }} />}
                      sx={{
                        fontSize: '0.675rem',
                        fontWeight: 700,
                        textTransform: 'none',
                        py: 0.25,
                        px: 1,
                        borderRadius: '6px',
                        borderColor: '#cbd5e1',
                        color: '#475569',
                      }}
                    >
                      {copiedIndex === 1000 + bIdx ? 'Đã chép' : 'Chép'}
                    </Button>
                  </Box>
                ))}
              </Stack>
            </Box>

            {/* 3. Core Skills */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.8rem', mb: 0.75 }}>
                Kỹ năng trọng tâm chuẩn ATS:
              </Typography>
              <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                {generatedAI.skills.map((s, sIdx) => (
                  <Chip
                    key={sIdx}
                    label={`+ ${s}`}
                    clickable
                    onClick={() => handleCopy(s, 2000 + sIdx)}
                    size="small"
                    sx={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      bgcolor: '#ede9fe',
                      color: '#6d28d9',
                      borderRadius: '6px',
                      height: 24,
                      '&:hover': { bgcolor: '#ddd6fe' },
                    }}
                  />
                ))}
              </Stack>
            </Box>
          </Paper>
        )}
      </Paper>

      <Divider sx={{ my: 0.5, borderColor: '#e2e8f0' }}>
        <Chip label="Thư viện gợi ý mẫu theo ngành" size="small" sx={{ fontSize: '0.725rem', fontWeight: 600, color: '#64748b' }} />
      </Divider>

      {/* ── Filter & Search Toolbar ─────────────────────────────────────────── */}
      <Stack direction="row" spacing={1.5}>
        <TextField
          select
          size="small"
          value={selectedIndustry}
          onChange={(e) => setSelectedIndustry(e.target.value)}
          sx={{ width: 180, bgcolor: '#ffffff' }}
        >
          {INDUSTRY_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: '0.8rem' }}>
              {opt.label}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          size="small"
          fullWidth
          placeholder="Tìm trong thư viện mẫu..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchOutlinedIcon sx={{ fontSize: 18, color: '#94a3b8' }} />
              </InputAdornment>
            ),
          }}
          sx={{ bgcolor: '#ffffff' }}
        />
      </Stack>

      {/* ── Suggestions List ────────────────────────────────────────────── */}
      <Stack spacing={2}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={24} sx={{ color: '#2563eb' }} />
          </Box>
        ) : suggestions.length > 0 ? (
          suggestions.map((item, index) => (
            <Paper
              key={item.id}
              elevation={0}
              sx={{
                p: 2,
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                bgcolor: '#ffffff',
                transition: 'border-color 0.2s',
                '&:hover': { borderColor: '#93c5fd' },
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
              }}
            >
              {/* Card Header & Action Buttons */}
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.85rem' }}>
                    {item.title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#2563eb', fontWeight: 700, fontSize: '0.7rem' }}>
                    {item.industry_name}
                  </Typography>
                </Box>

                <Stack direction="row" spacing={1} sx={{ shrink: 0 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleCopy(item.content, index)}
                    startIcon={
                      copiedIndex === index ? (
                        <CheckCircleOutlineIcon sx={{ fontSize: 14, color: '#16a34a' }} />
                      ) : (
                        <ContentCopyOutlinedIcon sx={{ fontSize: 14 }} />
                      )
                    }
                    sx={{
                      borderRadius: '8px',
                      borderColor: '#cbd5e1',
                      color: copiedIndex === index ? '#16a34a' : '#475569',
                      fontWeight: 700,
                      fontSize: '0.725rem',
                      textTransform: 'none',
                      px: 1.25,
                      py: 0.4,
                      '&:hover': { bgcolor: '#f8fafc', borderColor: '#94a3b8' },
                    }}
                  >
                    {copiedIndex === index ? 'Đã chép' : 'Sao chép'}
                  </Button>

                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => onApplyBio(item.content)}
                    startIcon={<CheckCircleOutlineIcon sx={{ fontSize: 14 }} />}
                    sx={{
                      borderRadius: '8px',
                      bgcolor: '#1e40af',
                      color: '#ffffff',
                      fontWeight: 700,
                      fontSize: '0.725rem',
                      textTransform: 'none',
                      px: 1.5,
                      py: 0.4,
                      boxShadow: '0 2px 6px rgba(30, 64, 175, 0.25)',
                      '&:hover': { bgcolor: '#1d4ed8' },
                    }}
                  >
                    Áp dụng
                  </Button>
                </Stack>
              </Stack>

              {/* Content Body */}
              <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                <Typography variant="body2" sx={{ color: '#334155', fontSize: '0.775rem', lineHeight: 1.5 }}>
                  {item.content}
                </Typography>
              </Box>

              {/* Skills Chips */}
              {item.skills_list && item.skills_list.length > 0 && (
                <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                  {item.skills_list.map((skill, skIdx) => (
                    <Chip
                      key={skIdx}
                      label={skill}
                      size="small"
                      sx={{
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        bgcolor: '#f1f5f9',
                        color: '#475569',
                        borderRadius: '6px',
                        height: 22,
                      }}
                    />
                  ))}
                </Stack>
              )}
            </Paper>
          ))
        ) : (
          <Box sx={{ textAlign: 'center', py: 4, color: '#94a3b8', fontSize: '0.8rem' }}>
            Không tìm thấy gợi ý phù hợp.
          </Box>
        )}
      </Stack>
    </Box>
  );
};

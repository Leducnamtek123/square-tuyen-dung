'use client';

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Grid2 as Grid,
  Stack,
  Button,
  Avatar,
  Divider,
} from '@mui/material';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import CompareArrowsOutlinedIcon from '@mui/icons-material/CompareArrowsOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';
import DiamondOutlinedIcon from '@mui/icons-material/DiamondOutlined';
import WaterDropOutlinedIcon from '@mui/icons-material/WaterDropOutlined';
import ParkOutlinedIcon from '@mui/icons-material/ParkOutlined';
import WhatshotOutlinedIcon from '@mui/icons-material/WhatshotOutlined';
import TerrainOutlinedIcon from '@mui/icons-material/TerrainOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import TipsAndUpdatesOutlinedIcon from '@mui/icons-material/TipsAndUpdatesOutlined';
import FormatListNumberedOutlinedIcon from '@mui/icons-material/FormatListNumberedOutlined';
import AutoFixHighOutlinedIcon from '@mui/icons-material/AutoFixHighOutlined';

export const CVGuideSection: React.FC = () => {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: '24px',
        border: '1px solid #e2e8f0',
        bgcolor: '#ffffff',
        p: { xs: 3, sm: 4, md: 5 },
        mt: 4,
        display: 'flex',
        flexDirection: 'column',
        gap: 5,
      }}
    >
      {/* ── 1. Main Header & Intro ────────────────────────────────────────── */}
      <Box sx={{ borderBottom: '1px solid #f1f5f9', pb: 4, maxWidth: 900 }}>
        <Chip
          icon={<ArticleOutlinedIcon sx={{ fontSize: '16px !important', color: '#2563eb !important' }} />}
          label="Cẩm nang Nghề nghiệp & Tuyển dụng"
          size="small"
          sx={{
            bgcolor: '#eff6ff',
            color: '#1d4ed8',
            fontWeight: 700,
            fontSize: '0.75rem',
            mb: 2,
            border: '1px solid #dbeafe',
          }}
        />

        <Typography
          variant="h4"
          sx={{
            fontWeight: 900,
            color: '#0f172a',
            fontSize: { xs: '1.45rem', sm: '1.95rem' },
            letterSpacing: '-0.02em',
            lineHeight: 1.3,
            mb: 2,
          }}
        >
          CV là gì? Những điều cần lưu ý khi viết CV xin việc
        </Typography>

        <Typography
          variant="body1"
          sx={{
            color: '#475569',
            fontSize: { xs: '0.875rem', sm: '0.95rem' },
            lineHeight: 1.7,
          }}
        >
          Khi tham gia vào thị trường lao động, chắc hẳn bạn đã nghe đến thuật ngữ <strong>&ldquo;CV&rdquo;</strong>. Vậy CV là gì? Tại sao CV lại quan trọng trong quá trình xin việc? Làm thế nào để viết CV chuyên nghiệp, gây ấn tượng với nhà tuyển dụng? Cùng tìm hiểu chi tiết trong bài viết dưới đây.
        </Typography>
      </Box>

      {/* ── 2. Khái niệm & Tại sao CV quan trọng ──────────────────────────── */}
      <Grid container spacing={3}>
        {/* Definition Box */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card
            elevation={0}
            sx={{
              height: '100%',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
              color: '#ffffff',
              p: { xs: 3, sm: 3.5 },
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: '12px',
                bgcolor: 'rgba(59, 130, 246, 0.2)',
                border: '1px solid rgba(59, 130, 246, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#93c5fd',
              }}
            >
              <HelpOutlineOutlinedIcon sx={{ fontSize: 24 }} />
            </Box>

            <Typography variant="h6" sx={{ fontWeight: 800, color: '#ffffff' }}>
              CV là gì?
            </Typography>

            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.85)', lineHeight: 1.7, fontSize: '0.875rem' }}>
              <strong>CV (Curriculum Vitae)</strong>, hay còn gọi là sơ yếu lý lịch, là tài liệu tóm tắt thông tin cá nhân, trình độ học vấn, kinh nghiệm làm việc và các kỹ năng của bạn.
            </Typography>

            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.85)', lineHeight: 1.7, fontSize: '0.875rem' }}>
              Mục đích của CV là giúp nhà tuyển dụng nhanh chóng nắm bắt được các thông tin quan trọng của bạn trong quá trình tuyển dụng. Một CV thu hút sẽ tạo ấn tượng tốt và giúp bạn nổi bật giữa hàng trăm ứng viên khác.
            </Typography>
          </Card>
        </Grid>

        {/* 4 Pillars of Importance */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Stack spacing={2}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 1 }}>
              <WorkspacePremiumOutlinedIcon sx={{ color: '#2563eb' }} />
              <span>Tại sao CV quan trọng?</span>
            </Typography>

            <Grid container spacing={2}>
              {[
                {
                  title: 'Là cầu nối giữa ứng viên và nhà tuyển dụng',
                  desc: 'CV chính là cầu nối đầu tiên thu hút sự chú ý của nhà tuyển dụng, giúp bạn có cơ hội bước vào vòng phỏng vấn.',
                  color: '#2563eb',
                },
                {
                  title: 'Thể hiện sự chuyên nghiệp',
                  desc: 'Một CV trình bày đẹp mắt, rõ ràng và mạch lạc sẽ ghi điểm với nhà tuyển dụng, cho thấy bạn là người cẩn thận và tôn trọng công việc.',
                  color: '#059669',
                },
                {
                  title: 'Tăng khả năng cạnh tranh',
                  desc: 'CV độc đáo, tối ưu hóa từ khóa và làm nổi bật kinh nghiệm giúp bạn nổi bật giữa hàng trăm đối thủ cùng ứng tuyển.',
                  color: '#d97706',
                },
                {
                  title: 'Cơ hội trình bày kỹ năng và kinh nghiệm',
                  desc: 'CV là nơi thể hiện những kỹ năng và thành tựu đã tích lũy một cách chi tiết để thuyết phục nhà tuyển dụng lựa chọn bạn.',
                  color: '#7c3aed',
                },
              ].map((item, idx) => (
                <Grid size={{ xs: 12, sm: 6 }} key={item.title || `guide-item-${idx}`}>
                  <Card
                    elevation={0}
                    sx={{
                      p: 2.25,
                      borderRadius: '16px',
                      bgcolor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      height: '100%',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: '#ffffff',
                        borderColor: '#cbd5e1',
                        boxShadow: '0 4px 14px rgba(0,0,0,0.05)',
                      },
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', mb: 0.75, fontSize: '0.85rem' }}>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.8rem', lineHeight: 1.6 }}>
                      {item.desc}
                    </Typography>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Stack>
        </Grid>
      </Grid>

      {/* ── 3. Sự khác biệt giữa CV và Resume ─────────────────────────────── */}
      <Stack spacing={2.5}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 1 }}>
            <CompareArrowsOutlinedIcon sx={{ color: '#4f46e5' }} />
            <span>Sự khác biệt giữa CV và Resume</span>
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.85rem', mt: 0.5 }}>
            Khi nói đến xin việc, nhiều người thường nhầm lẫn giữa CV và resume. Mặc dù cả hai đều là tài liệu quan trọng trong quá trình tìm việc, nhưng chúng có một số điểm khác biệt chính:
          </Typography>
        </Box>

        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
          }}
        >
          <Table size="medium">
            <TableHead sx={{ bgcolor: '#f1f5f9' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, color: '#334155', width: '22%', fontSize: '0.825rem' }}>
                  Tiêu chí
                </TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#1e40af', width: '39%', bgcolor: '#eff6ff', fontSize: '0.825rem' }}>
                  CV (Curriculum Vitae)
                </TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#334155', width: '39%', fontSize: '0.825rem' }}>
                  Resume
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[
                {
                  criterion: 'Định nghĩa',
                  cv: 'Tài liệu chi tiết liệt kê toàn bộ quá trình học vấn, kinh nghiệm làm việc, kỹ năng và thành tựu của bạn.',
                  resume: 'Tài liệu tóm tắt các thông tin quan trọng nhất của bạn chỉ trong một hoặc hai trang, tối ưu cho từng vị trí.',
                },
                {
                  criterion: 'Độ dài',
                  cv: 'Thường dài từ 2 đến 3 trang hoặc hơn, phụ thuộc vào kinh nghiệm và thành tích.',
                  resume: 'Nên giữ ngắn gọn, chỉ từ 1 đến 2 trang.',
                },
                {
                  criterion: 'Nội dung',
                  cv: 'Bao gồm thông tin chi tiết về học vấn, kinh nghiệm, kỹ năng, giải thưởng, bài viết, hoạt động ngoại khóa.',
                  resume: 'Tập trung vào thông tin cụ thể liên quan đến vị trí ứng tuyển, thường chỉ liệt kê công việc và kỹ năng liên quan.',
                },
                {
                  criterion: 'Mục đích sử dụng',
                  cv: 'Hỗ trợ nhà tuyển dụng đánh giá và chọn ra ứng viên phù hợp nhất cho vị trí công việc chuyên sâu, học thuật.',
                  resume: 'Thường được sử dụng để ứng tuyển công việc nhanh chóng tại các doanh nghiệp.',
                },
              ].map((row, idx) => (
                <TableRow key={row.criterion || `cv-diff-${idx}`} sx={{ '&:hover': { bgcolor: '#f8fafc' } }}>
                  <TableCell sx={{ fontWeight: 700, color: '#0f172a', bgcolor: '#f8fafc', fontSize: '0.825rem' }}>
                    {row.criterion}
                  </TableCell>
                  <TableCell sx={{ color: '#1e293b', bgcolor: 'rgba(239, 246, 255, 0.4)', fontSize: '0.825rem', lineHeight: 1.6 }}>
                    {row.cv}
                  </TableCell>
                  <TableCell sx={{ color: '#334155', fontSize: '0.825rem', lineHeight: 1.6 }}>
                    {row.resume}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>

      {/* ── 4. Cấu trúc của một CV hoàn chỉnh ─────────────────────────────── */}
      <Stack spacing={2.5}>
        <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 1 }}>
          <FormatListNumberedOutlinedIcon sx={{ color: '#0284c7' }} />
          <span>Cấu trúc của một CV hoàn chỉnh</span>
        </Typography>

        <Grid container spacing={2}>
          {[
            {
              step: '01',
              title: 'Thông tin cá nhân',
              desc: 'Họ và tên rõ ràng, số điện thoại thường dùng, email chuyên nghiệp, nơi sinh sống.',
            },
            {
              step: '02',
              title: 'Mục tiêu nghề nghiệp',
              desc: 'Đoạn ngắn 2 - 3 câu nêu rõ mục tiêu, lý do ứng tuyển và giá trị bạn đóng góp cho công ty.',
            },
            {
              step: '03',
              title: 'Trình độ học vấn',
              desc: 'Tên trường, chuyên ngành, thời gian học tập, bằng cấp đạt được (Cử nhân, Kỹ sư, Thạc sĩ).',
            },
            {
              step: '04',
              title: 'Kinh nghiệm làm việc',
              desc: 'Tên công ty, chức danh, thời gian làm việc và các nhiệm vụ, thành tựu nổi bật định lượng.',
            },
            {
              step: '05',
              title: 'Kỹ năng nổi bật',
              desc: 'Kỹ năng chuyên môn ngành nghề + kỹ năng mềm (giao tiếp, làm việc nhóm, quản lý thời gian).',
            },
            {
              step: '06',
              title: 'Chứng chỉ và giải thưởng',
              desc: 'Tên chứng chỉ chuyên ngành và thời gian đạt được, các giải thưởng đạt được nếu có.',
            },
            {
              step: '07',
              title: 'Hoạt động ngoài lề và sở thích',
              desc: 'Hoạt động tình nguyện, câu lạc bộ tham gia hoặc sở thích giúp NTD hiểu rõ hơn về bạn.',
            },
            {
              step: '08',
              title: 'Thông tin tham khảo',
              desc: 'Thông tin liên hệ của 1 - 2 người có thể giới thiệu và xác nhận năng lực của bạn.',
            },
          ].map((item) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={item.step}>
              <Card
                elevation={0}
                sx={{
                  p: 2.25,
                  borderRadius: '16px',
                  bgcolor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.25,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: '#ffffff',
                    borderColor: '#93c5fd',
                    boxShadow: '0 4px 14px rgba(37, 99, 235, 0.08)',
                  },
                }}
              >
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: '#2563eb',
                    color: '#ffffff',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                  }}
                >
                  {item.step}
                </Avatar>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.85rem' }}>
                  {item.title}
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.775rem', lineHeight: 1.6 }}>
                  {item.desc}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Stack>

      {/* ── 5. Các lưu ý khi viết CV & Quy trình 8 bước ───────────────────── */}
      <Grid container spacing={4}>
        {/* 10 Golden Rules */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Stack spacing={2}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 1 }}>
              <ShieldOutlinedIcon sx={{ color: '#059669' }} />
              <span>Các lưu ý quan trọng khi viết CV</span>
            </Typography>

            <Stack spacing={1.5}>
              {[
                'Đảm bảo tính chính xác và trung thực 100% về thông tin kinh nghiệm, học vấn.',
                'Xác định mục tiêu nghề nghiệp rõ ràng, thể hiện kế hoạch cụ thể cho sự nghiệp.',
                'Nghiên cứu văn hóa công ty và yêu cầu công việc để tùy chỉnh CV phù hợp.',
                'Lựa chọn định dạng phù hợp: Chronological (theo thời gian) hoặc Functional (kỹ năng).',
                'Sử dụng ngôn ngữ chuyên nghiệp, trang trọng, tuân thủ đúng ngữ pháp và chính tả.',
                'Nhấn mạnh điểm nổi bật bằng số liệu cụ thể (ví dụ: "Tăng doanh thu 30% trong 6 tháng").',
                'Hạn chế sử dụng ngôn ngữ quá thân mật hoặc quá cảm tính.',
                'Tránh sử dụng từ ngữ chung chung như "năng động", "siêng năng" mà thiếu chứng minh.',
                'Kiểm tra và chỉnh sửa kỹ lưỡng trước khi gửi đến nhà tuyển dụng.',
                'Nộp CV đúng thời hạn và luôn cập nhật CV thường xuyên khi có thay đổi mới.',
              ].map((rule, idx) => (
                <Box key={`cv-rule-${idx}`} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25 }}>
                  <CheckCircleOutlineIcon sx={{ fontSize: 18, color: '#10b981', shrink: 0, mt: 0.2 }} />
                  <Typography variant="body2" sx={{ color: '#334155', fontSize: '0.825rem', lineHeight: 1.6 }}>
                    {rule}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Stack>
        </Grid>

        {/* 8-Step Guide */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Stack spacing={2}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 1 }}>
              <TipsAndUpdatesOutlinedIcon sx={{ color: '#d97706' }} />
              <span>Hướng dẫn quy trình 8 bước viết CV</span>
            </Typography>

            <Stack spacing={1.25}>
              {[
                { step: 'Bước 1', title: 'Chuẩn bị thông tin', desc: 'Chuẩn bị thông tin cá nhân, học vấn, kinh nghiệm và kỹ năng.' },
                { step: 'Bước 2', title: 'Chọn định dạng CV', desc: 'Lựa chọn định dạng phù hợp với ngành nghề và kinh nghiệm.' },
                { step: 'Bước 3', title: 'Viết mục tiêu nghề nghiệp', desc: 'Mục tiêu ngắn gọn 2 - 3 câu nêu bật mong muốn và đóng góp.' },
                { step: 'Bước 4', title: 'Liệt kê trình độ học vấn', desc: 'Bắt đầu từ bậc học cao nhất trở xuống kèm bằng cấp liên quan.' },
                { step: 'Bước 5', title: 'Mô tả kinh nghiệm làm việc', desc: 'Liệt kê tên công ty, chức danh, nhiệm vụ và thành tựu đo lường được.' },
                { step: 'Bước 6', title: 'Nêu rõ kỹ năng trọng tâm', desc: 'Kết hợp kỹ năng chuyên môn và kỹ năng mềm phù hợp yêu cầu vị trí.' },
                { step: 'Bước 7', title: 'Thêm thông tin liên hệ', desc: 'Bổ sung thông tin tham khảo của người giới thiệu nếu cần.' },
                { step: 'Bước 8', title: 'Đọc lại và chỉnh sửa', desc: 'Rà soát lỗi chính tả, ngữ pháp và xuất file PDF chất lượng cao.' },
              ].map((item, idx) => (
                <Card
                  key={item.step || `step-${idx}`}
                  elevation={0}
                  sx={{
                    p: 1.5,
                    borderRadius: '12px',
                    bgcolor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                  }}
                >
                  <Chip
                    label={item.step}
                    size="small"
                    sx={{
                      bgcolor: '#2563eb',
                      color: '#ffffff',
                      fontWeight: 800,
                      fontSize: '0.7rem',
                      height: 24,
                      borderRadius: '8px',
                    }}
                  />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.825rem' }}>
                      {item.title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.75rem' }}>
                      {item.desc}
                    </Typography>
                  </Box>
                </Card>
              ))}
            </Stack>
          </Stack>
        </Grid>
      </Grid>

      <Divider sx={{ borderColor: '#f1f5f9' }} />

      {/* ── 6. Phối màu CV theo Phong Thủy Ngũ Hành ─────────────────────── */}
      <Stack spacing={3}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 1 }}>
            <PaletteOutlinedIcon sx={{ color: '#e11d48' }} />
            <span>Có nên phối màu CV không? & Bí kíp chọn màu CV đẹp mắt, hợp mệnh</span>
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.85rem', mt: 0.5, lineHeight: 1.7, maxWidth: 900 }}>
            Phối màu CV xin việc mang lại nhiều lợi ích quan trọng: tạo ấn tượng ban đầu mạnh mẽ, phản ánh cá tính riêng, làm nổi bật thông tin quan trọng và mang lại may mắn theo phong thủy Ngũ Hành (Kim, Mộc, Thủy, Hỏa, Thổ):
          </Typography>
        </Box>

        <Grid container spacing={2.5}>
          {/* Mệnh Kim */}
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Card
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: '18px',
                bgcolor: '#fffbeb',
                border: '1px solid #fde68a',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#92400e', display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <DiamondOutlinedIcon sx={{ fontSize: 18, color: '#d97706' }} />
                  <span>1. Người Mệnh Kim</span>
                </Typography>
                <Chip label="Vàng, Trắng, Bạc" size="small" sx={{ bgcolor: '#fef3c7', color: '#92400e', fontWeight: 700, fontSize: '0.7rem' }} />
              </Stack>
              <Typography variant="caption" sx={{ color: '#78350f', lineHeight: 1.5 }}>
                Yêu cầu sự rõ ràng, chính xác và hiệu quả cao trong công việc.
              </Typography>
              <Stack spacing={0.75} sx={{ mt: 'auto', pt: 1, borderTop: '1px solid #fde68a' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckIcon sx={{ fontSize: 15, color: '#16a34a' }} />
                  <Typography variant="caption" sx={{ color: '#166534', fontWeight: 600 }}>
                    Hợp: Màu Vàng, Trắng, Xám bạc
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CloseIcon sx={{ fontSize: 15, color: '#dc2626' }} />
                  <Typography variant="caption" sx={{ color: '#991b1b', fontWeight: 600 }}>
                    Kỵ: Màu Đỏ, Hồng (thuộc Hỏa)
                  </Typography>
                </Box>
              </Stack>
            </Card>
          </Grid>

          {/* Mệnh Thủy */}
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Card
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: '18px',
                bgcolor: '#eff6ff',
                border: '1px solid #bfdbfe',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1e40af', display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <WaterDropOutlinedIcon sx={{ fontSize: 18, color: '#2563eb' }} />
                  <span>2. Người Mệnh Thủy</span>
                </Typography>
                <Chip label="Xanh dương, Đen, Trắng" size="small" sx={{ bgcolor: '#dbeafe', color: '#1e40af', fontWeight: 700, fontSize: '0.7rem' }} />
              </Stack>
              <Typography variant="caption" sx={{ color: '#1e3a8a', lineHeight: 1.5 }}>
                Tuýp người nhẹ nhàng, khéo léo, tinh tế và linh hoạt với nhu cầu người khác.
              </Typography>
              <Stack spacing={0.75} sx={{ mt: 'auto', pt: 1, borderTop: '1px solid #bfdbfe' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckIcon sx={{ fontSize: 15, color: '#16a34a' }} />
                  <Typography variant="caption" sx={{ color: '#166534', fontWeight: 600 }}>
                    Hợp: Đen, Trắng, Xanh dương
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CloseIcon sx={{ fontSize: 15, color: '#dc2626' }} />
                  <Typography variant="caption" sx={{ color: '#991b1b', fontWeight: 600 }}>
                    Kỵ: Xanh lá cây, Đỏ, Cam, Tím, Vàng, Nâu
                  </Typography>
                </Box>
              </Stack>
            </Card>
          </Grid>

          {/* Mệnh Mộc */}
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Card
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: '18px',
                bgcolor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#166534', display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <ParkOutlinedIcon sx={{ fontSize: 18, color: '#16a34a' }} />
                  <span>3. Người Mệnh Mộc</span>
                </Typography>
                <Chip label="Xanh lá, Biển, Đen" size="small" sx={{ bgcolor: '#dcfce7', color: '#166534', fontWeight: 700, fontSize: '0.7rem' }} />
              </Stack>
              <Typography variant="caption" sx={{ color: '#14532d', lineHeight: 1.5 }}>
                Những người hoạt bát, nhanh nhẹn, hòa đồng và tư duy nhạy bén.
              </Typography>
              <Stack spacing={0.75} sx={{ mt: 'auto', pt: 1, borderTop: '1px solid #bbf7d0' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckIcon sx={{ fontSize: 15, color: '#16a34a' }} />
                  <Typography variant="caption" sx={{ color: '#166534', fontWeight: 600 }}>
                    Hợp: Xanh biển, Đen, Xanh lá cây
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CloseIcon sx={{ fontSize: 15, color: '#dc2626' }} />
                  <Typography variant="caption" sx={{ color: '#991b1b', fontWeight: 600 }}>
                    Kỵ: Vàng đậm, Vàng nhạt, Nâu đất, Trắng bạc
                  </Typography>
                </Box>
              </Stack>
            </Card>
          </Grid>

          {/* Mệnh Hỏa */}
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Card
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: '18px',
                bgcolor: '#fff1f2',
                border: '1px solid #fecdd3',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#9f1239', display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <WhatshotOutlinedIcon sx={{ fontSize: 18, color: '#e11d48' }} />
                  <span>4. Người Mệnh Hỏa</span>
                </Typography>
                <Chip label="Đỏ, Tím, Cam, Xanh lá" size="small" sx={{ bgcolor: '#ffe4e6', color: '#9f1239', fontWeight: 700, fontSize: '0.7rem' }} />
              </Stack>
              <Typography variant="caption" sx={{ color: '#881337', lineHeight: 1.5 }}>
                Những người cá tính, nổi bật và giàu nhiệt huyết trong công việc.
              </Typography>
              <Stack spacing={0.75} sx={{ mt: 'auto', pt: 1, borderTop: '1px solid #fecdd3' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckIcon sx={{ fontSize: 15, color: '#16a34a' }} />
                  <Typography variant="caption" sx={{ color: '#166534', fontWeight: 600 }}>
                    Hợp: Xanh lá cây (Mộc sinh Hỏa), Đỏ, Tím, Cam
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CloseIcon sx={{ fontSize: 15, color: '#dc2626' }} />
                  <Typography variant="caption" sx={{ color: '#991b1b', fontWeight: 600 }}>
                    Kỵ: Đen, Xám, Xanh biển đậm (Thủy khắc Hỏa)
                  </Typography>
                </Box>
              </Stack>
            </Card>
          </Grid>

          {/* Mệnh Thổ */}
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Card
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: '18px',
                bgcolor: '#fff7ed',
                border: '1px solid #fed7aa',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#9a3412', display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <TerrainOutlinedIcon sx={{ fontSize: 18, color: '#ea580c' }} />
                  <span>5. Người Mệnh Thổ</span>
                </Typography>
                <Chip label="Vàng nâu, Đỏ, Hồng" size="small" sx={{ bgcolor: '#ffedd5', color: '#9a3412', fontWeight: 700, fontSize: '0.7rem' }} />
              </Stack>
              <Typography variant="caption" sx={{ color: '#7c2d12', lineHeight: 1.5 }}>
                Những người bao dung, dễ tha thứ và luôn giữ đúng cam kết, lời hứa.
              </Typography>
              <Stack spacing={0.75} sx={{ mt: 'auto', pt: 1, borderTop: '1px solid #fed7aa' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckIcon sx={{ fontSize: 15, color: '#16a34a' }} />
                  <Typography variant="caption" sx={{ color: '#166534', fontWeight: 600 }}>
                    Hợp: Vàng nâu, Vàng nhạt, Đỏ, Hồng, Cam, Tím
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CloseIcon sx={{ fontSize: 15, color: '#dc2626' }} />
                  <Typography variant="caption" sx={{ color: '#991b1b', fontWeight: 600 }}>
                    Kỵ: Xanh lá cây (Mộc khắc Thổ)
                  </Typography>
                </Box>
              </Stack>
            </Card>
          </Grid>

          {/* Color Rules Card */}
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Card
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: '18px',
                bgcolor: '#0f172a',
                color: '#ffffff',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 1.5,
              }}
            >
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#fde047', mb: 1, display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <AutoFixHighOutlinedIcon sx={{ fontSize: 16 }} />
                  <span>Nguyên tắc phối màu chuẩn</span>
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)', lineHeight: 1.6, display: 'block' }}>
                  Màu sắc hài hòa, cân đối, sử dụng màu sắc tương phản để làm nổi bật thông tin quan trọng. Chọn màu sắc phù hợp với ngành nghề và đồng nhất với bố cục tổng thể.
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ color: '#93c5fd', fontWeight: 600, pt: 1, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                Tất cả mẫu CV tại InfoHR đều đã tích hợp sẵn bảng màu chuẩn hợp mệnh.
              </Typography>
            </Card>
          </Grid>
        </Grid>
      </Stack>

      {/* ── 7. Call To Action Footer ──────────────────────────────────────── */}
      <Card
        elevation={0}
        sx={{
          borderRadius: '20px',
          background: 'linear-gradient(135deg, #2563eb 0%, #4338ca 100%)',
          color: '#ffffff',
          p: { xs: 3, sm: 4 },
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 3,
          boxShadow: '0 10px 25px rgba(37, 99, 235, 0.25)',
        }}
      >
        <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#ffffff', mb: 0.5 }}>
            Bắt đầu tạo CV chuyên nghiệp & chuẩn ATS ngay hôm nay
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.85rem' }}>
            Thoả sức phối màu, tự động đồng bộ từ hồ sơ và xuất file PDF miễn phí chỉ trong vài phút.
          </Typography>
        </Box>

        <Button
          component="a"
          href="#cv-template-grid"
          variant="contained"
          endIcon={<ArrowForwardIcon />}
          sx={{
            bgcolor: '#ffffff',
            color: '#1d4ed8',
            fontWeight: 800,
            fontSize: '0.825rem',
            borderRadius: '12px',
            textTransform: 'none',
            px: 3,
            py: 1.25,
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            '&:hover': {
              bgcolor: '#f8fafc',
              color: '#1e40af',
              transform: 'scale(1.03)',
            },
          }}
        >
          Khám phá các mẫu CV phía trên
        </Button>
      </Card>
    </Card>
  );
};

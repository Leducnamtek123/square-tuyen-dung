'use client';

import React from 'react';
import { Box, Typography, Stack, Chip, Avatar } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import VerifiedIcon from '@mui/icons-material/Verified';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import GroupsIcon from '@mui/icons-material/Groups';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';

interface AuthShowcasePanelProps {
  variant: 'employer' | 'candidate';
}

export const AuthShowcasePanel: React.FC<AuthShowcasePanelProps> = ({ variant }) => {
  const isEmployer = variant === 'employer';

  const employerContent = {
    badge: 'Cổng thông tin Nhà tuyển dụng',
    title: 'Tuyển dụng nhân tài nhanh chóng & chính xác cùng AI',
    subtitle: 'Nền tảng kết nối hơn 500,000+ hồ sơ ứng viên chất lượng cao với công nghệ sàng lọc thông minh.',
    features: [
      {
        icon: <AutoAwesomeIcon sx={{ fontSize: 20, color: '#60A5FA' }} />,
        title: 'AI Smart Matching',
        desc: 'Tự động gợi ý ứng viên phù hợp với mô tả công việc (JD) lên tới 95%.',
      },
      {
        icon: <TrendingUpIcon sx={{ fontSize: 20, color: '#34D399' }} />,
        title: 'Tối ưu 60% thời gian tuyển dụng',
        desc: 'Hệ thống ATS quản lý hồ sơ tập trung, gửi lời mời phỏng vấn tự động.',
      },
      {
        icon: <GroupsIcon sx={{ fontSize: 20, color: '#FBBF24' }} />,
        title: '15,000+ Doanh nghiệp đồng hành',
        desc: 'Được tin dùng bởi các tập đoàn và doanh nghiệp hàng đầu Việt Nam.',
      },
    ],
    testimonial: {
      quote: 'InfoHR giúp chúng tôi tiếp cận đúng nhân sự chủ chốt và rút ngắn thời gian tuyển dụng từ 3 tuần xuống còn 5 ngày.',
      author: 'Nguyễn Thu Trang',
      role: 'Head of Talent Acquisition',
      company: 'Tập đoàn Công nghệ & Bán lẻ',
    },
    metrics: [
      { label: 'Ứng viên sẵn sàng', value: '500K+' },
      { label: 'Tỷ lệ matching', value: '94.8%' },
      { label: 'Thời gian phản hồi', value: '< 24h' },
    ],
  };

  const candidateContent = {
    badge: 'Cổng thông tin Ứng viên',
    title: 'Khám phá cơ hội nghề nghiệp bứt phá tương lai',
    subtitle: 'Hơn 50,000+ việc làm chất lượng cao từ các công ty hàng đầu được cập nhật mỗi ngày.',
    features: [
      {
        icon: <WorkOutlineIcon sx={{ fontSize: 20, color: '#60A5FA' }} />,
        title: '50,000+ Việc làm chọn lọc',
        desc: 'Mức lương minh bạch, môi trường làm việc chuyên nghiệp và đãi ngộ hấp dẫn.',
      },
      {
        icon: <AutoAwesomeIcon sx={{ fontSize: 20, color: '#34D399' }} />,
        title: 'Gợi ý việc làm bằng AI',
        desc: 'Phân tích hồ sơ và đề xuất việc làm chuẩn xác theo kỹ năng & kỳ vọng.',
      },
      {
        icon: <AssignmentTurnedInIcon sx={{ fontSize: 20, color: '#FBBF24' }} />,
        title: 'Tạo CV chuyên nghiệp tức thì',
        desc: 'Kho mẫu CV chuẩn ATS hiện đại, dễ dàng ghi điểm trong mắt nhà tuyển dụng.',
      },
    ],
    testimonial: {
      quote: 'Mình tìm được công việc Senior Product Designer ưng ý chỉ sau 3 ngày nộp hồ sơ qua tính năng AI Matching của InfoHR.',
      author: 'Trần Minh Hoàng',
      role: 'Senior Product Designer',
      company: 'Fintech Startup',
    },
    metrics: [
      { label: 'Việc làm mới/ngày', value: '1,200+' },
      { label: 'Doanh nghiệp tuyển', value: '15,000+' },
      { label: 'Đánh giá hài lòng', value: '4.9 ★' },
    ],
  };

  const content = isEmployer ? employerContent : candidateContent;

  return (
    <Box
      sx={{
        height: '100%',
        minHeight: { md: 620 },
        background: isEmployer
          ? 'linear-gradient(165deg, #090E1A 0%, #0F172A 50%, #172554 100%)'
          : 'linear-gradient(165deg, #0A0F1D 0%, #0F172A 50%, #1E293B 100%)',
        color: '#ffffff',
        borderRadius: { xs: 0, md: '24px' },
        border: '1px solid rgba(255, 255, 255, 0.08)',
        p: { xs: 3, sm: 4, md: 5 },
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '-15%',
          right: '-10%',
          width: '340px',
          height: '340px',
          borderRadius: '50%',
          background: isEmployer
            ? 'radial-gradient(circle, rgba(37, 99, 235, 0.18) 0%, rgba(37, 99, 235, 0) 70%)'
            : 'radial-gradient(circle, rgba(59, 130, 246, 0.18) 0%, rgba(59, 130, 246, 0) 70%)',
          pointerEvents: 'none',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: '-15%',
          left: '-10%',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: isEmployer
            ? 'radial-gradient(circle, rgba(16, 185, 129, 0.14) 0%, rgba(16, 185, 129, 0) 70%)'
            : 'radial-gradient(circle, rgba(99, 102, 241, 0.14) 0%, rgba(99, 102, 241, 0) 70%)',
          pointerEvents: 'none',
        },
      }}
    >
      {/* Top Section */}
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Chip
          icon={<VerifiedIcon sx={{ fontSize: '16px !important', color: '#60A5FA !important' }} />}
          label={content.badge}
          size="small"
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            color: '#E0E7FF',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            fontWeight: 600,
            fontSize: '12px',
            mb: 3,
            px: 0.5,
          }}
        />

        <Typography
          variant="h4"
          component="h2"
          sx={{
            fontWeight: 700,
            lineHeight: 1.25,
            letterSpacing: '-0.02em',
            mb: 1.5,
            fontSize: { xs: '22px', sm: '26px', md: '30px' },
            background: 'linear-gradient(180deg, #FFFFFF 0%, #F1F5F9 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {content.title}
        </Typography>

        <Typography
          variant="body1"
          sx={{
            color: 'rgba(203, 213, 225, 0.85)',
            fontSize: '14.5px',
            lineHeight: 1.6,
            mb: 4,
            maxWidth: '520px',
          }}
        >
          {content.subtitle}
        </Typography>

        {/* Feature Highlights */}
        <Stack spacing={2} sx={{ mb: 3.5 }}>
          {content.features.map((feat, idx) => (
            <Box
              key={idx}
              sx={{
                display: 'flex',
                gap: 2,
                p: 1.75,
                borderRadius: '14px',
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderColor: 'rgba(96, 165, 250, 0.35)',
                  transform: 'translateX(4px)',
                },
              }}
            >
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: '10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {feat.icon}
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 600, fontSize: '14px', color: '#FFFFFF', mb: 0.25 }}>
                  {feat.title}
                </Typography>
                <Typography sx={{ fontSize: '12.5px', color: 'rgba(203, 213, 225, 0.85)', lineHeight: 1.45 }}>
                  {feat.desc}
                </Typography>
              </Box>
            </Box>
          ))}
        </Stack>
      </Box>

      {/* Bottom Section: Testimonial & Metrics */}
      <Box sx={{ position: 'relative', zIndex: 1, mt: 1 }}>
        {/* Testimonial Quote */}
        <Box
          sx={{
            p: 2.25,
            borderRadius: '14px',
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.18)',
            mb: 2.5,
            position: 'relative',
          }}
        >
          <FormatQuoteIcon
            sx={{
              position: 'absolute',
              top: 10,
              right: 12,
              color: 'rgba(255, 255, 255, 0.15)',
              fontSize: 28,
            }}
          />
          <Typography
            sx={{
              fontSize: '13px',
              fontStyle: 'italic',
              color: '#F8FAFC',
              lineHeight: 1.55,
              mb: 1.5,
            }}
          >
            &ldquo;{content.testimonial.quote}&rdquo;
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                fontSize: '13px',
                fontWeight: 600,
                bgcolor: isEmployer ? '#2563EB' : '#10B981',
                border: '1.5px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              {content.testimonial.author.charAt(0)}
            </Avatar>
            <Box>
              <Typography sx={{ fontWeight: 600, fontSize: '12.5px', color: '#FFFFFF' }}>
                {content.testimonial.author}
              </Typography>
              <Typography sx={{ fontSize: '11px', color: 'rgba(203, 213, 225, 0.8)' }}>
                {content.testimonial.role} &middot; {content.testimonial.company}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Metrics Grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 1.5,
            pt: 2,
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          {content.metrics.map((metric, idx) => (
            <Box key={idx} sx={{ textAlign: 'center' }}>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: '18px',
                  color: '#FFFFFF',
                  letterSpacing: '-0.01em',
                  lineHeight: 1.2,
                  mb: 0.25,
                }}
              >
                {metric.value}
              </Typography>
              <Typography sx={{ fontSize: '11px', color: '#94A3B8', fontWeight: 500 }}>
                {metric.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default AuthShowcasePanel;

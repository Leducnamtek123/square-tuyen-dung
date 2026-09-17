'use client';
import React from 'react';
import { Box, Typography, Stack } from '@mui/material';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';

interface ValuePropItem {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const VALUE_PROPS: ValuePropItem[] = [
  {
    icon: <PeopleAltOutlinedIcon sx={{ fontSize: 22, color: '#38BDF8' }} />,
    title: 'Mạng lưới 5.000.000+ nhân tài',
    description: 'Tiếp cận ứng viên chất lượng cao đa lĩnh vực từ Junior đến Quản lý cấp cao.',
  },
  {
    icon: <AutoAwesomeOutlinedIcon sx={{ fontSize: 22, color: '#F472B6' }} />,
    title: 'Sàng lọc & AI Matching 98%',
    description: 'Tự động phân tích kỹ năng, chấm điểm độ tương thích và rút ngắn 70% vòng sơ tuyển.',
  },
  {
    icon: <AssessmentOutlinedIcon sx={{ fontSize: 22, color: '#34D399' }} />,
    title: 'Hệ thống ATS tuyển dụng tập trung',
    description: 'Quản lý toàn diện ứng viên, lịch phỏng vấn AI và dữ liệu tuyển dụng trên một nền tảng.',
  },
];

const METRICS = [
  { value: '50.000+', label: 'Doanh nghiệp tin dùng' },
  { value: '300.000+', label: 'Ứng tuyển mỗi tháng' },
  { value: '98%', label: 'Tỷ lệ hài lòng' },
];

const EmployerSignUpShowcase: React.FC = () => {
  return (
    <Box
      sx={{
        height: '100%',
        minHeight: { md: '640px' },
        width: '100%',
        p: { xs: 3, sm: 4, md: 5 },
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(155deg, #090E1A 0%, #0F172A 50%, #172554 100%)',
        color: '#FFFFFF',
      }}
    >
      {/* Background Decorative Glow Orbs */}
      <Box
        sx={{
          position: 'absolute',
          top: -80,
          right: -80,
          width: 280,
          height: 280,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.22) 0%, transparent 70%)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -60,
          left: -60,
          width: 240,
          height: 240,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(236, 72, 153, 0.18) 0%, transparent 70%)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }}
      />

      {/* Top Header Section */}
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        {/* Enterprise Badge */}
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.75,
            px: 1.5,
            py: 0.5,
            borderRadius: '999px',
            backgroundColor: 'rgba(59, 130, 246, 0.12)',
            border: '1px solid rgba(147, 197, 253, 0.2)',
            mb: 2,
          }}
        >
          <Box
            sx={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: '#38BDF8',
              boxShadow: '0 0 8px #38BDF8',
            }}
          />
          <Typography
            sx={{
              fontSize: '11.5px',
              fontWeight: 700,
              color: '#93C5FD',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            Dành riêng cho doanh nghiệp
          </Typography>
        </Box>

        {/* Title */}
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            fontSize: { md: '25px', lg: '27px' },
            lineHeight: 1.3,
            color: '#FFFFFF',
            letterSpacing: '-0.02em',
            mb: 1.25,
          }}
        >
          Nền tảng tuyển dụng &amp; Quản trị nhân tài thông minh
        </Typography>

        {/* Subtitle */}
        <Typography
          sx={{
            color: '#94A3B8',
            fontSize: '14px',
            lineHeight: 1.6,
          }}
        >
          Tối ưu hóa đến 70% thời gian tuyển dụng, kết nối đúng ứng viên phù hợp với chi phí hiệu quả nhất.
        </Typography>
      </Box>

      {/* Middle Value Props Cards */}
      <Stack spacing={2} sx={{ my: 3.5, position: 'relative', zIndex: 1 }}>
        {VALUE_PROPS.map((prop, idx) => (
          <Box
            key={idx}
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 1.75,
              p: 2,
              borderRadius: '16px',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(8px)',
              transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.07)',
                borderColor: 'rgba(255, 255, 255, 0.16)',
                transform: 'translateX(3px)',
              },
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
              }}
            >
              {prop.icon}
            </Box>
            <Box>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: '14px',
                  color: '#F8FAFC',
                  mb: 0.35,
                }}
              >
                {prop.title}
              </Typography>
              <Typography
                sx={{
                  color: '#94A3B8',
                  fontSize: '12.5px',
                  lineHeight: 1.5,
                }}
              >
                {prop.description}
              </Typography>
            </Box>
          </Box>
        ))}
      </Stack>

      {/* Bottom Metrics & Social Proof */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          pt: 2.5,
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 1.5,
            mb: 2,
          }}
        >
          {METRICS.map((metric, idx) => (
            <Box key={idx}>
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: { md: '19px', lg: '21px' },
                  color: '#FFFFFF',
                  letterSpacing: '-0.02em',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {metric.value}
              </Typography>
              <Typography
                sx={{
                  color: '#64748B',
                  fontSize: '11px',
                  fontWeight: 500,
                  mt: 0.25,
                  lineHeight: 1.3,
                }}
              >
                {metric.label}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Trust & Guarantee Statement */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            color: '#64748B',
            fontSize: '11.5px',
          }}
        >
          <VerifiedUserOutlinedIcon sx={{ fontSize: 16, color: '#10B981' }} />
          <span>Cam kết bảo mật dữ liệu doanh nghiệp chuẩn ISO &amp; SSL 256-bit</span>
        </Box>
      </Box>
    </Box>
  );
};

export default EmployerSignUpShowcase;

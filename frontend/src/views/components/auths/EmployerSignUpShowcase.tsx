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
    icon: <PeopleAltOutlinedIcon sx={{ fontSize: 20, color: '#38BDF8' }} />,
    title: 'Mạng lưới 5.000.000+ nhân tài',
    description: 'Tiếp cận ứng viên chất lượng cao đa lĩnh vực từ Junior đến Quản lý cấp cao.',
  },
  {
    icon: <AutoAwesomeOutlinedIcon sx={{ fontSize: 20, color: '#F472B6' }} />,
    title: 'Sàng lọc & AI Matching 98%',
    description: 'Tự động phân tích kỹ năng, chấm điểm độ tương thích và rút ngắn thời gian sơ tuyển.',
  },
  {
    icon: <AssessmentOutlinedIcon sx={{ fontSize: 20, color: '#34D399' }} />,
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
        width: '100%',
        p: { xs: 2.5, sm: 3.5, md: 4 },
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(160deg, #0B1120 0%, #0F172A 50%, #1E293B 100%)',
        color: '#FFFFFF',
      }}
    >
      {/* Background Decorative Glow Orbs */}
      <Box
        sx={{
          position: 'absolute',
          top: -60,
          right: -60,
          width: 240,
          height: 240,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.22) 0%, transparent 70%)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -50,
          left: -50,
          width: 220,
          height: 220,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37, 99, 235, 0.2) 0%, transparent 70%)',
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
            px: 1.25,
            py: 0.4,
            borderRadius: '999px',
            backgroundColor: 'rgba(59, 130, 246, 0.12)',
            border: '1px solid rgba(147, 197, 253, 0.25)',
            mb: 1.75,
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
              fontSize: '11px',
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
            fontSize: { md: '22px', lg: '24px' },
            lineHeight: 1.35,
            color: '#FFFFFF',
            letterSpacing: '-0.02em',
            mb: 1,
          }}
        >
          Nền tảng tuyển dụng &amp; Quản trị nhân tài thông minh
        </Typography>

        {/* Subtitle */}
        <Typography
          sx={{
            color: '#94A3B8',
            fontSize: '13px',
            lineHeight: 1.55,
          }}
        >
          Tối ưu hóa đến 70% thời gian tuyển dụng, kết nối đúng ứng viên phù hợp với chi phí hiệu quả nhất.
        </Typography>
      </Box>

      {/* Middle Value Props Cards */}
      <Stack spacing={1.5} sx={{ my: 2.5, position: 'relative', zIndex: 1 }}>
        {VALUE_PROPS.map((prop, idx) => (
          <Box
            key={idx}
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 1.5,
              p: 1.5,
              borderRadius: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.07)',
              backdropFilter: 'blur(8px)',
              transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.07)',
                borderColor: 'rgba(255, 255, 255, 0.15)',
                transform: 'translateX(3px)',
              },
            }}
          >
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '10px',
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
                  fontSize: '13.5px',
                  color: '#F8FAFC',
                  mb: 0.25,
                }}
              >
                {prop.title}
              </Typography>
              <Typography
                sx={{
                  color: '#94A3B8',
                  fontSize: '12px',
                  lineHeight: 1.45,
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
          pt: 2,
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 1.5,
            mb: 1.75,
          }}
        >
          {METRICS.map((metric, idx) => (
            <Box key={idx}>
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: { md: '18px', lg: '20px' },
                  color: '#FFFFFF',
                  letterSpacing: '-0.02em',
                  fontVariantNumeric: 'tabular-nums',
                  lineHeight: 1.2,
                }}
              >
                {metric.value}
              </Typography>
              <Typography
                sx={{
                  color: '#94A3B8',
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
            gap: 0.75,
            color: '#94A3B8',
            fontSize: '11px',
          }}
        >
          <VerifiedUserOutlinedIcon sx={{ fontSize: 15, color: '#10B981', flexShrink: 0 }} />
          <span>Bảo mật dữ liệu doanh nghiệp chuẩn ISO &amp; SSL 256-bit</span>
        </Box>
      </Box>
    </Box>
  );
};

export default EmployerSignUpShowcase;

'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Chip,
  Avatar,
  IconButton,
  Button,
  Stack,
  Divider,
  LinearProgress,
  keyframes,
} from '@mui/material';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import GraphicEqRoundedIcon from '@mui/icons-material/GraphicEqRounded';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';

// Keyframe cho hiệu ứng sóng âm đang phát
const waveAnimation = keyframes`
  0%, 100% {
    transform: scaleY(0.35);
  }
  50% {
    transform: scaleY(1);
  }
`;

// Thanh sóng âm tĩnh và động
const WAVE_HEIGHTS = [
  12, 20, 16, 28, 22, 14, 26, 30, 18, 24, 12, 26, 28, 16, 22, 32, 26, 18, 24, 14,
  28, 20, 16, 24, 30, 18, 14, 22, 28, 16, 12, 20
];

export interface CandidateScorecardMockupProps {
  className?: string;
}

export const CandidateScorecardMockup: React.FC<CandidateScorecardMockupProps> = ({
  className = '',
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSeconds, setPlaybackSeconds] = useState<number>(84); // 01:24
  const [isForwarded, setIsForwarded] = useState<boolean>(false);

  // Timer giả lập khi bật nghe audio
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isPlaying) {
      timer = setInterval(() => {
        setPlaybackSeconds((prev) => {
          if (prev >= 165) {
            setIsPlaying(false);
            return 84;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying]);

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleForward = () => {
    setIsForwarded(true);
    setTimeout(() => {
      setIsForwarded(false);
    }, 3500);
  };

  return (
    <Box
      className={`candidate-scorecard-mockup ${className}`}
      sx={{
        width: '100%',
        maxWidth: 580,
        mx: 'auto',
        bgcolor: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
        boxShadow:
          '0 4px 6px -1px rgba(15, 23, 42, 0.04), 0 20px 25px -5px rgba(15, 23, 42, 0.08)',
        overflow: 'hidden',
        position: 'relative',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow:
            '0 10px 15px -3px rgba(15, 23, 42, 0.06), 0 25px 35px -5px rgba(15, 23, 42, 0.12)',
        },
      }}
    >
      {/* Top Banner: Brand Header */}
      <Box
        sx={{
          bgcolor: '#0F172A',
          px: { xs: 2, sm: 3 },
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #1E293B',
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 26,
              height: 26,
              borderRadius: '6px',
              bgcolor: '#DC2626',
              color: '#FFFFFF',
            }}
          >
            <AutoAwesomeRoundedIcon sx={{ fontSize: 16 }} />
          </Box>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#F8FAFC',
              fontSize: '0.75rem',
            }}
          >
            AILA Candidate Scorecard
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          <Chip
            size="small"
            label="ID: #AILA-2026-8842"
            sx={{
              height: 22,
              fontSize: '0.7rem',
              fontWeight: 600,
              bgcolor: '#1E293B',
              color: '#94A3B8',
              borderRadius: '4px',
              border: '1px solid #334155',
            }}
          />
          <Chip
            size="small"
            label="Đã phỏng vấn 24/7"
            sx={{
              height: 22,
              fontSize: '0.7rem',
              fontWeight: 600,
              bgcolor: 'rgba(37, 99, 235, 0.2)',
              color: '#60A5FA',
              borderRadius: '4px',
              border: '1px solid rgba(59, 130, 246, 0.4)',
            }}
          />
        </Stack>
      </Box>

      {/* Main Candidate Info & Match Score */}
      <Box sx={{ p: { xs: 2.5, sm: 3 } }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' },
            justifyContent: 'space-between',
            gap: 2,
            mb: 2.5,
          }}
        >
          {/* Avatar and Info */}
          <Stack direction="row" spacing={2} alignItems="center">
            <Box sx={{ position: 'relative' }}>
              <Avatar
                sx={{
                  width: { xs: 52, sm: 60 },
                  height: { xs: 52, sm: 60 },
                  bgcolor: '#1E3A8A',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '1.25rem',
                  border: '2px solid #DBEAFE',
                }}
              >
                NC
              </Avatar>
              <Box
                sx={{
                  position: 'absolute',
                  bottom: -2,
                  right: -2,
                  bgcolor: '#FFFFFF',
                  borderRadius: '50%',
                  display: 'flex',
                  p: '1px',
                }}
              >
                <VerifiedRoundedIcon sx={{ fontSize: 18, color: '#2563EB' }} />
              </Box>
            </Box>

            <Box>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: '1rem', sm: '1.0625rem' },
                  color: '#0F172A',
                  lineHeight: 1.3,
                }}
              >
                Nguyễn Văn Cường — Kỹ sư Giám sát MEP (4 năm KN)
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: '#64748B',
                  fontSize: '0.875rem',
                  mt: 0.25,
                }}
              >
                Vị trí: <strong>Chỉ huy phó MEP — Tòa nhà Cao ốc Văn phòng</strong>
              </Typography>
            </Box>
          </Stack>

          {/* Match Score Display */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'row', sm: 'column' },
              alignItems: { xs: 'center', sm: 'flex-end' },
              justifyContent: 'space-between',
              width: { xs: '100%', sm: 'auto' },
              px: { xs: 2, sm: 0 },
              py: { xs: 1.5, sm: 0 },
              bgcolor: { xs: '#F8FAFC', sm: 'transparent' },
              borderRadius: { xs: '8px', sm: 0 },
              border: { xs: '1px solid #E2E8F0', sm: 'none' },
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                color: '#64748B',
                textTransform: 'uppercase',
                fontSize: '0.72rem',
                letterSpacing: '0.04em',
              }}
            >
              Match Score Kỹ Thuật
            </Typography>
            <Stack direction="row" spacing={0.5} alignItems="baseline">
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  color: '#2563EB',
                  fontSize: { xs: '1.75rem', sm: '2rem' },
                  lineHeight: 1,
                }}
              >
                88
              </Typography>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 700,
                  color: '#94A3B8',
                  fontSize: '1rem',
                }}
              >
                /100
              </Typography>
            </Stack>
            <Chip
              size="small"
              label="Top 5% Chuẩn Kỹ Năng"
              sx={{
                height: 20,
                fontSize: '0.6875rem',
                fontWeight: 700,
                bgcolor: '#EFF6FF',
                color: '#1D4ED8',
                borderRadius: '4px',
                border: '1px solid #BFDBFE',
                mt: { sm: 0.5 },
              }}
            />
          </Box>
        </Box>

        <Divider sx={{ my: 2, borderColor: '#F1F5F9' }} />

        {/* Thẩm định năng lực & chứng chỉ (Checklist) */}
        <Box sx={{ mb: 2.5 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
            <ArticleOutlinedIcon sx={{ fontSize: 16, color: '#475569' }} />
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                color: '#475569',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontSize: '0.75rem',
              }}
            >
              Thẩm Định Chứng Chỉ & Dự Án Thực Tế
            </Typography>
          </Stack>

          <Stack spacing={1}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1.25,
                p: 1.25,
                bgcolor: '#F8FAFC',
                borderRadius: '8px',
                border: '1px solid #F1F5F9',
              }}
            >
              <CheckCircleRoundedIcon sx={{ fontSize: 18, color: '#16A34A', mt: 0.2 }} />
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color: '#1E293B',
                    fontSize: '0.85rem',
                    lineHeight: 1.4,
                  }}
                >
                  Chứng chỉ hành nghề Giám sát MEP Hạng II (Đã xác thực)
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: '#64748B', display: 'block', fontSize: '0.75rem' }}
                >
                  Cục Quản lý Hoạt động Xây dựng — Bộ Xây dựng cấp • Thời hạn đến 2029
                </Typography>
              </Box>
            </Box>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1.25,
                p: 1.25,
                bgcolor: '#F8FAFC',
                borderRadius: '8px',
                border: '1px solid #F1F5F9',
              }}
            >
              <CheckCircleRoundedIcon sx={{ fontSize: 18, color: '#16A34A', mt: 0.2 }} />
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color: '#1E293B',
                    fontSize: '0.85rem',
                    lineHeight: 1.4,
                  }}
                >
                  Thành thạo Revit MEP & Navisworks
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: '#64748B', display: 'block', fontSize: '0.75rem' }}
                >
                  Bóc tách xung đột Clash Detection đường ống HVAC & Busway trên mô hình BIM 3D
                </Typography>
              </Box>
            </Box>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1.25,
                p: 1.25,
                bgcolor: '#F8FAFC',
                borderRadius: '8px',
                border: '1px solid #F1F5F9',
              }}
            >
              <CheckCircleRoundedIcon sx={{ fontSize: 18, color: '#16A34A', mt: 0.2 }} />
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color: '#1E293B',
                    fontSize: '0.85rem',
                    lineHeight: 1.4,
                  }}
                >
                  Sẵn sàng làm việc theo tiến độ công trường
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: '#64748B', display: 'block', fontSize: '0.75rem' }}
                >
                  Cam kết bám sát công trình cao ốc, trực đổ bê tông đêm và nghiệm thu hiện trường
                </Typography>
              </Box>
            </Box>
          </Stack>
        </Box>

        {/* Mini Audio Player (Mô phỏng phỏng vấn tình huống) */}
        <Box
          sx={{
            mb: 2.5,
            p: 2,
            bgcolor: '#F8FAFC',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 1,
            }}
          >
            <Stack direction="row" spacing={0.75} alignItems="center">
              <GraphicEqRoundedIcon sx={{ fontSize: 18, color: '#DC2626' }} />
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  color: '#0F172A',
                  fontSize: '0.78rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Ghi Âm Voice AI Phỏng Vấn Tình Huống Kỹ Thuật
              </Typography>
            </Stack>
            <Typography
              variant="caption"
              sx={{
                fontFamily: 'monospace',
                fontWeight: 600,
                color: '#475569',
                fontSize: '0.75rem',
              }}
            >
              {formatTime(playbackSeconds)} / 02:45
            </Typography>
          </Box>

          <Typography
            variant="body2"
            sx={{
              fontSize: '0.8125rem',
              color: '#334155',
              fontStyle: 'italic',
              mb: 1.5,
              lineHeight: 1.4,
            }}
          >
            &quot;Quy trình xử lý xung đột ống gió HVAC với dầm bê tông cốt thép khi thi công thực tế...&quot;
          </Typography>

          {/* Player Bar: Button + Waveform */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              bgcolor: '#FFFFFF',
              p: 1.25,
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
            }}
          >
            <IconButton
              size="small"
              onClick={() => setIsPlaying(!isPlaying)}
              aria-label={isPlaying ? 'Tạm dừng nghe câu trả lời' : 'Nghe câu trả lời của ứng viên'}
              sx={{
                bgcolor: '#2563EB',
                color: '#FFFFFF',
                width: 36,
                height: 36,
                flexShrink: 0,
                '&:hover': {
                  bgcolor: '#1D4ED8',
                },
              }}
            >
              {isPlaying ? (
                <PauseRoundedIcon sx={{ fontSize: 20 }} />
              ) : (
                <PlayArrowRoundedIcon sx={{ fontSize: 20 }} />
              )}
            </IconButton>

            {/* Dynamic Waveform Bars */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                height: 32,
                flex: 1,
                overflow: 'hidden',
              }}
            >
              {WAVE_HEIGHTS.map((height, idx) => {
                const isPassed = idx < (playbackSeconds / 165) * WAVE_HEIGHTS.length;
                return (
                  <Box
                    key={`wave-${idx}`}
                    sx={{
                      width: 3,
                      height: `${height}px`,
                      bgcolor: isPassed ? '#2563EB' : '#CBD5E1',
                      borderRadius: '2px',
                      transition: isPlaying ? 'none' : 'height 0.2s ease, background-color 0.2s ease',
                      animation: isPlaying
                        ? `${waveAnimation} ${0.6 + (idx % 5) * 0.15}s ease-in-out infinite alternate`
                        : 'none',
                      animationDelay: `${(idx % 6) * 0.1}s`,
                    }}
                  />
                );
              })}
            </Box>
          </Box>
        </Box>

        {/* Badge trạng thái sơ tuyển */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            p: 1.25,
            mb: 2.5,
            bgcolor: 'rgba(22, 163, 74, 0.08)',
            border: '1px solid rgba(22, 163, 74, 0.3)',
            borderRadius: '8px',
          }}
        >
          <CheckCircleRoundedIcon sx={{ fontSize: 20, color: '#16A34A', flexShrink: 0 }} />
          <Typography
            variant="body2"
            sx={{
              fontWeight: 700,
              color: '#15803D',
              fontSize: '0.85rem',
            }}
          >
            Đã qua sơ tuyển AILA AI — Đủ tiêu chuẩn phỏng vấn vòng 2
          </Typography>
        </Box>

        {/* Action Button: Chuyển Giám Đốc Dự Án Duyệt */}
        <Button
          fullWidth
          variant="contained"
          onClick={handleForward}
          disabled={isForwarded}
          startIcon={
            isForwarded ? (
              <DoneAllRoundedIcon sx={{ fontSize: 20 }} />
            ) : (
              <SendRoundedIcon sx={{ fontSize: 18 }} />
            )
          }
          sx={{
            py: 1.5,
            bgcolor: isForwarded ? '#16A34A' : '#0F172A',
            color: '#FFFFFF',
            fontWeight: 700,
            fontSize: '0.9375rem',
            textTransform: 'none',
            borderRadius: '8px',
            boxShadow: 'none',
            transition: 'all 0.2s ease',
            '&:hover': {
              bgcolor: isForwarded ? '#15803D' : '#1E293B',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.2)',
            },
          }}
        >
          {isForwarded ? 'Đã Gửi Tới Giám Đốc Dự Án Duyệt' : 'Chuyển Giám Đốc Dự Án Duyệt'}
        </Button>
      </Box>
    </Box>
  );
};

export default CandidateScorecardMockup;

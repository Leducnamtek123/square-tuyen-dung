'use client';

import React from 'react';
import { Box, Paper, Typography, Stack, ToggleButtonGroup, ToggleButton, Chip } from '@mui/material';
import Image from 'next/image';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import VisibilityIcon from '@mui/icons-material/Visibility';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import { LOGO_IMAGES } from '@/configs/images';
import { MessageResponse } from '@/components/Features/AiElements/message';

interface LiveChatbotPreviewProps {
  title: string;
  subtitle: string;
  employerGreeting: string;
  jobSeekerGreeting: string;
  employerSuggestions: string[];
  jobSeekerSuggestions: string[];
  activeTarget: 'employer' | 'jobseeker';
  onTargetChange: (target: 'employer' | 'jobseeker') => void;
}

export const LiveChatbotPreview: React.FC<LiveChatbotPreviewProps> = ({
  title,
  subtitle,
  employerGreeting,
  jobSeekerGreeting,
  employerSuggestions,
  jobSeekerSuggestions,
  activeTarget,
  onTargetChange,
}) => {
  const currentGreeting = activeTarget === 'employer' ? employerGreeting : jobSeekerGreeting;
  const currentSuggestions = activeTarget === 'employer' ? employerSuggestions : jobSeekerSuggestions;

  return (
    <CardContainer>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <VisibilityIcon color="primary" fontSize="small" />
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Xem Trước Trực Tiếp (Live Preview)
          </Typography>
        </Stack>

        <ToggleButtonGroup
          value={activeTarget}
          exclusive
          onChange={(_, val) => val && onTargetChange(val)}
          size="small"
          sx={{ background: '#f1f5f9', p: 0.5, borderRadius: '10px' }}
        >
          <ToggleButton value="employer" sx={{ px: 1.5, py: 0.5, borderRadius: '8px !important', fontWeight: 600 }}>
            <BusinessIcon fontSize="small" sx={{ mr: 0.5 }} />
            NTD
          </ToggleButton>
          <ToggleButton value="jobseeker" sx={{ px: 1.5, py: 0.5, borderRadius: '8px !important', fontWeight: 600 }}>
            <PersonIcon fontSize="small" sx={{ mr: 0.5 }} />
            Ứng viên
          </ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      <Paper
        elevation={4}
        sx={{
          borderRadius: '20px',
          overflow: 'hidden',
          border: '1px solid rgba(226, 232, 240, 0.95)',
          background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
          maxWidth: '380px',
          margin: '0 auto',
          boxShadow: '0 16px 40px rgba(15, 23, 42, 0.12)',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: '14px 16px',
            background: 'linear-gradient(120deg, #0f172a 0%, #1e293b 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.2, color: '#ffffff' }}>
                {title || 'InfoHR AI'}
              </Typography>
              <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mt: 0.2 }}>
                <Box
                  sx={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: '#22c55e',
                    boxShadow: '0 0 0 3px rgba(34, 197, 94, 0.25)',
                  }}
                />
                <Typography variant="caption" sx={{ fontSize: '0.72rem', opacity: 0.9, color: '#cbd5e1' }}>
                  {subtitle || 'Trợ lý tuyển dụng thông minh'}
                </Typography>
              </Stack>
            </Box>
          </Stack>

          <Stack direction="row" spacing={0.5}>
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.15)',
                display: 'grid',
                placeItems: 'center',
                color: '#ffffff',
              }}
            >
              <RefreshRoundedIcon sx={{ fontSize: 16 }} />
            </Box>
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.15)',
                display: 'grid',
                placeItems: 'center',
                color: '#ffffff',
              }}
            >
              <CloseRoundedIcon sx={{ fontSize: 16 }} />
            </Box>
          </Stack>
        </Box>

        {/* Message Body */}
        <Box sx={{ p: 2, minHeight: 240, maxHeight: 360, overflowY: 'auto' }}>
          <Paper
            elevation={0}
            sx={{
              p: 1.75,
              borderRadius: '16px',
              background: '#ffffff',
              border: '1px solid rgba(226, 232, 240, 0.95)',
              mb: 1.5,
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.04)',
            }}
          >
            <MessageResponse enableRich>{currentGreeting}</MessageResponse>
          </Paper>

          {/* Quick Suggestion Chips */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, my: 1.5 }}>
            {currentSuggestions.map((item, idx) => (
              <Chip
                key={idx}
                label={item}
                sx={{
                  background: '#f8fafc',
                  color: '#334155',
                  border: '1px solid #e2e8f0',
                  borderRadius: '999px',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  height: 'auto',
                  py: 0.75,
                  px: 0.5,
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  '&:hover': {
                    background: '#f1f5f9',
                    borderColor: '#cbd5e1',
                    color: '#0f172a',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 2px 8px rgba(15, 23, 42, 0.06)',
                  },
                  '& .MuiChip-label': {
                    px: 1,
                    whiteSpace: 'normal',
                    textAlign: 'left',
                  },
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Simulated Input Composer */}
        <Box
          sx={{
            p: 1.5,
            borderTop: '1px solid rgba(226, 232, 240, 0.95)',
            background: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Box
            sx={{
              flex: 1,
              py: 0.9,
              px: 2,
              borderRadius: '999px',
              border: '1px solid #e2e8f0',
              fontSize: '0.82rem',
              color: '#94a3b8',
              background: '#f8fafc',
            }}
          >
            Nhập tin nhắn của bạn...
          </Box>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #fb7185 0%, #e11d48 100%)',
              display: 'grid',
              placeItems: 'center',
              color: '#ffffff',
            }}
          >
            <SendRoundedIcon sx={{ fontSize: 16 }} />
          </Box>
        </Box>
      </Paper>
    </CardContainer>
  );
};

const CardContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Paper
    elevation={0}
    sx={{
      p: 2.5,
      borderRadius: '16px',
      border: '1px solid',
      borderColor: 'divider',
      background: '#ffffff',
      height: '100%',
    }}
  >
    {children}
  </Paper>
);

export default LiveChatbotPreview;

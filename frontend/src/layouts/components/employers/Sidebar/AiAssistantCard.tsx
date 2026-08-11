'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Box, Button, Typography, Tooltip } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { ROUTES } from '@/configs/routeConfig';
import { localizeRoutePath } from '@/configs/routeLocalization';
import { CHATBOT_ICONS } from '@/configs/images';

interface AiAssistantCardProps {
  isCollapsed?: boolean;
  language?: string;
}

const AiAssistantCard: React.FC<AiAssistantCardProps> = ({ isCollapsed = false, language = 'vi' }) => {
  const targetHref = localizeRoutePath(`/${ROUTES.EMPLOYER.AGENT_ASSISTANTS}`, language);
  const chatbotSrc = typeof CHATBOT_ICONS.EMPLOYER === 'string'
    ? CHATBOT_ICONS.EMPLOYER
    : (CHATBOT_ICONS.EMPLOYER as any)?.src || '/ai-avatar.png';

  if (isCollapsed) {
    return (
      <Tooltip title="AILA - Trợ lý AI hỗ trợ tìm kiếm ứng viên phù hợp" placement="right" arrow>
        <Box
          component={Link}
          href={targetHref}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 44,
            height: 44,
            mx: 'auto',
            my: 1.5,
            borderRadius: '14px',
            bgcolor: '#EFF6FF',
            border: '1px solid #DBEAFE',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.15)',
            transition: 'all 0.2s ease-in-out',
            textDecoration: 'none',
            overflow: 'hidden',
            p: 0.5,
            '&:hover': {
              transform: 'scale(1.08)',
              borderColor: '#3B82F6',
              boxShadow: '0 6px 16px rgba(37, 99, 235, 0.25)',
            },
          }}
        >
          <Box
            component="img"
            src={chatbotSrc}
            alt="AILA Assistant"
            sx={{ width: 34, height: 34, objectFit: 'contain' }}
          />
        </Box>
      </Tooltip>
    );
  }

  return (
    <Box
      sx={{
        mx: 1.5,
        mt: 2,
        mb: 1.5,
        p: 2,
        borderRadius: '16px',
        background: 'linear-gradient(180deg, #F4F8FF 0%, #EBF3FE 100%)',
        border: '1px solid #DBEAFE',
        boxShadow: '0 4px 14px rgba(37, 99, 235, 0.06)',
        position: 'relative',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {/* Title */}
      <Typography
        variant="subtitle1"
        sx={{
          fontWeight: 800,
          fontSize: '1.05rem',
          lineHeight: 1.25,
          color: '#2563EB',
          mb: 0.75,
          letterSpacing: '-0.01em',
        }}
      >
        AILA
      </Typography>

      {/* Subtitle text */}
      <Typography
        variant="body2"
        sx={{
          color: '#475569',
          fontSize: '0.78rem',
          lineHeight: 1.4,
          fontWeight: 500,
          maxWidth: '62%',
          mb: 2,
        }}
      >
        Trợ lý AI hỗ trợ tìm kiếm ứng viên phù hợp
      </Typography>

      {/* Robot Image from AILA Chatbot Icons */}
      <Box
        component="img"
        src={chatbotSrc}
        alt="AILA Assistant Robot"
        sx={{
          width: 72,
          height: 72,
          position: 'absolute',
          right: 10,
          top: 18,
          objectFit: 'contain',
          filter: 'drop-shadow(0 4px 10px rgba(37, 99, 235, 0.18))',
          pointerEvents: 'none',
        }}
      />

      {/* Action Button */}
      <Button
        component={Link}
        href={targetHref}
        variant="contained"
        fullWidth
        endIcon={<ArrowForwardIcon sx={{ fontSize: 15, color: '#2563EB', ml: 0.25 }} />}
        sx={{
          bgcolor: '#FFFFFF',
          color: '#2563EB',
          fontWeight: 800,
          fontSize: '0.8rem',
          py: 0.8,
          px: 1.25,
          borderRadius: '24px',
          textTransform: 'none',
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 8px rgba(37, 99, 235, 0.08)',
          whiteSpace: 'nowrap',
          '&:hover': {
            bgcolor: '#F8FAFC',
            borderColor: '#CBD5E1',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.15)',
            transform: 'translateY(-1px)',
          },
          transition: 'all 0.2s ease-in-out',
          mt: 0.5,
        }}
      >
        Trải nghiệm ngay
      </Button>
    </Box>
  );
};

export default AiAssistantCard;

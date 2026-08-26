'use client';

import React from 'react';
import Link from 'next/link';
import {
  Box,
  Card,
  Typography,
  Button,
} from '@mui/material';
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined';
import ChatOutlinedIcon from '@mui/icons-material/ChatOutlined';

const CandidateQuickSupportCard = () => {
  return (
    <>
      {/* ── Mobile Compact Helper (< 900px) ── */}
      <Card
        elevation={0}
        sx={{
          display: { xs: 'block', md: 'none' },
          p: 1.25,
          px: 1.5,
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          backgroundColor: '#ffffff',
          boxShadow: '0 2px 6px -2px rgba(0,0,0,0.03)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                backgroundColor: '#eff6ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2563eb',
                flexShrink: 0,
              }}
            >
              <SupportAgentOutlinedIcon sx={{ fontSize: 20 }} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="subtitle2"
                noWrap
                sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.825rem', lineHeight: 1.2 }}
              >
                Cần hỗ trợ?
              </Typography>
              <Typography
                variant="caption"
                noWrap
                sx={{ color: '#64748b', fontSize: '0.725rem', display: 'block' }}
              >
                Đội ngũ hỗ trợ 24/7
              </Typography>
            </Box>
          </Box>

          <Button
            component={Link}
            href="/contact"
            variant="outlined"
            size="small"
            startIcon={<ChatOutlinedIcon sx={{ fontSize: '15px !important', color: '#2563eb' }} />}
            sx={{
              borderRadius: '8px',
              borderColor: '#e2e8f0',
              color: '#2563eb',
              fontWeight: 700,
              textTransform: 'none',
              fontSize: '0.775rem',
              minHeight: 34,
              py: 0.5,
              px: 1.25,
              whiteSpace: 'nowrap',
              flexShrink: 0,
              transition: 'all 0.15s ease',
              '&:hover': {
                borderColor: '#2563eb',
                backgroundColor: '#eff6ff',
              },
              '&:focus-visible': {
                outline: '2px solid #2563eb',
                outlineOffset: '2px',
              },
            }}
          >
            Chat ngay
          </Button>
        </Box>
      </Card>

      {/* ── Desktop Full Card (>= 900px) ── */}
      <Card
        elevation={0}
        sx={{
          display: { xs: 'none', md: 'block' },
          p: 2,
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          backgroundColor: '#ffffff',
          boxShadow: '0 4px 20px -2px rgba(0,0,0,0.03)',
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a', mb: 0.5 }}>
          Cần hỗ trợ nhanh?
        </Typography>

        <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.775rem', display: 'block', mb: 1.5 }}>
          Trò chuyện với đội ngũ hỗ trợ để được giải đáp ngay.
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
          <Button
            component={Link}
            href="/contact"
            variant="outlined"
            size="small"
            startIcon={<ChatOutlinedIcon sx={{ color: '#2563eb' }} />}
            sx={{
              borderRadius: '10px',
              borderColor: '#e2e8f0',
              color: '#2563eb',
              fontWeight: 700,
              textTransform: 'none',
              fontSize: '0.8rem',
              py: 0.75,
              px: 1.5,
              transition: 'all 0.15s ease',
              '&:hover': {
                borderColor: '#2563eb',
                backgroundColor: '#eff6ff',
              },
              '&:focus-visible': {
                outline: '2px solid #2563eb',
                outlineOffset: '2px',
              },
            }}
          >
            Chat với chúng tôi
          </Button>

          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              backgroundColor: '#eff6ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#2563eb',
            }}
          >
            <SupportAgentOutlinedIcon sx={{ fontSize: 28 }} />
          </Box>
        </Box>
      </Card>
    </>
  );
};

export default CandidateQuickSupportCard;

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
    <Card
      elevation={0}
      sx={{
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
            '&:hover': {
              borderColor: '#2563eb',
              backgroundColor: '#eff6ff',
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
  );
};

export default CandidateQuickSupportCard;

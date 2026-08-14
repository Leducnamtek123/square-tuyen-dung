'use client';

import React from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  Stack,
} from '@mui/material';
import BusinessCenterOutlinedIcon from '@mui/icons-material/BusinessCenterOutlined';
import AddIcon from '@mui/icons-material/Add';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import type { ExtendedResume } from '@/components/Features/CVDoc';

interface CandidateExperienceCardProps {
  resume: ExtendedResume | null;
}

const CandidateExperienceCard = ({ resume }: CandidateExperienceCardProps) => {
  const experiences = resume?.experienceDetails || [];

  return (
    <Card
      elevation={0}
      sx={{
        p: { xs: 2, md: 2.5 },
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        backgroundColor: '#ffffff',
        boxShadow: '0 4px 20px -2px rgba(0,0,0,0.03)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BusinessCenterOutlinedIcon sx={{ color: '#2563eb' }} />
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.05rem', color: '#0f172a' }}>
            Kinh nghiệm làm việc
          </Typography>
        </Box>

        <Button
          size="small"
          startIcon={<AddIcon />}
          sx={{
            color: '#2563eb',
            fontWeight: 600,
            textTransform: 'none',
            borderRadius: '8px',
            backgroundColor: '#eff6ff',
            px: 1.5,
            '&:hover': { backgroundColor: '#dbeafe' },
          }}
        >
          Thêm
        </Button>
      </Box>

      <Stack spacing={2} sx={{ flexGrow: 1 }}>
        {experiences.length > 0 ? (
          experiences.map((exp, idx) => (
            <Box key={idx} sx={{ pb: idx !== experiences.length - 1 ? 2 : 0, borderBottom: idx !== experiences.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>
                    {exp.jobName}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#2563eb', fontWeight: 600, fontSize: '0.85rem' }}>
                    {exp.companyName}
                  </Typography>
                </Box>
                {(exp as { location?: string }).location && (
                  <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.775rem' }}>
                    {(exp as { location?: string }).location}
                  </Typography>
                )}
              </Box>

              {(exp.startDate || exp.endDate) && (
                <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.8rem', display: 'block', mb: 1 }}>
                  {exp.startDate || '—'} - {exp.endDate || 'Hiện tại'}
                </Typography>
              )}

              {Array.isArray(exp.description) && exp.description.length > 0 ? (
                <Box component="ul" sx={{ m: 0, pl: 2, color: '#475569', fontSize: '0.825rem', lineHeight: 1.6 }}>
                  {exp.description.map((item, dIdx) => (
                    <Typography component="li" key={dIdx} variant="caption" sx={{ fontSize: '0.825rem', display: 'list-item' }}>
                      {item}
                    </Typography>
                  ))}
                </Box>
              ) : typeof exp.description === 'string' && exp.description ? (
                <Typography variant="caption" sx={{ color: '#475569', fontSize: '0.825rem', display: 'block' }}>
                  {exp.description}
                </Typography>
              ) : null}
            </Box>
          ))
        ) : (
          <Typography variant="body2" sx={{ color: '#94a3b8', fontStyle: 'italic', py: 2, textAlign: 'center' }}>
            Chưa có thông tin kinh nghiệm làm việc
          </Typography>
        )}
      </Stack>

      <Box sx={{ textAlign: 'center', mt: 2, pt: 1.5, borderTop: '1px solid #f8fafc' }}>
        <Button
          size="small"
          endIcon={<ArrowForwardIosIcon sx={{ fontSize: '10px !important' }} />}
          sx={{
            color: '#2563eb',
            fontWeight: 700,
            fontSize: '0.85rem',
            textTransform: 'none',
            '&:hover': { backgroundColor: 'transparent', color: '#1d4ed8' },
          }}
        >
          Xem tất cả kinh nghiệm
        </Button>
      </Box>
    </Card>
  );
};

export default CandidateExperienceCard;

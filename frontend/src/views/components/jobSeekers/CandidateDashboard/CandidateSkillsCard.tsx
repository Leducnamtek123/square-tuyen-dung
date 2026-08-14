'use client';

import React from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  LinearProgress,
  Stack,
} from '@mui/material';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import AddIcon from '@mui/icons-material/Add';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import type { ExtendedResume } from '@/components/Features/CVDoc';

interface CandidateSkillsCardProps {
  resume: ExtendedResume | null;
}

const CandidateSkillsCard = ({ resume }: CandidateSkillsCardProps) => {
  const skills = resume?.advancedSkills && resume.advancedSkills.length > 0
    ? resume.advancedSkills.map((s) => ({
        name: s.name || '',
        percent: (s.level ?? 4) * 20,
      })).filter((s) => Boolean(s.name))
    : [];

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
          <LightbulbOutlinedIcon sx={{ color: '#2563eb' }} />
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.05rem', color: '#0f172a' }}>
            Kỹ năng nổi bật
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
        {skills.length > 0 ? (
          skills.map((skill) => (
            <Box key={skill.name}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#0f172a', fontSize: '0.875rem' }}>
                  {skill.name}
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#475569', fontSize: '0.875rem' }}>
                  {skill.percent}%
                </Typography>
              </Box>

              <LinearProgress
                variant="determinate"
                value={skill.percent}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: '#f1f5f9',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                    backgroundColor: '#2563eb',
                  },
                }}
              />
            </Box>
          ))
        ) : (
          <Typography variant="body2" sx={{ color: '#94a3b8', fontStyle: 'italic', py: 2, textAlign: 'center' }}>
            Chưa có thông tin kỹ năng nổi bật
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
          Xem tất cả kỹ năng
        </Button>
      </Box>
    </Card>
  );
};

export default CandidateSkillsCard;

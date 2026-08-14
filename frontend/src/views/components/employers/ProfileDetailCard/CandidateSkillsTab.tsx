'use client';

import React from 'react';
import { Box, Chip, Paper, Stack, Typography } from '@mui/material';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined';
import AdvancedSkillSection from './AdvancedSkillSection';
import type { ResumeDetailResponse } from '@/types/models';

interface CandidateSkillsTabProps {
  profileDetail: ResumeDetailResponse;
}

export const CandidateSkillsTab: React.FC<CandidateSkillsTabProps> = ({ profileDetail }) => {
  const skills = profileDetail.advancedSkills || [];
  const hasSkillDetails = skills.length > 0;


  return (
    <Stack spacing={3}>
      {/* Skill Tags */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 3 },
          borderRadius: '16px',
          bgcolor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: 2 }}>
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: '6px',
              bgcolor: '#EFF6FF',
              color: '#2563EB',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <AutoAwesomeOutlinedIcon sx={{ fontSize: 18 }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1rem', color: '#0F172A' }}>
            Kỹ năng chuyên môn
          </Typography>
        </Stack>

        {skills.length > 0 ? (
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {skills.map((skill: any, idx: number) => {
              const skillName = typeof skill === 'object' ? skill.name || skill.skillName : skill;
              return (
                <Chip
                  key={idx}
                  label={skillName}
                  sx={{
                    bgcolor: '#EFF6FF',
                    color: '#1D4ED8',
                    border: '1px solid #BFDBFE',
                    fontWeight: 700,
                    borderRadius: '8px',
                    fontSize: '0.8125rem',
                    py: 2,
                  }}
                />
              );
            })}
          </Stack>
        ) : (
          <Typography variant="body2" sx={{ color: '#94A3B8', fontStyle: 'italic' }}>
            Chưa có thông tin danh sách kỹ năng chuyên môn.
          </Typography>
        )}
      </Paper>

      {/* Advanced Skill Levels */}
      {hasSkillDetails && <AdvancedSkillSection profileDetail={profileDetail} />}
    </Stack>
  );
};

export default CandidateSkillsTab;

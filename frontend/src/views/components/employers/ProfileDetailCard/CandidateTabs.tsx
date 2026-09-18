'use client';

import React from 'react';
import { Box, Stack, Typography, ButtonBase } from '@mui/material';
import { motion } from 'motion/react';
import {
  SquaresFour,
  Briefcase,
  Sparkle,
  Microphone,
  FileText,
  ClockCounterClockwise,
} from '@phosphor-icons/react';

export type CandidateTabKey = 'overview' | 'experience' | 'skills' | 'interview' | 'documents' | 'activity';

interface CandidateTabsProps {
  activeTab: CandidateTabKey;
  onChangeTab: (tab: CandidateTabKey) => void;
  experienceCount?: number;
  skillsCount?: number;
  documentsCount?: number;
}

interface TabDef {
  id: CandidateTabKey;
  label: string;
  icon: React.ElementType;
}

const TABS: TabDef[] = [
  { id: 'overview', label: 'Tổng quan', icon: SquaresFour },
  { id: 'experience', label: 'Hồ sơ & Kinh nghiệm', icon: Briefcase },
  { id: 'skills', label: 'Kỹ năng', icon: Sparkle },
  { id: 'interview', label: 'Phỏng vấn', icon: Microphone },
  { id: 'documents', label: 'Tài liệu', icon: FileText },
  { id: 'activity', label: 'Nhật ký hoạt động', icon: ClockCounterClockwise },
];

export const CandidateTabs: React.FC<CandidateTabsProps> = ({
  activeTab,
  onChangeTab,
  experienceCount,
  skillsCount,
  documentsCount,
}) => {
  return (
    <Box
      sx={{
        borderBottom: '1px solid #E2E8F0',
        bgcolor: 'transparent',
        overflowX: 'auto',
        whiteSpace: 'nowrap',
        '::-webkit-scrollbar': { display: 'none' },
        scrollbarWidth: 'none',
      }}
    >
      <Stack direction="row" spacing={0.75} sx={{ minWidth: 'max-content', py: 0.5 }}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          let countBadge: number | undefined;
          if (tab.id === 'experience' && experienceCount !== undefined && experienceCount > 0) {
            countBadge = experienceCount;
          } else if (tab.id === 'skills' && skillsCount !== undefined && skillsCount > 0) {
            countBadge = skillsCount;
          } else if (tab.id === 'documents' && documentsCount !== undefined && documentsCount > 0) {
            countBadge = documentsCount;
          }

          const IconComponent = tab.icon;

          return (
            <ButtonBase
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              sx={{
                position: 'relative',
                px: 2,
                py: 1.5,
                borderRadius: '10px',
                color: isActive ? '#1D4ED8' : '#64748B',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.875rem',
                transition: 'color 0.15s ease, background-color 0.15s ease, transform 0.1s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1.1,
                cursor: 'pointer',
                '&:hover': {
                  color: '#0F172A',
                  bgcolor: isActive ? 'rgba(239, 246, 255, 0.7)' : 'rgba(241, 245, 249, 0.8)',
                },
                '&:active': {
                  transform: 'scale(0.98)',
                },
              }}
            >
              <IconComponent
                size={18}
                weight={isActive ? 'duotone' : 'regular'}
                style={{
                  color: isActive ? '#2563EB' : '#94A3B8',
                  transition: 'color 0.15s ease',
                }}
              />
              <Typography
                component="span"
                sx={{
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 750 : 600,
                  color: 'inherit',
                  letterSpacing: '-0.01em',
                }}
              >
                {tab.label}
              </Typography>

              {countBadge !== undefined && (
                <Box
                  component="span"
                  sx={{
                    px: 0.85,
                    py: 0.15,
                    borderRadius: '8px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono)',
                    bgcolor: isActive ? '#EFF6FF' : '#F1F5F9',
                    color: isActive ? '#2563EB' : '#64748B',
                    border: '1px solid',
                    borderColor: isActive ? 'rgba(191, 219, 254, 0.6)' : 'rgba(226, 232, 240, 0.8)',
                    lineHeight: 1.3,
                  }}
                >
                  {countBadge}
                </Box>
              )}

              {/* Shared Spring Physical Sliding Indicator Bar */}
              {isActive && (
                <motion.div
                  layoutId="activeCandidateTabIndicator"
                  transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                  style={{
                    position: 'absolute',
                    bottom: -5,
                    left: 8,
                    right: 8,
                    height: 2.5,
                    backgroundColor: '#2563EB',
                    borderRadius: '4px 4px 0 0',
                    boxShadow: '0 1px 4px rgba(37, 99, 235, 0.35)',
                  }}
                />
              )}
            </ButtonBase>
          );
        })}
      </Stack>
    </Box>
  );
};

export default CandidateTabs;

'use client';

import React from 'react';
import { Box, Stack, Typography, ButtonBase } from '@mui/material';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import MicNoneOutlinedIcon from '@mui/icons-material/MicNoneOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';

export type CandidateTabKey = 'overview' | 'experience' | 'skills' | 'interview' | 'documents' | 'activity';

interface CandidateTabsProps {
  activeTab: CandidateTabKey;
  onChangeTab: (tab: CandidateTabKey) => void;
  experienceCount?: number;
  skillsCount?: number;
  documentsCount?: number;
}

const TABS: { id: CandidateTabKey; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Tổng quan', icon: DashboardOutlinedIcon },
  { id: 'experience', label: 'Hồ sơ & Kinh nghiệm', icon: WorkOutlineOutlinedIcon },
  { id: 'skills', label: 'Kỹ năng', icon: AutoAwesomeOutlinedIcon },
  { id: 'interview', label: 'Phỏng vấn', icon: MicNoneOutlinedIcon },
  { id: 'documents', label: 'Tài liệu', icon: DescriptionOutlinedIcon },
  { id: 'activity', label: 'Nhật ký hoạt động', icon: HistoryOutlinedIcon },
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
      <Stack direction="row" spacing={1} sx={{ minWidth: 'max-content', py: 0.5 }}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <ButtonBase
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              sx={{
                position: 'relative',
                px: 2,
                py: 1.5,
                borderRadius: '8px',
                color: isActive ? '#2563EB' : '#64748B',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.875rem',
                transition: 'all 0.15s ease-in-out',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                '&:hover': {
                  color: '#0F172A',
                  bgcolor: 'rgba(241, 245, 249, 0.7)',
                },
              }}
            >
              <Icon sx={{ fontSize: 18, color: isActive ? '#2563EB' : '#94A3B8' }} />
              <Typography
                component="span"
                sx={{
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 700 : 600,
                  color: 'inherit',
                }}
              >
                {tab.label}
              </Typography>

              {/* Active Bottom Underline Bar */}
              {isActive && (
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: -5,
                    left: 12,
                    right: 12,
                    height: 2.5,
                    bgcolor: '#2563EB',
                    borderRadius: '3px 3px 0 0',
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

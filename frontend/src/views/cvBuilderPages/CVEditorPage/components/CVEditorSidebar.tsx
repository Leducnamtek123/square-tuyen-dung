'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Stack,
  Typography,
  Tabs,
  Tab,
  Divider,
} from '@mui/material';
import SyncIcon from '@mui/icons-material/Sync';
import EditNoteOutlinedIcon from '@mui/icons-material/EditNoteOutlined';
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import AutoFixHighOutlinedIcon from '@mui/icons-material/AutoFixHighOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import CodeOutlinedIcon from '@mui/icons-material/CodeOutlined';

import {
  CVData,
  CVPersonalInfo,
  CVExperienceItem,
  CVEducationItem,
  CVSkillItem,
  CVLanguageItem,
  CVCertificateItem,
  CVProjectItem,
  CVThemeConfig,
} from '@/types/cvBuilder';
import { UnifiedCVForm } from './forms/UnifiedCVForm';
import { DesignCustomizer } from './forms/DesignCustomizer';
import { AIAssistantTab } from './forms/AIAssistantTab';
import { AICvScoreTab } from './forms/AICvScoreTab';
import { useTranslation } from 'react-i18next';

interface CVEditorSidebarProps {
  data: CVData;
  candidateCvId?: number | string | null;
  onChangeData: (updated: CVData) => void;
  onSyncFromProfile: () => void;
  isSyncing?: boolean;
}

type MainTab = 'content' | 'design' | 'ai-score' | 'ai';

export const CVEditorSidebar: React.FC<CVEditorSidebarProps> = ({
  data,
  candidateCvId,
  onChangeData,
  onSyncFromProfile,
  isSyncing,
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<MainTab>('content');

  const updateTheme = (theme: CVThemeConfig) => {
    onChangeData({ ...data, theme });
  };

  const updateTemplate = (templateId: string, color?: string) => {
    onChangeData({
      ...data,
      templateId,
      theme: {
        ...data.theme,
        ...(color ? { primaryColor: color } : {}),
      },
    });
  };

  const handleApplyBioFromAI = (bioText: string) => {
    onChangeData({
      ...data,
      personalInfo: {
        ...data.personalInfo,
        bio: bioText,
      },
    });
    setActiveTab('content');
  };

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#ffffff', borderRight: '1px solid #e2e8f0' }}>
      {/* ── Top Header & 1-Click Sync Button ──────────────────────────────── */}
      <Box sx={{ p: 2, borderBottom: '1px solid #e2e8f0', bgcolor: '#f8fafc', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.875rem' }}>
            {t('cvBuilder.editor.sidebarTitle', 'Chỉnh sửa hồ sơ CV')}
          </Typography>
          <Button
            size="small"
            variant="contained"
            disabled={isSyncing}
            startIcon={<SyncIcon sx={{ fontSize: 16, animation: isSyncing ? 'spin 1s linear infinite' : 'none' }} />}
            onClick={onSyncFromProfile}
            sx={{
              bgcolor: '#2563eb',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.75rem',
              borderRadius: '10px',
              textTransform: 'none',
              px: 1.75,
              py: 0.6,
              boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)',
              '&:hover': { bgcolor: '#1d4ed8' },
            }}
          >
            {t('cvBuilder.editor.syncFromProfile', 'Đồng bộ từ hồ sơ')}
          </Button>
        </Stack>

        {/* Navigation Tabs (4 Main Tabs) */}
        <Stack direction="row" spacing={0.75} sx={{ bgcolor: '#f1f5f9', p: 0.5, borderRadius: '12px' }}>
          {[
            { id: 'content', label: t('cvBuilder.tabs.content', 'Nhập liệu'), icon: EditNoteOutlinedIcon },
            { id: 'design', label: t('cvBuilder.tabs.design', 'Thiết kế'), icon: PaletteOutlinedIcon },
            { id: 'ai-score', label: t('cvBuilder.tabs.aiScore', 'Chấm ATS'), icon: FactCheckOutlinedIcon },
            { id: 'ai', label: t('cvBuilder.tabs.aiAssist', 'Gợi ý AI'), icon: AutoFixHighOutlinedIcon },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <Button
                key={tab.id}
                size="small"
                onClick={() => setActiveTab(tab.id as MainTab)}
                startIcon={<Icon sx={{ fontSize: 15 }} />}
                sx={{
                  flex: 1,
                  py: 0.75,
                  borderRadius: '9px',
                  fontWeight: 700,
                  fontSize: '0.725rem',
                  textTransform: 'none',
                  whiteSpace: 'nowrap',
                  minWidth: 0,
                  px: 0.5,
                  ...(isSelected
                    ? {
                        bgcolor: '#ffffff',
                        color: '#2563eb',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                        '&:hover': { bgcolor: '#ffffff' },
                      }
                    : {
                        color: '#64748b',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.6)', color: '#0f172a' },
                      }),
                }}
              >
                {tab.label}
              </Button>
            );
          })}
        </Stack>
      </Box>

      {/* ── Tab Content Forms Scrollable Container ─────────────────────── */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: { xs: 2, sm: 2.5 } }}>
        {activeTab === 'content' && (
          <UnifiedCVForm
            data={data}
            onChangeData={onChangeData}
            onOpenAISuggestions={() => setActiveTab('ai')}
          />
        )}

        {activeTab === 'design' && (
          <DesignCustomizer
            theme={data.theme}
            templateId={data.templateId}
            onChangeTheme={updateTheme}
            onChangeTemplate={updateTemplate}
          />
        )}

        {activeTab === 'ai-score' && (
          <AICvScoreTab data={data} candidateCvId={candidateCvId} onUpdate={onChangeData} />
        )}

        {activeTab === 'ai' && (
          <AIAssistantTab onApplyBio={handleApplyBioFromAI} />
        )}
      </Box>
    </Box>
  );
};

'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Stack,
  CircularProgress,
  Tabs,
  Tab,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import SaveIcon from '@mui/icons-material/Save';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import VpnKeyIcon from '@mui/icons-material/VpnKey';

import { useSystemSettings, SystemSettings } from './hooks/useSystemSettings';
import ChatbotSettingsTab from './components/ChatbotSettingsTab';
import VoiceInterviewTab from './components/VoiceInterviewTab';
import GeneralSettingsTab from './components/GeneralSettingsTab';
import ApiIntegrationTab from './components/ApiIntegrationTab';

const INITIAL_SETTINGS: SystemSettings = {
  maintenanceMode: false,
  autoApproveJobs: false,
  emailNotifications: true,
  ttsSpeed: '0.92',
  interviewQuestionGapSeconds: '2.0',
  interviewMinimumSilenceSeconds: '1.2',
  chatbotTitle: 'AILA AI',
  chatbotSubtitle: 'Trợ lý tuyển dụng thông minh',
  chatbotEmployerGreeting: '',
  chatbotJobSeekerGreeting: '',
  chatbotEmployerSuggestions: '',
  chatbotJobSeekerSuggestions: '',
};

interface SettingsFormProps {
  initialSettings: SystemSettings;
  onSave: (data: SystemSettings) => Promise<unknown>;
  isMutating: boolean;
}

const SettingsForm: React.FC<SettingsFormProps> = ({ initialSettings, onSave, isMutating }) => {
  const { t } = useTranslation('admin');
  const [formData, setFormData] = useState<SystemSettings>(() => initialSettings);
  const [currentTab, setCurrentTab] = useState<number>(0);

  useEffect(() => {
    setFormData(initialSettings);
  }, [initialSettings]);

  const handleFieldChange = (name: keyof SystemSettings, value: unknown) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggleChange = (name: keyof SystemSettings) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [name]: event.target.checked }));
  };

  const handleSave = async () => {
    try {
      await onSave(formData);
    } catch {
      // Error handled by hook toast
    }
  };

  return (
    <Box sx={{ pb: 6 }}>
      {/* Top Header with Title and Global Save Bar */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: '16px',
          border: '1px solid',
          borderColor: 'divider',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        }}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} gap={2}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.02em', mb: 0.5 }}>
              Cài Đặt Hệ Thống
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Quản lý toàn bộ cấu hình AI Chatbot, phỏng vấn giọng nói, vận hành và các khóa API.
            </Typography>
          </Box>

          <Button
            variant="contained"
            color="primary"
            startIcon={isMutating ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
            onClick={handleSave}
            disabled={isMutating}
            sx={{
              py: 1.2,
              px: 3.5,
              fontWeight: 700,
              borderRadius: '12px',
              boxShadow: '0 8px 20px rgba(15, 23, 42, 0.15)',
              whiteSpace: 'nowrap',
            }}
          >
            {isMutating ? t('common.saving') : t('common.saveChanges')}
          </Button>
        </Stack>

        {/* Navigation Tabs */}
        <Box sx={{ mt: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={currentTab}
            onChange={(_, val) => setCurrentTab(val)}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              '& .MuiTab-root': {
                fontWeight: 700,
                fontSize: '0.92rem',
                py: 1.5,
                minHeight: 48,
              },
            }}
          >
            <Tab icon={<SmartToyIcon />} iconPosition="start" label="AI Chatbot (Trợ lý AI)" />
            <Tab icon={<RecordVoiceOverIcon />} iconPosition="start" label="Phỏng Vấn & Giọng Nói AI" />
            <Tab icon={<SettingsSuggestIcon />} iconPosition="start" label="Hệ Thống & Thông Báo" />
            <Tab icon={<VpnKeyIcon />} iconPosition="start" label="API & Tích Hợp" />
          </Tabs>
        </Box>
      </Paper>

      {/* Tab Panels */}
      <Box sx={{ mt: 2 }}>
        {currentTab === 0 && <ChatbotSettingsTab formData={formData} onChange={handleFieldChange} />}
        {currentTab === 1 && (
          <VoiceInterviewTab
            formData={formData}
            onChange={handleFieldChange}
          />
        )}
        {currentTab === 2 && <GeneralSettingsTab formData={formData} onToggleChange={handleToggleChange} />}
        {currentTab === 3 && <ApiIntegrationTab formData={formData} onChange={handleFieldChange} />}
      </Box>
    </Box>
  );
};

const SettingsPage = () => {
  const { data: settings, isLoading, updateSystemSettings, isMutating } = useSystemSettings();

  if (isLoading && !settings) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  const initialSettings = settings ?? INITIAL_SETTINGS;

  return (
    <SettingsForm
      key={settings ? 'loaded' : 'default'}
      initialSettings={initialSettings}
      onSave={updateSystemSettings}
      isMutating={isMutating}
    />
  );
};

export default SettingsPage;

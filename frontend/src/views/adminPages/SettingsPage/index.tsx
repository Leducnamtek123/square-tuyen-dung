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
  Card,
  CardContent,
  Grid2 as Grid,
  Chip,
  Alert,
  Divider,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import SaveIcon from '@mui/icons-material/Save';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import RefreshIcon from '@mui/icons-material/Refresh';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

import { useSystemSettings, SystemSettings } from './hooks/useSystemSettings';
import ChatbotSettingsTab from './components/ChatbotSettingsTab';
import VoiceInterviewTab from './components/VoiceInterviewTab';
import GeneralSettingsTab from './components/GeneralSettingsTab';
import ApiIntegrationTab from './components/ApiIntegrationTab';
import fptGpuService from '../../../services/fptGpuService';
import toastMessages from '../../../utils/toastMessages';
import { getApiErrorMessage } from '../../../utils/apiResponse';
import { getSafeExternalOpenUrl } from '@/utils/safeExternalUrl';

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

const serviceLabels: Record<string, string> = {
  llm: 'LLM',
  stt: 'STT',
  tts: 'TTS',
  livekit: 'LiveKit',
  celery: 'Celery',
};

const normalizeStatus = (status?: string): string => (status || 'UNKNOWN').toUpperCase();

const statusColor = (status?: string): 'success' | 'warning' | 'error' | 'default' => {
  const normalized = normalizeStatus(status);
  if (normalized === 'RUNNING' || normalized === 'READY') return 'success';
  if (normalized === 'STOPPED' || normalized === 'UNKNOWN' || normalized === 'DEGRADED') return 'warning';
  if (normalized === 'FAILED' || normalized === 'ERROR') return 'error';
  return 'default';
};

const serviceColor = (status?: string): 'success' | 'error' | 'default' => {
  if (status === 'online') return 'success';
  if (status === 'offline') return 'error';
  return 'default';
};

const formatVndPerHour = (value?: number, locale: string = 'vi') => {
  if (value === undefined || value === null) return 'N/A';
  try {
    return new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(value) + '/h';
  } catch {
    return `${value} VND/h`;
  }
};

const FPTGpuControlCard = () => {
  const { t, i18n } = useTranslation('admin');
  const queryClient = useQueryClient();

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ['fpt-gpu-control'],
    queryFn: fptGpuService.getStatus,
    refetchInterval: 15000,
  });

  const actionMutation = useMutation({
    mutationFn: (action: 'start' | 'stop' | 'bootstrap' | 'start-bootstrap') => {
      if (action === 'start') return fptGpuService.start();
      if (action === 'stop') return fptGpuService.stop();
      if (action === 'bootstrap') return fptGpuService.bootstrap();
      return fptGpuService.startAndBootstrap();
    },
    onSuccess: (_result, action) => {
      const toastKey =
        action === 'stop'
          ? 'pages.settings.fptGpu.toast.stopSuccess'
          : action === 'bootstrap'
            ? 'pages.settings.fptGpu.toast.bootstrapSuccess'
            : action === 'start-bootstrap'
              ? 'pages.settings.fptGpu.toast.startBootstrapSuccess'
              : 'pages.settings.fptGpu.toast.startSuccess';
      toastMessages.success(t(toastKey));
      queryClient.invalidateQueries({ queryKey: ['fpt-gpu-control'] });
    },
    onError: (mutationError) => {
      toastMessages.error(getApiErrorMessage(mutationError, t('pages.settings.fptGpu.toast.actionError')));
    },
  });

  const container = data?.container;
  const safeConsoleUrl = getSafeExternalOpenUrl(container?.consoleUrl);
  const control = data?.control;
  const status = normalizeStatus(container?.status);
  const bootstrapConfigured = !!data?.bootstrap?.configured;
  const isBusy = ['CREATING', 'PROCESSING', 'DELETING', 'INITIALIZING'].includes(status);
  const canStart = !!control?.available && !isBusy && ['STOPPED', 'FAILED', 'ERROR', 'UNKNOWN'].includes(status);
  const canStop = !!control?.available && !isBusy && status === 'RUNNING';
  const canStartBootstrap = canStart && bootstrapConfigured;
  const canBootstrap = bootstrapConfigured && !isBusy && ['RUNNING', 'DEGRADED', 'UNKNOWN', 'FAILED', 'ERROR'].includes(status);
  const checks = Object.entries(data?.ai.checks || {});
  const queryError = error instanceof Error ? error.message : '';

  return (
    <Card elevation={0} sx={{ borderRadius: '16px', border: '1px solid', borderColor: 'divider' }}>
      <CardContent sx={{ p: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={2} sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {t('pages.settings.fptGpu.title')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {container?.name || 'square-ai-manual-1ivp1r2x'}
            </Typography>
          </Box>
          <Stack direction="row" gap={1} flexWrap="wrap">
            <Chip label={status} color={statusColor(status)} size="small" />
            <Chip
              label={control?.available ? t('pages.settings.fptGpu.controlEnabled') : t('pages.settings.fptGpu.readOnly')}
              size="small"
              variant="outlined"
            />
          </Stack>
        </Stack>

        <Divider sx={{ mb: 3 }} />

        {queryError && <Alert severity="error" sx={{ mb: 2 }}>{queryError}</Alert>}
        {control?.configured && control?.error && <Alert severity="warning" sx={{ mb: 2 }}>{control.error}</Alert>}
        {!control?.configured && !isLoading && <Alert severity="info" sx={{ mb: 2 }}>{t('pages.settings.fptGpu.notConfigured')}</Alert>}

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="caption" color="text.secondary">{t('pages.settings.fptGpu.tenant')}</Typography>
            <Typography variant="body2" fontWeight={600}>{container?.tenantId || 'N/A'}</Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="caption" color="text.secondary">{t('pages.settings.fptGpu.runningCost')}</Typography>
            <Typography variant="body2" fontWeight={600}>{formatVndPerHour(container?.billing?.runningHourlyVnd, i18n.language)}</Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="caption" color="text.secondary">{t('pages.settings.fptGpu.stoppedDiskCost')}</Typography>
            <Typography variant="body2" fontWeight={600}>{formatVndPerHour(container?.billing?.stoppedHourlyVnd, i18n.language)}</Typography>
          </Grid>
        </Grid>

        <Stack direction="row" gap={1} flexWrap="wrap" sx={{ mb: 3 }}>
          {checks.map(([key, check]) => (
            <Chip
              key={key}
              label={`${serviceLabels[key] || key}: ${check.status}`}
              color={serviceColor(check.status)}
              size="small"
              variant="outlined"
            />
          ))}
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} gap={1.5}>
          <Button
            variant="contained"
            color="success"
            startIcon={actionMutation.isPending ? <CircularProgress color="inherit" size={18} /> : <PlayArrowIcon />}
            disabled={!canStartBootstrap || actionMutation.isPending}
            onClick={() => actionMutation.mutate('start-bootstrap')}
          >
            {t('pages.settings.fptGpu.startBootstrap')}
          </Button>
          <Button
            variant="outlined"
            startIcon={actionMutation.isPending ? <CircularProgress size={18} /> : <RefreshIcon />}
            disabled={!canBootstrap || actionMutation.isPending}
            onClick={() => actionMutation.mutate('bootstrap')}
          >
            {t('pages.settings.fptGpu.bootstrap')}
          </Button>
          <Button
            variant="outlined"
            color="success"
            startIcon={actionMutation.isPending ? <CircularProgress color="inherit" size={18} /> : <PlayArrowIcon />}
            disabled={!canStart || actionMutation.isPending}
            onClick={() => actionMutation.mutate('start')}
          >
            {t('pages.settings.fptGpu.start')}
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={actionMutation.isPending ? <CircularProgress color="inherit" size={18} /> : <StopCircleIcon />}
            disabled={!canStop || actionMutation.isPending}
            onClick={() => actionMutation.mutate('stop')}
          >
            {t('pages.settings.fptGpu.stop')}
          </Button>
          <Button
            variant="outlined"
            startIcon={isFetching ? <CircularProgress size={18} /> : <RefreshIcon />}
            onClick={() => queryClient.invalidateQueries({ queryKey: ['fpt-gpu-control'] })}
          >
            {t('pages.settings.fptGpu.refresh')}
          </Button>
          {safeConsoleUrl && (
            <Button
              variant="text"
              endIcon={<OpenInNewIcon />}
              href={safeConsoleUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('pages.settings.fptGpu.openConsole')}
            </Button>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
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
              Quản lý toàn bộ cấu hình AI Chatbot, phỏng vấn giọng nói, dịch vụ GPU, vận hành và các khóa API.
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
            FPTGpuControlCardComponent={<FPTGpuControlCard />}
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

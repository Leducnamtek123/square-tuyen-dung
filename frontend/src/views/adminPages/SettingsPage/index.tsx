'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Breadcrumbs,
  Link,
  Paper,
  Grid2 as Grid,
  Switch,
  FormControlLabel,
  Button,
  TextField,
  Divider,
  Card,
  CardContent,
  Stack,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import SaveIcon from '@mui/icons-material/Save';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import RefreshIcon from '@mui/icons-material/Refresh';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import { useSystemSettings, SystemSettings } from './hooks/useSystemSettings';
import fptGpuService, { type FPTGpuControlStatus } from '../../../services/fptGpuService';
import adminSettingsService, { type SystemHealthPayload } from '../../../services/adminSettingsService';
import toastMessages from '../../../utils/toastMessages';

const INITIAL_SETTINGS: SystemSettings = {
  maintenanceMode: false,
  autoApproveJobs: false,
  emailNotifications: true,
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

const formatVndPerHour = (value?: number): string => {
  if (!value) return 'N/A';
  return `${new Intl.NumberFormat('vi-VN').format(value)} VND/h`;
};

const getApiErrorMessage = (error: unknown, fallback: string): string => {
  const responseData = (error as { response?: { data?: unknown } })?.response?.data as
    | {
        detail?: string;
        error?: {
          message?: string;
          details?: { detail?: string };
        };
      }
    | undefined;

  return (
    responseData?.error?.details?.detail ||
    responseData?.error?.message ||
    responseData?.detail ||
    (error instanceof Error ? error.message : '') ||
    fallback
  );
};

const FPTGpuControlCard = () => {
  const queryClient = useQueryClient();
  const { data, isLoading, isFetching, error } = useQuery<FPTGpuControlStatus>({
    queryKey: ['fpt-gpu-control'],
    queryFn: fptGpuService.getStatus,
    refetchInterval: 30000,
  });

  const actionMutation = useMutation({
    mutationFn: (action: 'start' | 'stop') =>
      action === 'start' ? fptGpuService.start() : fptGpuService.stop(),
    onSuccess: (_result, action) => {
      toastMessages.success(action === 'start' ? 'FPT GPU start requested.' : 'FPT GPU stop requested.');
      queryClient.invalidateQueries({ queryKey: ['fpt-gpu-control'] });
    },
    onError: (mutationError) => {
      toastMessages.error(getApiErrorMessage(mutationError, 'FPT GPU action failed.'));
    },
  });

  const container = data?.container;
  const control = data?.control;
  const status = normalizeStatus(container?.status);
  const isBusy = ['CREATING', 'PROCESSING', 'DELETING', 'INITIALIZING'].includes(status);
  const canStart = !!control?.available && !isBusy && ['STOPPED', 'FAILED', 'ERROR', 'UNKNOWN'].includes(status);
  const canStop = !!control?.available && !isBusy && status === 'RUNNING';
  const checks = Object.entries(data?.ai.checks || {});
  const queryError = error instanceof Error ? error.message : '';

  return (
    <Card elevation={0} sx={{ borderRadius: '16px', border: '1px solid', borderColor: 'divider' }}>
      <CardContent sx={{ p: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={2} sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              FPT GPU Container
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {container?.name || 'square-ai-manual-1ivp1r2x'}
            </Typography>
          </Box>
          <Stack direction="row" gap={1} flexWrap="wrap">
            <Chip label={status} color={statusColor(status)} size="small" />
            <Chip label={control?.available ? 'Control enabled' : 'Read only'} size="small" variant="outlined" />
          </Stack>
        </Stack>

        <Divider sx={{ mb: 3 }} />

        {queryError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {queryError}
          </Alert>
        )}
        {control?.configured && control?.error && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {control.error}
          </Alert>
        )}
        {!control?.configured && !isLoading && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Add FPT_GPU_BSS_ACCESS_TOKEN or FPT_GPU_ACCESS_TOKEN on the backend to enable Start and Stop.
          </Alert>
        )}

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="caption" color="text.secondary">Tenant</Typography>
            <Typography variant="body2" fontWeight={600}>{container?.tenantId || 'N/A'}</Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="caption" color="text.secondary">Running cost</Typography>
            <Typography variant="body2" fontWeight={600}>{formatVndPerHour(container?.billing?.runningHourlyVnd)}</Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="caption" color="text.secondary">Stopped disk cost</Typography>
            <Typography variant="body2" fontWeight={600}>{formatVndPerHour(container?.billing?.stoppedHourlyVnd)}</Typography>
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
            disabled={!canStart || actionMutation.isPending}
            onClick={() => actionMutation.mutate('start')}
          >
            Start
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={actionMutation.isPending ? <CircularProgress color="inherit" size={18} /> : <StopCircleIcon />}
            disabled={!canStop || actionMutation.isPending}
            onClick={() => actionMutation.mutate('stop')}
          >
            Stop
          </Button>
          <Button
            variant="outlined"
            startIcon={isFetching ? <CircularProgress size={18} /> : <RefreshIcon />}
            onClick={() => queryClient.invalidateQueries({ queryKey: ['fpt-gpu-control'] })}
          >
            Refresh
          </Button>
          {container?.consoleUrl && (
            <Button
              variant="text"
              endIcon={<OpenInNewIcon />}
              href={container.consoleUrl}
              target="_blank"
              rel="noreferrer"
            >
              Open FPT
            </Button>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

type SettingsFormProps = {
  initialSettings: SystemSettings;
  onSave: (data: SystemSettings) => Promise<unknown>;
  isMutating: boolean;
};

const SettingsForm = ({ initialSettings, onSave, isMutating }: SettingsFormProps) => {
  const { t } = useTranslation('admin');
  const [formData, setFormData] = useState<SystemSettings>(() => initialSettings);
  const [healthResult, setHealthResult] = useState<SystemHealthPayload | null>(null);

  const notificationDemoMutation = useMutation({
    mutationFn: adminSettingsService.sendNotificationDemo,
    onSuccess: () => toastMessages.success(t('pages.settings.notificationDemo.success')),
    onError: (error) => toastMessages.error(getApiErrorMessage(error, t('pages.settings.notificationDemo.error'))),
  });

  const healthMutation = useMutation({
    mutationFn: adminSettingsService.healthCheck,
    onSuccess: (result) => {
      setHealthResult(result);
      toastMessages.success(`${t('pages.settings.healthCheck.title')}: ${result.status}`);
    },
    onError: (error) => toastMessages.error(getApiErrorMessage(error, t('pages.settings.healthCheck.description'))),
  });

  useEffect(() => {
    setFormData(initialSettings);
  }, [initialSettings]);

  const handleToggleChange = (name: keyof SystemSettings) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [name]: event.target.checked }));
  };

  const handleInputChange = (name: keyof SystemSettings) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [name]: event.target.value }));
  };

  const handleSave = async () => {
    try {
      await onSave(formData);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
          {t('pages.settings.title')}
        </Typography>
        <Breadcrumbs>
          <Link underline="hover" color="inherit" href="/admin">
            {t('pages.settings.breadcrumbAdmin')}
          </Link>
          <Typography color="text.primary">{t('pages.settings.breadcrumb')}</Typography>
        </Breadcrumbs>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={3}>
            <Card elevation={0} sx={{ borderRadius: '16px', border: '1px solid', borderColor: 'divider' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                  {t('pages.settings.generalTitle')}
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <Stack spacing={3}>
                  <FormControlLabel
                    control={<Switch checked={!!formData.maintenanceMode} onChange={handleToggleChange('maintenanceMode')} color="error" />}
                    label={
                      <Box sx={{ ml: 1 }}>
                        <Typography variant="subtitle2" fontWeight={700}>
                          {t('pages.settings.maintenanceMode.label')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {t('pages.settings.maintenanceMode.desc')}
                        </Typography>
                      </Box>
                    }
                  />

                  <FormControlLabel
                    control={<Switch checked={!!formData.autoApproveJobs} onChange={handleToggleChange('autoApproveJobs')} />}
                    label={
                      <Box sx={{ ml: 1 }}>
                        <Typography variant="subtitle2" fontWeight={700}>
                          {t('pages.settings.autoApproveJobs.label')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {t('pages.settings.autoApproveJobs.desc')}
                        </Typography>
                      </Box>
                    }
                  />

                  <FormControlLabel
                    control={<Switch checked={!!formData.emailNotifications} onChange={handleToggleChange('emailNotifications')} />}
                    label={
                      <Box sx={{ ml: 1 }}>
                        <Typography variant="subtitle2" fontWeight={700}>
                          {t('pages.settings.emailNotifications.label')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {t('pages.settings.emailNotifications.desc')}
                        </Typography>
                      </Box>
                    }
                  />
                </Stack>
              </CardContent>
            </Card>

            <FPTGpuControlCard />

            <Card elevation={0} sx={{ borderRadius: '16px', border: '1px solid', borderColor: 'divider' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                  {t('pages.settings.apiTitle')}
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <Stack spacing={3}>
                  <TextField
                    label={t('pages.settings.googleApiKey')}
                    fullWidth
                    value={formData.googleApiKey || ''}
                    onChange={handleInputChange('googleApiKey')}
                    type="password"
                    size="small"
                  />
                  <TextField
                    label={t('pages.settings.supportEmail')}
                    fullWidth
                    value={formData.supportEmail || ''}
                    onChange={handleInputChange('supportEmail')}
                    size="small"
                  />
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={3} sx={{ position: 'sticky', top: 24 }}>
            <Paper sx={{ p: 3, borderRadius: '16px', border: '1px solid', borderColor: 'divider' }} elevation={0}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                {t('pages.settings.summary')}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {t('pages.settings.summaryText')}
              </Typography>
              <Button
                variant="contained"
                fullWidth
                startIcon={isMutating ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                onClick={handleSave}
                disabled={isMutating}
                sx={{ py: 1.5, fontWeight: 700 }}
              >
                {isMutating ? t('common.saving') : t('common.saveChanges')}
              </Button>
            </Paper>

            <Card elevation={0} sx={{ borderRadius: '16px', border: '1px solid', borderColor: 'divider' }}>
              <CardContent sx={{ p: 3 }}>
                <Stack spacing={2}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={
                      notificationDemoMutation.isPending
                        ? <CircularProgress size={18} />
                        : <NotificationsActiveIcon />
                    }
                    onClick={() => notificationDemoMutation.mutate()}
                    disabled={notificationDemoMutation.isPending}
                  >
                    {notificationDemoMutation.isPending
                      ? t('pages.settings.notificationDemo.sending')
                      : t('pages.settings.notificationDemo.send')}
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={healthMutation.isPending ? <CircularProgress size={18} /> : <MonitorHeartIcon />}
                    onClick={() => healthMutation.mutate()}
                    disabled={healthMutation.isPending}
                  >
                    {healthMutation.isPending
                      ? t('pages.settings.healthCheck.checking')
                      : t('pages.settings.healthCheck.check')}
                  </Button>
                  {healthResult && (
                    <Alert severity={healthResult.status === 'healthy' ? 'success' : 'warning'} sx={{ mt: 1 }}>
                      {t('pages.settings.healthCheck.database')}: {healthResult.database || 'N/A'} |{' '}
                      {t('pages.settings.healthCheck.redis')}: {healthResult.redis || 'N/A'}
                    </Alert>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
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

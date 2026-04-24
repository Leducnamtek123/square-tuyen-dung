import React, { useState } from 'react';
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
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import SaveIcon from '@mui/icons-material/Save';
import { useSystemSettings, SystemSettings } from './hooks/useSystemSettings';

const INITIAL_SETTINGS: SystemSettings = {
  maintenanceMode: false,
  autoApproveJobs: false,
  emailNotifications: true,
};

type SettingsFormProps = {
  initialSettings: SystemSettings;
  onSave: (data: SystemSettings) => Promise<unknown>;
  isMutating: boolean;
};

const SettingsForm = ({ initialSettings, onSave, isMutating }: SettingsFormProps) => {
  const { t } = useTranslation('admin');
  const [formData, setFormData] = useState<SystemSettings>(INITIAL_SETTINGS);

  React.useEffect(() => {
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
          <Paper sx={{ p: 3, borderRadius: '16px', position: 'sticky', top: 24, border: '1px solid', borderColor: 'divider' }} elevation={0}>
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
              sx={{ py: 1.5, borderRadius: '12px', fontWeight: 700 }}
            >
              {isMutating ? t('common.saving') : t('common.saveChanges')}
            </Button>
          </Paper>
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
    <SettingsForm initialSettings={initialSettings} onSave={updateSystemSettings} isMutating={isMutating} />
  );
};

export default SettingsPage;

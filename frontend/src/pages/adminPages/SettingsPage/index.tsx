import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Divider, Switch, List, ListItem, ListItemText, Button, CircularProgress, Stack } from "@mui/material";
import { useTranslation } from 'react-i18next';

import { useSystemSettings, useUpdateSystemSettings } from './hooks/useSystemSettings';
import commonService from '../../../services/commonService';
import ProjectService from '../../../services/ProjectService';

const SettingsPage = () => {
    const { t } = useTranslation('admin');
    const { data: settings, isLoading } = useSystemSettings() as any;
    const updateMutation = useUpdateSystemSettings() as any;
    const [localSettings, setLocalSettings] = useState<any>(settings || {});
    const [isSendingDemo, setIsSendingDemo] = useState(false);
    const [demoMessage, setDemoMessage] = useState<string | null>(null);
    const [healthStatus, setHealthStatus] = useState<any>(null);
    const [isCheckingHealth, setIsCheckingHealth] = useState(false);

    useEffect(() => {
        if (settings) {
            setLocalSettings(settings);
        }
    }, [settings]);

    const handleToggle = (key: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
        setLocalSettings((prev: any) => ({ ...prev, [key]: event.target.checked }));
    };

    const handleSave = () => {
        updateMutation.mutate(localSettings);
    };

    const handleSendDemo = async () => {
        setIsSendingDemo(true);
        setDemoMessage(null);
        try {
            await ProjectService.sendNotificationDemo();
            setDemoMessage(t('pages.settings.notificationDemo.success'));
        } catch (error) {
            setDemoMessage(t('pages.settings.notificationDemo.error'));
        } finally {
            setIsSendingDemo(false);
        }
    };

    const handleCheckHealth = async () => {
        setIsCheckingHealth(true);
        try {
            const resData = await commonService.healthCheck();
            setHealthStatus(resData);
        } catch {
            setHealthStatus({ status: 'unhealthy' });
        } finally {
            setIsCheckingHealth(false);
        }
    };

    if (isLoading && !settings) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
                {t('pages.settings.title')}
            </Typography>

            <Paper sx={{ p: 3, boxShadow: 2 }}>
                <Typography variant="h6" gutterBottom>{t('pages.settings.generalTitle')}</Typography>
                <List>
                    <ListItem
                        secondaryAction={
                            <Switch
                                checked={!!localSettings.maintenanceMode}
                                onChange={handleToggle('maintenanceMode')}
                                color="error"
                            />
                        }
                    >
                        <ListItemText 
                            primary={t('pages.settings.maintenanceMode.label')} 
                            secondary={t('pages.settings.maintenanceMode.description')} 
                        />
                    </ListItem>
                    <Divider />
                    <ListItem
                        secondaryAction={
                            <Switch
                                checked={!!localSettings.autoApproveJobs}
                                onChange={handleToggle('autoApproveJobs')}
                                color="primary"
                            />
                        }
                    >
                        <ListItemText 
                            primary={t('pages.settings.autoApproveJobs.label')} 
                            secondary={t('pages.settings.autoApproveJobs.description')} 
                        />
                    </ListItem>
                    <Divider />
                    <ListItem
                        secondaryAction={
                            <Switch
                                checked={!!localSettings.emailNotifications}
                                onChange={handleToggle('emailNotifications')}
                                color="primary"
                            />
                        }
                    >
                        <ListItemText 
                            primary={t('pages.settings.emailNotifications.label')} 
                            secondary={t('pages.settings.emailNotifications.description')} 
                        />
                    </ListItem>
                </List>
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        disabled={updateMutation.isPending}
                    >
                        {updateMutation.isPending ? <CircularProgress size={20} /> : t('pages.settings.saveBtn')}
                    </Button>
                </Box>
            </Paper>

            <Paper sx={{ p: 3, mt: 3, boxShadow: 2 }}>
                <Stack spacing={1}>
                    <Typography variant="h6">{t('pages.settings.notificationDemo.title')}</Typography>
                    <Typography variant="body2" color="text.secondary">
                        {t('pages.settings.notificationDemo.description')}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Button
                            variant="outlined"
                            onClick={handleSendDemo}
                            disabled={isSendingDemo}
                        >
                            {isSendingDemo
                                ? t('pages.settings.notificationDemo.sending')
                                : t('pages.settings.notificationDemo.send')}
                        </Button>
                        {demoMessage && (
                            <Typography variant="body2" color="text.secondary">
                                {demoMessage}
                            </Typography>
                        )}
                    </Box>
                </Stack>
            </Paper>

            <Paper sx={{ p: 3, mt: 3, boxShadow: 2 }}>
                <Stack spacing={1}>
                    <Typography variant="h6">{t('pages.settings.healthCheck.title')}</Typography>
                    <Typography variant="body2" color="text.secondary">
                        {t('pages.settings.healthCheck.description')}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Button
                            variant="outlined"
                            onClick={handleCheckHealth}
                            disabled={isCheckingHealth}
                        >
                            {isCheckingHealth
                                ? t('pages.settings.healthCheck.checking')
                                : t('pages.settings.healthCheck.check')}
                        </Button>
                        {healthStatus?.status && (
                            <Typography
                                variant="body2"
                                color={healthStatus.status === 'healthy' ? 'success.main' : 'error.main'}
                            >
                                {healthStatus.status}
                            </Typography>
                        )}
                    </Box>
                    {healthStatus && (
                        <Typography variant="body2" color="text.secondary">
                            {t('pages.settings.healthCheck.database')}: {healthStatus.database || '-'} |{' '}
                            {t('pages.settings.healthCheck.redis')}: {healthStatus.redis || '-'}
                        </Typography>
                    )}
                </Stack>
            </Paper>
        </Box>
    );
};

export default SettingsPage;

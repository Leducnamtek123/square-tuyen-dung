import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Divider, Switch, List, ListItem, ListItemText, Button, CircularProgress } from "@mui/material";
import { useTranslation } from 'react-i18next';

import { useSystemSettings, useUpdateSystemSettings } from './hooks/useSystemSettings';

const SettingsPage = () => {
    const { t } = useTranslation('admin');
    const { data: settings, isLoading } = useSystemSettings();
    const updateMutation = useUpdateSystemSettings();
    const [localSettings, setLocalSettings] = useState(settings || {});

    useEffect(() => {
        if (settings) {
            setLocalSettings(settings);
        }
    }, [settings]);

    const handleToggle = (key) => (event) => {
        setLocalSettings(prev => ({ ...prev, [key]: event.target.checked }));
    };

    const handleSave = () => {
        updateMutation.mutate(localSettings);
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
        </Box>
    );
};

export default SettingsPage;

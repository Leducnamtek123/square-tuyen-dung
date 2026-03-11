import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Divider, Switch, List, ListItem, ListItemText, Button, CircularProgress } from "@mui/material";

import { useSystemSettings, useUpdateSystemSettings } from './hooks/useSystemSettings';

const SettingsPage = () => {
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
                System Settings
            </Typography>

            <Paper sx={{ p: 3, boxShadow: 2 }}>
                <Typography variant="h6" gutterBottom>General Settings</Typography>
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
                        <ListItemText primary="System Maintenance" secondary="Stop all user activities for maintenance" />
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
                        <ListItemText primary="Auto-approve Job Posts" secondary="Allow job posts to be approved automatically" />
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
                        <ListItemText primary="Email Notifications" secondary="Send system notifications via email to administrators" />
                    </ListItem>
                </List>
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        disabled={updateMutation.isPending}
                    >
                        {updateMutation.isPending ? <CircularProgress size={20} /> : 'Save Changes'}
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
};

export default SettingsPage;

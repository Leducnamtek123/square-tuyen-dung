import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Divider, Switch, List, ListItem, ListItemText, ListItemSecondaryAction, Button, CircularProgress } from '@mui/material';
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
                Cài đặt hệ thống
            </Typography>

            <Paper sx={{ p: 3, boxShadow: 2 }}>
                <Typography variant="h6" gutterBottom>Cài đặt chung</Typography>
                <List>
                    <ListItem>
                        <ListItemText primary="Bảo trì hệ thống" secondary="Dừng tất cả các hoạt động của người dùng để bảo trì" />
                        <ListItemSecondaryAction>
                            <Switch
                                checked={!!localSettings.maintenanceMode}
                                onChange={handleToggle('maintenanceMode')}
                                color="error"
                            />
                        </ListItemSecondaryAction>
                    </ListItem>
                    <Divider />
                    <ListItem>
                        <ListItemText primary="Duyệt bài đăng tự động" secondary="Cho phép các tin tuyển dụng được duyệt tự động" />
                        <ListItemSecondaryAction>
                            <Switch
                                checked={!!localSettings.autoApproveJobs}
                                onChange={handleToggle('autoApproveJobs')}
                                color="primary"
                            />
                        </ListItemSecondaryAction>
                    </ListItem>
                    <Divider />
                    <ListItem>
                        <ListItemText primary="Thông báo Email" secondary="Gửi thông báo hệ thống qua email cho người quản trị" />
                        <ListItemSecondaryAction>
                            <Switch
                                checked={!!localSettings.emailNotifications}
                                onChange={handleToggle('emailNotifications')}
                                color="primary"
                            />
                        </ListItemSecondaryAction>
                    </ListItem>
                </List>
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        disabled={updateMutation.isPending}
                    >
                        {updateMutation.isPending ? <CircularProgress size={20} /> : 'Lưu thay đổi'}
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
};

export default SettingsPage;

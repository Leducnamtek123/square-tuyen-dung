'use client';

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid2 as Grid,
  Switch,
  FormControlLabel,
  Divider,
  Stack,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import adminSettingsService, { type SystemHealthPayload } from '@/services/adminSettingsService';
import toastMessages from '@/utils/toastMessages';
import { getApiErrorMessage } from '@/utils/apiResponse';
import type { SystemSettings } from '../hooks/useSystemSettings';

interface GeneralSettingsTabProps {
  formData: SystemSettings;
  onToggleChange: (name: keyof SystemSettings) => (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const GeneralSettingsTab: React.FC<GeneralSettingsTabProps> = ({ formData, onToggleChange }) => {
  const [healthResult, setHealthResult] = React.useState<SystemHealthPayload | null>(null);
  const [isSendingDemo, setIsSendingDemo] = React.useState(false);
  const [isCheckingHealth, setIsCheckingHealth] = React.useState(false);

  const handleSendNotificationDemo = async () => {
    try {
      setIsSendingDemo(true);
      await adminSettingsService.sendNotificationDemo();
      toastMessages.success('Đã gửi thông báo thử nghiệm thành công');
    } catch (error) {
      toastMessages.error(getApiErrorMessage(error, 'Không thể gửi thông báo thử nghiệm'));
    } finally {
      setIsSendingDemo(false);
    }
  };

  const handleHealthCheck = async () => {
    try {
      setIsCheckingHealth(true);
      const result = await adminSettingsService.healthCheck();
      setHealthResult(result);
      toastMessages.success(`Trạng thái hệ thống: ${result.status}`);
    } catch (error) {
      toastMessages.error(getApiErrorMessage(error, 'Kiểm tra trạng thái hệ thống thất bại'));
    } finally {
      setIsCheckingHealth(false);
    }
  };

  return (
    <Stack spacing={3}>
      <Card elevation={0} sx={{ borderRadius: '16px', border: '1px solid', borderColor: 'divider' }}>
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
            <SettingsSuggestIcon color="primary" sx={{ fontSize: 28 }} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Cấu Hình Vận Hành Hệ Thống
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Bật/tắt các chế độ bảo trì, tự động duyệt tin tuyển dụng và gửi thông báo qua email.
          </Typography>

          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.maintenanceMode}
                    onChange={onToggleChange('maintenanceMode')}
                    color="primary"
                  />
                }
                label={
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      Chế độ bảo trì (Maintenance Mode)
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Tạm thời đóng cổng truy cập cho người dùng thông thường.
                    </Typography>
                  </Box>
                }
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.autoApproveJobs}
                    onChange={onToggleChange('autoApproveJobs')}
                    color="primary"
                  />
                }
                label={
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      Tự động duyệt bài tuyển dụng
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Tự động phê duyệt các bài đăng mới mà không cần qua kiểm duyệt tay.
                    </Typography>
                  </Box>
                }
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.emailNotifications}
                    onChange={onToggleChange('emailNotifications')}
                    color="primary"
                  />
                }
                label={
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      Thông báo qua Email
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Gửi email tự động khi có hoạt động ứng tuyển mới.
                    </Typography>
                  </Box>
                }
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card elevation={0} sx={{ borderRadius: '16px', border: '1px solid', borderColor: 'divider' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>
            Công Cụ Thử Nghiệm & Chẩn Đoán Trạng Thái
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Kiểm tra kết nối Database, Redis cache và thử nghiệm gửi thông báo đẩy hệ thống.
          </Typography>

          <Divider sx={{ mb: 3 }} />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Button
              variant="outlined"
              startIcon={isSendingDemo ? <CircularProgress size={18} /> : <NotificationsActiveIcon />}
              onClick={handleSendNotificationDemo}
              disabled={isSendingDemo}
              sx={{ py: 1.2, px: 3, fontWeight: 600, borderRadius: '10px' }}
            >
              {isSendingDemo ? 'Đang gửi thông báo...' : 'Gửi thông báo thử nghiệm (Notification Demo)'}
            </Button>

            <Button
              variant="outlined"
              startIcon={isCheckingHealth ? <CircularProgress size={18} /> : <MonitorHeartIcon />}
              onClick={handleHealthCheck}
              disabled={isCheckingHealth}
              sx={{ py: 1.2, px: 3, fontWeight: 600, borderRadius: '10px' }}
            >
              {isCheckingHealth ? 'Đang kiểm tra...' : 'Kiểm tra trạng thái (Health Check)'}
            </Button>
          </Stack>

          {healthResult && (
            <Alert
              severity={healthResult.status === 'healthy' ? 'success' : 'warning'}
              sx={{ mt: 3, borderRadius: '12px' }}
            >
              Trạng thái hệ thống: <strong>{healthResult.status}</strong> | Database: {healthResult.database || 'OK'} | Redis Cache: {healthResult.redis || 'OK'}
            </Alert>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
};

export default GeneralSettingsTab;

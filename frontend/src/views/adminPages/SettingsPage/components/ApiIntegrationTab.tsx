'use client';

import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Divider,
  Stack,
} from '@mui/material';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import type { SystemSettings } from '../hooks/useSystemSettings';

interface ApiIntegrationTabProps {
  formData: SystemSettings;
  onChange: (name: keyof SystemSettings, value: unknown) => void;
}

export const ApiIntegrationTab: React.FC<ApiIntegrationTabProps> = ({ formData, onChange }) => {
  return (
    <Card elevation={0} sx={{ borderRadius: '16px', border: '1px solid', borderColor: 'divider' }}>
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
          <VpnKeyIcon color="primary" sx={{ fontSize: 28 }} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Khóa API & Thông Tin Liên Hệ Hỗ Trợ
          </Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Cấu hình API Key của Google và Email nhận phản hồi hỗ trợ kỹ thuật từ hệ thống.
        </Typography>

        <Divider sx={{ mb: 3 }} />

        <Stack spacing={3}>
          <TextField
            label="Google API Key"
            fullWidth
            value={formData.googleApiKey || ''}
            onChange={(e) => onChange('googleApiKey', e.target.value)}
            type="password"
            size="small"
            helperText="Sử dụng cho dịch vụ bản đồ Goong / Google Maps & OAuth2."
          />

          <TextField
            label="Email Hỗ Trợ (Support Contact Email)"
            fullWidth
            value={formData.supportEmail || ''}
            onChange={(e) => onChange('supportEmail', e.target.value)}
            size="small"
            helperText="Địa chỉ email liên hệ hỗ trợ chính thức hiển thị trên giao diện trang chủ."
          />
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ApiIntegrationTab;

'use client';

import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { typedYupResolver } from '../../../../utils/formHelpers';
import { Box, Card, Grid2 as Grid, Stack, Switch, Typography } from "@mui/material";
import MailOutlineRoundedIcon from '@mui/icons-material/MailOutlineRounded';
import SmsOutlinedIcon from '@mui/icons-material/SmsOutlined';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import { useTranslation } from 'react-i18next';

export type FormValues = {
  emailNotificationActive: boolean;
  smsNotificationActive: boolean;
};

interface SettingFormProps {
  editData: Partial<FormValues> | null;
  handleUpdate: (data: FormValues) => void;
}

const SettingForm = ({ editData, handleUpdate }: SettingFormProps) => {
  const { t } = useTranslation(['employer', 'common']);
  const schema = yup.object().shape({
    emailNotificationActive: yup.boolean().default(false),
    smsNotificationActive: yup.boolean().default(false),
  });

  const { control, handleSubmit } = useForm<FormValues>({
    resolver: typedYupResolver(schema),
    defaultValues: {
      emailNotificationActive: Boolean(editData?.emailNotificationActive),
      smsNotificationActive: Boolean(editData?.smsNotificationActive),
    },
  });

  return (
    <form id="setting-form" onSubmit={handleSubmit(handleUpdate)}>
      <Stack spacing={3}>
        {/* Section Header */}
        <Box sx={{ pb: 1, borderBottom: '1px solid #f1f5f9' }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '10px',
                bgcolor: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <NotificationsActiveOutlinedIcon sx={{ fontSize: 20 }} />
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1rem' }}>
                Kênh nhận thông báo tuyển dụng & hệ thống
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500, fontSize: '0.8rem' }}>
                Tùy chỉnh phương thức bạn muốn InfoHR gửi cập nhật về ứng viên và các hoạt động tuyển dụng
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Grid container spacing={2.5}>
          {/* Email Notification Switch Card */}
          <Grid size={12}>
            <Controller
              name="emailNotificationActive"
              control={control}
              render={({ field }) => (
                <Card
                  onClick={() => field.onChange(!field.value)}
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    border: '1.5px solid',
                    borderColor: field.value ? '#bfdbfe' : '#e2e8f0',
                    bgcolor: field.value ? '#f8faff' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: field.value ? '0 4px 14px -2px rgba(37, 99, 235, 0.08)' : '0 1px 3px 0 rgba(0, 0, 0, 0.02)',
                    '&:hover': {
                      borderColor: '#93c5fd',
                      transform: 'translateY(-1px)',
                    },
                  }}
                >
                  <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: '12px',
                          bgcolor: field.value ? '#eff6ff' : '#f1f5f9',
                          color: field.value ? '#2563eb' : '#64748b',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          transition: 'all 0.2s',
                        }}
                      >
                        <MailOutlineRoundedIcon sx={{ fontSize: 24 }} />
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.9375rem', mb: 0.25 }}>
                          {t('common:userSettings.emailNotifications')}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.8125rem', lineHeight: 1.4 }}>
                          Nhận email thông báo tức thì khi có ứng viên mới ứng tuyển, lời mời phỏng vấn và các báo cáo tuyển dụng định kỳ.
                        </Typography>
                      </Box>
                    </Stack>
                    <Switch
                      checked={Boolean(field.value)}
                      onChange={(e) => field.onChange(e.target.checked)}
                      onClick={(e) => e.stopPropagation()}
                      color="primary"
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: '#2563eb',
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: '#2563eb',
                        },
                      }}
                    />
                  </Stack>
                </Card>
              )}
            />
          </Grid>

          {/* SMS Notification Switch Card */}
          <Grid size={12}>
            <Controller
              name="smsNotificationActive"
              control={control}
              render={({ field }) => (
                <Card
                  onClick={() => field.onChange(!field.value)}
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    border: '1.5px solid',
                    borderColor: field.value ? '#bbf7d0' : '#e2e8f0',
                    bgcolor: field.value ? '#fbfdfb' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: field.value ? '0 4px 14px -2px rgba(22, 163, 74, 0.08)' : '0 1px 3px 0 rgba(0, 0, 0, 0.02)',
                    '&:hover': {
                      borderColor: '#86efac',
                      transform: 'translateY(-1px)',
                    },
                  }}
                >
                  <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: '12px',
                          bgcolor: field.value ? '#f0fdf4' : '#f1f5f9',
                          color: field.value ? '#16a34a' : '#64748b',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          transition: 'all 0.2s',
                        }}
                      >
                        <SmsOutlinedIcon sx={{ fontSize: 24 }} />
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.9375rem', mb: 0.25 }}>
                          {t('common:userSettings.smsNotifications')}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.8125rem', lineHeight: 1.4 }}>
                          Nhận tin nhắn SMS cho các mã xác thực bảo mật khẩn cấp và nhắc lịch phỏng vấn trực tiếp trước giờ diễn ra.
                        </Typography>
                      </Box>
                    </Stack>
                    <Switch
                      checked={Boolean(field.value)}
                      onChange={(e) => field.onChange(e.target.checked)}
                      onClick={(e) => e.stopPropagation()}
                      color="success"
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: '#16a34a',
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: '#16a34a',
                        },
                      }}
                    />
                  </Stack>
                </Card>
              )}
            />
          </Grid>
        </Grid>
      </Stack>
    </form>
  );
};

export default SettingForm;

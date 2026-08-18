'use client';

import React from "react";
import { Box, Button, Divider, Skeleton, Stack, Typography, SxProps, Theme } from "@mui/material";
import { Grid2 as Grid } from "@mui/material";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import SettingForm from "../SettingForm";
import { useUserSettings, useUpdateUserSettings } from "../../jobSeekers/hooks/useJobSeekerQueries";
import type { FormValues as SettingformFormValues } from '../SettingForm';
import { useTranslation } from 'react-i18next';

interface SettingCardProps {
  title?: React.ReactNode;
  sx?: SxProps<Theme>;
}

const Loading = (
  <Stack spacing={2.5} sx={{ py: 2 }}>
    <Skeleton variant="rounded" height={88} sx={{ borderRadius: 3 }} />
    <Skeleton variant="rounded" height={88} sx={{ borderRadius: 3 }} />
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
      <Skeleton variant="rounded" height={44} width={180} sx={{ borderRadius: 2.5 }} />
    </Box>
  </Stack>
);

const SettingCard = ({ title, sx }: SettingCardProps) => {
  const { t } = useTranslation(['employer', 'common']);
  const { data: editData, isLoading } = useUserSettings();
  const updateSettings = useUpdateUserSettings();

  const handleUpdateUserSetting = (data: SettingformFormValues) => {
    updateSettings.mutate(data);
  };

  return (
    <Box
      sx={{
        bgcolor: "#ffffff",
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: (theme) => theme.customShadows?.z1,
        p: { xs: 2.5, sm: 3.5 },
        ...sx,
      }}
    >
      <Stack spacing={3}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '12px',
                bgcolor: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <SettingsOutlinedIcon sx={{ fontSize: 24 }} />
            </Box>
            <Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 900,
                  color: '#0f172a',
                  fontSize: { xs: '1.25rem', md: '1.5rem' },
                  letterSpacing: '-0.02em',
                }}
              >
                {title || t('employer:setting.title')}
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500, fontSize: '0.875rem' }}>
                Quản lý các tùy chọn thiết lập hệ thống và nhận thông báo tài khoản
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Divider sx={{ borderColor: '#f1f5f9' }} />

        <Box>
          {isLoading ? (
            Loading
          ) : (
            <Box>
              <SettingForm
                key={JSON.stringify(editData ?? {})}
                editData={editData ?? null}
                handleUpdate={handleUpdateUserSetting}
              />
              <Box
                sx={{
                  mt: 3.5,
                  display: 'flex',
                  justifyContent: 'flex-end',
                }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<SaveOutlinedIcon />}
                  type="submit"
                  form="setting-form"
                  disabled={updateSettings.isPending}
                  sx={{
                    minHeight: 44,
                    px: { xs: 3, sm: 4 },
                    borderRadius: 2.5,
                    fontWeight: 800,
                    fontSize: '0.9375rem',
                    textTransform: 'none',
                    bgcolor: '#2563eb',
                    boxShadow: '0 4px 14px 0 rgba(37, 99, 235, 0.25)',
                    '&:hover': {
                      bgcolor: '#1d4ed8',
                      boxShadow: '0 6px 20px 0 rgba(37, 99, 235, 0.35)',
                      transform: 'translateY(-1px)',
                    },
                    '&:active': {
                      transform: 'scale(0.98)',
                    },
                  }}
                >
                  {updateSettings.isPending ? 'Đang lưu...' : t('common:actions.saveChanges')}
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Stack>
    </Box>
  );
};

export default SettingCard;

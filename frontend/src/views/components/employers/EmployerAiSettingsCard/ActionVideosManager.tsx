'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Stack,
  Grid,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CloseIcon from '@mui/icons-material/Close';
import SmartDisplayOutlinedIcon from '@mui/icons-material/SmartDisplayOutlined';
import VideoCameraFrontOutlinedIcon from '@mui/icons-material/VideoCameraFrontOutlined';
import {
  AVATAR_ACTION_METAS,
  DEFAULT_AVATAR_ACTIONS,
  type AvatarActionMeta,
} from '@/services/employerAiSettingService';

interface ActionVideosManagerProps {
  actions?: Record<string, string>;
  characterId?: string;
  onPreviewAction?: (actionKey: string) => void;
}

export function ActionVideosManager({
  actions = DEFAULT_AVATAR_ACTIONS,
  characterId = 'ng_c_linh',
}: ActionVideosManagerProps) {
  const [activePreviewMeta, setActivePreviewMeta] = useState<AvatarActionMeta | null>(null);

  const getActionUrl = (key: string): string => {
    return actions[key] || DEFAULT_AVATAR_ACTIONS[key] || `/assets/avatars/${characterId}/actions/${key}.mp4`;
  };

  const handleClosePreview = () => {
    setActivePreviewMeta(null);
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Tiêu đề phần quản lý video hành động */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              bgcolor: '#f0fdf4',
              color: '#16a34a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <VideoCameraFrontOutlinedIcon sx={{ fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary' }}>
              Thư viện video hành động người ảo
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
              Bộ 5 clip Full HD thực tế điều phối cử chỉ và biểu cảm tự nhiên của người phỏng vấn
            </Typography>
          </Box>
        </Stack>

        <Chip
          label="Độ phân giải Full HD"
          size="small"
          sx={{
            fontWeight: 700,
            fontSize: '0.72rem',
            bgcolor: '#ecfdf5',
            color: '#059669',
            border: '1px solid #a7f3d0',
          }}
        />
      </Stack>

      {/* Lưới 5 video hành động */}
      <Grid container spacing={2}>
        {AVATAR_ACTION_METAS.map((action) => {
          const actionUrl = getActionUrl(action.key);

          return (
            <Grid item xs={12} sm={6} md={4} key={action.key}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 3,
                  border: '1px solid #e2e8f0',
                  bgcolor: '#ffffff',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  height: '100%',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: 'primary.light',
                    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.06)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <Box>
                  {/* Hàng trạng thái và tên file */}
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Chip
                      icon={<CheckCircleRoundedIcon sx={{ fontSize: '14px !important' }} />}
                      label="Sẵn sàng chuẩn HD"
                      size="small"
                      color="success"
                      variant="outlined"
                      sx={{
                        height: 22,
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        borderColor: '#86efac',
                        color: '#15803d',
                        bgcolor: '#f0fdf4',
                      }}
                    />
                    <Typography
                      variant="caption"
                      sx={{
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        color: 'primary.main',
                        bgcolor: '#eff6ff',
                        px: 1,
                        py: 0.25,
                        borderRadius: 1.5,
                      }}
                    >
                      {action.filename}
                    </Typography>
                  </Stack>

                  {/* Tên hành động và mô tả */}
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary', mt: 0.5 }}>
                    {action.labelVi}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'text.secondary',
                      display: 'block',
                      mt: 0.5,
                      lineHeight: 1.4,
                      minHeight: 36,
                    }}
                  >
                    {action.descriptionVi}
                  </Typography>
                </Box>

                {/* Nút xem trước clip */}
                <Box sx={{ pt: 1.5, mt: 1, borderTop: '1px dashed #e2e8f0' }}>
                  <Button
                    fullWidth
                    size="small"
                    variant="outlined"
                    color="primary"
                    onClick={() => setActivePreviewMeta(action)}
                    startIcon={<PlayArrowRoundedIcon />}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 700,
                      borderRadius: 2,
                      fontSize: '0.78rem',
                    }}
                  >
                    Xem trước clip hành động
                  </Button>
                </Box>
              </Box>
            </Grid>
          );
        })}
      </Grid>

      {/* Hộp thoại xem trước video hành động */}
      <Dialog
        open={Boolean(activePreviewMeta)}
        onClose={handleClosePreview}
        maxWidth="sm"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: 3.5,
            bgcolor: '#0f172a',
            color: '#ffffff',
            overflow: 'hidden',
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pb: 1,
            pt: 2,
            px: 2.5,
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <SmartDisplayOutlinedIcon sx={{ color: '#38bdf8' }} />
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#ffffff' }}>
                {activePreviewMeta?.labelVi}
              </Typography>
              <Typography variant="caption" sx={{ color: '#94a3b8', fontFamily: 'monospace' }}>
                {activePreviewMeta?.filename}
              </Typography>
            </Box>
          </Stack>
          <IconButton size="small" onClick={handleClosePreview} sx={{ color: '#94a3b8' }}>
            <CloseIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 2, bgcolor: '#020617', textAlign: 'center' }}>
          {activePreviewMeta && (
            <Box
              sx={{
                width: '100%',
                maxHeight: 380,
                borderRadius: 2,
                overflow: 'hidden',
                bgcolor: '#0f172a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <video
                src={getActionUrl(activePreviewMeta.key)}
                controls
                autoPlay
                loop
                playsInline
                muted
                style={{
                  width: '100%',
                  maxHeight: 380,
                  objectFit: 'contain',
                }}
              />
            </Box>
          )}
          <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mt: 1.5, textAlign: 'center' }}>
            {activePreviewMeta?.descriptionVi}
          </Typography>
        </DialogContent>

        <DialogActions sx={{ p: 2, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleClosePreview}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: 2,
              px: 3,
            }}
          >
            Đóng xem trước
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ActionVideosManager;

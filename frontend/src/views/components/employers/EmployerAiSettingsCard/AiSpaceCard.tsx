'use client';

import React, { useRef, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Grid,
  RadioGroup,
  FormControlLabel,
  Radio,
  Chip,
  Button,
  CircularProgress,
} from '@mui/material';
import PhotoCameraBackOutlinedIcon from '@mui/icons-material/PhotoCameraBackOutlined';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import commonService from '@/services/commonService';
import {
  PRESET_BACKGROUNDS,
  type EmployerAiSettings,
} from '@/services/employerAiSettingService';
import toastMessages from '@/utils/toastMessages';

export interface AiSpaceCardProps {
  backgroundType: 'preset' | 'custom';
  selectedBackgroundId: string;
  customBackgroundUrl?: string | null;
  onChange: (partial: Partial<EmployerAiSettings>) => void;
}

export function AiSpaceCard({
  backgroundType,
  selectedBackgroundId,
  customBackgroundUrl,
  onChange,
}: AiSpaceCardProps) {
  const [uploadingBg, setUploadingBg] = useState(false);
  const bgInputRef = useRef<HTMLInputElement>(null);

  const handleUploadBg = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingBg(true);
    try {
      const res = await commonService.uploadFile(file, 'IMAGE');
      onChange({
        backgroundType: 'custom',
        customBackgroundUrl: res.url,
      });
      toastMessages.success('Tải lên hình nền thành công');
    } catch {
      toastMessages.error('Tải lên hình nền thất bại, vui lòng thử lại');
    } finally {
      setUploadingBg(false);
      if (bgInputRef.current) bgInputRef.current.value = '';
    }
  };

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3.5,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Box sx={{ p: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              bgcolor: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <PhotoCameraBackOutlinedIcon sx={{ fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary' }}>
              Không gian phòng phỏng vấn
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
              Lựa chọn phông nền phòng studio chuyên nghiệp hoặc tải hình ảnh không gian văn phòng thực tế của doanh nghiệp
            </Typography>
          </Box>
        </Stack>
      </Box>

      <CardContent sx={{ p: 2.5 }}>
        <RadioGroup
          row
          value={backgroundType}
          onChange={(e) => onChange({ backgroundType: e.target.value as 'preset' | 'custom' })}
          sx={{ mb: 2.5 }}
        >
          <FormControlLabel
            value="preset"
            control={<Radio size="small" />}
            label={<Typography variant="body2" sx={{ fontWeight: 700 }}>Phông nền không gian tiêu chuẩn</Typography>}
          />
          <FormControlLabel
            value="custom"
            control={<Radio size="small" />}
            label={<Typography variant="body2" sx={{ fontWeight: 700 }}>Tải ảnh không gian doanh nghiệp</Typography>}
          />
        </RadioGroup>

        {backgroundType === 'preset' ? (
          <Grid container spacing={2}>
            {PRESET_BACKGROUNDS.map((item) => {
              const isSelected = selectedBackgroundId === item.id;
              return (
                <Grid item xs={12} sm={6} key={item.id}>
                  <Box
                    onClick={() => onChange({ backgroundType: 'preset', selectedBackgroundId: item.id })}
                    sx={{
                      p: 1.5,
                      borderRadius: 3,
                      border: '2px solid',
                      borderColor: isSelected ? 'primary.main' : '#e2e8f0',
                      bgcolor: isSelected ? '#eff6ff' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      position: 'relative',
                      '&:hover': {
                        borderColor: 'primary.light',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: '100%',
                        aspectRatio: '16/9',
                        borderRadius: 2,
                        overflow: 'hidden',
                        backgroundImage: `url("${item.url}")`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        mb: 1.5,
                        position: 'relative',
                      }}
                    >
                      <Chip
                        label={item.badge}
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 8,
                          left: 8,
                          height: 20,
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          bgcolor: 'rgba(15, 23, 42, 0.75)',
                          color: '#ffffff',
                          backdropFilter: 'blur(4px)',
                        }}
                      />
                      {isSelected && (
                        <Box
                          sx={{
                            position: 'absolute',
                            bottom: 8,
                            right: 8,
                            color: 'primary.main',
                            bgcolor: '#ffffff',
                            borderRadius: '50%',
                            display: 'flex',
                          }}
                        >
                          <CheckCircleRoundedIcon sx={{ fontSize: 22 }} />
                        </Box>
                      )}
                    </Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary' }}>
                      {item.nameVi}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5, lineHeight: 1.4 }}>
                      {item.descriptionVi}
                    </Typography>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        ) : (
          <Box>
            <input
              ref={bgInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              style={{ display: 'none' }}
              onChange={handleUploadBg}
            />

            {customBackgroundUrl ? (
              <Box sx={{ p: 2, border: '1px solid #e2e8f0', borderRadius: 3, bgcolor: '#f8fafc' }}>
                <Box
                  sx={{
                    width: '100%',
                    aspectRatio: '16/9',
                    borderRadius: 2,
                    overflow: 'hidden',
                    backgroundImage: `url("${customBackgroundUrl}")`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    mb: 2,
                  }}
                />
                <Stack direction="row" spacing={1.5} justifyContent="flex-end">
                  <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    onClick={() => bgInputRef.current?.click()}
                    disabled={uploadingBg}
                    startIcon={<CloudUploadOutlinedIcon />}
                    sx={{ textTransform: 'none', fontWeight: 700 }}
                  >
                    Thay đổi ảnh khác
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => onChange({ customBackgroundUrl: null })}
                    startIcon={<DeleteOutlineOutlinedIcon />}
                    sx={{ textTransform: 'none', fontWeight: 700 }}
                  >
                    Xóa ảnh
                  </Button>
                </Stack>
              </Box>
            ) : (
              <Box
                onClick={() => bgInputRef.current?.click()}
                sx={{
                  p: 4,
                  border: '2px dashed #cbd5e1',
                  borderRadius: 3,
                  bgcolor: '#f8fafc',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: '#eff6ff',
                  },
                }}
              >
                {uploadingBg ? (
                  <CircularProgress size={32} />
                ) : (
                  <>
                    <CloudUploadOutlinedIcon sx={{ fontSize: 44, color: 'text.secondary', mb: 1 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                      Nhấp để tải lên hình nền không gian thương hiệu Nhà tuyển dụng
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                      Hỗ trợ định dạng JPG, PNG hoặc WebP tỷ lệ 16:9 độ phân giải tiêu chuẩn 1920x1080
                    </Typography>
                  </>
                )}
              </Box>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export default AiSpaceCard;

'use client';

import React, { useRef, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  Grid,
  Stack,
  Button,
  LinearProgress,
  IconButton,
  Tooltip,
  Alert,
} from '@mui/material';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import commonService from '@/services/commonService';
import { useTranslation } from 'react-i18next';
import type { EmployerStep3Values } from '../schemas/employerOnboardingSchema';

interface StepVerificationGPKDProps {
  values: EmployerStep3Values;
  onChange: (field: keyof EmployerStep3Values, value: any) => void;
  isUploading: boolean;
  setIsUploading: (uploading: boolean) => void;
  errorMsg: string;
  setErrorMsg: (msg: string) => void;
}

export default function StepVerificationGPKD({
  values,
  onChange,
  isUploading,
  setIsUploading,
  errorMsg,
  setErrorMsg,
}: StepVerificationGPKDProps) {
  const { t } = useTranslation('employer');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileProcess = async (file: File) => {
    const validExtensions = ['.pdf', '.jpg', '.jpeg', '.png'];
    const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!validExtensions.includes(fileExt)) {
      setErrorMsg('Chỉ chấp nhận file định dạng PDF, JPG, PNG.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('Dung lượng file GPKD không được vượt quá 10MB.');
      return;
    }

    setIsUploading(true);
    setErrorMsg('');

    try {
      const fileType = fileExt === '.pdf' ? 'DOCUMENT' : 'IMAGE';
      const res = await commonService.uploadFile(file, fileType);
      onChange('gpkdFileId', res.id);
      onChange('gpkdFileName', file.name);
      onChange('gpkdFileUrl', res.url);
    } catch (err: unknown) {
      console.error('GPKD upload error:', err);
      setErrorMsg(t('employerOnboarding.validation.uploadFailed', 'Tải file lên thất bại. Vui lòng thử lại.'));
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      void handleFileProcess(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      void handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveFile = () => {
    onChange('gpkdFileId', null);
    onChange('gpkdFileName', '');
    onChange('gpkdFileUrl', '');
  };

  return (
    <Box>
      <input
        type="file"
        ref={fileInputRef}
        accept=".pdf,.jpg,.jpeg,.png"
        style={{ display: 'none' }}
        onChange={handleFileInputChange}
      />

      {/* Step Header */}
      <Box sx={{ mb: 3.5 }}>
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 0.75 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              backgroundColor: 'rgba(37, 99, 235, 0.1)',
              color: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <VerifiedUserOutlinedIcon fontSize="small" />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', fontSize: { xs: '1.25rem', sm: '1.45rem' } }}>
            {t('employerOnboarding.step3.title', 'Xác thực Doanh nghiệp (GPKD)')}
          </Typography>
        </Stack>
        <Typography variant="body2" sx={{ color: '#64748B', pl: { xs: 0, sm: 6 } }}>
          {t('employerOnboarding.step3.subtitle', 'Doanh nghiệp có tích xanh xác thực sẽ nhận được độ tin cậy cao và thu hút ứng viên gấp 3 lần')}
        </Typography>
      </Box>

      {errorMsg && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2.5 }} onClose={() => setErrorMsg('')}>
          {errorMsg}
        </Alert>
      )}

      {/* Benefits Card */}
      <Card
        variant="outlined"
        sx={{
          p: 2.5,
          mb: 3.5,
          borderRadius: 3,
          backgroundColor: '#EFF6FF',
          borderColor: '#BFDBFE',
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E40AF', mb: 1.5 }}>
          {t('employerOnboarding.step3.benefitsTitle', 'Lợi ích khi xác thực Giấy phép ĐKKD ngay:')}
        </Typography>
        <Stack spacing={1}>
          <Stack direction="row" spacing={1.25} alignItems="center">
            <CheckCircleOutlineIcon sx={{ color: '#2563EB', fontSize: 18 }} />
            <Typography variant="body2" sx={{ color: '#1E3A8A', fontWeight: 600 }}>
              {t('employerOnboarding.step3.benefit1', 'Huy hiệu Tích xanh Doanh nghiệp uy tín')}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1.25} alignItems="center">
            <CheckCircleOutlineIcon sx={{ color: '#2563EB', fontSize: 18 }} />
            <Typography variant="body2" sx={{ color: '#1E3A8A', fontWeight: 600 }}>
              {t('employerOnboarding.step3.benefit2', 'Ưu tiên hiển thị tin tuyển dụng ở vị trí nổi bật')}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1.25} alignItems="center">
            <CheckCircleOutlineIcon sx={{ color: '#2563EB', fontSize: 18 }} />
            <Typography variant="body2" sx={{ color: '#1E3A8A', fontWeight: 600 }}>
              {t('employerOnboarding.step3.benefit3', 'Tăng x3 tỷ lệ ứng tuyển của các ứng viên chất lượng cao')}
            </Typography>
          </Stack>
        </Stack>
      </Card>

      {/* Upload Dropzone */}
      {!values.gpkdFileName ? (
        <Card
          variant="outlined"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          sx={{
            p: { xs: 3, sm: 5 },
            textAlign: 'center',
            cursor: isUploading ? 'default' : 'pointer',
            borderRadius: 4,
            border: '1.5px solid',
            borderColor: isDragOver ? '#2563EB' : '#CBD5E1',
            backgroundColor: isDragOver ? 'rgba(37, 99, 235, 0.04)' : '#F8FAFC',
            transition: 'all 0.2s ease',
            '&:hover': {
              borderColor: '#2563EB',
              backgroundColor: 'rgba(37, 99, 235, 0.02)',
            },
          }}
        >
          {isUploading ? (
            <Box sx={{ py: 2 }}>
              <AutorenewIcon
                sx={{
                  fontSize: 48,
                  color: '#2563EB',
                  animation: 'spin 1s linear infinite',
                  '@keyframes spin': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' },
                  },
                  mb: 1.5,
                }}
              />
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1E293B', mb: 1 }}>
                {t('jobSeeker:onboarding.step3.uploading', 'Đang tải file lên...')}
              </Typography>
              <Box sx={{ width: '60%', mx: 'auto', mt: 1 }}>
                <LinearProgress sx={{ borderRadius: 1.5, height: 6 }} />
              </Box>
            </Box>
          ) : (
            <>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(37, 99, 235, 0.08)',
                  color: '#2563EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2,
                }}
              >
                <CloudUploadOutlinedIcon sx={{ fontSize: 32 }} />
              </Box>

              <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A', mb: 0.5, fontSize: '1.05rem' }}>
                {t('employerOnboarding.step3.dropzoneTitle', 'Kéo thả file GPKD (Ảnh hoặc PDF) vào đây hoặc bấm để chọn')}
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748B', mb: 2.5 }}>
                {t('employerOnboarding.step3.dropzoneSubtitle', 'Định dạng hỗ trợ: JPG, PNG, PDF (Dung lượng tối đa 10MB)')}
              </Typography>

              <Button
                variant="outlined"
                color="primary"
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                sx={{ borderRadius: 2, px: 2.5, fontWeight: 700 }}
              >
                {t('jobSeeker:onboarding.step3.selectFile', 'Chọn tệp từ máy tính')}
              </Button>
            </>
          )}
        </Card>
      ) : (
        <Card
          variant="outlined"
          sx={{
            p: 3,
            borderRadius: 3.5,
            border: '1.5px solid #10B981',
            backgroundColor: '#F0FDF4',
          }}
        >
          <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" justifyContent="space-between" spacing={2}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2.5,
                  backgroundColor: '#DCFCE7',
                  color: '#16A34A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <InsertDriveFileOutlinedIcon fontSize="medium" />
              </Box>
              <Box>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#166534', wordBreak: 'break-all' }}>
                    {values.gpkdFileName}
                  </Typography>
                  <CheckCircleRoundedIcon sx={{ color: '#16A34A', fontSize: 18 }} />
                </Stack>
                <Typography variant="caption" sx={{ color: '#15803D', fontWeight: 600 }}>
                  {t('employerOnboarding.step3.uploadedFile', 'Giấy phép kinh doanh đã tải lên')}
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => fileInputRef.current?.click()}
                sx={{
                  borderRadius: 2,
                  borderColor: '#86EFAC',
                  color: '#166534',
                  backgroundColor: '#FFFFFF',
                  '&:hover': { borderColor: '#4ADE80', backgroundColor: '#F0FDF4' },
                }}
              >
                {t('employerOnboarding.step3.replaceFile', 'Thay file')}
              </Button>
              <Tooltip title={t('employerOnboarding.step3.removeFile', 'Xóa file')}>
                <IconButton onClick={handleRemoveFile} size="small" sx={{ color: '#EF4444' }}>
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
        </Card>
      )}

      {/* Skip Notice */}
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="caption" sx={{ color: '#64748B', fontStyle: 'italic', fontSize: '0.8125rem' }}>
          {t('employerOnboarding.step3.skipNotice', 'Bạn có thể bỏ qua bước này và cập nhật GPKD bất kỳ lúc nào trong phần Cài đặt công ty.')}
        </Typography>
      </Box>
    </Box>
  );
}

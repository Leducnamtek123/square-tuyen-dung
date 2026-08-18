'use client';

import React from 'react';
import {
  Box,
  Button,
  Card,
  Chip,
  Grid2 as Grid,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
  CircularProgress,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import AutorenewOutlinedIcon from '@mui/icons-material/AutorenewOutlined';
import type { ChipProps } from '@mui/material';
import commonService from '@/services/commonService';
import toastMessages from '@/utils/toastMessages';
import { getSafeExternalOpenUrl } from '@/utils/safeExternalUrl';
import pc from '@/utils/muiColors';

export interface VerificationLegalProfile {
  companyName: string;
  taxCode: string;
  businessLicense: string;
  representative: string;
  phone: string;
  email: string;
  website: string;
}

interface Props {
  legalProfile: VerificationLegalProfile;
  onChange: (field: keyof VerificationLegalProfile) => (event: React.ChangeEvent<HTMLInputElement>) => void;
  onLicenseFileUploaded?: (fileUrl: string) => void;
  onSubmit: (event: React.FormEvent) => void;
  statusLabel: string;
  statusColor?: ChipProps['color'];
  errors?: Partial<Record<keyof VerificationLegalProfile, string>>;
  loading?: boolean;
}

const inputSx = {
  '& .MuiOutlinedInput-root': {
    minHeight: 44,
    borderRadius: 2,
    backgroundColor: 'background.paper',
    transition: 'background-color 0.2s ease, border-color 0.2s ease',
    '& fieldset': { borderColor: pc.divider(0.95) },
    '&:hover': { backgroundColor: pc.bgDefault(0.45) },
    '&:hover fieldset': { borderColor: pc.primary(0.35) },
    '&.Mui-focused fieldset': {
      borderColor: 'primary.main',
      borderWidth: 1,
    },
  },
  '& .MuiInputBase-input': {
    fontSize: '0.875rem',
    py: '10px',
  },
};

const VerificationLegalProfileForm = ({
  legalProfile,
  onChange,
  onLicenseFileUploaded,
  onSubmit,
  statusLabel,
  statusColor = 'info',
  errors,
  loading,
}: Props) => {
  const { t } = useTranslation('employer');
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);
  const [uploadedFileUrl, setUploadedFileUrl] = React.useState<string>(legalProfile.businessLicense || '');

  React.useEffect(() => {
    if (legalProfile.businessLicense) {
      setUploadedFileUrl(legalProfile.businessLicense);
    }
  }, [legalProfile.businessLicense]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const res = await commonService.uploadFile(file, 'BUSINESS_LICENSE');
      if (res?.url) {
        const url = res.url;
        setUploadedFileUrl(url);
        onLicenseFileUploaded?.(url);
        toastMessages.success('Tải lên giấy phép kinh doanh thành công!');
      }
    } catch {
      toastMessages.error('Không thể tải lên tệp pháp lý. Vui lòng thử lại.');
    } finally {
      setUploading(false);
    }
  };

  const fieldsConfig: Array<{
    field: keyof VerificationLegalProfile;
    label: string;
    required: boolean;
    type: string;
    icon: React.ReactNode;
    placeholder: string;
  }> = [
    {
      field: 'companyName',
      label: 'verification.step2.enterpriseName',
      required: true,
      type: 'text',
      icon: <BusinessOutlinedIcon sx={{ fontSize: 18, color: '#64748b' }} />,
      placeholder: 'Nhập tên doanh nghiệp theo GPKD',
    },
    {
      field: 'taxCode',
      label: 'verification.step2.taxCode',
      required: true,
      type: 'text',
      icon: <FactCheckOutlinedIcon sx={{ fontSize: 18, color: '#64748b' }} />,
      placeholder: 'Nhập mã số thuế doanh nghiệp',
    },
    {
      field: 'businessLicense',
      label: 'verification.step2.licenseNumber',
      required: true,
      type: 'text',
      icon: <BadgeOutlinedIcon sx={{ fontSize: 18, color: '#64748b' }} />,
      placeholder: 'Nhập số đăng ký kinh doanh / giấy phép',
    },
    {
      field: 'representative',
      label: 'verification.step2.representative',
      required: true,
      type: 'text',
      icon: <PersonOutlineOutlinedIcon sx={{ fontSize: 18, color: '#64748b' }} />,
      placeholder: 'Nhập tên người đại diện pháp luật',
    },
    {
      field: 'phone',
      label: 'verification.step2.phone',
      required: true,
      type: 'text',
      icon: <PhoneOutlinedIcon sx={{ fontSize: 18, color: '#64748b' }} />,
      placeholder: 'Nhập số điện thoại liên hệ pháp lý',
    },
    {
      field: 'email',
      label: 'verification.step2.email',
      required: true,
      type: 'email',
      icon: <EmailOutlinedIcon sx={{ fontSize: 18, color: '#64748b' }} />,
      placeholder: 'Nhập email liên hệ chính thức',
    },
    {
      field: 'website',
      label: 'verification.step2.website',
      required: false,
      type: 'text',
      icon: <LanguageOutlinedIcon sx={{ fontSize: 18, color: '#64748b' }} />,
      placeholder: 'https://example.com',
    },
  ];

  return (
    <Card
      elevation={0}
      sx={{
        p: { xs: 2.5, sm: 3.5 },
        mb: 3,
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: '#ffffff',
        boxShadow: (theme) => theme.customShadows?.z1,
      }}
    >
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={1.5} sx={{ mb: 3, pb: 2, borderBottom: '1px solid #f1f5f9' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 900, color: '#0f172a', fontSize: '1.125rem' }}>
            {t('verification.step2.title')}
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500, mt: 0.25 }}>
            {t('verification.step2.description')}
          </Typography>
        </Box>
        <Chip label={statusLabel} color={statusColor} sx={{ fontWeight: 800, borderRadius: 2 }} />
      </Stack>

      <Box component="form" onSubmit={onSubmit}>
        <Grid container spacing={{ xs: 2, md: 2.5 }}>
          {fieldsConfig.map(({ field, label, required, type, icon, placeholder }) => (
            <Grid key={field} size={{ xs: 12, md: field === 'companyName' ? 12 : 6 }}>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.75, color: '#1e293b', fontSize: '0.8125rem' }}>
                  {t(label)}{required && <span style={{ color: 'red', marginLeft: '4px' }}>*</span>}
                </Typography>
                <TextField
                  value={legalProfile[field] || ''}
                  onChange={onChange(field)}
                  fullWidth
                  placeholder={placeholder}
                  type={type}
                  error={Boolean(errors?.[field])}
                  helperText={errors?.[field]}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          {icon}
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={inputSx}
                />
              </Box>
            </Grid>
          ))}

          {/* Legal Document File Upload Dropzone */}
          <Grid size={12}>
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 700, mb: 1, color: '#1e293b', fontSize: '0.8125rem' }}>
                Giấy phép đăng ký kinh doanh (GPKD) / Tài liệu chứng minh pháp lý <span style={{ color: 'red' }}>*</span>
              </Typography>

              <Box
                sx={{
                  p: { xs: 2.5, sm: 3 },
                  border: '1.5px dashed',
                  borderColor: uploadedFileUrl ? '#86efac' : '#cbd5e1',
                  borderRadius: 3,
                  bgcolor: uploadedFileUrl ? '#f0fdf4' : '#f8fafc',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: '#2563eb',
                    bgcolor: '#eff6ff',
                  },
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  hidden
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleFileChange}
                />

                {uploading ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, py: 2 }}>
                    <CircularProgress size={24} sx={{ color: '#2563eb' }} />
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#2563eb' }}>
                      Đang xử lý tải tài liệu lên hệ thống bảo mật...
                    </Typography>
                  </Box>
                ) : uploadedFileUrl ? (
                  <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" justifyContent="space-between" spacing={2}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: '12px',
                          bgcolor: '#dcfce7',
                          color: '#16a34a',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <DescriptionOutlinedIcon sx={{ fontSize: 26 }} />
                      </Box>
                      <Box sx={{ textAlign: 'left' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                          Giấy phép kinh doanh đã được lưu trữ
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
                          {uploadedFileUrl.split('/').pop() || 'Tài_liệu_pháp_lý_doanh_nghiệp.pdf'}
                        </Typography>
                      </Box>
                    </Stack>

                    <Stack direction="row" spacing={1.25}>
                      {uploadedFileUrl.startsWith('http') && (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<VisibilityOutlinedIcon sx={{ fontSize: 16 }} />}
                          component="a"
                          href={getSafeExternalOpenUrl(uploadedFileUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          sx={{
                            borderRadius: 2,
                            borderColor: '#cbd5e1',
                            bgcolor: '#ffffff',
                            color: '#0f172a',
                            textTransform: 'none',
                            fontWeight: 700,
                            fontSize: '0.8125rem',
                            '&:hover': {
                              bgcolor: '#f8fafc',
                            },
                          }}
                        >
                          Xem tệp
                        </Button>
                      )}

                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<AutorenewOutlinedIcon sx={{ fontSize: 16 }} />}
                        sx={{
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 700,
                          fontSize: '0.8125rem',
                          bgcolor: '#2563eb',
                          boxShadow: 'none',
                          '&:hover': {
                            bgcolor: '#1d4ed8',
                          },
                        }}
                      >
                        Thay đổi tệp
                      </Button>
                    </Stack>
                  </Stack>
                ) : (
                  <Box sx={{ py: 1 }}>
                    <FileUploadOutlinedIcon sx={{ fontSize: 40, color: '#2563eb', mb: 1 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                      Nhấp để tải lên Giấy phép kinh doanh (GPKD) hoặc tài liệu chứng minh
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 0.5 }}>
                      Định dạng hỗ trợ: PDF, PNG, JPG, JPEG (Dung lượng tối đa 10MB)
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ mt: 3.5, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={<SaveOutlinedIcon />}
            sx={{
              borderRadius: 2.5,
              px: 4,
              minHeight: 44,
              fontWeight: 800,
              fontSize: '0.9375rem',
              textTransform: 'none',
              bgcolor: '#2563eb',
              boxShadow: '0 4px 14px 0 rgba(37, 99, 235, 0.25)',
              '&:hover': {
                bgcolor: '#1d4ed8',
                boxShadow: '0 6px 20px 0 rgba(37, 99, 235, 0.35)',
              },
            }}
          >
            {loading ? 'Đang lưu...' : t('verification.step2.saveBtn')}
          </Button>
        </Box>
      </Box>
    </Card>
  );
};

export default VerificationLegalProfileForm;

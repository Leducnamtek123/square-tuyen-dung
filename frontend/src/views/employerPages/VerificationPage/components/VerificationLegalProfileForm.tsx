'use client';

import React from 'react';
import {
  Box,
  Button,
  Card,
  Chip,
  Grid2 as Grid,
  Stack,
  TextField,
  Typography,
  CircularProgress,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import type { ChipProps } from '@mui/material';
import commonService from '@/services/commonService';
import toastMessages from '@/utils/toastMessages';
import { getSafeExternalOpenUrl } from '@/utils/safeExternalUrl';


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

  const fields = [
    ['companyName', 'verification.step2.enterpriseName', true],
    ['taxCode', 'verification.step2.taxCode', true],
    ['businessLicense', 'verification.step2.licenseNumber', true],
    ['representative', 'verification.step2.representative', true],
    ['phone', 'verification.step2.phone', true],
    ['email', 'verification.step2.email', true],
    ['website', 'verification.step2.website', false],
  ] as const;

  return (
    <Card elevation={0} sx={{ p: 3, mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: '20px' }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1.5} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
            {t('verification.step2.title')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontWeight: 500 }}>
            {t('verification.step2.description')}
          </Typography>
        </Box>
        <Chip label={statusLabel} color={statusColor} sx={{ alignSelf: { xs: 'flex-start', sm: 'center' }, fontWeight: 800 }} />
      </Stack>

      <Box component="form" onSubmit={onSubmit}>
        <Grid container spacing={2.5}>
          {fields.map(([field, label, required]) => (
            <Grid key={field} size={{ xs: 12, md: 6 }}>
              <TextField
                label={t(label)}
                value={legalProfile[field]}
                onChange={onChange(field)}
                fullWidth
                required={required}
                type={field === 'email' ? 'email' : 'text'}
                error={Boolean(errors?.[field])}
                helperText={errors?.[field]}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>
          ))}

          {/* Legal Document File Upload Dropzone */}
          <Grid size={12}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#0f172a' }}>
              Giấy phép đăng ký kinh doanh (GPKD) / Tài liệu pháp lý doanh nghiệp *
            </Typography>
            <Box
              sx={{
                p: 3,
                border: '1.5px solid #CBD5E1',
                borderRadius: '16px',
                backgroundColor: '#F8FAFC',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: '#2563eb',
                  backgroundColor: '#eff6ff',
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
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, py: 1 }}>
                  <CircularProgress size={24} sx={{ color: '#2563eb' }} />
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#2563eb' }}>
                    Đang tải tệp pháp lý lên hệ thống...
                  </Typography>
                </Box>
              ) : uploadedFileUrl ? (
                <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" justifyContent="space-between" spacing={2} sx={{ px: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ p: 1.25, borderRadius: '12px', backgroundColor: '#dcfce7', color: '#16a34a' }}>
                      <DescriptionOutlinedIcon />
                    </Box>
                    <Box sx={{ textAlign: 'left' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                        Đã tải lên Giấy phép kinh doanh (GPKD)
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
                        {uploadedFileUrl.split('/').pop() || 'Tài_liệu_pháp_lý_doanh_nghiệp.pdf'}
                      </Typography>
                    </Box>
                  </Box>
                  <Stack direction="row" spacing={1}>
                    {uploadedFileUrl.startsWith('http') && (
                      <Button
                        size="small"
                        variant="outlined"
                        component="a"
                        href={getSafeExternalOpenUrl(uploadedFileUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700 }}
                      >
                        Xem tài liệu
                      </Button>
                    )}


                    <Button
                      size="small"
                      variant="contained"
                      sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700, backgroundColor: '#2563eb' }}
                    >
                      Thay đổi tệp
                    </Button>
                  </Stack>
                </Stack>
              ) : (
                <Box>
                  <FileUploadOutlinedIcon sx={{ fontSize: 40, color: '#2563eb', mb: 1 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                    Tải lên Giấy phép kinh doanh (GPKD) hoặc tài liệu chứng minh doanh nghiệp
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 0.5 }}>
                    Hỗ trợ định dạng PDF, PNG, JPG, JPEG (Dung lượng tối đa 10MB)
                  </Typography>
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ mt: 3, display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{ borderRadius: '10px', px: 4, py: 1.2, fontWeight: 800, backgroundColor: '#2563eb' }}
          >
            {t('verification.step2.saveBtn')}
          </Button>
        </Box>
      </Box>
    </Card>
  );
};

export default VerificationLegalProfileForm;

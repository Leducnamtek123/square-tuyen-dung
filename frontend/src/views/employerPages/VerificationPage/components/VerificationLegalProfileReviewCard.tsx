'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid2 as Grid,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import dayjs from 'dayjs';
import type { CompanyVerification } from '@/types/models';
import type { VerificationLegalProfile } from './VerificationLegalProfileForm';
import { getSafeExternalOpenUrl } from '@/utils/safeExternalUrl';

interface Props {
  legalProfile: VerificationLegalProfile;
  verification?: CompanyVerification;
  onStartEditing: () => void;
}

interface InfoFieldProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  isLink?: boolean;
}

const InfoField = ({ icon, label, value, isLink }: InfoFieldProps) => {
  const displayValue = value.trim() ? value : '---';
  const hasLink = isLink && Boolean(value.trim());
  const href = hasLink
    ? value.startsWith('http://') || value.startsWith('https://')
      ? value
      : `https://${value}`
    : undefined;

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2.5,
        bgcolor: '#f8fafc',
        border: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1.5,
        transition: 'all 0.2s ease',
        '&:hover': {
          borderColor: '#cbd5e1',
          bgcolor: '#f1f5f9',
        },
      }}
    >
      <Box
        sx={{
          width: 38,
          height: 38,
          borderRadius: 2,
          bgcolor: '#ffffff',
          border: '1px solid #e2e8f0',
          color: '#2563eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          mt: 0.25,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="caption"
          sx={{
            color: '#64748b',
            fontWeight: 600,
            display: 'block',
            mb: 0.25,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            fontSize: '0.6875rem',
          }}
        >
          {label}
        </Typography>
        {hasLink && href ? (
          <Typography
            component="a"
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            variant="body2"
            sx={{
              fontWeight: 700,
              color: '#2563eb',
              textDecoration: 'none',
              wordBreak: 'break-word',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            {displayValue}
          </Typography>
        ) : (
          <Typography
            variant="body2"
            sx={{
              fontWeight: 700,
              color: '#0f172a',
              wordBreak: 'break-word',
              fontSize: '0.875rem',
            }}
          >
            {displayValue}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

const VerificationLegalProfileReviewCard = ({
  legalProfile,
  verification,
  onStartEditing,
}: Props) => {
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const safeLicenseUrl = legalProfile.businessLicense
    ? getSafeExternalOpenUrl(legalProfile.businessLicense)
    : '';

  const fileName = legalProfile.businessLicense
    ? legalProfile.businessLicense.split('/').pop()?.split('?')[0] || 'Giay_phep_kinh_doanh.pdf'
    : 'Giấy phép kinh doanh đã duyệt';

  const uploadDate =
    verification?.updateAt || verification?.createAt
      ? dayjs(verification.updateAt || verification.createAt).format('DD/MM/YYYY')
      : 'Gần đây';

  return (
    <Stack spacing={3}>
      {/* Card 1: Thông tin doanh nghiệp */}
      <Card
        elevation={0}
        sx={{
          p: { xs: 2.5, sm: 3.5 },
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: '#ffffff',
          boxShadow: (theme) => theme.customShadows?.z1,
        }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={2}
          sx={{ mb: 3, pb: 2, borderBottom: '1px solid #f1f5f9' }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
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
                flexShrink: 0,
              }}
            >
              <BusinessOutlinedIcon sx={{ fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1.125rem' }}>
                Thông tin doanh nghiệp
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500, mt: 0.25 }}>
                Thông tin cơ bản về doanh nghiệp của bạn.
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1.5} alignItems="center">
            <Chip
              icon={<CheckCircleOutlineIcon sx={{ fontSize: '16px !important', color: '#16a34a !important' }} />}
              label="Đã hoàn tất"
              size="small"
              sx={{
                height: 28,
                fontWeight: 700,
                bgcolor: '#dcfce7',
                color: '#16a34a',
                border: '1px solid #bbf7d0',
                borderRadius: 2,
              }}
            />
            <Button
              variant="outlined"
              size="small"
              startIcon={<EditOutlinedIcon sx={{ fontSize: 16 }} />}
              onClick={() => setConfirmDialogOpen(true)}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 700,
                borderColor: '#cbd5e1',
                color: '#334155',
                fontSize: '0.8125rem',
                bgcolor: '#ffffff',
                '&:hover': {
                  bgcolor: '#f8fafc',
                  borderColor: '#94a3b8',
                },
              }}
            >
              Chỉnh sửa
            </Button>
          </Stack>
        </Stack>

        {/* 2 columns with icon chips */}
        <Grid container spacing={{ xs: 2, md: 2.5 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack spacing={2}>
              <InfoField
                icon={<BusinessOutlinedIcon sx={{ fontSize: 20 }} />}
                label="Tên doanh nghiệp"
                value={legalProfile.companyName}
              />
              <InfoField
                icon={<FactCheckOutlinedIcon sx={{ fontSize: 20 }} />}
                label="Mã số thuế"
                value={legalProfile.taxCode}
              />
              <InfoField
                icon={<PersonOutlineOutlinedIcon sx={{ fontSize: 20 }} />}
                label="Người đại diện"
                value={legalProfile.representative}
              />
              <InfoField
                icon={<EmailOutlinedIcon sx={{ fontSize: 20 }} />}
                label="Email liên hệ"
                value={legalProfile.email}
              />
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Stack spacing={2}>
              <InfoField
                icon={<BadgeOutlinedIcon sx={{ fontSize: 20 }} />}
                label="Số giấy phép kinh doanh"
                value={
                  legalProfile.businessLicense
                    ? legalProfile.businessLicense.includes('/')
                      ? legalProfile.businessLicense.split('/').pop()?.split('?')[0] || legalProfile.businessLicense
                      : legalProfile.businessLicense
                    : '---'
                }
              />
              <InfoField
                icon={<PhoneOutlinedIcon sx={{ fontSize: 20 }} />}
                label="Số điện thoại"
                value={legalProfile.phone}
              />
              <InfoField
                icon={<LanguageOutlinedIcon sx={{ fontSize: 20 }} />}
                label="Website"
                value={legalProfile.website}
                isLink
              />
            </Stack>
          </Grid>
        </Grid>
      </Card>

      {/* Card 2: Tài liệu pháp lý doanh nghiệp */}
      <Card
        elevation={0}
        sx={{
          p: { xs: 2.5, sm: 3.5 },
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: '#ffffff',
          boxShadow: (theme) => theme.customShadows?.z1,
        }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={2}
          sx={{ mb: 3, pb: 2, borderBottom: '1px solid #f1f5f9' }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '12px',
                bgcolor: '#f0fdf4',
                color: '#16a34a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <DescriptionOutlinedIcon sx={{ fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1.125rem' }}>
                Tài liệu pháp lý doanh nghiệp
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500, mt: 0.25 }}>
                Các tài liệu đã được xác thực bởi hệ thống.
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1.5} alignItems="center">
            <Chip
              icon={<CheckCircleOutlineIcon sx={{ fontSize: '16px !important', color: '#16a34a !important' }} />}
              label="Đã duyệt"
              size="small"
              sx={{
                height: 28,
                fontWeight: 700,
                bgcolor: '#dcfce7',
                color: '#16a34a',
                border: '1px solid #bbf7d0',
                borderRadius: 2,
              }}
            />
            {safeLicenseUrl && (
              <Button
                size="small"
                variant="text"
                startIcon={<VisibilityOutlinedIcon sx={{ fontSize: 16 }} />}
                component="a"
                href={safeLicenseUrl}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.8125rem',
                  color: '#2563eb',
                }}
              >
                Xem tất cả
              </Button>
            )}
          </Stack>
        </Stack>

        {/* Document Item */}
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: 2.5,
            border: '1px solid #bbf7d0',
            bgcolor: '#f6fef9',
          }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            justifyContent="space-between"
            spacing={2}
          >
            <Stack direction="row" spacing={2} alignItems="center">
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
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                  Giấy phép kinh doanh
                </Typography>
                <Typography variant="body2" sx={{ color: '#475569', fontWeight: 600, fontSize: '0.8125rem', mt: 0.25 }}>
                  {fileName}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500, display: 'block', mt: 0.25 }}>
                  Đã tải lên: {uploadDate} • Đã kiểm định
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1.5} alignItems="center" alignSelf={{ xs: 'flex-end', sm: 'center' }}>
              <Chip
                label="Đã được duyệt"
                size="small"
                sx={{
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  bgcolor: '#dcfce7',
                  color: '#16a34a',
                  height: 26,
                  borderRadius: 1.5,
                }}
              />
              {safeLicenseUrl ? (
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<VisibilityOutlinedIcon sx={{ fontSize: 16 }} />}
                  component="a"
                  href={safeLicenseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
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
                  Xem chi tiết
                </Button>
              ) : null}
            </Stack>
          </Stack>
        </Paper>
      </Card>

      {/* Card 3: Lưu ý quan trọng */}
      <Card
        elevation={0}
        sx={{
          p: { xs: 2.5, sm: 3.5 },
          borderRadius: 3,
          border: '1px solid #bfdbfe',
          bgcolor: '#f8fafc',
          boxShadow: (theme) => theme.customShadows?.z1,
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
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
              flexShrink: 0,
            }}
          >
            <VerifiedUserOutlinedIcon sx={{ fontSize: 22 }} />
          </Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1e3a8a', fontSize: '1.05rem' }}>
            Lưu ý quan trọng
          </Typography>
        </Stack>

        <Stack spacing={1.25} sx={{ pl: { xs: 0, sm: 1 }, mb: 3 }}>
          <Typography variant="body2" sx={{ color: '#334155', fontWeight: 500 }}>
            • Nếu bạn thay đổi thông tin doanh nghiệp (Tên doanh nghiệp, MST, GPKD, Người đại diện...), hệ thống sẽ yêu cầu xác minh lại.
          </Typography>
          <Typography variant="body2" sx={{ color: '#334155', fontWeight: 500 }}>
            • Thời gian xử lý xác minh lại thường từ 1 - 3 ngày làm việc.
          </Typography>
          <Typography variant="body2" sx={{ color: '#334155', fontWeight: 500 }}>
            • Vui lòng đảm bảo thông tin luôn chính xác để tránh ảnh hưởng đến việc sử dụng dịch vụ.
          </Typography>
        </Stack>

        <Button
          variant="outlined"
          startIcon={<EditOutlinedIcon sx={{ fontSize: 16 }} />}
          onClick={() => setConfirmDialogOpen(true)}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '0.875rem',
            borderColor: '#3b82f6',
            color: '#1d4ed8',
            bgcolor: '#ffffff',
            '&:hover': {
              bgcolor: '#eff6ff',
              borderColor: '#2563eb',
            },
          }}
        >
          Thay đổi thông tin
        </Button>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 1,
            maxWidth: 500,
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, fontWeight: 800, color: '#0f172a' }}>
          <WarningAmberOutlinedIcon sx={{ color: '#ea580c', fontSize: 28 }} />
          Thay đổi thông tin pháp lý?
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: '#475569', fontSize: '0.9375rem', lineHeight: 1.6 }}>
            Việc thay đổi các thông tin pháp lý cốt lõi (Tên doanh nghiệp, Mã số thuế, GPKD, Người đại diện) sẽ yêu cầu ban quản trị InfoHR xác thực lại doanh nghiệp. Bạn có chắc muốn chỉnh sửa không?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, pt: 1, gap: 1 }}>
          <Button
            variant="outlined"
            onClick={() => setConfirmDialogOpen(false)}
            sx={{
              borderRadius: 2,
              borderColor: '#cbd5e1',
              color: '#475569',
              fontWeight: 700,
              textTransform: 'none',
              '&:hover': { bgcolor: '#f8fafc', borderColor: '#94a3b8' },
            }}
          >
            Hủy bỏ
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setConfirmDialogOpen(false);
              onStartEditing();
            }}
            sx={{
              borderRadius: 2,
              bgcolor: '#2563eb',
              fontWeight: 700,
              textTransform: 'none',
              '&:hover': { bgcolor: '#1d4ed8' },
            }}
          >
            Xác nhận chỉnh sửa
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default VerificationLegalProfileReviewCard;

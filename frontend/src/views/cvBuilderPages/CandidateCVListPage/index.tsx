'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Box,
  Card,
  Typography,
  Button,
  IconButton,
  Chip,
  Stack,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid2 as Grid,
  Tooltip,
} from '@mui/material';
import AutoFixHighOutlinedIcon from '@mui/icons-material/AutoFixHighOutlined';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import StarOutlinedIcon from '@mui/icons-material/StarOutlined';
import StarBorderOutlinedIcon from '@mui/icons-material/StarBorderOutlined';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import FolderSpecialOutlinedIcon from '@mui/icons-material/FolderSpecialOutlined';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';

import cvBuilderService from '@/services/cvBuilderService';
import { CandidateCVListItem } from '@/types/cvBuilder';
import { TabTitle } from '@/utils/generalFunction';
import toastMessages from '@/utils/toastMessages';
import { localizeRoutePath } from '@/configs/routeLocalization';
import { useTranslation } from 'react-i18next';

export const CandidateCVListPage: React.FC = () => {
  const router = useRouter();
  const { i18n } = useTranslation();
  const queryClient = useQueryClient();
  TabTitle('Quản Lý CV Đã Lưu & Hồ Sơ Trực Tuyến | InfoHR Tuyển Dụng');

  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const {
    data: cvList = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<CandidateCVListItem[]>({
    queryKey: ['candidate-cvs', searchQuery],
    queryFn: () => cvBuilderService.getCandidateCVs({ search: searchQuery.trim() || undefined }),
  });

  // Duplicate mutation
  const duplicateMutation = useMutation({
    mutationFn: (id: number) => cvBuilderService.duplicateCandidateCV(id),
    onSuccess: (newCV) => {
      toastMessages.success(`Đã nhân bản thành công: ${newCV.title}`);
      queryClient.invalidateQueries({ queryKey: ['candidate-cvs'] });
    },
    onError: () => {
      toastMessages.error('Không thể nhân bản CV. Vui lòng thử lại!');
    },
  });

  // Set Main CV mutation
  const setMainMutation = useMutation({
    mutationFn: (id: number) => cvBuilderService.setMainCandidateCV(id),
    onSuccess: () => {
      toastMessages.success('Đã đặt làm CV chính dùng để ứng tuyển nhanh!');
      queryClient.invalidateQueries({ queryKey: ['candidate-cvs'] });
    },
    onError: () => {
      toastMessages.error('Không thể cập nhật CV chính.');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => cvBuilderService.deleteCandidateCV(id),
    onSuccess: () => {
      toastMessages.success('Đã xóa CV thành công.');
      setDeleteConfirmId(null);
      queryClient.invalidateQueries({ queryKey: ['candidate-cvs'] });
    },
    onError: () => {
      toastMessages.error('Không thể xóa CV.');
    },
  });

  const handleCopyPublicLink = (slug: string) => {
    const fullUrl = `${window.location.origin}/cv/${slug}`;
    navigator.clipboard.writeText(fullUrl);
    toastMessages.success('Đã sao chép liên kết CV trực tuyến vào clipboard!');
  };

  const totalViews = cvList.reduce((acc, item) => acc + (item.views_count || 0), 0);
  const mainCV = cvList.find((item) => item.is_main_cv);

  return (
    <Box sx={{ width: '100%', pb: 6, display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* ── Top Hero Banner (Matching InfoHR Standard) ──────────────────── */}
      <Card
        elevation={0}
        sx={{
          borderRadius: '20px',
          background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 55%, #1d4ed8 100%)',
          color: '#ffffff',
          p: { xs: 3, sm: 4 },
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 8px 30px rgba(37, 99, 235, 0.2)',
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={3}
          alignItems={{ xs: 'flex-start', md: 'center' }}
          justifyContent="space-between"
        >
          <Box sx={{ maxWidth: 700 }}>
            <Chip
              icon={<FolderSpecialOutlinedIcon sx={{ fontSize: '15px !important', color: '#ffffff !important' }} />}
              label="Trung tâm Quản lý CV & Hồ sơ Trực tuyến"
              size="small"
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.18)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.775rem',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                mb: 1.5,
              }}
            />
            <Typography variant="h4" sx={{ fontWeight: 900, fontSize: { xs: '1.4rem', sm: '1.85rem' }, color: '#ffffff', mb: 1 }}>
              Danh Sách CV Của Bạn
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.875rem', lineHeight: 1.6 }}>
              Tất cả các bản CV được lưu trữ an toàn trên đám mây. Bạn có thể tạo nhiều phiên bản phù hợp cho từng vị trí ứng tuyển, chia sẻ liên kết trực tuyến và xuất file PDF chuẩn in ấn A4.
            </Typography>
          </Box>

          <Button
            component={Link}
            href={localizeRoutePath('/danh-sach-mau-cv', i18n.language)}
            size="large"
            variant="contained"
            startIcon={<AutoFixHighOutlinedIcon sx={{ color: '#1e40af' }} />}
            sx={{
              borderRadius: '12px',
              bgcolor: '#ffffff',
              color: '#1e40af',
              fontWeight: 800,
              fontSize: '0.85rem',
              textTransform: 'none',
              px: 3,
              py: 1.25,
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
              whiteSpace: 'nowrap',
              shrink: 0,
              '&:hover': {
                bgcolor: '#f8fafc',
                color: '#1d4ed8',
              },
            }}
          >
            Tạo CV mới từ mẫu
          </Button>
        </Stack>
      </Card>

      {/* ── Quick Stats Grid ───────────────────────────────────────────── */}
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card elevation={0} sx={{ p: 2.5, borderRadius: '16px', border: '1px solid #e2e8f0', bgcolor: '#ffffff', display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ width: 48, height: 48, borderRadius: '12px', bgcolor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', shrink: 0 }}>
              <InsertDriveFileOutlinedIcon sx={{ fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 900, color: '#0f172a' }}>{cvList.length}</Typography>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>Bản CV đã khởi tạo</Typography>
            </Box>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Card elevation={0} sx={{ p: 2.5, borderRadius: '16px', border: '1px solid #e2e8f0', bgcolor: '#ffffff', display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ width: 48, height: 48, borderRadius: '12px', bgcolor: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', shrink: 0 }}>
              <StarOutlinedIcon sx={{ fontSize: 24 }} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {mainCV ? mainCV.title : 'Chưa thiết lập'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>CV Chính (Mặc định ứng tuyển)</Typography>
            </Box>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Card elevation={0} sx={{ p: 2.5, borderRadius: '16px', border: '1px solid #e2e8f0', bgcolor: '#ffffff', display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ width: 48, height: 48, borderRadius: '12px', bgcolor: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', shrink: 0 }}>
              <TrendingUpOutlinedIcon sx={{ fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 900, color: '#0f172a' }}>{totalViews}</Typography>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>Tổng lượt NTD xem</Typography>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* ── Search Bar ─────────────────────────────────────────────────── */}
      <Card elevation={0} sx={{ p: 2, borderRadius: '16px', border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
        <TextField
          size="small"
          placeholder="Tìm kiếm CV theo tiêu đề..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 20, color: '#94a3b8' }} />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 420 }}
        />
      </Card>

      {/* ── CV Cards Grid ──────────────────────────────────────────────── */}
      {isLoading ? (
        <Grid container spacing={3}>
          {[1, 2, 3].map((idx) => (
            <Grid size={{ xs: 12, md: 4 }} key={idx}>
              <Card elevation={0} sx={{ p: 3, borderRadius: '16px', border: '1px solid #e2e8f0', height: 200, bgcolor: '#f8fafc' }} />
            </Grid>
          ))}
        </Grid>
      ) : isError ? (
        <Card elevation={0} sx={{ p: 4, borderRadius: '16px', border: '1px solid #fecdd3', bgcolor: '#fff1f2', textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: '#be123c', fontWeight: 600, mb: 1.5 }}>
            Không thể tải danh sách CV. Vui lòng đăng nhập hoặc kiểm tra kết nối mạng.
          </Typography>
          <Button variant="contained" size="small" onClick={() => refetch()} startIcon={<RefreshIcon />} sx={{ bgcolor: '#e11d48', '&:hover': { bgcolor: '#be123c' } }}>
            Thử lại
          </Button>
        </Card>
      ) : cvList.length > 0 ? (
        <Grid container spacing={3}>
          {cvList.map((cv) => (
            <Grid size={{ xs: 12, md: 4 }} key={cv.id}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  bgcolor: '#ffffff',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  height: '100%',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: '#2563eb',
                    boxShadow: '0 8px 24px rgba(37, 99, 235, 0.1)',
                  },
                }}
              >
                {/* Top Info */}
                <Box sx={{ p: 2.5 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>
                      {cv.title}
                    </Typography>
                    {cv.is_main_cv && (
                      <Chip
                        icon={<StarOutlinedIcon sx={{ fontSize: '13px !important', color: '#b45309 !important' }} />}
                        label="CV Chính"
                        size="small"
                        sx={{ bgcolor: '#fef3c7', color: '#92400e', fontWeight: 800, fontSize: '0.675rem', height: 22 }}
                      />
                    )}
                  </Stack>

                  <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 1.5 }}>
                    Mẫu: <strong style={{ color: '#334155' }}>{cv.template_name || cv.template_code}</strong> • {new Date(cv.update_at).toLocaleDateString('vi-VN')}
                  </Typography>

                  <Stack direction="row" spacing={1} alignItems="center">
                    <VisibilityOutlinedIcon sx={{ fontSize: 15, color: '#94a3b8' }} />
                    <Typography variant="caption" sx={{ color: '#64748b' }}>
                      {cv.views_count || 0} lượt xem
                    </Typography>
                  </Stack>
                </Box>

                {/* Bottom Actions */}
                <Box sx={{ p: 2, bgcolor: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Stack direction="row" spacing={0.5}>
                    <Tooltip title="Chỉnh sửa CV trong Studio">
                      <IconButton size="small" onClick={() => router.push(localizeRoutePath(`/tao-cv?id=${cv.id}`, i18n.language))} sx={{ color: '#475569', '&:hover': { color: '#2563eb', bgcolor: '#ffffff' } }}>
                        <EditOutlinedIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Nhân bản CV này">
                      <IconButton size="small" disabled={duplicateMutation.isPending} onClick={() => duplicateMutation.mutate(cv.id)} sx={{ color: '#475569', '&:hover': { color: '#2563eb', bgcolor: '#ffffff' } }}>
                        <ContentCopyOutlinedIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Tooltip>

                    {cv.slug && (
                      <Tooltip title="Sao chép link CV trực tuyến">
                        <IconButton size="small" onClick={() => handleCopyPublicLink(cv.slug)} sx={{ color: '#475569', '&:hover': { color: '#16a34a', bgcolor: '#ffffff' } }}>
                          <ShareOutlinedIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>
                    )}

                    {!cv.is_main_cv && (
                      <Tooltip title="Đặt làm CV chính">
                        <IconButton size="small" disabled={setMainMutation.isPending} onClick={() => setMainMutation.mutate(cv.id)} sx={{ color: '#475569', '&:hover': { color: '#d97706', bgcolor: '#ffffff' } }}>
                          <StarBorderOutlinedIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>
                    )}

                    <Tooltip title="Xóa CV">
                      <IconButton size="small" onClick={() => setDeleteConfirmId(cv.id)} sx={{ color: '#94a3b8', '&:hover': { color: '#ef4444', bgcolor: '#ffffff' } }}>
                        <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Tooltip>
                  </Stack>

                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => router.push(localizeRoutePath(`/tao-cv?id=${cv.id}`, i18n.language))}
                    endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
                    sx={{
                      borderRadius: '8px',
                      bgcolor: '#1e40af',
                      color: '#ffffff',
                      fontWeight: 700,
                      fontSize: '0.725rem',
                      textTransform: 'none',
                      px: 1.75,
                      py: 0.5,
                      boxShadow: '0 2px 6px rgba(30, 64, 175, 0.25)',
                      '&:hover': { bgcolor: '#1d4ed8' },
                    }}
                  >
                    Mở Studio
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Card elevation={0} sx={{ p: 5, borderRadius: '20px', border: '1px solid #e2e8f0', bgcolor: '#ffffff', textAlign: 'center', maxWidth: 480, mx: 'auto' }}>
          <InsertDriveFileOutlinedIcon sx={{ fontSize: 48, color: '#94a3b8', mb: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 0.5 }}>
            Bạn chưa có bản CV nào
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.8rem', mb: 2.5 }}>
            Khám phá bộ sưu tập mẫu CV chuẩn chuyên nghiệp từ InfoHR và tạo bản CV đầu tiên chỉ trong 2 phút!
          </Typography>
          <Button
            component={Link}
            href={localizeRoutePath('/danh-sach-mau-cv', i18n.language)}
            variant="contained"
            startIcon={<AddIcon />}
            sx={{
              borderRadius: '10px',
              bgcolor: '#1e40af',
              color: '#ffffff',
              fontWeight: 700,
              textTransform: 'none',
              px: 3,
              py: 1,
              '&:hover': { bgcolor: '#1d4ed8' },
            }}
          >
            Khám phá mẫu CV ngay
          </Button>
        </Card>
      )}

      {/* ── Delete Confirmation Dialog ─────────────────────────────────── */}
      <Dialog
        open={Boolean(deleteConfirmId)}
        onClose={() => setDeleteConfirmId(null)}
        PaperProps={{ sx: { borderRadius: '16px', p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#0f172a' }}>Xác nhận xóa CV?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.85rem' }}>
            Bản CV này sẽ bị xóa vĩnh viễn khỏi hệ thống và không thể khôi phục.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteConfirmId(null)} variant="outlined" sx={{ borderRadius: '8px', color: '#64748b', borderColor: '#cbd5e1' }}>
            Hủy
          </Button>
          <Button
            onClick={() => deleteConfirmId && deleteMutation.mutate(deleteConfirmId)}
            variant="contained"
            color="error"
            disabled={deleteMutation.isPending}
            sx={{ borderRadius: '8px', fontWeight: 700 }}
          >
            Xác nhận xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

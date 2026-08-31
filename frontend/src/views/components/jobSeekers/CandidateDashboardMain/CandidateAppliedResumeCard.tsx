'use client';

import React from 'react';
import {
  Box,
  Card,
  Typography,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  IconButton,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import AutoFixHighOutlinedIcon from '@mui/icons-material/AutoFixHighOutlined';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { localizeRoutePath } from '@/configs/routeLocalization';
import toastMessages from '@/utils/toastMessages';
import resumeService from '@/services/resumeService';
import dayjs from 'dayjs';
import dynamic from 'next/dynamic';
import type { ExtendedResume } from '@/components/Features/CVDoc';

const CandidateResumePreviewModal = dynamic(
  () => import('../CandidateProfile/CandidateResumePreviewModal'),
  { ssr: false }
);

interface ResumeItemData {
  id: number | string;
  slug?: string;
  title: string;
  updatedDate: string;
  fileName?: string;
  fileUrl?: string;
  isSearchable?: boolean;
}

interface CandidateAppliedResumeCardProps {
  resume?: ExtendedResume | null;
  resumesList?: ExtendedResume[] | null;
  candidateName?: string;
  candidateEmail?: string;
  candidatePhone?: string;
  avatarUrl?: string;
  onRefresh?: () => void;
}

const CandidateAppliedResumeCard = ({
  resume,
  resumesList,
  candidateName = '',
  candidateEmail = '',
  candidatePhone = '',
  avatarUrl,
  onRefresh,
}: CandidateAppliedResumeCardProps) => {  // Support Multiple Resumes List
  const router = useRouter();
  const { i18n } = useTranslation();
  const [items, setItems] = React.useState<ResumeItemData[]>([]);
  const [isUploading, setIsUploading] = React.useState(false);
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  React.useEffect(() => {
    if (resumesList && resumesList.length > 0) {
      setItems(
        resumesList.map((r: ExtendedResume) => ({
          id: r.id,
          slug: r.slug,
          title: r.title || 'Hồ sơ ứng tuyển',
          updatedDate: r.updateAt || r.createAt ? dayjs(r.updateAt || r.createAt).format('DD/MM/YYYY') : '---',
          fileName: r.file?.name || (r.fileUrl ? r.fileUrl.split('/').pop()?.split('?')[0] : '') || (r.type === 'WEBSITE' ? 'Hồ sơ trực tuyến' : 'CV Đính kèm.pdf'),
          fileUrl: r.fileUrl || r.file?.url || r.file?.fileUrl,
          isSearchable: Boolean(r.isSearchable ?? r.isActive ?? true),
        }))
      );
    } else if (resume && resume.id != null) {
      setItems([
        {
          id: resume.id,
          slug: resume.slug,
          title: resume.title || 'Hồ sơ ứng tuyển',
          updatedDate: resume.updateAt || resume.createAt ? dayjs(resume.updateAt || resume.createAt).format('DD/MM/YYYY') : '---',
          fileName: resume.file?.name || (resume.fileUrl ? resume.fileUrl.split('/').pop()?.split('?')[0] : '') || 'Hồ sơ trực tuyến',
          fileUrl: resume.fileUrl || resume.file?.url || resume.file?.fileUrl,
          isSearchable: Boolean(resume.isSearchable ?? resume.isActive ?? true),
        },
      ]);
    } else {
      setItems([]);
    }
  }, [resumesList, resume]);

  // Preview Modal State
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [selectedResumeForPreview, setSelectedResumeForPreview] = React.useState<ExtendedResume | null>(null);

  // Edit Title State
  const [editOpen, setEditOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<ResumeItemData | null>(null);
  const [editTitleInput, setEditTitleInput] = React.useState('');

  // Delete Confirmation State
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deletingItem, setDeletingItem] = React.useState<ResumeItemData | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleOpenPreview = (item: ResumeItemData) => {
    setSelectedResumeForPreview({
      id: Number(item.id) || 0,
      slug: item.slug || '',
      title: item.title,
      fileUrl: item.fileUrl,
      file: item.fileUrl ? { url: item.fileUrl, name: item.fileName } : undefined,
    } as ExtendedResume);
    setPreviewOpen(true);
  };

  const handleOpenEdit = (item: ResumeItemData) => {
    setEditingItem(item);
    setEditTitleInput(item.title);
    setEditOpen(true);
  };

  const handleSaveTitle = async () => {
    if (!editTitleInput.trim() || !editingItem) return;
    try {
      setIsUpdating(true);
      const lookupKey = editingItem.slug || editingItem.id;
      await resumeService.updateResume(lookupKey, { title: editTitleInput.trim() });
      setItems((prev) =>
        prev.map((it) => (it.id === editingItem.id ? { ...it, title: editTitleInput.trim() } : it))
      );
      setEditOpen(false);
      setEditingItem(null);
      toastMessages.success('Cập nhật tên tiêu đề hồ sơ thành công!');
      if (onRefresh) onRefresh();
    } catch (err: any) {
      toastMessages.error(err?.response?.data?.errors?.detail || 'Cập nhật tên tiêu đề hồ sơ thất bại.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleOpenDelete = (item: ResumeItemData) => {
    setDeletingItem(item);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    try {
      setIsDeleting(true);
      const lookupKey = deletingItem.slug || deletingItem.id;
      await resumeService.deleteResume(lookupKey);
      setItems((prev) => prev.filter((it) => it.id !== deletingItem.id));
      setDeleteOpen(false);
      setDeletingItem(null);
      toastMessages.success('Xóa hồ sơ ứng tuyển thành công!');
      if (onRefresh) onRefresh();
    } catch (err: any) {
      toastMessages.error(err?.response?.data?.errors?.detail || 'Xóa hồ sơ ứng tuyển thất bại.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', file.name.replace(/\.[^/.]+$/, ''));
      try {
        setIsUploading(true);
        const res = await resumeService.addResume(formData);
        const resumeId = res.id ?? (res as any).data?.id;
        if (!resumeId) {
          throw new Error('Không nhận được mã định danh hồ sơ từ máy chủ.');
        }
        const newResumeItem: ResumeItemData = {
          id: resumeId,
          slug: res.slug || String(resumeId),
          title: res.title || file.name.replace(/\.[^/.]+$/, ''),
          updatedDate: dayjs().format('DD/MM/YYYY'),
          fileName: file.name,
          fileUrl: res.fileUrl || res.file?.fileUrl || res.file?.url,
          isSearchable: Boolean(res.isActive ?? true),
        };
        setItems((prev) => [newResumeItem, ...prev]);
        toastMessages.success('Tải CV mới lên thành công!');
        if (onRefresh) onRefresh();
      } catch (err: any) {
        const msg = err?.response?.data?.errors?.file?.[0] || err?.response?.data?.errors?.detail || err?.message || 'Tải CV lên thất bại. Vui lòng thử lại.';
        toastMessages.error(msg);
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
  };

  return (
    <Card
      elevation={0}
      sx={{
        p: 3,
        borderRadius: '20px',
        border: '1px solid #e2e8f0',
        backgroundColor: '#ffffff',
        boxShadow: '0 4px 20px -2px rgba(0,0,0,0.03)',
      }}
    >
      <input
        type="file"
        ref={fileInputRef}
        accept=".pdf,.doc,.docx"
        aria-label="Tải lên tệp CV"
        style={{ display: 'none' }}
        onChange={handleFileUpload}
      />

      {/* Card Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5, flexWrap: 'wrap', gap: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1rem' }}>
            Hồ sơ ứng tuyển
          </Typography>
          <Chip
            label={`${items.length} hồ sơ`}
            size="small"
            sx={{ backgroundColor: '#eff6ff', color: '#2563eb', fontWeight: 700, fontSize: '0.725rem', height: 22 }}
          />
        </Box>

        <Stack direction="row" spacing={1.25} sx={{ flexShrink: 0 }}>
          <Button
            size="small"
            variant="contained"
            startIcon={<AutoFixHighOutlinedIcon sx={{ fontSize: 16 }} />}
            onClick={() => router.push(localizeRoutePath('/ung-vien/trang-tri-cv', i18n.language))}
            sx={{
              borderRadius: '10px',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.8rem',
              textTransform: 'none',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              px: 2,
              py: 0.8,
              boxShadow: '0 2px 8px -1px rgba(37,99,235,0.3)',
              '&:hover': { backgroundColor: '#1d4ed8', boxShadow: '0 4px 12px -1px rgba(37,99,235,0.4)' },
            }}
          >
            Tạo CV từ Mẫu
          </Button>

          <Button
            size="small"
            disabled={isUploading}
            startIcon={isUploading ? <CircularProgress size={14} color="inherit" /> : <AddIcon sx={{ fontSize: 16 }} />}
            onClick={() => fileInputRef.current?.click()}
            sx={{
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              backgroundColor: '#ffffff',
              color: '#334155',
              fontWeight: 700,
              fontSize: '0.8rem',
              textTransform: 'none',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              px: 2,
              py: 0.8,
              '&:hover': { backgroundColor: '#f8fafc', borderColor: '#cbd5e1' },
            }}
          >
            {isUploading ? 'Đang tải lên...' : 'Tải CV mới'}
          </Button>
        </Stack>
      </Box>

      {/* List of Multiple Resumes */}
      {items.length === 0 ? (
        <Box sx={{ p: 4, textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
          <Typography variant="body2" sx={{ color: '#64748b', mb: 2, fontWeight: 500 }}>
            Bạn chưa có hồ sơ ứng tuyển nào. Bạn có thể tự tạo CV trực tuyến đẹp mắt hoặc tải file PDF từ máy tính.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="center">
            <Button
              size="small"
              variant="contained"
              startIcon={<AutoFixHighOutlinedIcon sx={{ fontSize: 16 }} />}
              onClick={() => router.push(localizeRoutePath('/ung-vien/trang-tri-cv', i18n.language))}
              sx={{
                borderRadius: '10px',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                textTransform: 'none',
                fontWeight: 700,
                boxShadow: '0 2px 8px -1px rgba(37,99,235,0.3)',
                '&:hover': { backgroundColor: '#1d4ed8' },
              }}
            >
              Tạo CV từ mẫu chuyên nghiệp
            </Button>
            <Button
              size="small"
              variant="outlined"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              startIcon={isUploading ? <CircularProgress size={14} color="inherit" /> : <AddIcon sx={{ fontSize: 16 }} />}
              sx={{ borderRadius: '10px', borderColor: '#2563eb', color: '#2563eb', textTransform: 'none', fontWeight: 700 }}
            >
              {isUploading ? 'Đang tải lên...' : 'Tải CV từ máy tính'}
            </Button>
          </Stack>
        </Box>
      ) : (
        <Stack spacing={2}>
          {items.map((item) => (
            <Box
              key={item.id}
              sx={{
                p: 2,
                borderRadius: '14px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                gap: 1.75,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  borderColor: '#bfdbfe',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 4px 16px -2px rgba(37,99,235,0.06)',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 42,
                    height: 42,
                    borderRadius: '12px',
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <InsertDriveFileOutlinedIcon sx={{ fontSize: 22 }} />
                </Box>

                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.925rem' }} noWrap>
                      {item.title}
                    </Typography>
                    <Chip
                      size="small"
                      label="Có thể tìm kiếm"
                      sx={{
                        backgroundColor: '#dcfce7',
                        color: '#15803d',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        height: 18,
                        flexShrink: 0,
                      }}
                    />
                  </Box>

                  <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.775rem', display: 'block', mt: 0.25 }}>
                    Tệp: <strong>{item.fileName || 'CV.pdf'}</strong> • Cập nhật: {item.updatedDate}
                  </Typography>
                </Box>
              </Box>

              {/* Action Buttons: Preview, Edit Title, Delete */}
              <Stack direction="row" spacing={1} alignItems="center">
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => handleOpenPreview(item)}
                  startIcon={<VisibilityOutlinedIcon sx={{ fontSize: 15 }} />}
                  sx={{
                    flexGrow: 1,
                    borderRadius: '10px',
                    borderColor: '#cbd5e1',
                    color: '#0f172a',
                    fontWeight: 700,
                    fontSize: '0.775rem',
                    textTransform: 'none',
                    py: 0.65,
                    '&:hover': { borderColor: '#2563eb', color: '#2563eb', backgroundColor: '#eff6ff' },
                  }}
                >
                  Xem bản xem trước
                </Button>

                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => handleOpenEdit(item)}
                  startIcon={<EditOutlinedIcon sx={{ fontSize: 15 }} />}
                  sx={{
                    borderRadius: '10px',
                    borderColor: '#cbd5e1',
                    color: '#475569',
                    fontWeight: 700,
                    fontSize: '0.775rem',
                    textTransform: 'none',
                    py: 0.65,
                    px: 1.5,
                    '&:hover': { borderColor: '#0f172a', color: '#0f172a', backgroundColor: '#f8fafc' },
                  }}
                >
                  Sửa tên
                </Button>

                <Tooltip title="Xóa hồ sơ ứng tuyển này">
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleOpenDelete(item)}
                    startIcon={<DeleteOutlineIcon sx={{ fontSize: 15 }} />}
                    sx={{
                      borderRadius: '10px',
                      borderColor: '#fecdd3',
                      color: '#dc2626',
                      fontWeight: 700,
                      fontSize: '0.775rem',
                      textTransform: 'none',
                      py: 0.65,
                      px: 1.5,
                      '&:hover': { borderColor: '#dc2626', backgroundColor: '#ffe4e6' },
                    }}
                  >
                    Xóa
                  </Button>
                </Tooltip>
              </Stack>
            </Box>
          ))}
        </Stack>
      )}

      {/* Popup Preview Modal (Does not navigate to another route) */}
      <CandidateResumePreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        resume={selectedResumeForPreview}
        candidateName={candidateName}
        candidateEmail={candidateEmail}
        candidatePhone={candidatePhone}
        avatarUrl={avatarUrl}
      />

      {/* Edit Resume Title Dialog */}
      <Dialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        aria-labelledby="edit-resume-dialog-title"
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: '20px', p: 1 } }}
      >
        <DialogTitle id="edit-resume-dialog-title" sx={{ fontWeight: 800, color: '#0f172a' }}>Chỉnh sửa tên Hồ sơ ứng tuyển</DialogTitle>
        <DialogContent dividers sx={{ borderColor: '#f1f5f9' }}>
          <Box sx={{ pt: 1 }}>
            <Typography component="label" htmlFor="edit-resume-title-input" variant="caption" sx={{ color: '#0f172a', fontWeight: 700, mb: 0.5, display: 'block', cursor: 'pointer' }}>
              Tên tiêu đề hồ sơ *
            </Typography>
            <TextField
              id="edit-resume-title-input"
              fullWidth
              size="small"
              value={editTitleInput}
              onChange={(e) => setEditTitleInput(e.target.value)}
              placeholder="VD: Kế toán trưởng / Kỹ sư Xây dựng"
              inputProps={{ 'aria-label': 'Tên tiêu đề hồ sơ' }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button disabled={isUpdating} onClick={() => setEditOpen(false)} sx={{ color: '#64748b', fontWeight: 700, borderRadius: '10px' }}>
            Hủy
          </Button>
          <Button
            variant="contained"
            disabled={isUpdating}
            startIcon={isUpdating ? <CircularProgress size={14} color="inherit" /> : undefined}
            onClick={handleSaveTitle}
            sx={{ borderRadius: '10px', backgroundColor: '#2563eb', fontWeight: 700, px: 3 }}
          >
            {isUpdating ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteOpen}
        onClose={() => !isDeleting && setDeleteOpen(false)}
        aria-labelledby="delete-resume-dialog-title"
        aria-describedby="delete-resume-dialog-desc"
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: '20px', p: 1 } }}
      >
        <DialogTitle id="delete-resume-dialog-title" sx={{ fontWeight: 800, color: '#dc2626' }}>Xóa Hồ sơ ứng tuyển</DialogTitle>
        <DialogContent dividers sx={{ borderColor: '#f1f5f9' }}>
          <Typography id="delete-resume-dialog-desc" variant="body2" sx={{ color: '#334155', lineHeight: 1.6 }}>
            Bạn có chắc chắn muốn xóa hồ sơ <strong>&quot;{deletingItem?.title}&quot;</strong>? Thao tác này không thể hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button disabled={isDeleting} onClick={() => setDeleteOpen(false)} sx={{ color: '#64748b', fontWeight: 700, borderRadius: '10px' }}>
            Hủy
          </Button>
          <Button
            variant="contained"
            color="error"
            disabled={isDeleting}
            startIcon={isDeleting ? <CircularProgress size={14} color="inherit" /> : undefined}
            onClick={handleConfirmDelete}
            sx={{ borderRadius: '10px', backgroundColor: '#dc2626', fontWeight: 700, px: 3 }}
          >
            {isDeleting ? 'Đang xóa...' : 'Xóa hồ sơ'}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default CandidateAppliedResumeCard;

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
} from '@mui/material';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import toastMessages from '@/utils/toastMessages';
import dayjs from 'dayjs';
import CandidateResumePreviewModal from '../CandidateProfile/CandidateResumePreviewModal';
import type { ExtendedResume } from '@/components/Features/CVDoc';

interface ResumeItemData {
  id: number | string;
  title: string;
  updatedDate: string;
  fileName?: string;
  isSearchable?: boolean;
}

interface CandidateAppliedResumeCardProps {
  resume?: ExtendedResume | null;
  resumesList?: ExtendedResume[] | null;
  candidateName?: string;
  candidateEmail?: string;
  candidatePhone?: string;
  avatarUrl?: string;
}

const CandidateAppliedResumeCard = ({
  resume,
  resumesList,
  candidateName = '',
  candidateEmail = '',
  candidatePhone = '',
  avatarUrl,
}: CandidateAppliedResumeCardProps) => {  // Support Multiple Resumes List
  const [items, setItems] = React.useState<ResumeItemData[]>([]);

  React.useEffect(() => {
    if (resumesList && resumesList.length > 0) {
      setItems(
        resumesList.map((r: any) => ({
          id: r.id,
          title: r.title || 'Hồ sơ ứng tuyển',
          updatedDate: r.updateAt || r.createAt ? (dayjs as any)(r.updateAt || r.createAt).format('DD/MM/YYYY') : '---',
          fileName: r.file?.name || (r.fileUrl ? r.fileUrl.split('/').pop() : '') || (r.type === 'WEBSITE' ? 'Hồ sơ trực tuyến' : 'CV Đính kèm'),
          isSearchable: Boolean(r.isSearchable ?? r.isActive ?? true),
        }))
      );
    } else if (resume) {
      setItems([
        {
          id: (resume as any).id || 1,
          title: resume.title || 'Hồ sơ ứng tuyển',
          updatedDate: (resume as any).updateAt ? (dayjs as any)((resume as any).updateAt).format('DD/MM/YYYY') : '---',
          fileName: (resume as any).file?.name || ((resume as any).fileUrl ? (resume as any).fileUrl.split('/').pop() : '') || 'Hồ sơ trực tuyến',
          isSearchable: true,
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
  const [editingId, setEditingId] = React.useState<number | string | null>(null);
  const [editTitleInput, setEditTitleInput] = React.useState('');

  // Delete Confirmation State
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deletingItem, setDeletingItem] = React.useState<ResumeItemData | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleOpenPreview = (item: ResumeItemData) => {
    setSelectedResumeForPreview({
      title: item.title,
    } as ExtendedResume);
    setPreviewOpen(true);
  };

  const handleOpenEdit = (item: ResumeItemData) => {
    setEditingId(item.id);
    setEditTitleInput(item.title);
    setEditOpen(true);
  };

  const handleSaveTitle = () => {
    if (!editTitleInput.trim() || !editingId) return;
    setItems((prev) =>
      prev.map((it) => (it.id === editingId ? { ...it, title: editTitleInput.trim() } : it))
    );
    setEditOpen(false);
    toastMessages.success('Cập nhật tên tiêu đề hồ sơ thành công!');
  };

  const handleOpenDelete = (item: ResumeItemData) => {
    setDeletingItem(item);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!deletingItem) return;
    setItems((prev) => prev.filter((it) => it.id !== deletingItem.id));
    setDeleteOpen(false);
    setDeletingItem(null);
    toastMessages.success('Xóa hồ sơ ứng tuyển thành công!');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const newResumeItem: ResumeItemData = {
        id: Date.now(),
        title: file.name.replace(/\.[^/.]+$/, ''),
        updatedDate: 'Mới cập nhật',
        fileName: file.name,
        isSearchable: true,
      };
      setItems((prev) => [newResumeItem, ...prev]);
      toastMessages.success('Tải CV mới lên thành công!');
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
        style={{ display: 'none' }}
        onChange={handleFileUpload}
      />

      {/* Card Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a' }}>
            Hồ sơ ứng tuyển
          </Typography>
          <Chip
            label={`${items.length} hồ sơ`}
            size="small"
            sx={{ backgroundColor: '#eff6ff', color: '#2563eb', fontWeight: 700, fontSize: '0.725rem', height: 22 }}
          />
        </Box>

        <Button
          size="small"
          startIcon={<AddIcon sx={{ fontSize: 16 }} />}
          onClick={() => fileInputRef.current?.click()}
          sx={{
            borderRadius: '10px',
            color: '#2563eb',
            fontWeight: 700,
            fontSize: '0.775rem',
            textTransform: 'none',
            '&:hover': { backgroundColor: '#eff6ff' },
          }}
        >
          Tải CV mới
        </Button>
      </Box>

      {/* List of Multiple Resumes */}
      {items.length === 0 ? (
        <Box sx={{ p: 4, textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '14px', border: '1px dashed #cbd5e1' }}>
          <Typography variant="body2" sx={{ color: '#64748b', mb: 1.5, fontWeight: 500 }}>
            Bạn chưa có hồ sơ ứng tuyển nào. Hãy tải CV mới từ máy tính để ứng tuyển công việc.
          </Typography>
          <Button
            size="small"
            variant="contained"
            onClick={() => fileInputRef.current?.click()}
            startIcon={<AddIcon sx={{ fontSize: 16 }} />}
            sx={{ borderRadius: '10px', backgroundColor: '#2563eb', textTransform: 'none', fontWeight: 700 }}
          >
            Tải CV ngay
          </Button>
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
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: '20px', p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#0f172a' }}>Chỉnh sửa tên Hồ sơ ứng tuyển</DialogTitle>
        <DialogContent dividers sx={{ borderColor: '#f1f5f9' }}>
          <Box sx={{ pt: 1 }}>
            <Typography variant="caption" sx={{ color: '#0f172a', fontWeight: 700, mb: 0.5, display: 'block' }}>
              Tên tiêu đề hồ sơ *
            </Typography>
            <TextField
              fullWidth
              size="small"
              value={editTitleInput}
              onChange={(e) => setEditTitleInput(e.target.value)}
              placeholder="VD: Kế toán trưởng / Kỹ sư Xây dựng"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setEditOpen(false)} sx={{ color: '#64748b', fontWeight: 700, borderRadius: '10px' }}>
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveTitle}
            sx={{ borderRadius: '10px', backgroundColor: '#2563eb', fontWeight: 700, px: 3 }}
          >
            Lưu thay đổi
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: '20px', p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#dc2626' }}>Xóa Hồ sơ ứng tuyển</DialogTitle>
        <DialogContent dividers sx={{ borderColor: '#f1f5f9' }}>
          <Typography variant="body2" sx={{ color: '#334155', lineHeight: 1.6 }}>
            Bạn có chắc chắn muốn xóa hồ sơ <strong>&quot;{deletingItem?.title}&quot;</strong>? Thao tác này không thể hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteOpen(false)} sx={{ color: '#64748b', fontWeight: 700, borderRadius: '10px' }}>
            Hủy
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmDelete}
            sx={{ borderRadius: '10px', backgroundColor: '#dc2626', fontWeight: 700, px: 3 }}
          >
            Xóa hồ sơ
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default CandidateAppliedResumeCard;

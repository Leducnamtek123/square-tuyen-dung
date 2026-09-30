'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  Typography,
  LinearProgress,
  Stack,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Grid2 as Grid,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import toastMessages from '@/utils/toastMessages';
import commonService from '@/services/commonService';
import hrmService, {
  type NativeOnboardingProcess,
  type NativeOnboardingTaskItem,
} from '@/services/hrmService';
import { getSafeExternalOpenUrl } from '@/utils/safeExternalUrl';

interface Props {
  process?: NativeOnboardingProcess | null;
  onRefresh: () => void;
}

export const PreboardingChecklistCard: React.FC<Props> = ({ process, onRefresh }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTask, setActiveTask] = useState<NativeOnboardingTaskItem | null>(null);

  // Form states for submission
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Bank Form
  const [bankName, setBankName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankAccountHolder, setBankAccountHolder] = useState('');

  // Tax Form
  const [taxId, setTaxId] = useState('');
  const [dependentsCount, setDependentsCount] = useState<number>(0);

  if (!process || process.stage === 'COMPLETED') {
    return null;
  }

  const tasks: NativeOnboardingTaskItem[] = process.tasks || [];
  const candidateTasks = tasks.filter(
    (t: NativeOnboardingTaskItem) => t.assigned_role === 'CANDIDATE' || t.stage === 'PREBOARDING_DOCS'
  );
  const progress = process.progress_percent ?? 0;

  const handleOpenTaskModal = (task: NativeOnboardingTaskItem) => {
    setActiveTask(task);
    setSelectedFile(null);
    setBankName('');
    setBankAccountNumber('');
    setBankAccountHolder('');
    setTaxId('');
    setDependentsCount(0);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setActiveTask(null);
  };

  const handleSubmitTask = async () => {
    if (!activeTask) return;
    setSubmitting(true);

    try {
      if (activeTask.code === 'BANK_ACCOUNT') {
        if (!bankAccountNumber.trim() || !bankName.trim()) {
          toastMessages.error('Vui lòng điền đầy đủ tên ngân hàng và số tài khoản.');
          setSubmitting(false);
          return;
        }
        await hrmService.submitSelfOnboardingTask(activeTask.id, {
          bank_name: bankName,
          bank_account_number: bankAccountNumber,
          bank_account_holder: bankAccountHolder,
        });
      } else if (activeTask.code === 'TAX_INFO') {
        if (!taxId.trim()) {
          toastMessages.error('Vui lòng nhập mã số thuế cá nhân.');
          setSubmitting(false);
          return;
        }
        await hrmService.submitSelfOnboardingTask(activeTask.id, {
          tax_id: taxId,
          dependents_count: Number(dependentsCount) || 0,
        });
      } else {
        // Document Upload Task
        if (!selectedFile) {
          toastMessages.error('Vui lòng chọn tệp tài liệu để tải lên.');
          setSubmitting(false);
          return;
        }
        setIsUploading(true);
        const uploadRes = await commonService.uploadFile(selectedFile, 'CV');
        setIsUploading(false);

        const docType = activeTask.code === 'UPLOAD_DEGREE' ? 'DEGREE' : 'IDENTITY_CARD';
        await hrmService.submitSelfOnboardingTask(activeTask.id, {
          file_url: uploadRes.url,
          name: selectedFile.name,
          document_type: docType,
        });
      }

      toastMessages.success('Nộp thông tin thành công!');
      handleCloseModal();
      onRefresh();
    } catch (err: any) {
      console.error('Error submitting onboarding task:', err);
      toastMessages.error(err?.message || 'Có lỗi xảy ra khi nộp thông tin.');
    } finally {
      setIsUploading(false);
      setSubmitting(false);
    }
  };

  return (
    <Card
      elevation={0}
      sx={{
        p: 3,
        borderRadius: '16px',
        bgcolor: '#ffffff',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
        mb: 3,
      }}
    >
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.3px' }}>
            📋 Thủ tục Nhận việc & Tiếp nhận hồ sơ số
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', mt: 0.25 }}>
            Vui lòng hoàn tất nộp giấy tờ cần thiết để bộ phận Nhân sự chuẩn bị hợp đồng và trang thiết bị làm việc.
          </Typography>
        </Box>
        <Chip
          label={`Tiến độ: ${progress}%`}
          color={progress === 100 ? 'success' : 'primary'}
          sx={{ fontWeight: 700, mt: { xs: 1, sm: 0 } }}
        />
      </Stack>

      <Box sx={{ width: '100%', mb: 3 }}>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 8,
            borderRadius: 4,
            bgcolor: '#f1f5f9',
            '& .MuiLinearProgress-bar': {
              borderRadius: 4,
              background: 'linear-gradient(90deg, #3b82f6 0%, #10b981 100%)',
            },
          }}
        />
      </Box>

      {/* Task Checklist Items */}
      <Stack spacing={1.5}>
        {candidateTasks.map((task: NativeOnboardingTaskItem) => {
          const isDone = task.is_completed;
          const hasRejection = Boolean(task.rejection_note);

          return (
            <Box
              key={task.id}
              sx={{
                p: 2,
                borderRadius: '12px',
                border: '1px solid',
                borderColor: hasRejection ? '#fecaca' : isDone ? '#bbf7d0' : '#e2e8f0',
                bgcolor: hasRejection ? '#fef2f2' : isDone ? '#f0fdf4' : '#fafafa',
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', sm: 'center' },
                gap: 1.5,
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="flex-start">
                {isDone ? (
                  <CheckCircleIcon sx={{ color: '#16a34a', fontSize: 22, mt: 0.25 }} />
                ) : hasRejection ? (
                  <ErrorOutlineIcon sx={{ color: '#dc2626', fontSize: 22, mt: 0.25 }} />
                ) : (
                  <RadioButtonUncheckedIcon sx={{ color: '#94a3b8', fontSize: 22, mt: 0.25 }} />
                )}

                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                    {task.title} {task.is_required && <span style={{ color: '#dc2626' }}>*</span>}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.8125rem' }}>
                    {task.description}
                  </Typography>
                  {hasRejection && (
                    <Typography variant="caption" sx={{ color: '#b91c1c', fontWeight: 600, display: 'block', mt: 0.5 }}>
                      ⚠️ Yêu cầu nộp lại: {task.rejection_note}
                    </Typography>
                  )}
                  {task.document_url && (
                    <Typography variant="caption" sx={{ color: '#2563eb', display: 'block', mt: 0.5 }}>
                      Đã nộp: <a href={getSafeExternalOpenUrl(task.document_url)} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', fontWeight: 600 }}>{task.document_name || 'Xem tài liệu'}</a>
                    </Typography>
                  )}
                </Box>
              </Stack>

              <Button
                variant={isDone ? 'outlined' : 'contained'}
                size="small"
                color={hasRejection ? 'error' : isDone ? 'inherit' : 'primary'}
                onClick={() => handleOpenTaskModal(task)}
                startIcon={
                  task.code === 'BANK_ACCOUNT' ? (
                    <CreditCardIcon sx={{ fontSize: 16 }} />
                  ) : task.code === 'TAX_INFO' ? (
                    <ReceiptLongIcon sx={{ fontSize: 16 }} />
                  ) : (
                    <UploadFileIcon sx={{ fontSize: 16 }} />
                  )
                }
                sx={{
                  textTransform: 'none',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.8125rem',
                  whiteSpace: 'nowrap',
                  alignSelf: { xs: 'flex-end', sm: 'center' },
                }}
              >
                {hasRejection ? 'Nộp lại ngay' : isDone ? 'Cập nhật lại' : 'Nộp thông tin'}
              </Button>
            </Box>
          );
        })}
      </Stack>

      {/* Task Submission Modal */}
      <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, color: '#0f172a' }}>
          {activeTask?.title}
        </DialogTitle>
        <DialogContent dividers>
          {activeTask?.rejection_note && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              <strong>Lưu ý từ Nhân sự:</strong> {activeTask.rejection_note}
            </Alert>
          )}

          {activeTask?.code === 'BANK_ACCOUNT' ? (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Tên Ngân hàng (VD: Vietcombank, Techcombank, MBBank)"
                fullWidth
                size="small"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="Nhập tên ngân hàng..."
              />
              <TextField
                label="Số tài khoản ngân hàng chính chủ"
                fullWidth
                size="small"
                value={bankAccountNumber}
                onChange={(e) => setBankAccountNumber(e.target.value)}
                placeholder="Nhập số tài khoản..."
              />
              <TextField
                label="Tên chủ tài khoản (Viết hoa không dấu)"
                fullWidth
                size="small"
                value={bankAccountHolder}
                onChange={(e) => setBankAccountHolder(e.target.value)}
                placeholder="VD: NGUYEN VAN A"
              />
            </Stack>
          ) : activeTask?.code === 'TAX_INFO' ? (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Mã số thuế thu nhập cá nhân (MST)"
                fullWidth
                size="small"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                placeholder="Nhập 10 chữ số mã số thuế..."
              />
              <TextField
                label="Số người phụ thuộc đăng ký giảm trừ gia cảnh"
                type="number"
                fullWidth
                size="small"
                value={dependentsCount}
                onChange={(e) => setDependentsCount(Number(e.target.value))}
              />
            </Stack>
          ) : (
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" sx={{ color: '#475569', mb: 2 }}>
                Định dạng hỗ trợ: PDF, JPG, PNG. Dung lượng tối đa 10MB.
              </Typography>
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setSelectedFile(e.target.files[0]);
                  }
                }}
                style={{ width: '100%', padding: '12px', border: '1px dashed #cbd5e1', borderRadius: '8px' }}
              />
              {selectedFile && (
                <Typography variant="caption" sx={{ color: '#16a34a', display: 'block', mt: 1, fontWeight: 700 }}>
                  ✓ Đã chọn: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseModal} sx={{ textTransform: 'none', color: '#64748b' }}>
            Hủy
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmitTask}
            disabled={submitting || isUploading}
            sx={{ textTransform: 'none', borderRadius: '8px', fontWeight: 700 }}
          >
            {submitting || isUploading ? <CircularProgress size={20} color="inherit" /> : 'Xác nhận nộp'}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default PreboardingChecklistCard;

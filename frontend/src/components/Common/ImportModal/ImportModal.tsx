import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  IconButton,
  Button,
  CircularProgress,
  useMediaQuery,
  useTheme,
  Stack,
  Tooltip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import type { ImportModalProps } from './types';
import { useImportStateMachine } from './useImportStateMachine';
import { ImportUploadStep } from './ImportUploadStep';
import { ImportPreviewStep } from './ImportPreviewStep';
import { ImportProgressStep } from './ImportProgressStep';
import { ImportResultStep } from './ImportResultStep';

export const ImportModal: React.FC<ImportModalProps> = (props) => {
  const { open, onClose, title } = props;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const {
    step,
    definition,
    isDefinitionLoading,
    file,
    setFile,
    mode,
    setMode,
    matchBy,
    setMatchBy,
    isValidating,
    previewData,
    previewFilter,
    setPreviewFilter,
    validationError,
    isCommitting,
    commitJob,
    commitError,
    activitySteps,
    progressPercent,
    currentStepText,
    elapsedSeconds,
    handleDownloadTemplate,
    handleStartValidate,
    handleDownloadErrorReport,
    handleConfirmCommit,
    handleBackToUpload,
  } = useImportStateMachine(props);

  const displayTitle =
    title ||
    (definition ? `Nhập dữ liệu: ${definition.label}` : 'Nhập dữ liệu vào hệ thống (Import)');

  const canConfirmImport =
    previewData &&
    (previewData.invalidRows === 0 || !definition?.atomicImport) &&
    previewData.validRows > 0;

  return (
    <Dialog
      open={open}
      onClose={isCommitting ? undefined : onClose}
      fullScreen={isMobile}
      maxWidth={false}
      aria-labelledby="import-modal-title"
      PaperProps={{
        sx: {
          width: isMobile ? '100%' : isTablet ? 850 : 980,
          maxWidth: '95vw',
          borderRadius: isMobile ? 0 : '16px',
          border: '1px solid #E5E7EB',
          boxShadow: '0px 20px 25px -5px rgba(0, 0, 0, 0.1), 0px 10px 10px -5px rgba(0, 0, 0, 0.04)',
          overflow: 'hidden',
          backgroundColor: '#FFFFFF',
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        id="import-modal-title"
        sx={{
          py: 2,
          px: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #E5E7EB',
          backgroundColor: '#FFFFFF',
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '8px',
              backgroundColor: '#E0F2FE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <UploadFileOutlinedIcon sx={{ color: '#0284C7', fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#111827', lineHeight: 1.2 }}>
              {displayTitle}
            </Typography>
            <Typography variant="caption" sx={{ color: '#6B7280' }}>
              Bước:{' '}
              {step === 'upload'
                ? '1. Chọn file & Chế độ'
                : step === 'preview'
                ? '2. Xem trước & Kiểm tra hợp lệ'
                : step === 'committing'
                ? '3. Đang lưu trữ'
                : '4. Kết quả'}
            </Typography>
          </Box>
        </Stack>

        <IconButton
          aria-label="close"
          onClick={onClose}
          disabled={isCommitting}
          size="small"
          sx={{
            color: '#9CA3AF',
            '&:hover': { color: '#4B5563', backgroundColor: '#F3F4F6' },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      {/* Content */}
      <DialogContent sx={{ p: { xs: 2.5, sm: 3.5 }, overflowY: 'auto' }}>
        {isDefinitionLoading ? (
          <Box sx={{ py: 8, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <CircularProgress size={32} sx={{ color: '#0284C7' }} />
          </Box>
        ) : step === 'upload' ? (
          <ImportUploadStep
            definition={definition}
            file={file}
            onFileChange={setFile}
            mode={mode}
            onModeChange={setMode}
            matchBy={matchBy}
            onMatchByChange={setMatchBy}
            onDownloadTemplate={handleDownloadTemplate}
            error={validationError}
          />
        ) : step === 'preview' && previewData ? (
          <ImportPreviewStep
            previewData={previewData}
            definition={definition}
            filter={previewFilter}
            onFilterChange={setPreviewFilter}
            onDownloadErrorReport={handleDownloadErrorReport}
          />
        ) : step === 'committing' ? (
          <ImportProgressStep
            activitySteps={activitySteps}
            progressPercent={progressPercent}
            currentStepText={currentStepText}
            elapsedSeconds={elapsedSeconds}
            commitJob={commitJob}
          />
        ) : (
          <ImportResultStep
            commitJob={commitJob}
            commitError={commitError}
            onClose={onClose}
            onDownloadErrorReport={handleDownloadErrorReport}
          />
        )}
      </DialogContent>

      {/* Actions */}
      {step !== 'committing' && step !== 'result' && (
        <DialogActions
          sx={{
            py: 2,
            px: 3,
            borderTop: '1px solid #E5E7EB',
            backgroundColor: '#F9FAFB',
            justifyContent: 'space-between',
          }}
        >
          {step === 'upload' ? (
            <>
              <Button
                variant="outlined"
                color="inherit"
                onClick={onClose}
                sx={{
                  textTransform: 'none',
                  borderRadius: '8px',
                  borderColor: '#D1D5DB',
                  color: '#4B5563',
                }}
              >
                Hủy
              </Button>

              <Button
                variant="contained"
                endIcon={isValidating ? <CircularProgress size={16} color="inherit" /> : <ArrowForwardIcon />}
                disabled={!file || isValidating}
                onClick={handleStartValidate}
                sx={{
                  backgroundColor: '#0284C7',
                  '&:hover': { backgroundColor: '#0369A1' },
                  textTransform: 'none',
                  fontWeight: 600,
                  borderRadius: '8px',
                  px: 3,
                }}
              >
                {isValidating ? 'Đang kiểm tra...' : 'Tiếp tục kiểm tra dữ liệu'}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outlined"
                color="inherit"
                startIcon={<ArrowBackIcon />}
                onClick={handleBackToUpload}
                disabled={isCommitting}
                sx={{
                  textTransform: 'none',
                  borderRadius: '8px',
                  borderColor: '#D1D5DB',
                  color: '#4B5563',
                }}
              >
                Quay lại chọn file
              </Button>

              <Tooltip
                title={
                  !canConfirmImport && definition?.atomicImport && previewData && previewData.invalidRows > 0
                    ? 'Chế độ an toàn 100%: Phải sửa hết các dòng lỗi trước khi lưu vào hệ thống.'
                    : ''
                }
                arrow
              >
                <span>
                  <Button
                    variant="contained"
                    startIcon={<CheckCircleOutlineIcon />}
                    disabled={!canConfirmImport || isCommitting}
                    onClick={handleConfirmCommit}
                    sx={{
                      backgroundColor: '#059669',
                      '&:hover': { backgroundColor: '#047857' },
                      textTransform: 'none',
                      fontWeight: 600,
                      borderRadius: '8px',
                      px: 3.5,
                      '&.Mui-disabled': {
                        backgroundColor: '#E5E7EB',
                        color: '#9CA3AF',
                      },
                    }}
                  >
                    Xác nhận nhập ({previewData?.validRows ?? 0} dòng)
                  </Button>
                </span>
              </Tooltip>
            </>
          )}
        </DialogActions>
      )}
    </Dialog>
  );
};
export default ImportModal;

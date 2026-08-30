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
  Grid2 as Grid,
  useMediaQuery,
  useTheme,
  Stack,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { useTranslation } from 'react-i18next';
import type { ExportModalProps } from './types';
import { useExportStateMachine } from './useExportStateMachine';
import { ExportOptions } from './ExportOptions';
import { ExportPreview } from './ExportPreview';
import { ExportProgress } from './ExportProgress';
import { ExportSuccess } from './ExportSuccess';
import { ExportError } from './ExportError';

export const ExportModal: React.FC<ExportModalProps> = (props) => {
  const { t } = useTranslation('common');
  const { open, onClose, title = t('export.title', 'Xuất dữ liệu (Export)') } = props;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const {
    status,
    format,
    setFormat,
    scope,
    setScope,
    fileName,
    setFileName,
    columns,
    previewRows,
    isPreviewLoading,
    progress,
    progressStepText,
    generatedFileName,
    exportRecordCount,
    errorMessage,
    handleToggleColumn,
    handleSelectAllColumns,
    handleClearAllColumns,
    handleStartGenerate,
    handleDownload,
    handleRetry,
  } = useExportStateMachine(props);

  return (
    <Dialog
      open={open}
      onClose={status === 'generating' ? undefined : onClose}
      fullScreen={isMobile}
      maxWidth={false}
      aria-labelledby="export-modal-title"
      aria-describedby="export-modal-description"
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: 'rgba(15, 23, 42, 0.55)',
            backdropFilter: 'blur(4px)',
          },
        },
      }}
      PaperProps={{
        sx: {
          width: isMobile ? '100%' : isTablet ? 850 : 1000,
          maxWidth: '95vw',
          borderRadius: isMobile ? 0 : '16px',
          border: '1px solid #E5E7EB',
          boxShadow: '0px 20px 25px -5px rgba(0, 0, 0, 0.1), 0px 10px 10px -5px rgba(0, 0, 0, 0.04)',
          overflow: 'hidden',
          backgroundColor: '#FFFFFF',
          animation: open ? 'scaleUp 200ms cubic-bezier(0.16, 1, 0.3, 1)' : 'none',
          '@keyframes scaleUp': {
            '0%': { transform: 'scale(0.96)', opacity: 0 },
            '100%': { transform: 'scale(1)', opacity: 1 },
          },
        },
      }}
    >
      {/* Modal Header */}
      <DialogTitle
        id="export-modal-title"
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
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              backgroundColor: '#EFF6FF',
              color: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FileDownloadOutlinedIcon sx={{ fontSize: 22 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827', fontSize: '1.05rem', lineHeight: 1.2 }}>
              {title}
            </Typography>
            <Typography variant="caption" sx={{ color: '#6B7280', fontSize: '0.75rem' }}>
              {t('export.subtitle', 'Cấu hình phạm vi, xem trước và tải xuống file dữ liệu')}
            </Typography>
          </Box>
        </Stack>

        {status !== 'generating' && (
          <IconButton
            onClick={onClose}
            size="small"
            aria-label={t('common.actions.close', 'Đóng')}
            sx={{
              color: '#9CA3AF',
              borderRadius: '8px',
              '&:hover': { backgroundColor: '#F3F4F6', color: '#111827' },
            }}
          >
            <CloseIcon sx={{ fontSize: 20 }} />
          </IconButton>
        )}
      </DialogTitle>

      {/* Modal Content */}
      <DialogContent sx={{ p: isMobile ? 2 : 3, backgroundColor: '#FFFFFF' }}>
        {status === 'config' && (
          <Grid container spacing={3}>
            {/* Left Column - Options */}
            <Grid size={{ xs: 12, md: 5 }}>
              <ExportOptions
                fileName={fileName}
                onFileNameChange={setFileName}
                format={format}
                onFormatChange={setFormat}
                scope={scope}
                onScopeChange={setScope}
                columns={columns}
                onToggleColumn={handleToggleColumn}
                onSelectAllColumns={handleSelectAllColumns}
                onClearAllColumns={handleClearAllColumns}
                totalRecords={props.totalRecords}
              />
            </Grid>

            {/* Right Column - Preview */}
            <Grid size={{ xs: 12, md: 7 }}>
              <ExportPreview
                columns={columns}
                rows={previewRows}
                isLoading={isPreviewLoading}
                totalRecords={
                  scope === 'selected'
                    ? props.totalRecords?.selected
                    : scope === 'filtered'
                    ? props.totalRecords?.filtered
                    : props.totalRecords?.all
                }
              />
            </Grid>
          </Grid>
        )}

        {status === 'generating' && (
          <ExportProgress
            progress={progress}
            stepText={progressStepText}
            format={format}
            fileName={fileName}
          />
        )}

        {status === 'success' && (
          <ExportSuccess
            fileName={generatedFileName}
            recordCount={exportRecordCount}
            onDownload={handleDownload}
            onClose={onClose}
          />
        )}

        {status === 'error' && (
          <ExportError
            errorMessage={errorMessage}
            onRetry={handleRetry}
            onClose={onClose}
          />
        )}
      </DialogContent>

      {/* Footer - Only shown during config state */}
      {status === 'config' && (
        <DialogActions
          sx={{
            py: 2,
            px: 3,
            borderTop: '1px solid #E5E7EB',
            backgroundColor: '#FAFAFA',
            justifyContent: 'space-between',
          }}
        >
          <Button
            variant="outlined"
            onClick={onClose}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600,
              color: '#374151',
              borderColor: '#D1D5DB',
              px: 2.5,
              '&:hover': {
                borderColor: '#9CA3AF',
                backgroundColor: '#FFFFFF',
              },
            }}
          >
            {t('common.actions.cancel', 'Hủy')}
          </Button>

          <Button
            variant="contained"
            onClick={handleStartGenerate}
            startIcon={<PlayArrowIcon />}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600,
              backgroundColor: '#2563EB',
              px: 3,
              py: 1,
              boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
              '&:hover': {
                backgroundColor: '#1D4ED8',
                boxShadow: '0px 2px 4px rgba(37, 99, 235, 0.25)',
              },
            }}
          >
            {t('export.exportButton', 'Xuất file dữ liệu')}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

import React from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import { useTranslation } from 'react-i18next';

interface PreviewModalProps {
  open: boolean;
  onClose: () => void;
  htmlContent: string;
  title?: string;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({
  open,
  onClose,
  htmlContent,
  title,
}) => {
  const { t } = useTranslation('common');
  const modalTitle = title || t('editor.preview.modalTitle', 'Xem Trước Bài Viết (Live Preview)');

  // Compute basic stats
  const plainText = htmlContent.replace(/<[^>]*>?/gm, ' ').trim();
  const wordCount = plainText ? plainText.split(/\s+/).filter(Boolean).length : 0;
  const charCount = plainText.length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: 'hidden',
          minHeight: '520px',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 1.5,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'primary.main',
              color: '#fff',
            }}
          >
            <VisibilityIcon fontSize="small" />
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight={700}>
              {modalTitle}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t('editor.preview.subtitle', 'Giao diện thực tế người xem sẽ nhìn thấy sau khi xuất bản')}
            </Typography>
          </Box>
        </Box>

        <IconButton onClick={onClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3, bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'grey.950' : 'grey.50') }}>
        {/* Statistics Bar */}
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            mb: 2.5,
            p: 1.5,
            px: 2,
            borderRadius: 2,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            flexWrap: 'wrap',
          }}
        >
          <Chip
            icon={<TextFieldsIcon fontSize="small" />}
            label={t('editor.status.words', '{{count}} từ', { count: wordCount })}
            size="small"
            variant="outlined"
          />
          <Chip
            icon={<FormatListNumberedIcon fontSize="small" />}
            label={t('editor.status.characters', '{{count}} ký tự', { count: charCount })}
            size="small"
            variant="outlined"
          />
          <Chip
            icon={<AccessTimeIcon fontSize="small" />}
            label={t('editor.status.readingTime', '~{{minutes}} phút đọc', { minutes: readingTime })}
            size="small"
            color="primary"
            variant="outlined"
          />
        </Box>

        {/* Content Rendered Card */}
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 2.5,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            minHeight: '360px',
            '& h1': { fontSize: '1.75rem', fontWeight: 800, mb: 2, color: 'text.primary', letterSpacing: '-0.02em' },
            '& h2': { fontSize: '1.4rem', fontWeight: 700, mt: 3, mb: 1.5, color: 'text.primary' },
            '& h3': { fontSize: '1.15rem', fontWeight: 700, mt: 2.5, mb: 1.2, color: 'primary.main' },
            '& h4': { fontSize: '1rem', fontWeight: 700, mt: 2, mb: 1, color: 'text.primary' },
            '& p': { fontSize: '0.95rem', lineHeight: 1.75, mb: 1.5, color: 'text.secondary' },
            '& ul, & ol': { pl: 3, mb: 1.5 },
            '& li': { fontSize: '0.95rem', mb: 0.8, lineHeight: 1.6, color: 'text.secondary' },
            '& strong': { color: 'text.primary', fontWeight: 600 },
            '& blockquote': {
              borderLeft: '4px solid',
              borderColor: 'primary.main',
              pl: 2,
              py: 0.5,
              my: 2,
              fontStyle: 'italic',
              bgcolor: 'rgba(99, 102, 241, 0.04)',
              borderRadius: '0 8px 8px 0',
            },
            '& img': {
              maxWidth: '100%',
              borderRadius: 2,
              my: 2,
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            },
            '& table': {
              width: '100%',
              borderCollapse: 'collapse',
              my: 2,
              borderRadius: 1.5,
              overflow: 'hidden',
              '& th, & td': {
                border: '1px solid',
                borderColor: 'divider',
                p: 1.5,
                fontSize: '0.9rem',
              },
              '& th': {
                bgcolor: 'rgba(99, 102, 241, 0.08)',
                fontWeight: 700,
              },
            },
          }}
        >
          {htmlContent ? (
            <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
          ) : (
            <Box sx={{ py: 8, textAlign: 'center', color: 'text.disabled' }}>
              <Typography variant="body2">{t('editor.preview.empty', 'Chưa có nội dung để hiển thị')}</Typography>
            </Box>
          )}
        </Paper>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button onClick={onClose} variant="contained">
          {t('editor.preview.close', 'Đóng')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PreviewModal;

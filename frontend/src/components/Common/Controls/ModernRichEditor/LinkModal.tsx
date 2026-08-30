import React, { useState } from 'react';
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  TextField,
  Typography,
  Box,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LinkIcon from '@mui/icons-material/Link';
import { useTranslation } from 'react-i18next';

interface LinkModalProps {
  open: boolean;
  onClose: () => void;
  onInsertLink: (url: string, text: string, openInNewTab: boolean) => void;
  initialText?: string;
}

export const LinkModal: React.FC<LinkModalProps> = ({
  open,
  onClose,
  onInsertLink,
  initialText = '',
}) => {
  const { t } = useTranslation('common');
  const [url, setUrl] = useState('');
  const [text, setText] = useState(initialText);
  const [openInNewTab, setOpenInNewTab] = useState(true);

  React.useEffect(() => {
    if (open) {
      setText(initialText);
      setUrl('');
    }
  }, [open, initialText]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    let finalUrl = url.trim();
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://') && !finalUrl.startsWith('mailto:')) {
      finalUrl = 'https://' + finalUrl;
    }
    onInsertLink(finalUrl, text.trim() || finalUrl, openInNewTab);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LinkIcon color="primary" />
          <Typography variant="subtitle1" fontWeight={700}>
            {t('editor.link.modalTitle', 'Chèn Liên Kết (Hyperlink)')}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            label={t('editor.link.urlLabel', 'Địa chỉ liên kết (URL)')}
            placeholder={t('editor.link.urlPlaceholder', 'https://example.com')}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            size="small"
            fullWidth
            autoFocus
            required
          />

          <TextField
            label={t('editor.link.textLabel', 'Văn bản hiển thị')}
            placeholder={t('editor.link.textPlaceholder', 'Nhập chữ hiển thị (nếu có)...')}
            value={text}
            onChange={(e) => setText(e.target.value)}
            size="small"
            fullWidth
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={openInNewTab}
                onChange={(e) => setOpenInNewTab(e.target.checked)}
                size="small"
              />
            }
            label={<Typography variant="body2">{t('editor.link.openNewTab', 'Mở trong tab mới (target="_blank")')}</Typography>}
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button onClick={onClose} color="inherit">
            {t('editor.link.cancel', 'Hủy')}
          </Button>
          <Button type="submit" variant="contained" disabled={!url.trim()}>
            {t('editor.link.insert', 'Chèn Liên Kết')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default LinkModal;

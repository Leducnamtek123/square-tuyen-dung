import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Radio,
  TextField,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import { useTranslation } from 'react-i18next';

export type CalloutType = 'info' | 'tip' | 'warning' | 'success';

interface CalloutModalProps {
  open: boolean;
  onClose: () => void;
  onInsertCallout: (type: CalloutType, title: string, content: string) => void;
}

export const CalloutModal: React.FC<CalloutModalProps> = ({ open, onClose, onInsertCallout }) => {
  const { t } = useTranslation('common');
  const [type, setType] = useState<CalloutType>('info');

  const CALLOUT_CONFIG: Record<
    CalloutType,
    { label: string; icon: React.ReactNode; color: string; bg: string; border: string; defaultTitle: string }
  > = {
    info: {
      label: t('editor.callout.types.info.label', 'Thông tin bổ sung (Info)'),
      icon: <InfoOutlinedIcon sx={{ color: '#3b82f6' }} />,
      color: '#1d4ed8',
      bg: 'rgba(59, 130, 246, 0.08)',
      border: '#93c5fd',
      defaultTitle: t('editor.callout.types.info.defaultTitle', 'Lưu ý quan trọng:'),
    },
    tip: {
      label: t('editor.callout.types.tip.label', 'Mẹo & Bí quyết (Tip)'),
      icon: <LightbulbOutlinedIcon sx={{ color: '#8b5cf6' }} />,
      color: '#6d28d9',
      bg: 'rgba(139, 92, 246, 0.08)',
      border: '#c4b5fd',
      defaultTitle: t('editor.callout.types.tip.defaultTitle', 'Bí quyết hữu ích:'),
    },
    warning: {
      label: t('editor.callout.types.warning.label', 'Cảnh báo / Lưu ý (Warning)'),
      icon: <WarningAmberOutlinedIcon sx={{ color: '#f59e0b' }} />,
      color: '#b45309',
      bg: 'rgba(245, 158, 11, 0.08)',
      border: '#fde68a',
      defaultTitle: t('editor.callout.types.warning.defaultTitle', 'Lưu ý cần biết:'),
    },
    success: {
      label: t('editor.callout.types.success.label', 'Điểm nổi bật / Thành tựu (Success)'),
      icon: <CheckCircleOutlineOutlinedIcon sx={{ color: '#10b981' }} />,
      color: '#047857',
      bg: 'rgba(16, 185, 129, 0.08)',
      border: '#a7f3d0',
      defaultTitle: t('editor.callout.types.success.defaultTitle', 'Cam kết chất lượng:'),
    },
  };

  const [title, setTitle] = useState(CALLOUT_CONFIG.info.defaultTitle);
  const [content, setContent] = useState('');

  const currentCfg = CALLOUT_CONFIG[type];

  const handleTypeChange = (newType: CalloutType) => {
    setType(newType);
    if (!title || Object.values(CALLOUT_CONFIG).some((c) => c.defaultTitle === title)) {
      setTitle(CALLOUT_CONFIG[newType].defaultTitle);
    }
  };

  const handleApply = () => {
    onInsertCallout(type, title.trim(), content.trim());
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LightbulbOutlinedIcon color="primary" />
          <Typography variant="subtitle1" fontWeight={700}>
            {t('editor.callout.modalTitle', 'Chèn Khối Ghi Chú Nổi Bật (Callout Box)')}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
        <Box>
          <Typography variant="caption" fontWeight={600} color="text.secondary" gutterBottom>
            {t('editor.callout.selectType', 'Chọn loại khối ghi chú:')}
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5, mt: 0.5 }}>
            {(Object.keys(CALLOUT_CONFIG) as CalloutType[]).map((key) => {
              const cfg = CALLOUT_CONFIG[key];
              const isSelected = type === key;
              return (
                <Paper
                  key={key}
                  elevation={0}
                  onClick={() => handleTypeChange(key)}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    border: '1.5px solid',
                    borderColor: isSelected ? cfg.color : 'divider',
                    bgcolor: isSelected ? cfg.bg : 'background.paper',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    cursor: 'pointer',
                  }}
                >
                  <Radio checked={isSelected} size="small" sx={{ p: 0, color: cfg.color, '&.Mui-checked': { color: cfg.color } }} />
                  {cfg.icon}
                  <Typography variant="body2" fontWeight={isSelected ? 700 : 500} sx={{ fontSize: '0.82rem' }}>
                    {cfg.label.split('(')[0].trim()}
                  </Typography>
                </Paper>
              );
            })}
          </Box>
        </Box>

        <TextField
          label={t('editor.callout.customTitle', 'Tiêu đề khối')}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          size="small"
          fullWidth
        />

        <TextField
          label={t('editor.callout.content', 'Nội dung chi tiết')}
          placeholder={t('editor.callout.contentPlaceholder', 'Nhập nội dung thông điệp cần nhấn mạnh...')}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          multiline
          rows={3}
          size="small"
          fullWidth
        />

        {/* Live Preview */}
        <Box>
          <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            {t('editor.callout.preview', 'Xem trước giao diện:')}
          </Typography>
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: currentCfg.bg,
              borderLeft: `4px solid ${currentCfg.color}`,
              border: `1px solid ${currentCfg.border}`,
              borderLeftWidth: '4px',
              display: 'flex',
              gap: 1.5,
            }}
          >
            {currentCfg.icon}
            <Box>
              <Typography variant="subtitle2" fontWeight={700} sx={{ color: currentCfg.color, mb: 0.5 }}>
                {title || t('editor.callout.types.info.defaultTitle', 'Tiêu đề ghi chú')}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.primary', fontSize: '0.85rem' }}>
                {content || t('editor.callout.contentPlaceholder', 'Nội dung thông điệp sẽ hiển thị nổi bật tại đây để thu hút sự chú ý của người đọc.')}
              </Typography>
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button onClick={onClose} color="inherit">
          {t('editor.callout.cancel', 'Hủy')}
        </Button>
        <Button onClick={handleApply} variant="contained">
          {t('editor.callout.insert', 'Chèn Khối Ghi Chú')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CalloutModal;

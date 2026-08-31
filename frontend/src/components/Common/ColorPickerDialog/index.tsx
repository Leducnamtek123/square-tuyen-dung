import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Stack, Typography } from "@mui/material";
import { useTranslation } from 'react-i18next';
import defaultTheme from '@/configs/theme/defaultTheme';

interface Props {
  open: boolean;
  onClose: () => void;
  onColorSelect: (color: string) => void;
}

const DEFAULT_COLORS = [
  defaultTheme.palette.primary.main,
  '#2196f3',
  '#4caf50',
  '#f44336',
  '#ff9800',
  '#140861',
];

const ColorPickerDialog = ({ open, onClose, onColorSelect }: Props) => {
  const { t } = useTranslation(['jobSeeker', 'common']);
  const [selectedColor, setSelectedColor] = React.useState<string>(defaultTheme.palette.primary.main);
  const [showCustomPicker, setShowCustomPicker] = React.useState(false);

  const handleColorSelect = (color: string) => {
    setSelectedColor(color || defaultTheme.palette.primary.main);
    setShowCustomPicker(false);
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedColor(e.target.value || defaultTheme.palette.primary.main);
  };

  const handleConfirm = () => {
    onColorSelect(selectedColor || defaultTheme.palette.primary.main);
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>
        {t('jobSeeker:cv.pickColorTitle', 'Chọn màu sắc cho CV của bạn')}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3}>
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              {t('jobSeeker:cv.suggestedColors', 'Màu sắc gợi ý')}
            </Typography>
            <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
              {DEFAULT_COLORS.map((color) => (
                <Box
                  key={color}
                  onClick={() => handleColorSelect(color)}
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 1,
                    bgcolor: color,
                    cursor: 'pointer',
                    border: selectedColor === color ? '3px solid' : '1px solid',
                    borderColor: selectedColor === color ? 'primary.main' : 'grey.300',
                    '&:hover': { opacity: 0.8 },
                  }}
                />
              ))}
              <Box
                onClick={() => setShowCustomPicker(!showCustomPicker)}
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 1,
                  background: 'linear-gradient(45deg, #ff0000, #00ff00, #0000ff)',
                  cursor: 'pointer',
                  border: showCustomPicker ? '3px solid' : '1px solid',
                  borderColor: showCustomPicker ? 'primary.main' : 'grey.300',
                  '&:hover': { opacity: 0.8 },
                }}
              />
            </Stack>
          </Box>

          {showCustomPicker && (
            <Stack direction="row" alignItems="center" justifyContent="center" spacing={2} sx={{ pt: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{t('jobSeeker:cv.customColor', 'Tự chọn màu:')}</Typography>
              <input
                type="color"
                value={selectedColor || '#2563EB'}
                onChange={handleCustomColorChange}
                style={{
                  width: 44,
                  height: 44,
                  padding: 0,
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer',
                  backgroundColor: 'transparent',
                }}
              />
              <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 700, color: 'primary.main' }}>
                {selectedColor}
              </Typography>
            </Stack>
          )}

          <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1, border: '1px solid', borderColor: 'grey.300' }}>
            <Typography variant="subtitle2" gutterBottom>
              {t('jobSeeker:cv.selectedColorPreview', 'Xem trước màu đã chọn')}
            </Typography>
            <Box sx={{ width: '100%', height: 60, bgcolor: selectedColor || '#2563EB', borderRadius: 1, boxShadow: 1 }} />
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('common:actions.cancel', 'Hủy')}</Button>
        <Button 
          variant="contained"
          onClick={handleConfirm}
          sx={{
            bgcolor: selectedColor || '#2563EB',
            '&:hover': {
              bgcolor: selectedColor || '#2563EB',
              opacity: 0.9,
            },
          }}
        >
          {t('common:actions.confirm', 'Xác nhận')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ColorPickerDialog;

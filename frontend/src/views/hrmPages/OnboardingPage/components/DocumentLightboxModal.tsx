import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Button,
  Box,
  Typography,
  Stack,
  Tooltip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import RotateRightIcon from '@mui/icons-material/RotateRight';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { getSafeExternalOpenUrl } from '@/utils/safeExternalUrl';

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  documentUrl?: string | null;
}

export const DocumentLightboxModal: React.FC<Props> = ({
  open,
  onClose,
  title,
  documentUrl,
}) => {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);

  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);
  const handleReset = () => {
    setScale(1);
    setRotation(0);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const isPdf = documentUrl?.toLowerCase().endsWith('.pdf');

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            overflow: 'hidden',
            bgcolor: '#0f172a',
            color: '#ffffff',
            maxHeight: '90vh',
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#ffffff' }}>
          {title}
        </Typography>

        <Stack direction="row" spacing={1} alignItems="center">
          {!isPdf && (
            <>
              <Tooltip title="Thu nhỏ">
                <IconButton size="small" onClick={handleZoomOut} sx={{ color: '#cbd5e1' }}>
                  <ZoomOutIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Phóng to">
                <IconButton size="small" onClick={handleZoomIn} sx={{ color: '#cbd5e1' }}>
                  <ZoomInIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Xoay 90°">
                <IconButton size="small" onClick={handleRotate} sx={{ color: '#cbd5e1' }}>
                  <RotateRightIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Đặt lại">
                <IconButton size="small" onClick={handleReset} sx={{ color: '#cbd5e1' }}>
                  <RestartAltIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}

          {getSafeExternalOpenUrl(documentUrl) && (
            <Tooltip title="Mở trong tab mới">
              <IconButton
                size="small"
                component="a"
                href={getSafeExternalOpenUrl(documentUrl)}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ color: '#cbd5e1' }}
              >
                <OpenInNewIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          <IconButton size="small" onClick={handleClose} sx={{ color: '#ffffff', ml: 1 }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent
        sx={{
          p: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 450,
          maxHeight: 600,
          overflow: 'auto',
          bgcolor: '#020617',
          position: 'relative',
        }}
      >
        {!documentUrl ? (
          <Typography variant="body2" sx={{ color: '#94a3b8' }}>
            Không có tệp đính kèm để hiển thị.
          </Typography>
        ) : isPdf ? (
          <iframe
            src={documentUrl}
            title={title}
            style={{ width: '100%', height: 550, border: 'none' }}
          />
        ) : (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: 2,
              width: '100%',
              height: '100%',
            }}
          >
            <Box
              component="img"
              src={documentUrl}
              alt={title}
              sx={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                transform: `scale(${scale}) rotate(${rotation}deg)`,
                transition: 'transform 0.2s ease',
                borderRadius: 1,
                boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
              }}
            />
          </Box>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          p: 1.5,
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="caption" sx={{ color: '#94a3b8', pl: 1 }}>
          Định dạng: {isPdf ? 'Tài liệu PDF' : 'Hình ảnh'}
        </Typography>
        <Button
          variant="outlined"
          size="small"
          onClick={handleClose}
          sx={{
            color: '#cbd5e1',
            borderColor: 'rgba(255, 255, 255, 0.2)',
            textTransform: 'none',
            fontWeight: 600,
            '&:hover': {
              borderColor: '#ffffff',
              bgcolor: 'rgba(255, 255, 255, 0.05)',
            },
          }}
        >
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
};

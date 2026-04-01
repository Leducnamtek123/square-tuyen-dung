import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import CropperImport, { Area } from 'react-easy-crop';

// Handle ESM/CJS interop: in production builds the default import can resolve
// to the module wrapper object instead of the component function.
const Cropper = (CropperImport as { default?: typeof CropperImport }).default || CropperImport;
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Slider,
  Typography,
  Stack,
} from '@mui/material';
import CropIcon from '@mui/icons-material/Crop';
import ZoomInIcon from '@mui/icons-material/ZoomIn';

/**
 * Create a cropped image File from a source image URL and crop area.
 */
const getCroppedImg = async (
  imageSrc: string,
  pixelCrop: Area,
  fileName: string,
): Promise<File> => {
  const image = new Image();
  image.crossOrigin = 'anonymous';
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = reject;
    image.src = imageSrc;
  });

  const canvas = document.createElement('canvas');
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext('2d')!;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error('Canvas toBlob failed'));
        const baseName = fileName.replace(/\.[^/.]+$/, '');
        resolve(new File([blob], `${baseName}.webp`, { type: 'image/webp' }));
      },
      'image/webp',
      0.9,
    );
  });
};

interface ImageCropDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** The source image URL (from URL.createObjectURL) */
  imageSrc: string;
  /** Original file name */
  fileName: string;
  /** Aspect ratio for cropping, e.g. 16/5 for wide banners */
  aspectRatio: number;
  /** Label describing the aspect ratio */
  aspectLabel?: string;
  /** Called with the cropped File when the user confirms */
  onConfirm: (croppedFile: File, previewUrl: string) => void;
  /** Called when the user cancels */
  onCancel: () => void;
}

const ImageCropDialog: React.FC<ImageCropDialogProps> = ({
  open,
  imageSrc,
  fileName,
  aspectRatio,
  aspectLabel,
  onConfirm,
  onCancel,
}) => {
  const { t } = useTranslation('employer');
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isCropping, setIsCropping] = useState(false);

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;
    setIsCropping(true);
    try {
      const croppedFile = await getCroppedImg(imageSrc, croppedAreaPixels, fileName);
      const previewUrl = URL.createObjectURL(croppedFile);
      onConfirm(croppedFile, previewUrl);
    } catch (err) {
      console.error('[ImageCropDialog] Crop failed:', err);
    } finally {
      setIsCropping(false);
    }
  };

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CropIcon fontSize="small" />
        {t('imageCrop.title')}
        {aspectLabel && (
          <Typography
            component="span"
            variant="body2"
            sx={{ color: 'text.secondary', ml: 1 }}
          >
            ({t('imageCrop.ratio')}: {aspectLabel})
          </Typography>
        )}
      </DialogTitle>
      <DialogContent>
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: { xs: 300, sm: 400, md: 450 },
            bgcolor: 'grey.900',
            borderRadius: 1,
            overflow: 'hidden',
          }}
        >
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspectRatio}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            objectFit="contain"
          />
        </Box>
        <Stack
          direction="row"
          alignItems="center"
          spacing={2}
          sx={{ mt: 2, px: 1 }}
        >
          <ZoomInIcon sx={{ color: 'text.secondary' }} />
          <Slider
            value={zoom}
            min={1}
            max={3}
            step={0.05}
            onChange={(_, value) => setZoom(value as number)}
            sx={{ flex: 1 }}
          />
          <Typography variant="body2" sx={{ color: 'text.secondary', minWidth: 40 }}>
            {Math.round(zoom * 100)}%
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onCancel} color="inherit">
          {t('imageCrop.cancel')}
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={isCropping}
        >
          {isCropping ? t('imageCrop.cropping') : t('imageCrop.confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImageCropDialog;

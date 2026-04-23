import React from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import ImageCropDialog from '../../../components/Common/ImageCropDialog';
import { IMAGES } from '../../../configs/constants';
import type { Banner } from '../../../types/models';

type Option = {
  value: string | number;
  label: string;
  webAspectRatio?: string;
};

type BannerFormData = {
  description: string;
  button_text: string;
  button_link: string;
  is_show_button: boolean;
  is_active: boolean;
  platform: string;
  type: number;
  description_location: number;
};

type BannerFormDialogProps = {
  open: boolean;
  dialogMode: 'add' | 'edit';
  isMutating: boolean;
  formData: BannerFormData;
  webImage: File | null;
  mobileImage: File | null;
  webPreview: string;
  mobilePreview: string;
  cropOpen: boolean;
  cropImageSrc: string;
  cropFileName: string;
  cropAspectRatio: number;
  cropAspectLabel: string;
  onClose: () => void;
  onSave: () => void;
  onInputChange: (name: keyof BannerFormData, value: unknown) => void;
  onFileSelect: (target: 'web' | 'mobile') => (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCropConfirm: (croppedFile: File, previewUrl: string) => Promise<void>;
  onCropCancel: () => void;
  platformOptions: Option[];
  typeOptions: Option[];
  descriptionLocations: Option[];
  webInputRef: React.RefObject<HTMLInputElement>;
  mobileInputRef: React.RefObject<HTMLInputElement>;
  t: (key: string, params?: Record<string, unknown>) => string;
  onPickWebImage: () => void;
  onPickMobileImage: () => void;
};

const ImagePreview = ({
  preview,
  alt,
  emptyText,
  errorText,
  width,
  maxWidth,
  maxHeight,
}: {
  preview: string;
  alt: string;
  emptyText: string;
  errorText: string;
  width: string | number;
  maxWidth?: number;
  maxHeight?: number;
}) => {
  if (!preview) {
    return (
      <Box
        sx={{
          width,
          height: 80,
          borderRadius: 1,
          border: '1px dashed',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'text.secondary',
          fontSize: 13,
          bgcolor: 'action.hover',
        }}
      >
        {emptyText}
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative' }}>
      <Box
        component="img"
        src={preview}
        alt={alt}
        onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
          e.currentTarget.style.display = 'none';
          const next = e.currentTarget.nextSibling as HTMLElement | null;
          if (next) next.style.display = 'flex';
        }}
        sx={{
          width,
          maxHeight: maxHeight ?? 150,
          objectFit: 'contain',
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'divider',
          display: 'block',
          maxWidth,
        }}
      />
      <Box
        sx={{
          display: 'none',
          width,
          height: 80,
          borderRadius: 1,
          border: '1px dashed',
          borderColor: 'divider',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'text.secondary',
          fontSize: 13,
        }}
      >
        {errorText}
      </Box>
    </Box>
  );
};

const BannerFormDialog = ({
  open,
  dialogMode,
  isMutating,
  formData,
  webImage,
  mobileImage,
  webPreview,
  mobilePreview,
  cropOpen,
  cropImageSrc,
  cropFileName,
  cropAspectRatio,
  cropAspectLabel,
  onClose,
  onSave,
  onInputChange,
  onFileSelect,
  onCropConfirm,
  onCropCancel,
  platformOptions,
  typeOptions,
  descriptionLocations,
  webInputRef,
  mobileInputRef,
  t,
  onPickWebImage,
  onPickMobileImage,
}: BannerFormDialogProps) => (
  <>
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{dialogMode === 'add' ? t('pages.banners.addTitle') : t('pages.banners.editTitle')}</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label={t('pages.banners.form.description')} fullWidth value={formData.description} onChange={(e) => onInputChange('description', e.target.value)} />
          <TextField label={t('pages.banners.form.buttonText')} fullWidth value={formData.button_text} onChange={(e) => onInputChange('button_text', e.target.value)} />
          <TextField label={t('pages.banners.form.buttonLink')} fullWidth value={formData.button_link} onChange={(e) => onInputChange('button_link', e.target.value)} />
          <FormControl fullWidth size="small">
            <InputLabel>{t('pages.banners.form.platform')}</InputLabel>
            <Select value={formData.platform} label={t('pages.banners.form.platform')} onChange={(e) => onInputChange('platform', e.target.value)}>
              {platformOptions.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl fullWidth size="small">
            <InputLabel>{t('pages.banners.form.bannerType')}</InputLabel>
            <Select value={formData.type} label={t('pages.banners.form.bannerType')} onChange={(e) => onInputChange('type', Number(e.target.value))}>
              {typeOptions.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl fullWidth size="small">
            <InputLabel>{t('pages.banners.form.descLocation')}</InputLabel>
            <Select value={formData.description_location} label={t('pages.banners.form.descLocation')} onChange={(e) => onInputChange('description_location', Number(e.target.value))}>
              {descriptionLocations.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControlLabel control={<Switch checked={formData.is_show_button} onChange={(e) => onInputChange('is_show_button', e.target.checked)} />} label={t('pages.banners.form.showButton')} />
          <FormControlLabel control={<Switch checked={formData.is_active} onChange={(e) => onInputChange('is_active', e.target.checked)} color="success" />} label={t('pages.banners.form.activeLabel')} />

          <Typography variant="subtitle2" sx={{ mt: 1, fontWeight: 600 }}>{t('pages.banners.form.webImageLabel')}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <input ref={webInputRef} type="file" accept="image/*" hidden onChange={onFileSelect('web')} />
            <Button variant="outlined" startIcon={<UploadFileIcon />} onClick={onPickWebImage}>
              {webImage ? webImage.name : t('pages.banners.form.chooseWeb')}
            </Button>
          </Box>
          <ImagePreview
            preview={webPreview}
            alt="Web preview"
            emptyText={t('pages.banners.noWebImage')}
            errorText={t('pages.banners.errorLoadingImage')}
            width="100%"
            maxHeight={150}
          />

          <Typography variant="subtitle2" sx={{ mt: 1, fontWeight: 600 }}>{t('pages.banners.form.mobileImageLabel')}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <input ref={mobileInputRef} type="file" accept="image/*" hidden onChange={onFileSelect('mobile')} />
            <Button variant="outlined" startIcon={<UploadFileIcon />} onClick={onPickMobileImage}>
              {mobileImage ? mobileImage.name : t('pages.banners.form.chooseMobile')}
            </Button>
          </Box>
          <ImagePreview
            preview={mobilePreview}
            alt="Mobile preview"
            emptyText={t('pages.banners.noMobileImage')}
            errorText={t('pages.banners.errorLoadingImage')}
            width={200}
            maxWidth={200}
            maxHeight={150}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">{t('pages.banners.cancel')}</Button>
        <Button onClick={onSave} variant="contained" disabled={isMutating}>
          {isMutating ? t('pages.banners.saving') : t('pages.banners.save')}
        </Button>
      </DialogActions>
    </Dialog>

    <ImageCropDialog
      open={cropOpen}
      imageSrc={cropImageSrc}
      fileName={cropFileName}
      aspectRatio={cropAspectRatio}
      aspectLabel={cropAspectLabel}
      onConfirm={onCropConfirm}
      onCancel={onCropCancel}
    />
  </>
);

export default BannerFormDialog;

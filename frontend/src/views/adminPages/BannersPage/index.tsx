import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  Box, Typography, Breadcrumbs, Link, Button, Paper,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  FormControlLabel, Switch, Select, MenuItem, InputLabel, FormControl,
  Chip, Tooltip, IconButton, Stack
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { useTranslation } from 'react-i18next';
import { IMAGES } from '../../../configs/constants';
import { compressImageFile } from '../../../utils/imageCompression';
import ImageCropDialog from '../../../components/Common/ImageCropDialog';
import { ColumnDef } from '@tanstack/react-table';
import DataTable from '../../../components/Common/DataTable';
import { useDataTable } from '../../../hooks';
import { Banner } from '../../../types/models';
import { useBanners } from './hooks/useBanners';

/** Aspect ratios per banner type */
const ASPECT_RATIOS: Record<number, { ratio: number; label: string }> = {
  1: { ratio: 16 / 5, label: '16:5' },  // Home banner (wide)
  2: { ratio: 1 / 1, label: '1:1' },     // Main Job Right (square)
};

const PLATFORM_OPTIONS = [
  { value: 'WEB', label: 'Web' },
  { value: 'APP', label: 'Mobile App' },
];

const TYPE_OPTIONS = [
  { value: 1, label: 'Home' },
  { value: 2, label: 'Main Job Right' },
];

const DESCRIPTION_LOCATIONS = [
  { value: 1, label: 'Top Left' },
  { value: 2, label: 'Top Right' },
  { value: 3, label: 'Bottom Left' },
  { value: 4, label: 'Bottom Right' },
];

interface BannerFormData {
    description: string;
    button_text: string;
    button_link: string;
    is_show_button: boolean;
    is_active: boolean;
    platform: string;
    type: number;
    description_location: number;
}

const BannersPage = () => {
  const { t } = useTranslation('admin');
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [current, setCurrent] = useState<Banner | null>(null);
  const [openDelete, setOpenDelete] = useState(false);

  const {
      sorting,
      onSortingChange,
      ordering,
  } = useDataTable();

  const {
      data,
      isLoading,
      createBanner,
      updateBanner,
      deleteBanner,
      isMutating
  } = useBanners({ ordering });

  const banners = data?.results || [];

  // Form fields
  const [formData, setFormData] = useState<BannerFormData>({
    description: '',
    button_text: '',
    button_link: '',
    is_show_button: false,
    is_active: false,
    platform: 'WEB',
    type: 1,
    description_location: 3
  });

  // File uploads
  const [webImage, setWebImage] = useState<File | null>(null);
  const [mobileImage, setMobileImage] = useState<File | null>(null);
  const [webPreview, setWebPreview] = useState('');
  const [mobilePreview, setMobilePreview] = useState('');
  const webInputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  // Crop dialog state
  const [cropOpen, setCropOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState('');
  const [cropFileName, setCropFileName] = useState('');
  const [cropTarget, setCropTarget] = useState<'web' | 'mobile'>('web');

  const resetForm = () => {
    setFormData({
        description: '',
        button_text: '',
        button_link: '',
        is_show_button: false,
        is_active: false,
        platform: 'WEB',
        type: 1,
        description_location: 3
    });
    setWebImage(null); setMobileImage(null);
    setWebPreview(''); setMobilePreview('');
  };

  const handleOpenAdd = () => {
    setDialogMode('add'); setCurrent(null); resetForm();
    setOpenDialog(true);
  };

  const handleOpenEdit = (banner: Banner) => {
    setDialogMode('edit'); setCurrent(banner);
    setFormData({
        description: banner.description || '',
        button_text: banner.button_text || '',
        button_link: banner.button_link || '',
        is_show_button: !!banner.is_show_button,
        is_active: !!banner.is_active,
        platform: banner.platform || 'WEB',
        type: banner.type ?? 1,
        description_location: banner.description_location ?? 3
    });
    setWebImage(null); setMobileImage(null);
    setWebPreview(banner.imageUrl || '');
    setMobilePreview(banner.imageMobileUrl || '');
    setOpenDialog(true);
  };

  const handleInputChange = (name: keyof BannerFormData, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const dataToSend = new FormData();
    dataToSend.append('description', formData.description);
    dataToSend.append('button_text', formData.button_text);
    if (formData.button_link) dataToSend.append('button_link', formData.button_link);
    dataToSend.append('is_show_button', String(formData.is_show_button));
    dataToSend.append('is_active', String(formData.is_active));
    dataToSend.append('platform', formData.platform);
    dataToSend.append('type', String(formData.type));
    dataToSend.append('description_location', String(formData.description_location));

    if (webImage) dataToSend.append('imageFile', webImage);
    if (mobileImage) dataToSend.append('imageMobileFile', mobileImage);

    try {
      if (dialogMode === 'add') {
        await createBanner(dataToSend);
      } else if (current) {
        await updateBanner({ id: current.id, data: dataToSend });
      }
      setOpenDialog(false);
    } catch (e) { console.error(e); }
  };

  const handleDelete = async () => {
    try {
      if (current) {
        await deleteBanner(current.id);
        setOpenDelete(false);
      }
    } catch (e) { console.error(e); }
  };

  const handleFileSelect = (target: 'web' | 'mobile') =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (!f) return;
      setCropTarget(target);
      setCropFileName(f.name);
      setCropImageSrc(URL.createObjectURL(f));
      setCropOpen(true);
      e.target.value = '';
    };

  const handleCropConfirm = async (croppedFile: File, previewUrl: string) => {
    const compressed = await compressImageFile(croppedFile);
    const finalPreview = URL.createObjectURL(compressed);
    if (cropTarget === 'web') {
      setWebImage(compressed);
      setWebPreview(finalPreview);
    } else {
      setMobileImage(compressed);
      setMobilePreview(finalPreview);
    }
    URL.revokeObjectURL(previewUrl);
    setCropOpen(false);
    setCropImageSrc('');
  };

  const handleCropCancel = () => {
    setCropOpen(false);
    if (cropImageSrc) URL.revokeObjectURL(cropImageSrc);
    setCropImageSrc('');
  };

  const cropAspect = ASPECT_RATIOS[formData.type] || ASPECT_RATIOS[1];

  const columns = useMemo<ColumnDef<Banner>[]>(() => [
    {
      accessorKey: 'id',
      header: t('pages.banners.table.id') as string,
      enableSorting: true,
    },
    {
      accessorKey: 'imageUrl',
      header: t('pages.banners.table.webImage') as string,
      cell: (info) => (
        info.getValue() ? (
          <Box
            component="img"
            src={info.getValue() as string}
            alt="web banner"
            onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => { e.currentTarget.src = IMAGES.companyLogoDefault; }}
            sx={{ width: 120, height: 60, objectFit: 'cover', borderRadius: 1 }}
          />
        ) : '—'
      ),
    },
    {
      accessorKey: 'imageMobileUrl',
      header: t('pages.banners.table.mobileImage') as string,
      cell: (info) => (
        info.getValue() ? (
          <Box
            component="img"
            src={info.getValue() as string}
            alt="mobile banner"
            onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => { e.currentTarget.src = IMAGES.companyLogoDefault; }}
            sx={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 1 }}
          />
        ) : '—'
      ),
    },
    {
      accessorKey: 'description',
      header: t('pages.banners.table.description') as string,
      enableSorting: true,
      cell: (info) => (
        <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {info.getValue() as string || '—'}
        </Typography>
      ),
    },
    {
      accessorKey: 'platform',
      header: t('pages.banners.table.platform') as string,
      enableSorting: true,
      cell: (info) => (
        <Chip label={info.getValue() as string} size="small" color={info.getValue() === 'WEB' ? 'primary' : 'secondary'} />
      ),
    },
    {
      accessorKey: 'type',
      header: t('pages.banners.table.type') as string,
      enableSorting: true,
      cell: (info) => TYPE_OPTIONS.find(opt => opt.value === info.getValue())?.label || (info.getValue() as string | number),
    },
    {
      accessorKey: 'is_active',
      header: t('pages.banners.table.status') as string,
      cell: (info) => (
        <Chip label={info.getValue() ? t('pages.banners.active') : t('pages.banners.inactive')} size="small"
              color={info.getValue() ? 'success' : 'default'} variant="outlined" />
      ),
    },
    {
      id: 'actions',
      header: t('pages.banners.table.actions') as string,
      meta: { align: 'right' },
      cell: (info) => (
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Tooltip title={t('pages.banners.table.editTooltip')}>
            <IconButton size="small" color="primary" onClick={() => handleOpenEdit(info.row.original)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('pages.banners.table.deleteTooltip')}>
            <IconButton size="small" color="error" onClick={() => { setCurrent(info.row.original); setOpenDelete(true); }}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ], [t]);

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>{t('pages.banners.title')}</Typography>
          <Breadcrumbs>
            <Link underline="hover" color="inherit" href="/admin">{t('pages.banners.breadcrumbAdmin')}</Link>
            <Typography color="text.primary">{t('pages.banners.breadcrumb')}</Typography>
          </Breadcrumbs>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenAdd}
          sx={{ borderRadius: '8px', textTransform: 'none' }}>
          {t('pages.banners.addBtn')}
        </Button>
      </Box>

      <DataTable
        columns={columns}
        data={banners}
        isLoading={isLoading}
        hidePagination
        enableSorting
        sorting={sorting}
        onSortingChange={onSortingChange}
        emptyMessage={t('pages.banners.empty')}
      />

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>{dialogMode === 'add' ? t('pages.banners.addTitle') : t('pages.banners.editTitle')}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label={t('pages.banners.form.description')} fullWidth value={formData.description} onChange={e => handleInputChange('description', e.target.value)} />
            <TextField label={t('pages.banners.form.buttonText')} fullWidth value={formData.button_text} onChange={e => handleInputChange('button_text', e.target.value)} />
            <TextField label={t('pages.banners.form.buttonLink')} fullWidth value={formData.button_link} onChange={e => handleInputChange('button_link', e.target.value)} />
            <FormControl fullWidth size="small">
              <InputLabel>{t('pages.banners.form.platform')}</InputLabel>
              <Select value={formData.platform} label={t('pages.banners.form.platform')} onChange={e => handleInputChange('platform', e.target.value)}>
                {PLATFORM_OPTIONS.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel>{t('pages.banners.form.bannerType')}</InputLabel>
              <Select value={formData.type} label={t('pages.banners.form.bannerType')} onChange={e => handleInputChange('type', Number(e.target.value))}>
                {TYPE_OPTIONS.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel>{t('pages.banners.form.descLocation')}</InputLabel>
              <Select value={formData.description_location} label={t('pages.banners.form.descLocation')} onChange={e => handleInputChange('description_location', Number(e.target.value))}>
                {DESCRIPTION_LOCATIONS.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControlLabel control={<Switch checked={formData.is_show_button} onChange={e => handleInputChange('is_show_button', e.target.checked)} />} label={t('pages.banners.form.showButton')} />
            <FormControlLabel control={<Switch checked={formData.is_active} onChange={e => handleInputChange('is_active', e.target.checked)} color="success" />} label={t('pages.banners.form.activeLabel')} />

            {/* Web Image Upload */}
            <Typography variant="subtitle2" sx={{ mt: 1, fontWeight: 600 }}>{t('pages.banners.form.webImageLabel')}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <input ref={webInputRef} type="file" accept="image/*" hidden onChange={handleFileSelect('web')} />
              <Button variant="outlined" startIcon={<UploadFileIcon />} onClick={() => webInputRef.current?.click()}>
                {webImage ? webImage.name : t('pages.banners.form.chooseWeb')}
              </Button>
            </Box>
            {webPreview ? (
              <Box sx={{ position: 'relative' }}>
                <Box
                  component="img"
                  src={webPreview}
                  alt="Web preview"
                  onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => { e.currentTarget.style.display = 'none'; (e.currentTarget.nextSibling as HTMLElement) && ((e.currentTarget.nextSibling as HTMLElement).style.display = 'flex'); }}
                  sx={{ width: '100%', maxHeight: 150, objectFit: 'contain', borderRadius: 1, border: '1px solid', borderColor: 'divider', display: 'block' }}
                />
                <Box sx={{ display: 'none', width: '100%', height: 80, borderRadius: 1, border: '1px dashed', borderColor: 'divider', alignItems: 'center', justifyContent: 'center', color: 'text.secondary', fontSize: 13 }}>
                   {t('pages.banners.errorLoadingImage')}
                </Box>
              </Box>
            ) : (
              <Box sx={{ width: '100%', height: 80, borderRadius: 1, border: '1px dashed', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.secondary', fontSize: 13, bgcolor: 'action.hover' }}>
                {t('pages.banners.noWebImage')}
              </Box>
            )}

            {/* Mobile Image Upload */}
            <Typography variant="subtitle2" sx={{ mt: 1, fontWeight: 600 }}>{t('pages.banners.form.mobileImageLabel')}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <input ref={mobileInputRef} type="file" accept="image/*" hidden onChange={handleFileSelect('mobile')} />
              <Button variant="outlined" startIcon={<UploadFileIcon />} onClick={() => mobileInputRef.current?.click()}>
                {mobileImage ? mobileImage.name : t('pages.banners.form.chooseMobile')}
              </Button>
            </Box>
            {mobilePreview ? (
              <Box sx={{ position: 'relative' }}>
                <Box
                  component="img"
                  src={mobilePreview}
                  alt="Mobile preview"
                  onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => { e.currentTarget.style.display = 'none'; (e.currentTarget.nextSibling as HTMLElement) && ((e.currentTarget.nextSibling as HTMLElement).style.display = 'flex'); }}
                  sx={{ width: 200, maxHeight: 150, objectFit: 'contain', borderRadius: 1, border: '1px solid', borderColor: 'divider', display: 'block' }}
                />
                <Box sx={{ display: 'none', width: 200, height: 80, borderRadius: 1, border: '1px dashed', borderColor: 'divider', alignItems: 'center', justifyContent: 'center', color: 'text.secondary', fontSize: 13 }}>
                  {t('pages.banners.errorLoadingImage')}
                </Box>
              </Box>
            ) : (
              <Box sx={{ width: 200, height: 80, borderRadius: 1, border: '1px dashed', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.secondary', fontSize: 13, bgcolor: 'action.hover' }}>
                 {t('pages.banners.noMobileImage')}
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenDialog(false)} color="inherit">{t('pages.banners.cancel')}</Button>
          <Button onClick={handleSave} variant="contained" disabled={isMutating}>
            {isMutating ? t('pages.banners.saving') : t('pages.banners.save')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
        <DialogTitle>{t('pages.banners.deleteTitle')}</DialogTitle>
        <DialogContent><Typography>{t('pages.banners.deleteConfirm', { id: current?.id })}</Typography></DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenDelete(false)} color="inherit">{t('pages.banners.cancel')}</Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={isMutating}>
            {isMutating ? t('pages.banners.deleting') : t('pages.banners.delete')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Crop Dialog */}
      <ImageCropDialog
        open={cropOpen}
        imageSrc={cropImageSrc}
        fileName={cropFileName}
        aspectRatio={cropAspect.ratio}
        aspectLabel={cropAspect.label}
        onConfirm={handleCropConfirm}
        onCancel={handleCropCancel}
      />
    </Box>
  );
};

export default BannersPage;

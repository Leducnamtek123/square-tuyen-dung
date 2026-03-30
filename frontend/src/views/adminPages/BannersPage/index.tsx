import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  Box, Typography, Breadcrumbs, Link, Button, Paper, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  FormControlLabel, Switch, Select, MenuItem, InputLabel, FormControl,
  Chip, Tooltip, IconButton, Stack
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { useTranslation } from 'react-i18next';
import adminManagementService from '../../../services/adminManagementService';
import { IMAGES } from '../../../configs/constants';
import { compressImageFile } from '../../../utils/imageCompression';
import ImageCropDialog from '../../../components/Common/ImageCropDialog';
import { ColumnDef } from '@tanstack/react-table';
import DataTable from '../../../components/Common/DataTable';
import { useDataTable } from '../../../hooks';

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

import { PaginatedResponse } from '@/types/api';

const BannersPage = () => {
  const { t } = useTranslation('admin');
  const [banners, setBanners] = useState<Record<string, unknown>[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [current, setCurrent] = useState<Record<string, unknown> | null>(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const {
    sorting,
    onSortingChange,
    ordering,
  } = useDataTable();

  // Form fields
  const [description, setDescription] = useState('');
  const [buttonText, setButtonText] = useState('');
  const [buttonLink, setButtonLink] = useState('');
  const [isShowButton, setIsShowButton] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [platform, setPlatform] = useState('WEB');
  const [type, setType] = useState(1);
  const [descriptionLocation, setDescriptionLocation] = useState(3);

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

  const fetchBanners = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const res = await adminManagementService.getBanners({ ordering }) as PaginatedResponse<Record<string, unknown>>;
      setBanners(res.results || []);
    } catch (e) {
      console.error('[BannersPage] fetchBanners error:', e);
      setFetchError(t('pages.banners.fetchError') || 'Không thể tải danh sách banner. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  }, [t, ordering]);

  useEffect(() => { fetchBanners(); }, [fetchBanners]);

  const resetForm = () => {
    setDescription(''); setButtonText(''); setButtonLink('');
    setIsShowButton(false); setIsActive(false);
    setPlatform('WEB'); setType(1); setDescriptionLocation(3);
    setWebImage(null); setMobileImage(null);
    setWebPreview(''); setMobilePreview('');
  };

  const handleOpenAdd = () => {
    setDialogMode('add'); setCurrent(null); resetForm();
    setOpenDialog(true);
  };

  const handleOpenEdit = (banner: Record<string, unknown>) => {
    setDialogMode('edit'); setCurrent(banner);
    setDescription(banner.description as string || '');
    setButtonText(banner.button_text as string || '');
    setButtonLink(banner.button_link as string || '');
    setIsShowButton(!!banner.is_show_button);
    setIsActive(!!banner.is_active);
    setPlatform(banner.platform as string || 'WEB');
    setType(banner.type as number ?? 1);
    setDescriptionLocation(banner.description_location as number ?? 3);
    setWebImage(null); setMobileImage(null);
    setWebPreview(banner.imageUrl as string || '');
    setMobilePreview(banner.imageMobileUrl as string || '');
    setOpenDialog(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const formData = new FormData();
    formData.append('description', description);
    formData.append('button_text', buttonText);
    if (buttonLink) formData.append('button_link', buttonLink);
    formData.append('is_show_button', String(isShowButton));
    formData.append('is_active', String(isActive));
    formData.append('platform', platform);
    formData.append('type', String(type));
    formData.append('description_location', String(descriptionLocation));

    if (webImage) formData.append('imageFile', webImage);
    if (mobileImage) formData.append('imageMobileFile', mobileImage);

    try {
      if (dialogMode === 'add') {
        await adminManagementService.createBanner(formData as unknown as Record<string, unknown>);
      } else {
        await adminManagementService.updateBanner(current!.id as string | number, formData as unknown as Record<string, unknown>);
      }
      setOpenDialog(false);
      fetchBanners();
    } catch (e) { console.error(e); }
    finally { setIsSaving(false); }
  };

  const handleDelete = async () => {
    setIsSaving(true);
    try {
      await adminManagementService.deleteBanner(current!.id as string | number);
      setOpenDelete(false);
      fetchBanners();
    } catch (e) { console.error(e); }
    finally { setIsSaving(false); }
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

  const cropAspect = ASPECT_RATIOS[type] || ASPECT_RATIOS[1];

  const columns = useMemo<ColumnDef<Record<string, unknown>>[]>(() => [
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
      cell: (info) => TYPE_OPTIONS.find(t => t.value === info.getValue())?.label || (info.getValue() as string),
    },
    {
      accessorKey: 'is_active',
      header: t('pages.banners.table.status') as string,
      cell: (info) => (
        <Chip label={info.getValue() ? t('pages.banners.active') : t('pages.banners.inactive')} size="small"
          color={info.getValue() ? 'success' : 'default'} />
      ),
    },
    {
      id: 'actions',
      header: t('pages.banners.table.actions') as string,
      meta: { align: 'right' },
      cell: (info) => (
        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
          <Tooltip title={t('pages.banners.table.edit')}>
            <IconButton size="small" onClick={() => handleOpenEdit(info.row.original)}>
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
            <Link underline="hover" color="inherit" href="/">{t('pages.banners.breadcrumbAdmin')}</Link>
            <Typography color="text.primary">{t('pages.banners.breadcrumb')}</Typography>
          </Breadcrumbs>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenAdd}
          sx={{ borderRadius: '8px', textTransform: 'none' }}>
          {t('pages.banners.addBtn')}
        </Button>
      </Box>

      {fetchError && (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4, gap: 2 }}>
          <Typography color="error">{fetchError}</Typography>
          <Button variant="outlined" color="primary" onClick={fetchBanners}>
            {t('pages.banners.retry') || 'Thử lại'}
          </Button>
        </Box>
      )}

      {!fetchError && (
        <DataTable
          columns={columns}
          data={banners || []}
          isLoading={isLoading}
          hidePagination
          enableSorting
          sorting={sorting}
          onSortingChange={onSortingChange}
          emptyMessage={t('pages.banners.empty')}
        />
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>{dialogMode === 'add' ? t('pages.banners.addTitle') : t('pages.banners.editTitle')}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label={t('pages.banners.form.description')} fullWidth value={description} onChange={e => setDescription(e.target.value)} />
            <TextField label={t('pages.banners.form.buttonText')} fullWidth value={buttonText} onChange={e => setButtonText(e.target.value)} />
            <TextField label={t('pages.banners.form.buttonLink')} fullWidth value={buttonLink} onChange={e => setButtonLink(e.target.value)} />
            <FormControl fullWidth size="small">
              <InputLabel>{t('pages.banners.form.platform')}</InputLabel>
              <Select value={platform} label={t('pages.banners.form.platform')} onChange={e => setPlatform(e.target.value)}>
                {PLATFORM_OPTIONS.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel>{t('pages.banners.form.bannerType')}</InputLabel>
              <Select value={type} label={t('pages.banners.form.bannerType')} onChange={e => setType(Number(e.target.value))}>
                {TYPE_OPTIONS.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel>{t('pages.banners.form.descLocation')}</InputLabel>
              <Select value={descriptionLocation} label={t('pages.banners.form.descLocation')} onChange={e => setDescriptionLocation(Number(e.target.value))}>
                {DESCRIPTION_LOCATIONS.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControlLabel control={<Switch checked={isShowButton} onChange={e => setIsShowButton(e.target.checked)} />} label={t('pages.banners.form.showButton')} />
            <FormControlLabel control={<Switch checked={isActive} onChange={e => setIsActive(e.target.checked)} color="success" />} label={t('pages.banners.form.activeLabel')} />

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
                  onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => { e.currentTarget.style.display = 'none'; (e.currentTarget.nextSibling as HTMLElement)?.style && ((e.currentTarget.nextSibling as HTMLElement).style.display = 'flex'); }}
                  sx={{ width: '100%', maxHeight: 150, objectFit: 'contain', borderRadius: 1, border: '1px solid', borderColor: 'divider', display: 'block' }}
                />
                <Box sx={{ display: 'none', width: '100%', height: 80, borderRadius: 1, border: '1px dashed', borderColor: 'divider', alignItems: 'center', justifyContent: 'center', color: 'text.secondary', fontSize: 13 }}>
                  Không thể tải ảnh. Vui lòng chọn ảnh mới.
                </Box>
              </Box>
            ) : (
              <Box sx={{ width: '100%', height: 80, borderRadius: 1, border: '1px dashed', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.secondary', fontSize: 13, bgcolor: 'action.hover' }}>
                Chưa có ảnh web
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
                  onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => { e.currentTarget.style.display = 'none'; (e.currentTarget.nextSibling as HTMLElement)?.style && ((e.currentTarget.nextSibling as HTMLElement).style.display = 'flex'); }}
                  sx={{ width: 200, maxHeight: 150, objectFit: 'contain', borderRadius: 1, border: '1px solid', borderColor: 'divider', display: 'block' }}
                />
                <Box sx={{ display: 'none', width: 200, height: 80, borderRadius: 1, border: '1px dashed', borderColor: 'divider', alignItems: 'center', justifyContent: 'center', color: 'text.secondary', fontSize: 13 }}>
                  Không thể tải ảnh. Vui lòng chọn ảnh mới.
                </Box>
              </Box>
            ) : (
              <Box sx={{ width: 200, height: 80, borderRadius: 1, border: '1px dashed', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.secondary', fontSize: 13, bgcolor: 'action.hover' }}>
                Chưa có ảnh mobile
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenDialog(false)} color="inherit">{t('pages.banners.cancel')}</Button>
          <Button onClick={handleSave} variant="contained" disabled={isSaving}>
            {isSaving ? t('pages.banners.saving') : t('pages.banners.save')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
        <DialogTitle>{t('pages.banners.deleteTitle')}</DialogTitle>
        <DialogContent><Typography>{t('pages.banners.deleteConfirm', { id: current?.id })}</Typography></DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenDelete(false)} color="inherit">{t('pages.banners.cancel')}</Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={isSaving}>
            {isSaving ? t('pages.banners.deleting') : t('pages.banners.delete')}
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

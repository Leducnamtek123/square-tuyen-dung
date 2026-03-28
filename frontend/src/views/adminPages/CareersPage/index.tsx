import React, { useRef, useState } from 'react';
import { Box, Typography, Breadcrumbs, Link, Button, Paper, TextField, InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions, FormControlLabel, Switch, Avatar, Chip, Tooltip, IconButton } from "@mui/material";
import { useTranslation } from 'react-i18next';
import { ColumnDef } from '@tanstack/react-table';
import DataTable from '../../../components/Common/DataTable';
import { useDataTable } from '../../../hooks';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { useCareers } from './hooks/useCareers';
import ImageCropDialog from '../../../components/Common/ImageCropDialog';

const CareersPage = () => {
    const { t } = useTranslation('admin');
    const {
        page,
        pageSize,
        sorting,
        onSortingChange,
        ordering,
        pagination,
        onPaginationChange,
        searchTerm,
        onSearchChange,
    } = useDataTable({ initialPageSize: 10 });

    const [openDialog, setOpenDialog] = useState(false);
    const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add'); // 'add' or 'edit'
    const [currentCareer, setCurrentCareer] = useState<any>(null);
    const [careerName, setCareerName] = useState('');
    const [appIconName, setAppIconName] = useState('');
    const [isHot, setIsHot] = useState(false);
    const [iconFile, setIconFile] = useState<File | null>(null);
    const [iconPreviewUrl, setIconPreviewUrl] = useState('');
    const iconInputRef = useRef<HTMLInputElement>(null);

    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

    const [cropOpen, setCropOpen] = useState(false);
    const [cropImageSrc, setCropImageSrc] = useState('');
    const [cropFileName, setCropFileName] = useState('');

    const handleCropConfirm = (croppedFile: File, previewUrl: string) => {
        setCropOpen(false);
        setIconFile(croppedFile);
        setIconPreviewUrl(previewUrl);
        if (cropImageSrc) URL.revokeObjectURL(cropImageSrc);
    };

    const handleCropCancel = () => {
        setCropOpen(false);
        if (cropImageSrc) URL.revokeObjectURL(cropImageSrc);
        setCropImageSrc('');
    };

    const {
        data,
        isLoading,
        createCareer,
        updateCareer,
        deleteCareer,
        isMutating
    } = useCareers({
        page: page + 1,
        pageSize: pageSize,
        kw: searchTerm,
        ordering,
    }) as any;

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        onSearchChange(e.target.value);
    };

    const handleOpenAdd = () => {
        setDialogMode('add');
        setCareerName('');
        setAppIconName('');
        setIsHot(false);
        setIconFile(null);
        setIconPreviewUrl('');
        setCurrentCareer(null);
        setOpenDialog(true);
    };

    const handleOpenEdit = (career: any) => {
        setDialogMode('edit');
        setCurrentCareer(career);
        setCareerName(career.name);
        setAppIconName(career.appIconName || '');
        setIsHot(!!career.isHot);
        setIconFile(null);
        setIconPreviewUrl(career.iconUrl || '');
        setOpenDialog(true);
    };

    const handleOpenDelete = (career: any) => {
        setCurrentCareer(career);
        setOpenDeleteDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const handleChooseIcon = () => {
        iconInputRef.current?.click();
    };

    const handleIconFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;
        setCropFileName(selectedFile.name);
        setCropImageSrc(URL.createObjectURL(selectedFile));
        setCropOpen(true);
        e.target.value = '';
    };

    const handleSave = async () => {
        if (!careerName.trim()) return;

        const payload = new FormData();
        payload.append('name', careerName.trim());
        payload.append('app_icon_name', appIconName || '');
        payload.append('is_hot', String(isHot));
        if (iconFile) {
            payload.append('iconFile', iconFile);
        }

        try {
            if (dialogMode === 'add') {
                await createCareer(payload);
            } else {
                await updateCareer({ id: currentCareer.id, data: payload });
            }
            handleCloseDialog();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async () => {
        try {
            await deleteCareer(currentCareer.id);
            setOpenDeleteDialog(false);
        } catch (error) {
            console.error(error);
        }
    };

    const columns = React.useMemo<ColumnDef<any>[]>(() => [
        {
            accessorKey: 'id',
            header: t('pages.careers.table.id') as string,
            enableSorting: true,
            size: 80,
        },
        {
            accessorKey: 'iconUrl',
            header: t('pages.careers.table.symbol') as string,
            cell: (info) => (
                <Avatar
                    src={info.getValue() as string}
                    variant="rounded"
                    sx={{ width: 32, height: 32, bgcolor: 'primary.light' }}
                >
                    {info.row.original.name.charAt(0)}
                </Avatar>
            ),
            size: 80,
        },
        {
            accessorKey: 'name',
            header: t('pages.careers.table.careerName') as string,
            enableSorting: true,
            cell: (info) => <Typography sx={{ fontWeight: 500 }}>{info.getValue() as string}</Typography>,
        },
        {
            accessorKey: 'appIconName',
            header: t('pages.careers.iconLabel') as string,
            cell: (info) => info.getValue() || '---',
        },
        {
            accessorKey: 'isHot',
            header: t('pages.careers.keyCareerLabel') as string,
            enableSorting: true,
            meta: { align: 'center' },
            cell: (info) => info.getValue() ? (
                <Chip label={t('pages.careers.keyCareerBadge')} size="small" color="warning" />
            ) : '---',
        },
        {
            accessorKey: 'jobPostTotal',
            header: t('pages.careers.table.totalPosts') as string,
            enableSorting: true,
            meta: { align: 'center' },
            cell: (info) => info.getValue() || 0,
        },
        {
            id: 'actions',
            header: t('pages.careers.table.actions') as string,
            meta: { align: 'right' },
            cell: (info) => (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <Tooltip title={t('pages.careers.table.edit')}>
                        <IconButton size="small" onClick={() => handleOpenEdit(info.row.original)} color="primary">
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={t('pages.careers.table.delete')}>
                        <IconButton size="small" onClick={() => handleOpenDelete(info.row.original)} color="error">
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
            ),
        },
    ], [t]);

    return (
        <Box>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
                        {t('pages.careers.title')}
                    </Typography>
                    <Breadcrumbs aria-label={t('common.breadcrumb')}>
                        <Link underline="hover" color="inherit" href="/admin">
                            {t('pages.careers.breadcrumbAdmin')}
                        </Link>
                        <Typography color="text.primary">{t('pages.careers.breadcrumbGeneral')}</Typography>
                        <Typography color="text.primary">{t('pages.careers.breadcrumbCareers')}</Typography>
                    </Breadcrumbs>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpenAdd}
                    sx={{ borderRadius: '8px', textTransform: 'none' }}
                >
                    {t('pages.careers.addCareer')}
                </Button>
            </Box>
            <Paper sx={{ p: 2, mb: 3, borderRadius: '12px' }} elevation={0}>
                <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
                    <TextField
                        size="small"
                        placeholder={t('pages.careers.searchPlaceholder')}
                        value={searchTerm}
                        onChange={handleSearch}
                        sx={{ width: 300 }}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon fontSize="small" color="action" />
                                    </InputAdornment>
                                ),
                            }
                        }}
                    />
                </Box>


                <DataTable
                    columns={columns}
                    data={(data as any)?.results || []}
                    isLoading={isLoading}
                    rowCount={(data as any)?.count || 0}
                    pagination={pagination}
                    onPaginationChange={onPaginationChange}
                    enableSorting
                    sorting={sorting}
                    onSortingChange={onSortingChange}
                />
            </Paper>
            {/* Add/Edit Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="xs">
                <DialogTitle>
                    {dialogMode === 'add' ? t('pages.careers.addConfirmTitle') : t('pages.careers.editConfirmTitle')}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            label={t('pages.careers.careerNameLabel')}
                            fullWidth
                            value={careerName}
                            onChange={(e) => setCareerName(e.target.value)}
                            required
                        />
                        <TextField
                            label={t('pages.careers.iconLabel')}
                            fullWidth
                            value={appIconName}
                            onChange={(e) => setAppIconName(e.target.value)}
                        />
                        <FormControlLabel
                            control={<Switch checked={isHot} onChange={(e) => setIsHot(e.target.checked)} />}
                            label={t('pages.careers.keyCareerLabel')}
                        />
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <input
                                ref={iconInputRef}
                                type="file"
                                accept="image/*"
                                hidden
                                onChange={handleIconFileChange}
                            />
                            <Button
                                variant="outlined"
                                startIcon={<UploadFileIcon />}
                                onClick={handleChooseIcon}
                            >
                                {t('pages.careers.uploadIconBtn')}
                            </Button>
                            <Typography variant="body2" color="text.secondary">
                                {iconFile?.name || t('pages.careers.noIconSelected')}
                            </Typography>
                        </Box>
                        {iconPreviewUrl ? (
                            <Box sx={{ position: 'relative', display: 'inline-block' }}>
                                <Box
                                    component="img"
                                    src={iconPreviewUrl}
                                    alt="Career icon preview"
                                    onError={(e: any) => {
                                        e.currentTarget.style.display = 'none';
                                        const sibling = e.currentTarget.nextSibling as HTMLElement;
                                        if (sibling) sibling.style.display = 'flex';
                                    }}
                                    sx={{ width: 64, height: 64, borderRadius: 2, objectFit: 'cover', border: '1px solid', borderColor: 'divider', display: 'block' }}
                                />
                                <Box sx={{ display: 'none', width: 64, height: 64, borderRadius: 2, border: '1px dashed', borderColor: 'divider', alignItems: 'center', justifyContent: 'center', color: 'text.secondary', fontSize: 11, textAlign: 'center', p: 0.5 }}>
                                    Lỗi ảnh
                                </Box>
                            </Box>
                        ) : (
                            <Box sx={{ width: 64, height: 64, borderRadius: 2, border: '1px dashed', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.secondary', fontSize: 11, textAlign: 'center', bgcolor: 'action.hover' }}>
                                Chưa có icon
                            </Box>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={handleCloseDialog} color="inherit">{t('pages.careers.cancelBtn')}</Button>
                    <Button
                        onClick={handleSave}
                        variant="contained"
                        disabled={isMutating || !careerName.trim()}
                    >
                        {isMutating ? t('pages.careers.savingBtn') : t('pages.careers.saveBtn')}
                    </Button>
                </DialogActions>
            </Dialog>
            {/* Delete Confirmation */}
            <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
                <DialogTitle>{t('pages.careers.deleteTitle')}</DialogTitle>
                <DialogContent>
                    <Typography dangerouslySetInnerHTML={{ __html: t('pages.careers.deleteText', { name: currentCareer?.name }) }} />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setOpenDeleteDialog(false)} color="inherit">{t('pages.careers.cancelBtn')}</Button>
                    <Button
                        onClick={handleDelete}
                        color="error"
                        variant="contained"
                        disabled={isMutating}
                    >
                        {isMutating ? t('pages.careers.deletingBtn') : t('pages.careers.deleteBtn')}
                    </Button>
                </DialogActions>
            </Dialog>
            <ImageCropDialog
                open={cropOpen}
                imageSrc={cropImageSrc}
                fileName={cropFileName}
                aspectRatio={1}
                aspectLabel="1:1"
                onConfirm={handleCropConfirm}
                onCancel={handleCropCancel}
            />
        </Box>
    );
};

export default CareersPage;

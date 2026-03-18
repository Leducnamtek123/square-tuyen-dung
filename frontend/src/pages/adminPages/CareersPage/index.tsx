// @ts-nocheck
import React, { useRef, useState } from 'react';
import { Box, Typography, Breadcrumbs, Link, Button, Paper, TextField, InputAdornment, Pagination, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, FormControlLabel, Switch } from "@mui/material";
import { useTranslation } from 'react-i18next';

import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { useCareers } from './hooks/useCareers';
import CareerTable from './components/CareerTable';

interface Props {
  [key: string]: any;
}



const CareersPage = () => {
    const { t } = useTranslation('admin');
    const PAGE_SIZE = 10;
    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');

    const [openDialog, setOpenDialog] = useState(false);
    const [dialogMode, setDialogMode] = useState('add'); // 'add' or 'edit'
    const [currentCareer, setCurrentCareer] = useState(null);
    const [careerName, setCareerName] = useState('');
    const [appIconName, setAppIconName] = useState('');
    const [isHot, setIsHot] = useState(false);
    const [iconFile, setIconFile] = useState(null);
    const [iconPreviewUrl, setIconPreviewUrl] = useState('');
    const iconInputRef = useRef(null);

    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

    const {
        data,
        isLoading,
        createCareer,
        updateCareer,
        deleteCareer,
        isMutating
    } = useCareers({
        page,
        pageSize: PAGE_SIZE,
        kw: searchTerm
    });

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setPage(1);
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

    const handleOpenEdit = (career) => {
        setDialogMode('edit');
        setCurrentCareer(career);
        setCareerName(career.name);
        setAppIconName(career.appIconName || '');
        setIsHot(!!career.isHot);
        setIconFile(null);
        setIconPreviewUrl(career.iconUrl || '');
        setOpenDialog(true);
    };

    const handleOpenDelete = (career) => {
        setCurrentCareer(career);
        setOpenDeleteDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const handleChooseIcon = () => {
        iconInputRef.current?.click();
    };

    const handleIconFileChange = (e) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;
        setIconFile(selectedFile);
        setIconPreviewUrl(URL.createObjectURL(selectedFile));
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

                {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                        <CircularProgress size={40} />
                    </Box>
                ) : (
                    <>
                        <CareerTable
                            data={data?.results || data}
                            onEdit={handleOpenEdit}
                            onDelete={handleOpenDelete}
                        />
                        {data?.count > 0 && (
                            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                                <Pagination
                                    count={Math.ceil(data.count / PAGE_SIZE)}
                                    page={page}
                                    onChange={(e, v) => setPage(v)}
                                    color="primary"
                                />
                            </Box>
                        )}
                    </>
                )}
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
                            <Box
                                component="img"
                                src={iconPreviewUrl}
                                alt="Career icon preview"
                                sx={{ width: 64, height: 64, borderRadius: 2, objectFit: 'cover', border: '1px solid', borderColor: 'divider' }}
                            />
                        ) : null}
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
        </Box>
    );
};

export default CareersPage;

import React, { useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Breadcrumbs,
  Link,
  Paper,
  TextField,
  InputAdornment,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  IconButton,
  Stack,
  Chip,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ColumnDef } from '@tanstack/react-table';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DataTable from '../../../components/Common/DataTable';
import { BannerType } from '../../../types/models';
import { useDataTable } from '../../../hooks';
import { useBannerTypes } from './hooks/useBannerTypes';

interface BannerTypeFormData {
  code: string;
  name: string;
  value: number;
  web_aspect_ratio: string;
  mobile_aspect_ratio: string;
  is_active: boolean;
}

const defaultForm: BannerTypeFormData = {
  code: '',
  name: '',
  value: 1,
  web_aspect_ratio: '',
  mobile_aspect_ratio: '',
  is_active: true,
};

const BannerTypesPage = () => {
  const { t } = useTranslation('admin');
  const {
    page,
    pageSize,
    sorting,
    onSortingChange,
    ordering,
    pagination,
    onPaginationChange,
  } = useDataTable({ initialPageSize: 10 });

  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [current, setCurrent] = useState<BannerType | null>(null);
  const [formData, setFormData] = useState<BannerTypeFormData>(defaultForm);
  const [openDelete, setOpenDelete] = useState(false);

  const {
    data,
    isLoading,
    createBannerType,
    updateBannerType,
    deleteBannerType,
    isMutating,
  } = useBannerTypes({
    page: page + 1,
    pageSize,
    kw: searchTerm,
    ordering,
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    onPaginationChange({ pageIndex: 0, pageSize });
  };

  const handleOpenAdd = () => {
    setDialogMode('add');
    setCurrent(null);
    setFormData(defaultForm);
    setOpenDialog(true);
  };

  const handleOpenEdit = (item: BannerType) => {
    setDialogMode('edit');
    setCurrent(item);
    setFormData({
      code: item.code || '',
      name: item.name || '',
      value: item.value || 1,
      web_aspect_ratio: item.web_aspect_ratio || '',
      mobile_aspect_ratio: item.mobile_aspect_ratio || '',
      is_active: item.is_active !== false,
    });
    setOpenDialog(true);
  };

  const handleClose = () => {
    setOpenDialog(false);
    setOpenDelete(false);
  };

  const handleSave = async () => {
    const payload = {
      ...formData,
      code: formData.code.trim().toUpperCase(),
      name: formData.name.trim(),
      web_aspect_ratio: formData.web_aspect_ratio.trim(),
      mobile_aspect_ratio: formData.mobile_aspect_ratio.trim(),
    };
    try {
      if (dialogMode === 'add') {
        await createBannerType(payload);
      } else if (current) {
        await updateBannerType({ id: current.id, data: payload });
      }
      handleClose();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (!current) return;
    try {
      await deleteBannerType(current.id);
      handleClose();
    } catch (error) {
      console.error(error);
    }
  };

  const columns = useMemo<ColumnDef<BannerType>[]>(() => [
    { accessorKey: 'id', header: 'ID', enableSorting: true },
    { accessorKey: 'code', header: 'Code', enableSorting: true },
    { accessorKey: 'name', header: 'Name', enableSorting: true },
    { accessorKey: 'value', header: 'Value', enableSorting: true },
    {
      accessorKey: 'web_aspect_ratio',
      header: 'Web Aspect Ratio',
      cell: (info) => (info.getValue() as string) || '-',
    },
    {
      accessorKey: 'is_active',
      header: 'Status',
      cell: (info) => (
        <Chip
          size="small"
          label={info.getValue() ? t('common.active') : t('common.inactive')}
          color={info.getValue() ? 'success' : 'default'}
          variant="outlined"
        />
      ),
    },
    {
      id: 'actions',
      header: t('common.actions') as string,
      meta: { align: 'right' },
      cell: (info) => (
        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
          <Tooltip title={t('common.edit')}>
            <IconButton size="small" color="primary" onClick={() => handleOpenEdit(info.row.original)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('common.delete')}>
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
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>Banner Types</Typography>
          <Breadcrumbs>
            <Link underline="hover" color="inherit" href="/admin">Admin</Link>
            <Typography color="text.primary">Banner Types</Typography>
          </Breadcrumbs>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenAdd}>
          Add Banner Type
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3, borderRadius: '12px' }} elevation={0}>
        <Box sx={{ mb: 3 }}>
          <TextField
            size="small"
            placeholder="Search banner types..."
            value={searchTerm}
            onChange={handleSearch}
            sx={{ width: 400 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>

        <DataTable
          columns={columns}
          data={data?.results || []}
          isLoading={isLoading}
          rowCount={data?.count || 0}
          pagination={pagination}
          onPaginationChange={onPaginationChange}
          enableSorting
          sorting={sorting}
          onSortingChange={onSortingChange}
        />
      </Paper>

      <Dialog open={openDialog} onClose={handleClose} fullWidth maxWidth="xs">
        <DialogTitle>
          {dialogMode === 'add' ? 'Add Banner Type' : 'Edit Banner Type'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField label="Code" value={formData.code} onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value }))} required />
            <TextField label="Name" value={formData.name} onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))} required />
            <TextField
              label="Value"
              type="number"
              value={formData.value}
              onChange={(e) => setFormData((prev) => ({ ...prev, value: Number(e.target.value) || 1 }))}
              required
            />
            <TextField
              label="Web Aspect Ratio"
              value={formData.web_aspect_ratio}
              onChange={(e) => setFormData((prev) => ({ ...prev, web_aspect_ratio: e.target.value }))}
            />
            <TextField
              label="Mobile Aspect Ratio"
              value={formData.mobile_aspect_ratio}
              onChange={(e) => setFormData((prev) => ({ ...prev, mobile_aspect_ratio: e.target.value }))}
            />
            <FormControlLabel
              control={<Switch checked={formData.is_active} onChange={(e) => setFormData((prev) => ({ ...prev, is_active: e.target.checked }))} />}
              label="Active"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} color="inherit">{t('common.cancel')}</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={isMutating || !formData.code.trim() || !formData.name.trim() || formData.value <= 0}
          >
            {isMutating ? t('common.saving') : t('common.save')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDelete} onClose={handleClose}>
        <DialogTitle>Delete Banner Type</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete banner type {current?.name}?</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} color="inherit">{t('common.cancel')}</Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={isMutating}>
            {isMutating ? t('common.deleting') : t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BannerTypesPage;

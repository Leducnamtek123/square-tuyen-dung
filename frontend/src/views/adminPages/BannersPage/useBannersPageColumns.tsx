import React from 'react';
import { Box, Chip, IconButton, Stack, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { ColumnDef } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import { IMAGES } from '../../../configs/constants';
import type { Banner } from '../../../types/models';

interface UseBannersPageColumnsArgs {
  typeOptions: { value: string | number; label: string }[];
  onEdit: (banner: Banner) => void;
  onDelete: (banner: Banner) => void;
}

export const useBannersPageColumns = ({ typeOptions, onEdit, onDelete }: UseBannersPageColumnsArgs) => {
  const { t } = useTranslation('admin');

  return React.useMemo<ColumnDef<Banner>[]>(
    () => [
      {
        accessorKey: 'id',
        header: t('pages.banners.table.id') as string,
        enableSorting: true,
      },
      {
        accessorKey: 'imageUrl',
        header: t('pages.banners.table.webImage') as string,
        cell: (info) =>
          info.getValue() ? (
            <Box
              component="img"
              src={info.getValue() as string}
              alt="web banner"
              onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                e.currentTarget.src = IMAGES.companyLogoDefault;
              }}
              sx={{ width: 120, height: 60, objectFit: 'cover', borderRadius: 1 }}
            />
          ) : (
            '—'
          ),
      },
      {
        accessorKey: 'imageMobileUrl',
        header: t('pages.banners.table.mobileImage') as string,
        cell: (info) =>
          info.getValue() ? (
            <Box
              component="img"
              src={info.getValue() as string}
              alt="mobile banner"
              onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                e.currentTarget.src = IMAGES.companyLogoDefault;
              }}
              sx={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 1 }}
            />
          ) : (
            '—'
          ),
      },
      {
        accessorKey: 'description',
        header: t('pages.banners.table.description') as string,
        enableSorting: true,
        cell: (info) => (
          <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {(info.getValue() as string) || '—'}
          </Typography>
        ),
      },
      {
        accessorKey: 'platform',
        header: t('pages.banners.table.platform') as string,
        enableSorting: true,
        cell: (info) => (
          <Chip
            label={info.getValue() as string}
            size="small"
            color={info.getValue() === 'WEB' ? 'primary' : 'secondary'}
          />
        ),
      },
      {
        accessorKey: 'type',
        header: t('pages.banners.table.type') as string,
        enableSorting: true,
        cell: (info) => typeOptions.find((opt) => opt.value === info.getValue())?.label || (info.getValue() as string | number),
      },
      {
        accessorKey: 'is_active',
        header: t('pages.banners.table.status') as string,
        cell: (info) => (
          <Chip
            label={info.getValue() ? t('pages.banners.active') : t('pages.banners.inactive')}
            size="small"
            color={info.getValue() ? 'success' : 'default'}
            variant="outlined"
          />
        ),
      },
      {
        id: 'actions',
        header: t('pages.banners.table.actions') as string,
        meta: { align: 'right' },
        cell: (info) => (
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <IconButton size="small" color="primary" onClick={() => onEdit(info.row.original)}>
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" color="error" onClick={() => onDelete(info.row.original)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Stack>
        ),
      },
    ],
    [onDelete, onEdit, t, typeOptions]
  );
};

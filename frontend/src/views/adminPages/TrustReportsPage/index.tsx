'use client';

import React from 'react';
import {
  Box,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import adminManagementService from '../../../services/adminManagementService';
import toastMessages from '../../../utils/toastMessages';
import type { TrustReport } from '../../../types/models';

const STATUS_OPTIONS: TrustReport['status'][] = ['open', 'reviewing', 'resolved', 'rejected'];

const statusColor = (status: TrustReport['status']) => {
  if (status === 'resolved') return 'success';
  if (status === 'rejected') return 'default';
  if (status === 'reviewing') return 'warning';
  return 'error';
};

const TrustReportsPage = () => {
  const { t } = useTranslation('admin');
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['admin-trust-reports'],
    queryFn: () => adminManagementService.getTrustReports({ page: 1, pageSize: 100 }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: TrustReport['status'] }) =>
      adminManagementService.updateTrustReport(id, { status }),
    onSuccess: () => {
      toastMessages.success(t('pages.trustReports.toast.updateSuccess'));
      queryClient.invalidateQueries({ queryKey: ['admin-trust-reports'] });
    },
    onError: () => toastMessages.error(t('pages.trustReports.toast.updateError')),
  });

  const rows = data?.results || [];
  const emptyValue = t('common.na');
  const getStatusLabel = (status: TrustReport['status']) => {
    switch (status) {
      case 'reviewing':
        return t('pages.trustReports.status.reviewing');
      case 'resolved':
        return t('pages.trustReports.status.resolved');
      case 'rejected':
        return t('pages.trustReports.status.rejected');
      case 'open':
      default:
        return t('pages.trustReports.status.open');
    }
  };

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {t('pages.trustReports.title')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('pages.trustReports.subtitle')}
          </Typography>
        </Box>
      </Stack>

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
        <Table sx={{ minWidth: 900 }}>
          <TableHead>
            <TableRow>
              <TableCell>{t('pages.trustReports.table.id')}</TableCell>
              <TableCell>{t('pages.trustReports.table.target')}</TableCell>
              <TableCell>{t('pages.trustReports.table.reason')}</TableCell>
              <TableCell>{t('pages.trustReports.table.reporter')}</TableCell>
              <TableCell>{t('pages.trustReports.table.message')}</TableCell>
              <TableCell>{t('pages.trustReports.table.status')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell>{row.id}</TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {row.targetTitle || row.targetType}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {row.targetType}
                  </Typography>
                </TableCell>
                <TableCell>{row.reason}</TableCell>
                <TableCell>{row.reporterDict?.email || emptyValue}</TableCell>
                <TableCell sx={{ maxWidth: 280 }}>{row.message || emptyValue}</TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip size="small" label={getStatusLabel(row.status)} color={statusColor(row.status)} variant="outlined" />
                    <FormControl size="small" sx={{ minWidth: 130 }}>
                      <InputLabel>{t('pages.trustReports.table.status')}</InputLabel>
                      <Select
                        label={t('pages.trustReports.table.status')}
                        value={row.status}
                        disabled={updateMutation.isPending}
                        onChange={(event) =>
                          updateMutation.mutate({ id: row.id, status: event.target.value as TrustReport['status'] })
                        }
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <MenuItem key={status} value={status}>
                            {getStatusLabel(status)}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
            {!isLoading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                  {t('pages.trustReports.empty')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default TrustReportsPage;

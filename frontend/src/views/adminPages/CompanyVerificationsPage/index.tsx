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
  TextField,
  Typography,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import adminManagementService from '../../../services/adminManagementService';
import toastMessages from '../../../utils/toastMessages';
import type { CompanyVerification } from '../../../types/models';

type VerificationStatus = NonNullable<CompanyVerification['status']>;

const STATUS_OPTIONS: VerificationStatus[] = ['pending', 'reviewing', 'approved', 'rejected'];

const statusColor = (status: VerificationStatus) => {
  if (status === 'approved') return 'success';
  if (status === 'rejected') return 'error';
  if (status === 'reviewing') return 'warning';
  return 'info';
};

const CompanyVerificationsPage = () => {
  const { t } = useTranslation('admin');
  const queryClient = useQueryClient();
  const [notes, setNotes] = React.useState<Record<number, string>>({});
  const { data, isLoading } = useQuery({
    queryKey: ['admin-company-verifications'],
    queryFn: () => adminManagementService.getCompanyVerifications({ page: 1, pageSize: 100 }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status, adminNote }: { id: number; status: VerificationStatus; adminNote?: string }) =>
      adminManagementService.updateCompanyVerification(id, { status, adminNote }),
    onSuccess: () => {
      toastMessages.success(t('pages.companyVerifications.toast.updateSuccess'));
      queryClient.invalidateQueries({ queryKey: ['admin-company-verifications'] });
    },
    onError: () => toastMessages.error(t('pages.companyVerifications.toast.updateError')),
  });

  const rows = data?.results || [];
  const emptyValue = t('common.na');
  const getStatusLabel = (status: VerificationStatus) => {
    switch (status) {
      case 'reviewing':
        return t('pages.companyVerifications.status.reviewing');
      case 'approved':
        return t('pages.companyVerifications.status.approved');
      case 'rejected':
        return t('pages.companyVerifications.status.rejected');
      case 'pending':
      default:
        return t('pages.companyVerifications.status.pending');
    }
  };

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {t('pages.companyVerifications.title')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('pages.companyVerifications.subtitle')}
          </Typography>
        </Box>
      </Stack>

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
        <Table sx={{ minWidth: 1000 }}>
          <TableHead>
            <TableRow>
              <TableCell>{t('pages.companyVerifications.table.company')}</TableCell>
              <TableCell>{t('pages.companyVerifications.table.legalProfile')}</TableCell>
              <TableCell>{t('pages.companyVerifications.table.appointment')}</TableCell>
              <TableCell>{t('pages.companyVerifications.table.adminNote')}</TableCell>
              <TableCell>{t('pages.companyVerifications.table.status')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => {
              const status = row.status || 'pending';
              const note = notes[row.id || 0] ?? row.adminNote ?? '';
              return (
                <TableRow key={row.id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {row.companyDict?.companyName || row.companyName || emptyValue}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {row.companyDict?.companyEmail || row.email || emptyValue}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {t('pages.companyVerifications.legal.tax', { value: row.taxCode || emptyValue })}
                    </Typography>
                    <Typography variant="body2">
                      {t('pages.companyVerifications.legal.license', { value: row.businessLicense || emptyValue })}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {t('pages.companyVerifications.legal.representative', { value: row.representative || emptyValue })}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{row.scheduledAt || emptyValue}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {row.contactName || emptyValue} {row.contactPhone ? `- ${row.contactPhone}` : ''}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      value={note}
                      onChange={(event) => setNotes((prev) => ({ ...prev, [row.id || 0]: event.target.value }))}
                      placeholder={t('pages.companyVerifications.reviewNotePlaceholder')}
                      multiline
                      minRows={2}
                    />
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip size="small" label={getStatusLabel(status)} color={statusColor(status)} variant="outlined" />
                      <FormControl size="small" sx={{ minWidth: 130 }}>
                        <InputLabel>{t('pages.companyVerifications.table.status')}</InputLabel>
                        <Select
                          label={t('pages.companyVerifications.table.status')}
                          value={status}
                          disabled={updateMutation.isPending || !row.id}
                          onChange={(event) =>
                            row.id &&
                            updateMutation.mutate({
                              id: row.id,
                              status: event.target.value as VerificationStatus,
                              adminNote: note,
                            })
                          }
                        >
                          {STATUS_OPTIONS.map((item) => (
                            <MenuItem key={item} value={item}>
                              {getStatusLabel(item)}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Stack>
                  </TableCell>
                </TableRow>
              );
            })}
            {!isLoading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                  {t('pages.companyVerifications.empty')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default CompanyVerificationsPage;

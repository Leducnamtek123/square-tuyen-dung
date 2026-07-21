import React from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { Trans } from 'react-i18next';
import type { Company } from '../../../types/models';
import type { TFunction } from 'i18next';

type Props = {
  open: boolean;
  company: Company | null;
  loading: boolean;
  t: TFunction;
  onClose: () => void;
  onDelete: () => void;
};

const CompanyDeleteDialog = ({ open, company, loading, t, onClose, onDelete }: Props) => (
  <Dialog open={open} onClose={onClose}>
    <DialogTitle>{t('pages.companies.deleteTitle')}</DialogTitle>
    <DialogContent>
      <Typography>
        <Trans
          t={t}
          i18nKey="pages.companies.deleteText"
          values={{ name: company?.companyName || '' }}
          components={{ strong: <strong /> }}
        />
      </Typography>
    </DialogContent>
    <DialogActions sx={{ px: 3, pb: 2 }}>
      <Button onClick={onClose} color="inherit">{t('pages.companies.cancelBtn')}</Button>
      <Button onClick={onDelete} color="error" variant="contained" disabled={loading}>
        {loading ? t('pages.companies.deletingBtn') : t('pages.companies.deleteBtn')}
      </Button>
    </DialogActions>
  </Dialog>
);

export default CompanyDeleteDialog;

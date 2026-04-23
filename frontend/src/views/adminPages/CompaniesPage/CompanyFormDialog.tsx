import React from 'react';
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material';
import { Grid2 as Grid } from '@mui/material';
import type { CompanyFormData } from './types';
import type { TFunction } from 'i18next';
import { IMAGES } from '../../../configs/constants';

type Props = {
  open: boolean;
  mode: 'add' | 'edit';
  formData: CompanyFormData;
  logoPreview: string;
  isMutating: boolean;
  t: TFunction;
  onClose: () => void;
  onSave: () => void;
  onFieldChange: (name: string, value: string) => void;
  onLocationChange: (name: 'city' | 'district' | 'ward' | 'address' | 'lat' | 'lng', value: string) => void;
};

const CompanyFormDialog = ({
  open,
  mode,
  formData,
  logoPreview,
  isMutating,
  t,
  onClose,
  onSave,
  onFieldChange,
  onLocationChange,
}: Props) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ fontWeight: 700 }}>
        {mode === 'add' ? t('pages.companies.addConfirmTitle') : t('pages.companies.editConfirmTitle')}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3} sx={{ pt: 1 }}>
          <Grid size={12} sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar
                src={logoPreview || IMAGES.companyLogoDefault}
                sx={{ width: 100, height: 100, border: '2px solid', borderColor: 'primary.main', borderRadius: '12px' }}
                variant="rounded"
              />
            </Box>
          </Grid>

          <Grid size={12}>
            <TextField label={t('pages.companies.companyNameLabel')} fullWidth name="companyName" value={formData.companyName} onChange={(e) => onFieldChange('companyName', e.target.value)} required />
          </Grid>
          <Grid size={6}>
            <TextField label={t('pages.companies.taxCodeLabel')} fullWidth name="taxCode" value={formData.taxCode} onChange={(e) => onFieldChange('taxCode', e.target.value)} required />
          </Grid>
          <Grid size={6}>
            <TextField label={t('pages.companies.employeeSizeLabel')} fullWidth type="number" name="employeeSize" value={formData.employeeSize} onChange={(e) => onFieldChange('employeeSize', e.target.value)} required />
          </Grid>
          <Grid size={6}>
            <TextField label={t('pages.companies.companyEmailLabel')} fullWidth name="companyEmail" value={formData.companyEmail} onChange={(e) => onFieldChange('companyEmail', e.target.value)} required />
          </Grid>
          <Grid size={6}>
            <TextField label={t('pages.companies.companyPhoneLabel')} fullWidth name="companyPhone" value={formData.companyPhone} onChange={(e) => onFieldChange('companyPhone', e.target.value)} required />
          </Grid>
          <Grid size={12}>
            <TextField label={t('pages.companies.fieldOperationLabel')} fullWidth name="fieldOperation" value={formData.fieldOperation} onChange={(e) => onFieldChange('fieldOperation', e.target.value)} required />
          </Grid>
          <Grid size={12}>
            <TextField label={t('pages.companies.websiteLabel')} fullWidth name="websiteUrl" value={formData.websiteUrl || ''} onChange={(e) => onFieldChange('websiteUrl', e.target.value)} placeholder="https://..." />
          </Grid>
          <Grid size={12}>
            <TextField label={t('pages.companies.form.since', 'Founded date')} fullWidth type="date" name="since" value={formData.since || ''} onChange={(e) => onFieldChange('since', e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
          </Grid>
          <Grid size={4}>
            <TextField label={t('pages.companies.form.cityId', 'City ID')} fullWidth type="number" name="location.city" value={formData.location.city ?? ''} onChange={(e) => onLocationChange('city', e.target.value)} />
          </Grid>
          <Grid size={4}>
            <TextField label={t('pages.companies.form.districtId', 'District ID')} fullWidth type="number" name="location.district" value={formData.location.district ?? ''} onChange={(e) => onLocationChange('district', e.target.value)} />
          </Grid>
          <Grid size={4}>
            <TextField label={t('pages.companies.form.wardId', 'Ward ID')} fullWidth type="number" name="location.ward" value={formData.location.ward ?? ''} onChange={(e) => onLocationChange('ward', e.target.value)} />
          </Grid>
          <Grid size={12}>
            <TextField label={t('pages.companies.form.address', 'Address')} fullWidth name="location.address" value={formData.location.address} onChange={(e) => onLocationChange('address', e.target.value)} required />
          </Grid>
          <Grid size={6}>
            <TextField label={t('pages.companies.form.latitude', 'Latitude')} fullWidth type="number" name="location.lat" value={formData.location.lat ?? ''} onChange={(e) => onLocationChange('lat', e.target.value)} />
          </Grid>
          <Grid size={6}>
            <TextField label={t('pages.companies.form.longitude', 'Longitude')} fullWidth type="number" name="location.lng" value={formData.location.lng ?? ''} onChange={(e) => onLocationChange('lng', e.target.value)} />
          </Grid>
          <Grid size={12}>
            <TextField label={t('pages.companies.descriptionLabel')} fullWidth multiline rows={4} name="description" value={formData.description || ''} onChange={(e) => onFieldChange('description', e.target.value)} />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} color="inherit">{t('pages.companies.cancelBtn')}</Button>
        <Button onClick={onSave} variant="contained" disabled={isMutating || !formData.companyName || !formData.taxCode || !formData.location.address} sx={{ px: 4 }}>
          {isMutating ? t('pages.companies.savingBtn') : t('pages.companies.saveBtn')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CompanyFormDialog;

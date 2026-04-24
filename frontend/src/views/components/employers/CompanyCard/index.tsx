'use client';
import React, { useCallback, useRef, useMemo } from 'react';
import { Box, Button, Stack, Typography, Paper, Divider, Theme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import CameraAltOutlinedIcon from '@mui/icons-material/CameraAltOutlined';
import {
  convertEditorStateToHTMLString,
  createEditorStateFromHTMLString,
} from '@/utils/editorUtils';
import toastMessages from '@/utils/toastMessages';
import errorHandling from '@/utils/errorHandling';
import type { AxiosError } from 'axios';
import type { ApiError } from '@/types/api';
import BackdropLoading from '@/components/Common/Loading/BackdropLoading';
import CompanyForm from '../CompanyForm';
import CompanyFormLoading from '../CompanyForm/CompanyFormLoading';
import { compressImageFile } from '@/utils/imageCompression';
import MuiImageCustom from '@/components/Common/MuiImageCustom';
import ImageCropDialog from '@/components/Common/ImageCropDialog';
import { useCompanyProfile, useCompanyMutations } from '../hooks/useEmployerQueries';
import type { CompanyFormValues } from '../CompanyForm/types';
import type { Company } from '@/types/models';

const normalizeId = (value: number | string | { id: number; name: string } | undefined): number | string | undefined => {
  if (typeof value === 'number' || typeof value === 'string') return value;
  if (value && typeof value === 'object' && 'id' in value) return value.id;
  return undefined;
};

const normalizeCompanyForForm = (company: Company): Partial<CompanyFormValues> => {
  const location = company.location || undefined;
  return {
    companyName: company.companyName || '',
    taxCode: company.taxCode || '',
    employeeSize: company.employeeSize ?? undefined,
    fieldOperation: company.fieldOperation || '',
    companyEmail: company.companyEmail || '',
    companyPhone: company.companyPhone || '',
    websiteUrl: company.websiteUrl || '',
    facebookUrl: company.facebookUrl || '',
    youtubeUrl: company.youtubeUrl || '',
    linkedinUrl: company.linkedinUrl || '',
    since: company.since || null,
    location: location
      ? {
          ...location,
          city: normalizeId(location.city) ?? '',
          district: normalizeId(location.district) ?? '',
          address: location.address || '',
          lat: location.lat ?? '',
          lng: location.lng ?? '',
        }
      : { city: '', district: '', address: '', lat: '', lng: '' },
    description: createEditorStateFromHTMLString(company.description || ''),
  };
};

type CompanyCardState = {
  cropOpen: boolean;
  cropImageSrc: string;
  cropFileName: string;
  cropTarget: 'logo' | 'cover';
  serverErrors: Record<string, string[]> | null;
};

type CompanyCardAction =
  | { type: 'openCrop'; target: 'logo' | 'cover'; fileName: string; imageSrc: string }
  | { type: 'closeCrop' }
  | { type: 'setErrors'; errors: Record<string, string[]> | null };

const initialState: CompanyCardState = {
  cropOpen: false,
  cropImageSrc: '',
  cropFileName: '',
  cropTarget: 'logo',
  serverErrors: null,
};

function reducer(state: CompanyCardState, action: CompanyCardAction): CompanyCardState {
  switch (action.type) {
    case 'openCrop':
      return {
        ...state,
        cropOpen: true,
        cropTarget: action.target,
        cropFileName: action.fileName,
        cropImageSrc: action.imageSrc,
      };
    case 'closeCrop':
      return {
        ...state,
        cropOpen: false,
        cropImageSrc: '',
        cropFileName: '',
      };
    case 'setErrors':
      return { ...state, serverErrors: action.errors };
    default:
      return state;
  }
}

const CompanyCard = () => {
  const { t } = useTranslation('employer');
  
  // Data Fetching
  const { data: company, isLoading } = useCompanyProfile();
  const { updateCompany, updateLogo, updateCover, isMutating } = useCompanyMutations();

  const [state, dispatch] = React.useReducer(reducer, initialState);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Transform data for the form
  const editData = useMemo(() => {
    if (!company) return null;
    return normalizeCompanyForForm(company);
  }, [company]);

  const handleUpdate = useCallback(async (formData: CompanyFormValues) => {
    if (!company?.id) return;
    dispatch({ type: 'setErrors', errors: null });
    try {
      const payload = {
        ...formData,
        description: convertEditorStateToHTMLString(formData.description as ReturnType<typeof createEditorStateFromHTMLString>),
      };
      await updateCompany({ id: company.id, data: payload });
      toastMessages.success(t('companyProfile.success.update'));
    } catch (error) {
      errorHandling(error, (errs) => dispatch({ type: 'setErrors', errors: errs as Record<string, string[]> }));
    }
  }, [company?.id, updateCompany, t]);

  const handleFileSelect = (target: 'logo' | 'cover') => (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    dispatch({
      type: 'openCrop',
      target,
      fileName: file.name,
      imageSrc: URL.createObjectURL(file),
    });
    event.target.value = '';
  };

  const handleCropConfirm = async (croppedFile: File) => {
    dispatch({ type: 'closeCrop' });
    try {
      const compressed = await compressImageFile(croppedFile);
      const formData = new FormData();
      formData.append('file', compressed);

      if (state.cropTarget === 'logo') {
        await updateLogo(formData);
        toastMessages.success(t('companyProfile.success.logoUpdate'));
      } else {
        await updateCover(formData);
        toastMessages.success(t('companyProfile.success.coverUpdate'));
      }
    } catch (error) {
      errorHandling(error);
    }
  };

  const handleCropCancel = () => {
    if (state.cropImageSrc) {
      URL.revokeObjectURL(state.cropImageSrc);
    }
    dispatch({ type: 'closeCrop' });
  };

  if (isLoading) return <CompanyFormLoading />;

  return (
    <Paper 
        elevation={0}
        sx={{ 
            p: { xs: 3, md: 5 }, 
            borderRadius: 4, 
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: (theme: Theme) => theme.customShadows?.z1 
        }}
    >
      <Typography variant="h4" sx={{ fontWeight: 900, mb: 4, color: 'text.primary', letterSpacing: '-0.5px' }}>
        {t('companyProfile.title', 'Company Information')}
      </Typography>

      <Stack spacing={5}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
            <Box>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px' }}>
                    {t('companyProfile.labels.logo')}
                </Typography>
                <Box sx={{ position: 'relative', width: 140 }}>
                    <MuiImageCustom
                        src={company?.companyImageUrl || ''}
                        width={140}
                        height={140}
                        sx={{
                            borderRadius: 4,
                            border: (theme: Theme) => `1px solid ${theme.palette.divider}`,
                            backgroundColor: 'grey.50',
                            boxShadow: (theme: Theme) => theme.customShadows?.z1
                        }}
                    />
                    <Button
                        variant="contained"
                        color="secondary"
                        size="small"
                        startIcon={<CameraAltOutlinedIcon />}
                        onClick={() => logoInputRef.current?.click()}
                        sx={{ 
                            mt: 2, 
                            borderRadius: 2.5, 
                            textTransform: 'none', 
                            boxShadow: (theme: Theme) => theme.customShadows?.secondary,
                            width: '100%',
                            fontWeight: 900,
                            color: 'white'
                        }}
                    >
                        {t('common:actions.change')}
                    </Button>
                </Box>
            </Box>

            <Box flex={1}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px' }}>
                    {t('companyProfile.labels.cover')}
                </Typography>
                <Box sx={{ position: 'relative' }}>
                    <MuiImageCustom
                        src={company?.companyCoverImageUrl || company?.coverImageUrl || ''}
                        height={170}
                        width="100%"
                        sx={{
                            borderRadius: 4,
                            border: (theme: Theme) => `1px solid ${theme.palette.divider}`,
                            backgroundColor: 'grey.50',
                            boxShadow: (theme: Theme) => theme.customShadows?.z1
                        }}
                        fit="cover"
                    />
                    <Button
                        variant="contained"
                        color="secondary"
                        size="small"
                        startIcon={<CameraAltOutlinedIcon />}
                        onClick={() => coverInputRef.current?.click()}
                        sx={{ 
                            mt: 2, 
                            borderRadius: 2.5, 
                            textTransform: 'none', 
                            boxShadow: (theme: Theme) => theme.customShadows?.secondary,
                            fontWeight: 900,
                            color: 'white'
                        }}
                    >
                        {t('common:actions.change')}
                    </Button>
                </Box>
            </Box>
        </Stack>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Box>
                <CompanyForm
                handleUpdate={handleUpdate}
                editData={editData}
                serverErrors={state.serverErrors}
            />
            <Box sx={{ mt: 6, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<SaveOutlinedIcon />}
                    type="submit"
                    form="company-form"
                    sx={{
                        px: 8,
                        py: 1.5,
                        borderRadius: 3,
                        fontWeight: 900,
                        boxShadow: (theme: Theme) => theme.customShadows?.primary,
                        textTransform: 'none',
                        fontSize: '1rem',
                        '&:hover': { bgcolor: 'primary.dark' },
                    }}
                >
                    {t('common:actions.saveChanges')}
                </Button>
            </Box>
        </Box>
      </Stack>

      {/* Hidden Inputs */}
      <input
        ref={logoInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileSelect('logo')}
      />
      <input
        ref={coverInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileSelect('cover')}
      />

      {isMutating && <BackdropLoading />}

      <ImageCropDialog
        open={state.cropOpen}
        imageSrc={state.cropImageSrc}
        fileName={state.cropFileName}
        aspectRatio={state.cropTarget === 'logo' ? 1 : 16 / 9}
        aspectLabel={state.cropTarget === 'logo' ? '1:1' : '16:9'}
        onConfirm={handleCropConfirm}
        onCancel={handleCropCancel}
      />
    </Paper>
  );
};

export default CompanyCard;

'use client';
import React, { useCallback, useRef, useState, useMemo } from 'react';
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
import type { CompanyFormValues } from '../CompanyForm';
import type { EditorState } from 'draft-js';

const CompanyCard = () => {
  const { t } = useTranslation('employer');
  
  // Data Fetching
  const { data: company, isLoading } = useCompanyProfile();
  const { updateCompany, updateLogo, updateCover, isMutating } = useCompanyMutations();

  // Local State
  const [cropOpen, setCropOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState('');
  const [cropFileName, setCropFileName] = useState('');
  const [cropTarget, setCropTarget] = useState<'logo' | 'cover'>('logo');
  const [serverErrors, setServerErrors] = useState<Record<string, string[]> | null>(null);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Transform data for the form
  const editData = useMemo(() => {
    if (!company) return null;
    return {
      ...company,
      description: createEditorStateFromHTMLString(company.description || ''),
    };
  }, [company]);

  const handleUpdate = useCallback(async (formData: CompanyFormValues) => {
    if (!company?.id) return;
    setServerErrors(null);
    try {
      const payload = {
        ...formData,
        description: convertEditorStateToHTMLString(formData.description as EditorState),
      };
      await updateCompany({ id: company.id, data: payload as Parameters<typeof updateCompany>[0]['data'] });
      toastMessages.success(t('companyProfile.success.update'));
    } catch (error) {
      errorHandling(error, (errs) => setServerErrors(errs as Record<string, string[]>));
    }
  }, [company?.id, updateCompany, t]);

  const handleFileSelect = (target: 'logo' | 'cover') => (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setCropTarget(target);
    setCropFileName(file.name);
    setCropImageSrc(URL.createObjectURL(file));
    setCropOpen(true);
    event.target.value = '';
  };

  const handleCropConfirm = async (croppedFile: File) => {
    setCropOpen(false);
    try {
      const compressed = await compressImageFile(croppedFile);
      const formData = new FormData();
      formData.append('file', compressed);

      if (cropTarget === 'logo') {
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
    setCropOpen(false);
    if (cropImageSrc) URL.revokeObjectURL(cropImageSrc);
    setCropImageSrc('');
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
                        src={company?.coverImageUrl || ''}
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
                editData={editData as Parameters<typeof CompanyForm>[0]['editData']}
                serverErrors={serverErrors}
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
        open={cropOpen}
        imageSrc={cropImageSrc}
        fileName={cropFileName}
        aspectRatio={cropTarget === 'logo' ? 1 : 16 / 9}
        aspectLabel={cropTarget === 'logo' ? '1:1' : '16:9'}
        onConfirm={handleCropConfirm}
        onCancel={handleCropCancel}
      />
    </Paper>
  );
};

export default CompanyCard;

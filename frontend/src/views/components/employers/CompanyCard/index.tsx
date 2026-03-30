import React from 'react';
import { Box, Button, Stack, Typography, Paper } from '@mui/material';
import { useTranslation } from 'react-i18next';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import CameraAltOutlinedIcon from '@mui/icons-material/CameraAltOutlined';
import {
  convertEditorStateToHTMLString,
  createEditorStateFromHTMLString,
} from '@/utils/editorUtils';
import toastMessages from '@/utils/toastMessages';
import errorHandling from '@/utils/errorHandling';
import BackdropLoading from '@/components/Common/Loading/BackdropLoading';
import CompanyForm from '../CompanyForm';
import CompanyFormLoading from '../CompanyForm/CompanyFormLoading';
import companyService from '@/services/companyService';
import { compressImageFile } from '@/utils/imageCompression';
import MuiImageCustom from '@/components/Common/MuiImageCustom';
import ImageCropDialog from '@/components/Common/ImageCropDialog';

// ─── Custom hooks extracted from monolithic component ───

interface CompanyData {
  id?: number;
  description?: any;
  companyImageUrl?: string;
  companyCoverImageUrl?: string;
  [key: string]: unknown;
}

function useCompanyData() {
  const { t } = useTranslation('employer');
  const [isLoading, setIsLoading] = React.useState(true);
  const [editData, setEditData] = React.useState<CompanyData | null>(null);
  const [companyImageUrl, setCompanyImageUrl] = React.useState<string | null>(null);
  const [companyCoverImageUrl, setCompanyCoverImageUrl] = React.useState<string | null>(null);
  const [serverErrors, setServerErrors] = React.useState<Record<string, unknown> | null>(null);
  const [isFullScreenLoading, setIsFullScreenLoading] = React.useState(false);

  const loadCompany = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const resData = (await companyService.getCompany()) as unknown as CompanyData;
      const data: CompanyData = {
        ...resData,
        description: createEditorStateFromHTMLString(resData?.description || ''),
      };
      setEditData(data);
      setCompanyImageUrl((prev) => prev ?? data?.companyImageUrl ?? null);
      setCompanyCoverImageUrl((prev) => prev ?? data?.companyCoverImageUrl ?? null);
    } catch (error: unknown) {
      errorHandling(error as any);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load company data on mount only
  React.useEffect(() => {
    loadCompany();
  }, [loadCompany]);

  const handleUpdate = React.useCallback(
    async (formData: CompanyData) => {
      setIsFullScreenLoading(true);
      try {
        const dataCustom = {
          ...formData,
          description: convertEditorStateToHTMLString(formData.description),
        };
        await companyService.updateCompany(dataCustom?.id!, dataCustom);
        setServerErrors(null);
        toastMessages.success(
          t('companyProfile.success.update', 'Company information updated successfully.'),
        );
        // Reload after successful update
        await loadCompany();
      } catch (error: unknown) {
        errorHandling(error as any, setServerErrors as any);
      } finally {
        setIsFullScreenLoading(false);
      }
    },
    [loadCompany, t],
  );

  const handleUpdateImage = React.useCallback(
    async (file: File, type: 'logo' | 'cover') => {
      setIsFullScreenLoading(true);
      try {
        const compressed = await compressImageFile(file);
        const formData = new FormData();
        formData.append('file', compressed);

        const resData =
          type === 'logo'
            ? ((await companyService.updateCompanyImageUrl(formData)) as unknown as CompanyData)
            : ((await companyService.updateCompanyCoverImageUrl(formData)) as unknown as CompanyData);

        const successKey =
          type === 'logo' ? 'companyProfile.success.logoUpdate' : 'companyProfile.success.coverUpdate';
        const successDefault =
          type === 'logo' ? 'Company logo updated successfully.' : 'Company cover image updated successfully.';
        toastMessages.success(t(successKey, successDefault));

        if (type === 'logo') {
          setCompanyImageUrl(resData?.companyImageUrl ?? null);
        } else {
          setCompanyCoverImageUrl(resData?.companyCoverImageUrl ?? null);
        }
      } catch (error: unknown) {
        errorHandling(error as any);
      } finally {
        setIsFullScreenLoading(false);
      }
    },
    [t],
  );

  return {
    isLoading,
    editData,
    companyImageUrl,
    companyCoverImageUrl,
    serverErrors,
    isFullScreenLoading,
    handleUpdate,
    handleUpdateImage,
  };
}

function useImageCrop(onConfirm: (file: File, type: 'logo' | 'cover') => Promise<void>) {
  const [cropOpen, setCropOpen] = React.useState(false);
  const [cropImageSrc, setCropImageSrc] = React.useState('');
  const [cropFileName, setCropFileName] = React.useState('');
  const [cropTarget, setCropTarget] = React.useState<'logo' | 'cover'>('logo');

  const logoInputRef = React.useRef<HTMLInputElement>(null);
  const coverInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect =
    (target: 'logo' | 'cover') => (event: React.ChangeEvent<HTMLInputElement>) => {
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
    await onConfirm(croppedFile, cropTarget);
  };

  const handleCropCancel = () => {
    setCropOpen(false);
    if (cropImageSrc) URL.revokeObjectURL(cropImageSrc);
    setCropImageSrc('');
  };

  return {
    cropOpen,
    cropImageSrc,
    cropFileName,
    cropTarget,
    logoInputRef,
    coverInputRef,
    handleFileSelect,
    handleCropConfirm,
    handleCropCancel,
  };
}

// ─── Main Component ───

const CompanyCard = () => {
  const { t } = useTranslation('employer');
  const {
    isLoading,
    editData,
    companyImageUrl,
    companyCoverImageUrl,
    serverErrors,
    isFullScreenLoading,
    handleUpdate,
    handleUpdateImage,
  } = useCompanyData();

  const {
    cropOpen,
    cropImageSrc,
    cropFileName,
    cropTarget,
    logoInputRef,
    coverInputRef,
    handleFileSelect,
    handleCropConfirm,
    handleCropCancel,
  } = useImageCrop(handleUpdateImage);

  return (
    <Paper elevation={0}>
      <Stack spacing={4}>
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}>
            {t('companyProfile.labels.logo', 'Company Logo')}
          </Typography>
          <Box sx={{ position: 'relative' }}>
            <MuiImageCustom
              src={companyImageUrl || ''}
              width={120}
              height={120}
              sx={{
                borderRadius: 2,
                border: (theme: any) => `1px solid ${theme.palette.grey[200]}`,
                boxShadow: (theme: any) => theme.customShadows.small,
              }}
            />
            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                size="small"
                startIcon={<CameraAltOutlinedIcon />}
                onClick={() => logoInputRef.current?.click()}
                sx={{ borderRadius: 2, textTransform: 'none', boxShadow: 'none' }}
              >
                {t('companyProfile.labels.changeLogo', 'Change Logo')}
              </Button>
            </Box>
          </Box>
        </Box>

        <Box>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}>
            {t('companyProfile.labels.cover', 'Company Cover Image')}
          </Typography>
          <Box sx={{ position: 'relative' }}>
            <MuiImageCustom
              src={companyCoverImageUrl || ''}
              height={160}
              width="60%"
              sx={{
                borderRadius: 2,
                border: (theme: any) => `1px solid ${theme.palette.grey[200]}`,
                boxShadow: (theme: any) => theme.customShadows.small,
              }}
              fit="cover"
            />
            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                size="small"
                startIcon={<CameraAltOutlinedIcon />}
                onClick={() => coverInputRef.current?.click()}
                sx={{ borderRadius: 2, textTransform: 'none', boxShadow: 'none' }}
              >
                {t('companyProfile.labels.changeCover', 'Change Cover')}
              </Button>
            </Box>
          </Box>
        </Box>

        <Box>
          {isLoading ? (
            <CompanyFormLoading />
          ) : (
            <>
              <CompanyForm
                handleUpdate={handleUpdate}
                editData={editData}
                serverErrors={serverErrors}
              />
              <Box sx={{ mt: 3 }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<SaveOutlinedIcon />}
                  type="submit"
                  form="company-form"
                  sx={{
                    px: 4,
                    py: 1,
                    fontSize: '0.9rem',
                    '&:hover': { opacity: 0.9 },
                  }}
                >
                  {t('companyProfile.labels.update', 'Update')}
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Stack>

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

      <BackdropLoading open={isFullScreenLoading} />

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

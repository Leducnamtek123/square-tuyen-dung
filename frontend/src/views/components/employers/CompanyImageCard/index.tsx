'use client';
import React, { useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Box, 
  Dialog, 
  DialogContent, 
  DialogTitle, 
  IconButton, 
  Stack, 
  Typography, 
  Tooltip,
  Skeleton
} from "@mui/material";
import CameraAltOutlinedIcon from '@mui/icons-material/CameraAltOutlined';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import toastMessages from '../../../../utils/toastMessages';
import errorHandling from '../../../../utils/errorHandling';
import BackdropLoading from '../../../../components/Common/Loading/BackdropLoading';
import { confirmModal } from '../../../../utils/sweetalert2Modal';
import { compressImageFiles } from '../../../../utils/imageCompression';
import ImageCropDialog from '../../../../components/Common/ImageCropDialog';
import { useCompanyImages, useCompanyImageMutations } from '../hooks/useEmployerQueries';
import type { AxiosError } from 'axios';
import type { ApiError } from '../../../../types/api';

interface FileItem {
  uid: number | string;
  url: string;
}

type CompanyImageCardState = {
  previewVisible: boolean;
  previewImage: string;
  cropOpen: boolean;
  cropImageSrc: string;
  cropFileName: string;
};

type CompanyImageCardAction =
  | { type: 'openPreview'; value: string }
  | { type: 'closePreview' }
  | { type: 'openCrop'; fileName: string; imageSrc: string }
  | { type: 'closeCrop' };

const initialState: CompanyImageCardState = {
  previewVisible: false,
  previewImage: '',
  cropOpen: false,
  cropImageSrc: '',
  cropFileName: '',
};

function reducer(state: CompanyImageCardState, action: CompanyImageCardAction): CompanyImageCardState {
  switch (action.type) {
    case 'openPreview':
      return { ...state, previewVisible: true, previewImage: action.value };
    case 'closePreview':
      return { ...state, previewVisible: false, previewImage: '' };
    case 'openCrop':
      return {
        ...state,
        cropOpen: true,
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
    default:
      return state;
  }
}

const CompanyImageCard = () => {
  const { t } = useTranslation('employer');
  
  // Data Fetching & Mutations
  const { data: imagesData, isLoading } = useCompanyImages();
  const { addCompanyImages, deleteCompanyImage, isMutating } = useCompanyImageMutations();

  const [state, dispatch] = React.useReducer(reducer, initialState);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fileList = useMemo<FileItem[]>(() => {
    const results = imagesData?.results ?? [];
    return results.map((item) => ({
      uid: item.id,
      url: item.imageUrl,
    }));
  }, [imagesData]);

  const handleCropConfirm = async (croppedFile: File) => {
    dispatch({ type: 'closeCrop' });
    await handleUploadFiles([croppedFile]);
  };

  const handleCropCancel = () => {
    if (state.cropImageSrc) URL.revokeObjectURL(state.cropImageSrc);
    dispatch({ type: 'closeCrop' });
  };

  const handleUploadFiles = async (files: File[]) => {
    if (!files?.length) return;
    try {
      const compressedFiles = await compressImageFiles(files);
      const formData = new FormData();
      compressedFiles.forEach((file: File) => {
        formData.append('files', file);
      });
      await addCompanyImages(formData);
      toastMessages.success(t('companyImage.uploadSuccess'));
    } catch (error) {
      errorHandling(error);
    }
  };

  const handleDelete = (file: FileItem) => {
    confirmModal(
      async () => {
        try {
          await deleteCompanyImage(file.uid);
          toastMessages.success(t('companyImage.deleteSuccess'));
        } catch (error) {
          // Error handled by mutation hook
        }
      },
      t('companyImage.deleteTitle'),
      t('companyImage.deleteConfirm'),
      'warning'
    );
  };

  const handlePreview = (file: FileItem) => {
    dispatch({ type: 'openPreview', value: file.url });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []) as File[];
    if (files.length === 0) return;

    const file = files[0];
    dispatch({
      type: 'openCrop',
      fileName: file.name,
      imageSrc: URL.createObjectURL(file),
    });
    event.target.value = '';
  };

  return (
    <Box>
      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 700, color: 'text.secondary' }}>
        {t('companyImage.title')}
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 2 }}>
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="rectangular" height={140} sx={{ borderRadius: 3 }} />
          ))
        ) : (
          fileList.map((file) => (
            <Box
              key={file.uid}
              sx={{
                position: 'relative',
                borderRadius: 3,
                overflow: 'hidden',
                border: (theme) => `1px solid ${theme.palette.divider}`,
                bgcolor: 'grey.50',
                aspectRatio: '1/1',
                '&:hover .image-actions': { opacity: 1 },
              }}
            >
              <Box
                component="img"
                src={file.url}
                alt="Company"
                loading="lazy"
                sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              <Stack
                className="image-actions"
                direction="row"
                spacing={1}
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  bgcolor: 'rgba(0,0,0,0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0,
                  transition: 'opacity 0.2s',
                }}
              >
                <Tooltip title={t('common:actions.preview')}>
                    <IconButton size="small" onClick={() => handlePreview(file)} sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.2)' }}>
                        <VisibilityOutlinedIcon />
                    </IconButton>
                </Tooltip>
                <Tooltip title={t('common:actions.delete')}>
                    <IconButton size="small" onClick={() => handleDelete(file)} sx={{ color: 'error.main', bgcolor: 'rgba(255,255,255,0.2)' }}>
                        <DeleteIcon />
                    </IconButton>
                </Tooltip>
              </Stack>
            </Box>
          ))
        )}

        {fileList.length < 15 && !isLoading && (
          <Box
            onClick={() => fileInputRef.current?.click()}
            sx={{
              cursor: 'pointer',
              borderRadius: 3,
              border: (theme) => `2px dashed ${theme.palette.divider}`,
              bgcolor: 'grey.50',
              aspectRatio: '1/1',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              transition: 'all 0.2s',
              '&:hover': { borderColor: 'primary.main', bgcolor: 'primary.extralight' },
            }}
          >
            <CameraAltOutlinedIcon sx={{ fontSize: 32, color: 'primary.main' }} />
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
              {t('common:actions.upload')}
            </Typography>
          </Box>
        )}
      </Box>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      <Dialog open={state.previewVisible} onClose={() => dispatch({ type: 'closePreview' })} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{t('companyImage.preview')}</DialogTitle>
        <DialogContent>
          <Box
            component="img"
            src={state.previewImage}
            alt="Preview"
            sx={{ width: '100%', borderRadius: 2, boxShadow: (theme) => theme.customShadows?.z8 }}
          />
        </DialogContent>
      </Dialog>

      <BackdropLoading open={isMutating} />

      <ImageCropDialog
        open={state.cropOpen}
        imageSrc={state.cropImageSrc}
        fileName={state.cropFileName}
        aspectRatio={16 / 9}
        aspectLabel="16:9"
        onConfirm={handleCropConfirm}
        onCancel={handleCropCancel}
      />
    </Box>
  );
};

export default CompanyImageCard;

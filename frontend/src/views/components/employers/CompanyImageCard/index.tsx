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
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import CloseIcon from '@mui/icons-material/Close';
import CollectionsOutlinedIcon from '@mui/icons-material/CollectionsOutlined';
import toastMessages from '../../../../utils/toastMessages';
import errorHandling from '../../../../utils/errorHandling';
import BackdropLoading from '../../../../components/Common/Loading/BackdropLoading';
import { confirmModal } from '../../../../utils/sweetalert2Modal';
import { compressImageFiles } from '../../../../utils/imageCompression';
import ImageCropDialog from '../../../../components/Common/ImageCropDialog';
import { useCompanyImages, useCompanyImageMutations } from '../hooks/useEmployerQueries';

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
  const { t } = useTranslation(['employer', 'common']);
  
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
        } catch {
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
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2.5 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '10px',
            bgcolor: '#eff6ff',
            color: '#2563eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CollectionsOutlinedIcon sx={{ fontSize: 20 }} />
        </Box>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1rem' }}>
            {t('companyImage.title')}
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500, fontSize: '0.8rem' }}>
            Hình ảnh không gian làm việc, văn hóa và hoạt động thực tế của doanh nghiệp ({fileList.length}/15 ảnh)
          </Typography>
        </Box>
      </Stack>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(1, 1fr)',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
            lg: 'repeat(4, 1fr)',
          },
          gap: 2.5,
        }}
      >
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" sx={{ aspectRatio: '16/9', borderRadius: 3 }} />
          ))
        ) : (
          fileList.map((file) => (
            <Box
              key={file.uid}
              sx={{
                position: 'relative',
                borderRadius: 3,
                overflow: 'hidden',
                border: '1px solid #e2e8f0',
                bgcolor: '#f8fafc',
                aspectRatio: '16/9',
                boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.04)',
                transition: 'all 0.25s ease',
                '&:hover': {
                  boxShadow: '0 8px 24px -4px rgba(0, 0, 0, 0.12)',
                  transform: 'translateY(-2px)',
                  '& .image-actions': { opacity: 1 },
                },
              }}
            >
              <Box
                component="img"
                src={file.url}
                alt={t('companyImage.imageAlt')}
                loading="lazy"
                sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              <Stack
                className="image-actions"
                direction="row"
                spacing={1.25}
                sx={{
                  position: 'absolute',
                  inset: 0,
                  bgcolor: 'rgba(15, 23, 42, 0.55)',
                  backdropFilter: 'blur(3px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0,
                  transition: 'opacity 0.2s ease',
                }}
              >
                <Tooltip title={t('common:actions.preview')}>
                  <IconButton aria-label="Thao tác"
                    size="small"
                    onClick={() => handlePreview(file)}
                    sx={{
                      color: '#ffffff',
                      bgcolor: 'rgba(255, 255, 255, 0.25)',
                      border: '1px solid rgba(255, 255, 255, 0.4)',
                      '&:hover': { bgcolor: '#2563eb', borderColor: '#2563eb' },
                    }}
                  >
                    <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
                <Tooltip title={t('common:actions.delete')}>
                  <IconButton aria-label="Thao tác"
                    size="small"
                    onClick={() => handleDelete(file)}
                    sx={{
                      color: '#ffffff',
                      bgcolor: 'rgba(239, 68, 68, 0.6)',
                      border: '1px solid rgba(239, 68, 68, 0.8)',
                      '&:hover': { bgcolor: '#dc2626' },
                    }}
                  >
                    <DeleteOutlineOutlinedIcon sx={{ fontSize: 18 }} />
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
              border: '2px dashed #cbd5e1',
              bgcolor: '#f8fafc',
              aspectRatio: '16/9',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0.75,
              p: 2,
              textAlign: 'center',
              transition: 'all 0.2s ease',
              '&:hover': {
                borderColor: '#2563eb',
                bgcolor: '#eff6ff',
                boxShadow: '0 4px 14px 0 rgba(37, 99, 235, 0.08)',
                transform: 'translateY(-2px)',
              },
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '10px',
                bgcolor: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CameraAltOutlinedIcon sx={{ fontSize: 22 }} />
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.875rem' }}>
              {t('common:actions.upload')}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 500 }}>
              Định dạng 16:9 • JPG, PNG
            </Typography>
          </Box>
        )}
      </Box>

      <input
        ref={fileInputRef}
        type="file"
        aria-label={t('common:actions.upload')}
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {/* Preview Dialog */}
      <Dialog
        open={state.previewVisible}
        onClose={() => dispatch({ type: 'closePreview' })}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: 'hidden',
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 800,
            color: '#0f172a',
            p: 2.5,
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {t('companyImage.preview')}
          <IconButton aria-label="Thao tác" size="small" onClick={() => dispatch({ type: 'closePreview' })} sx={{ color: '#64748b' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 2.5, pt: '20px !important' }}>
          <Box
            component="img"
            src={state.previewImage}
            alt={t('companyImage.previewAlt')}
            sx={{ width: '100%', borderRadius: 2, display: 'block', maxHeight: '70vh', objectFit: 'contain' }}
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

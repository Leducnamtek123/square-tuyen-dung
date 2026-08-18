import React from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { Box, Stack, IconButton, Typography, Avatar, Button } from "@mui/material";
import { useTranslation } from 'react-i18next';
import CameraAltOutlinedIcon from '@mui/icons-material/CameraAltOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { confirmModal } from '../../../../utils/sweetalert2Modal';
import BackdropLoading from '../../../../components/Common/Loading/BackdropLoading';
import toastMessages from '../../../../utils/toastMessages';
import MuiImageCustom from '../../../../components/Common/MuiImageCustom';
import { deleteAvatar, updateAvatar } from '../../../../redux/userSlice';
import { compressImageFile } from '../../../../utils/imageCompression';
import ImageCropDialog from '../../../../components/Common/ImageCropDialog';

const AvatarCard = () => {
  const { t } = useTranslation('auth');
  const dispatch = useAppDispatch();
  const { currentUser } = useAppSelector((state) => state.user);
  const [isFullScreenLoading, setIsFullScreenLoading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [cropOpen, setCropOpen] = React.useState(false);
  const [cropImageSrc, setCropImageSrc] = React.useState('');
  const [cropFileName, setCropFileName] = React.useState('');

  const handleCropConfirm = async (croppedFile: File) => {
    setCropOpen(false);
    const compressed = await compressImageFile(croppedFile);
    await handleUpload(compressed);
  };

  const handleCropCancel = () => {
    setCropOpen(false);
    if (cropImageSrc) URL.revokeObjectURL(cropImageSrc);
    setCropImageSrc('');
  };

  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    setIsFullScreenLoading(true);

    dispatch(updateAvatar(formData))
      .unwrap()
      .then(() => {
        toastMessages.success(t('account.avatarUpdateSuccess'));
      })
      .catch(() => {
        toastMessages.error(t('messages.tryAgain'));
      })
      .finally(() => setIsFullScreenLoading(false));
  };

  const handleDelete = () => {
    const del = async () => {
      setIsFullScreenLoading(true);
      dispatch(deleteAvatar())
        .unwrap()
        .then(() => {
          toastMessages.success(t('account.avatarDeleteSuccess'));
        })
        .catch(() => {
          toastMessages.error(t('messages.genericError'));
        })
        .finally(() => setIsFullScreenLoading(false));
    };

    confirmModal(
      () => del(),
      t('account.avatar'),
      t('account.avatarDeleteConfirm'),
      'warning'
    );
  };

  const handlePickFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setCropFileName(file.name);
    setCropImageSrc(URL.createObjectURL(file));
    setCropOpen(true);
    event.target.value = '';
  };

  return (
    <>
      <Stack alignItems="center" spacing={2}>
        <Box
          sx={{
            position: 'relative',
            width: 120,
            height: 120,
            borderRadius: '50%',
            p: '3px',
            bgcolor: '#ffffff',
            border: '2px solid #e2e8f0',
            boxShadow: '0 8px 24px -4px rgba(15, 23, 42, 0.12)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            '&:hover': {
              borderColor: '#2563eb',
              transform: 'scale(1.02)',
              '& .avatar-overlay': {
                opacity: 1,
              },
            },
          }}
          onClick={handlePickFile}
        >
          {currentUser?.avatarUrl ? (
            <MuiImageCustom
              src={currentUser?.avatarUrl}
              width="100%"
              height="100%"
              sx={{
                borderRadius: '50%',
                objectFit: 'cover',
              }}
            />
          ) : (
            <Avatar
              sx={{
                width: '100%',
                height: '100%',
                bgcolor: '#eff6ff',
                color: '#2563eb',
                fontSize: '2.5rem',
                fontWeight: 800,
              }}
            >
              {currentUser?.fullName?.charAt(0)?.toUpperCase() || 'U'}
            </Avatar>
          )}

          <Box
            className="avatar-overlay"
            sx={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              bgcolor: 'rgba(15, 23, 42, 0.55)',
              backdropFilter: 'blur(2px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0,
              transition: 'opacity 0.2s ease',
              color: '#ffffff',
            }}
          >
            <CameraAltOutlinedIcon sx={{ fontSize: 28 }} />
          </Box>
        </Box>

        <Stack direction="row" spacing={1} alignItems="center">
          <Button
            size="small"
            variant="outlined"
            startIcon={<CameraAltOutlinedIcon sx={{ fontSize: 16 }} />}
            onClick={handlePickFile}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.8125rem',
              borderColor: '#cbd5e1',
              color: '#0f172a',
              bgcolor: '#ffffff',
              '&:hover': {
                borderColor: '#94a3b8',
                bgcolor: '#f8fafc',
              },
            }}
          >
            Đổi ảnh
          </Button>

          {currentUser?.avatarUrl && (
            <IconButton aria-label="Thao tác"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              sx={{
                borderRadius: 2,
                border: '1px solid #fee2e2',
                bgcolor: '#fef2f2',
                color: '#dc2626',
                '&:hover': {
                  bgcolor: '#fee2e2',
                },
              }}
            >
              <DeleteOutlineOutlinedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          )}
        </Stack>
      </Stack>

      <input
        ref={fileInputRef}
        type="file"
        aria-label={t('account.avatar')}
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      <BackdropLoading open={isFullScreenLoading} />

      <ImageCropDialog
        open={cropOpen}
        imageSrc={cropImageSrc}
        fileName={cropFileName}
        aspectRatio={1}
        aspectLabel="1:1"
        onConfirm={handleCropConfirm}
        onCancel={handleCropCancel}
      />
    </>
  );
};

export default React.memo(AvatarCard);

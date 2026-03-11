/*
MyJob Recruitment System - Part of MyJob Platform

Author: Bui Khanh Huy
Email: khuy220@gmail.com
Copyright (c) 2023 Bui Khanh Huy

License: MIT License
See the LICENSE file in the project root for full license information.
*/

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Stack, IconButton, Typography } from '@mui/material';
import ModeEditOutlineOutlinedIcon from '@mui/icons-material/ModeEditOutlineOutlined';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';

import { confirmModal } from '../../../../utils/sweetalert2Modal';
import BackdropLoading from '../../../../components/loading/BackdropLoading';
import toastMessages from '../../../../utils/toastMessages';
import MuiImageCustom from '../../../../components/MuiImageCustom';
import { deleteAvatar, updateAvatar } from '../../../../redux/userSlice';

const AvatarCard = () => {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const [isFullScreenLoading, setIsFullScreenLoading] = React.useState(false);
  const fileInputRef = React.useRef(null);

  const handleUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    setIsFullScreenLoading(true);

    dispatch(updateAvatar(formData))
      .unwrap()
      .then(() => {
        toastMessages.success('Cap nhat anh dai dien thanh cong.');
      })
      .catch(() => {
        toastMessages.error('Da xay ra loi, vui long thu lai.');
      })
      .finally(() => setIsFullScreenLoading(false));
  };

  const handleDelete = () => {
    const del = async () => {
      setIsFullScreenLoading(true);

      dispatch(deleteAvatar())
        .unwrap()
        .then(() => {
          toastMessages.success('Xoa anh dai dien thanh cong.');
        })
        .catch(() => {
          toastMessages.error('Xoa that bai.');
        })
        .finally(() => setIsFullScreenLoading(false));
    };

    confirmModal(
      () => del(),
      'Xoa anh dai dien',
      'Anh dai dien nay se bi xoa va khong the khoi phuc. Ban co chac chan?',
      'warning'
    );
  };

  const handlePickFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    handleUpload(file);
    event.target.value = '';
  };

  return (
    <>
      <Stack alignItems="center">
        <Box
          sx={{
            position: 'relative',
            width: 120,
            height: 120,
            padding: '4px',
            borderRadius: '50%',
            background: 'linear-gradient(45deg, #441da0, #6b4fd1)',
            boxShadow: '0 4px 14px 0 rgba(68, 29, 160, 0.15)',
            '&:hover .avatar-actions': {
              opacity: 1,
            },
          }}
        >
          <MuiImageCustom
            src={currentUser?.avatarUrl}
            width="100%"
            height="100%"
            sx={{
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid white',
            }}
          />

          <Box
            className="avatar-actions"
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: '50%',
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              opacity: 0,
              transition: 'opacity 0.2s ease',
            }}
          >
            <Stack direction="row" spacing={1}>
              <IconButton
                size="small"
                sx={{
                  bgcolor: 'white',
                  '&:hover': { bgcolor: 'white', opacity: 0.9 },
                }}
                onClick={handlePickFile}
              >
                <ModeEditOutlineOutlinedIcon sx={{ fontSize: 18, color: '#fca34d' }} />
              </IconButton>

              {currentUser?.avatarUrl && (
                <IconButton
                  size="small"
                  onClick={handleDelete}
                  sx={{
                    bgcolor: 'white',
                    '&:hover': { bgcolor: 'white', opacity: 0.9 },
                  }}
                >
                  <HighlightOffIcon sx={{ fontSize: 18, color: '#d32f2f' }} />
                </IconButton>
              )}
            </Stack>
          </Box>
        </Box>

        <Typography variant="subtitle2" gutterBottom sx={{ mt: 1 }}>
          Anh dai dien
        </Typography>
      </Stack>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {isFullScreenLoading && <BackdropLoading />}
    </>
  );
};

export default React.memo(AvatarCard);

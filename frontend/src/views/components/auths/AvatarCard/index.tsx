import React from 'react';
import { useAppSelector } from '@/redux/hooks';

import { useDispatch } from 'react-redux';

import { Box, Stack, IconButton, Typography } from "@mui/material";

import { useTranslation } from 'react-i18next';

import ModeEditOutlineOutlinedIcon from '@mui/icons-material/ModeEditOutlineOutlined';

import HighlightOffIcon from '@mui/icons-material/HighlightOff';

import { confirmModal } from '../../../../utils/sweetalert2Modal';

import BackdropLoading from '../../../../components/Common/Loading/BackdropLoading';

import toastMessages from '../../../../utils/toastMessages';

import MuiImageCustom from '../../../../components/Common/MuiImageCustom';

import { deleteAvatar, updateAvatar } from '../../../../redux/userSlice';
import { compressImageFile } from '../../../../utils/imageCompression';

interface AvatarCardProps {
  [key: string]: any;
}



const AvatarCard = () => {

  const { t } = useTranslation('auth');

  const dispatch = useDispatch();

  const { currentUser } = useAppSelector((state) => state.user);

  const [isFullScreenLoading, setIsFullScreenLoading] = React.useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {

    const formData = new FormData();

    formData.append('file', file);

    setIsFullScreenLoading(true);

    (dispatch as any)(updateAvatar(formData))

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

      (dispatch as any)(deleteAvatar())

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

    const compressed = await compressImageFile(file);

    handleUpload(compressed);

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

          {t('account.avatar')}

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

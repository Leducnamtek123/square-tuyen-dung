/*
MyJob Recruitment System - Part of MyJob Platform

Author: Bui Khanh Huy
Email: khuy220@gmail.com
Copyright (c) 2023 Bui Khanh Huy

License: MIT License
See the LICENSE file in the project root for full license information.
*/

import React, { useState } from 'react';
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import CameraAltOutlinedIcon from '@mui/icons-material/CameraAltOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';

import toastMessages from '../../../../utils/toastMessages';
import errorHandling from '../../../../utils/errorHandling';
import BackdropLoading from '../../../../components/loading/BackdropLoading';
import companyImageService from '../../../../services/companyImageService';
import { confirmModal } from '../../../../utils/sweetalert2Modal';

const CompanyImageCard = () => {
  const [isFullScreenLoading, setIsFullScreenLoading] = React.useState(false);
  const [fileList, setFileList] = useState([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const fileInputRef = React.useRef(null);

  React.useEffect(() => {
    const getImages = async () => {
      try {
        const resData = await companyImageService.getCompanyImages();
        const data = resData.data;
        const results = data.results;

        const newResults = results.map((item) => ({
          uid: item.id,
          url: item.imageUrl,
        }));
        setFileList(newResults);
      } catch (error) {
        console.log(error);
      }
    };

    getImages();
  }, []);

  const handleUploadFiles = async (files) => {
    if (!files?.length) return;

    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    setIsFullScreenLoading(true);
    try {
      const resData = await companyImageService.addCompanyImage(formData);
      const results = resData.data;
      const newResults = results.map((item) => ({
        uid: item.id,
        url: item.imageUrl,
      }));

      setFileList((prev) => [...prev, ...newResults]);
      toastMessages.success('Tai anh len thanh cong.');
    } catch (error) {
      errorHandling(error);
    } finally {
      setIsFullScreenLoading(false);
    }
  };

  const handleDelete = (file) => {
    const deleteCompanyImage = async (id) => {
      setIsFullScreenLoading(true);

      try {
        await companyImageService.deleteCompanyImage(id);
        setFileList((prev) => prev.filter((item) => item.uid !== file.uid));
        toastMessages.success('Xoa hinh anh thanh cong.');
      } catch (error) {
        errorHandling(error);
      } finally {
        setIsFullScreenLoading(false);
      }
    };

    confirmModal(
      () => deleteCompanyImage(file.uid),
      'Xoa hinh anh',
      'Hinh anh nay se bi xoa vinh vien va khong the khoi phuc. Ban co chac chan?',
      'warning'
    );
  };

  const handlePreview = (file) => {
    setPreviewImage(file.url);
    setPreviewVisible(true);
  };

  const handlePickFiles = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;
    handleUploadFiles(files);
    event.target.value = '';
  };

  return (
    <Box>
      <Typography
        variant="subtitle1"
        sx={{
          mb: 2,
          fontWeight: 600,
          color: 'text.primary',
        }}
      >
        Thu vien anh cong ty
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
          gap: 2,
        }}
      >
        {fileList.map((file) => (
          <Box
            key={file.uid}
            sx={{
              position: 'relative',
              borderRadius: 2,
              overflow: 'hidden',
              border: (theme) => `1px solid ${theme.palette.grey[200]}`,
              bgcolor: (theme) => theme.palette.grey[50],
            }}
          >
            <Box
              component="img"
              src={file.url}
              alt="Company"
              loading="lazy"
              sx={{
                width: '100%',
                height: 110,
                objectFit: 'cover',
                display: 'block',
              }}
            />
            <Stack
              direction="row"
              spacing={0.5}
              sx={{
                position: 'absolute',
                top: 6,
                right: 6,
                bgcolor: 'rgba(0,0,0,0.35)',
                borderRadius: 1,
                p: 0.5,
              }}
            >
              <IconButton size="small" onClick={() => handlePreview(file)} sx={{ color: 'white' }}>
                <VisibilityOutlinedIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={() => handleDelete(file)} sx={{ color: 'white' }}>
                <DeleteOutlineOutlinedIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Box>
        ))}

        {fileList.length < 15 && (
          <Box
            onClick={handlePickFiles}
            sx={{
              cursor: 'pointer',
              borderRadius: 2,
              border: (theme) => `2px dashed ${theme.palette.grey[300]}`,
              bgcolor: (theme) => theme.palette.grey[50],
              height: 110,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0.5,
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: 'primary.background',
              },
            }}
          >
            <CameraAltOutlinedIcon sx={{ fontSize: 24, color: 'primary.main' }} />
            <Typography variant="body2" color="text.secondary">
              Tai len
            </Typography>
          </Box>
        )}
      </Box>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      <Dialog open={previewVisible} onClose={() => setPreviewVisible(false)} maxWidth="md" fullWidth>
        <DialogTitle>Preview</DialogTitle>
        <DialogContent>
          <Box
            component="img"
            src={previewImage}
            alt="Preview"
            sx={{ width: '100%', borderRadius: 2, boxShadow: (theme) => theme.customShadows.small }}
          />
        </DialogContent>
      </Dialog>

      {isFullScreenLoading && <BackdropLoading />}
    </Box>
  );
};

export default CompanyImageCard;

import React from 'react';
// @ts-ignore
import { DropzoneDialog } from 'mui-file-dropzone';
import { IconButton, Typography, Stack } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';

type Props = {
  open: boolean;
  setOpen: (open: boolean) => void;
  handleUpload: (files: File[]) => void;
  title?: string;
};

const DropzoneDialogCustom = (props: Props) => {
  const { t } = useTranslation('common');
  const { open, setOpen, handleUpload, title = t('dropzone.titleDefault', 'Tiêu đề'), ...others } = props;

  const dialogTitle = (title: string) => (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Typography variant="h5">{title}</Typography>
      <IconButton aria-label={t('actions.close', 'Đóng')} color="error" onClick={() => setOpen(false)}>
        <CloseIcon />
      </IconButton>
    </Stack>
  );

  return (
    <DropzoneDialog
      dialogTitle={dialogTitle(title)}
      acceptedFiles={['image/*']}
      submitButtonText={t('actions.upload', 'Tải lên')}
      cancelButtonText={t('actions.cancel', 'Hủy')}
      maxFileSize={5000000}
      open={open}
      onClose={() => setOpen(false)}
      onSave={(files: File[]) => {
        setOpen(false);
        handleUpload(files);
      }}
      showPreviews={true}
      showFileNamesInPreview={false}
      dropzoneText={t('dropzone.dragDropImage', 'Kéo và thả tệp vào đây hoặc nhấp vào')}
      previewText={t('dropzone.preview', 'Xem trước')}
      getFileLimitExceedMessage={(number: number | string) =>
        t('dropzone.limitExceed', 'Giới hạn tải lên là {{count}} tệp.', { count: Number(number) })
      }
      getFileAddedMessage={(fileName: string) =>
        t('dropzone.fileAdded', 'Tệp {{fileName}} đã được thêm thành công.', { fileName })
      }
      getFileRemovedMessage={(fileName: string) =>
        t('dropzone.fileRemoved', 'Tệp {{fileName}} đã được hủy.', { fileName })
      }
      {...others}
    />
  );
};

export default DropzoneDialogCustom;


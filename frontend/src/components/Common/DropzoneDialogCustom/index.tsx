import React from 'react';
// @ts-ignore
import { DropzoneDialog } from 'mui-file-dropzone';
import { IconButton, Typography, Stack } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  handleUpload: (files: File[]) => void;
  title?: string;
  [key: string]: unknown;
}

const DropzoneDialogCustom = (props: Props) => {
  const { open, setOpen, handleUpload, title = 'Tiêu đề', ...others } = props;

  const dialogTitle = (title: string) => (

    <>

      <Stack direction="row" justifyContent="space-between" alignItems="center">

        <Typography variant="h5">{title}</Typography>

        <IconButton color="error" onClick={() => setOpen(false)}>

          <CloseIcon />

        </IconButton>

      </Stack>

    </>

  );

  return (

    <DropzoneDialog

      dialogTitle={dialogTitle(title)}

      acceptedFiles={['image/*']}

      submitButtonText="Tải lên"

      cancelButtonText="Hủy"

      maxFileSize={5000000}

      open={open}

      onClose={() => setOpen(false)}

      onSave={(files: File[]) => {
        setOpen(false);
        handleUpload(files);
      }}

      showPreviews={true}

      showFileNamesInPreview={false}

      dropzoneText="Kéo và thả tệp vào đây hoặc nhấp vào"

      previewText="Xem trước"

      getFileLimitExceedMessage={(number: number | string) =>
        `Giới hạn tải lên là ${number} tệp.`
      }

      getFileAddedMessage={(fileName: string) =>
        `File ${fileName} added successfully.`
      }

      getFileRemovedMessage={(fileName: string) => `Tệp ${fileName} đã được hủy`}

      {...others}

    />

  );

};

export default DropzoneDialogCustom;

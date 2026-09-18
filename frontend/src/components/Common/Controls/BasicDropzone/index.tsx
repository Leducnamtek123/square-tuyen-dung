import React from 'react';
import { useDropzone, Accept } from 'react-dropzone';
import { Control, FieldValues, Path } from 'react-hook-form';
import { Stack, Box, Typography, Button } from "@mui/material";
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useTranslation } from 'react-i18next';
import TypedController from '../TypedController';

interface FileDropzoneProps {
  accept?: Accept;
  onDrop: (files: File[]) => void;
  values?: File[] | null;
  multiple?: boolean;
}

const FileDropzone = ({ accept, onDrop, values, multiple = false }: FileDropzoneProps) => {
  const { t } = useTranslation('common');
  const hasFiles = Array.isArray(values) && values.length > 0;

  const handleDrop = async (files: File[]) => {
    onDrop(multiple ? files : files.slice(0, 1));
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept,
    onDrop: handleDrop,
    multiple,
    maxFiles: multiple ? undefined : 1,
  });

  return (
    <Box
      sx={{
        borderStyle: 'solid',
        borderWidth: 1.5,
        borderColor: '#CBD5E1',
        borderRadius: '16px',
        backgroundColor: '#F8FAFC',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        py: 5,
        px: 3,
        textAlign: 'center',
        '&:hover': {
          borderColor: '#2563EB',
          backgroundColor: '#EFF6FF',
          boxShadow: '0 4px 16px -2px rgba(37, 99, 235, 0.08)',
        },
      }}
      {...getRootProps({ className: 'dropzone' })}
    >
      <input {...(getInputProps() as any)} />
      <Stack
        direction="column"
        alignItems="center"
        spacing={2}
      >
        {!hasFiles ? (
          <>
            <Box
              sx={{
                backgroundColor: (theme) => theme.palette.primary.background,
                borderRadius: '50%',
                width: 60,
                height: 60,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: (theme) => theme.palette.primary.main,
              }}
            >
              <FileUploadOutlinedIcon sx={{ fontSize: 24 }} />
            </Box>

            <Typography 
              variant="h6" 
              sx={{ 
                color: (theme) => theme.palette.grey[800],
                fontWeight: 600 
              }}
            >
              {t('dropzone.dragDropResume', 'Kéo hoặc thả hồ sơ của bạn vào đây')}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              {t('dropzone.orYouCan', 'Hoặc bạn có thể')}
            </Typography>

            <Button
              variant="contained"
              size="medium"
              color="primary"
              sx={{
                px: 3,
                py: 1,
                boxShadow: (theme) => theme.customShadows.small,
                '&:hover': {
                  boxShadow: (theme) => theme.customShadows.medium,
                }
              }}
            >
              {t('dropzone.selectFile', 'Chọn hồ sơ từ máy bạn')}
            </Button>

            <Typography 
              variant="caption" 
              sx={{ 
                color: (theme) => theme.palette.grey[500],
                mt: 1 
              }}
            >
              {t('dropzone.supportPdf', 'Hỗ trợ định dạng .pdf')}
            </Typography>
          </>
        ) : (
          <>
            <Typography 
              variant="body1" 
              sx={{ 
                color: (theme) => theme.palette.grey[800],
                fontWeight: 500 
              }}
            >
              {values?.[0]?.name}
            </Typography>

            <Button
              variant="outlined"
              size="medium"
              color="primary"
              sx={{
                px: 3,
              }}
            >
              {t('dropzone.changeFile', 'Đổi tệp tin')}
            </Button>
          </>
        )}
      </Stack>
    </Box>
  );
};

interface BasicDropzoneProps<T extends FieldValues = FieldValues> {
  control: Control<T>;
  name: string;
  title?: string;
  showRequired?: boolean;
  accept?: Accept;
  multiple?: boolean;
}

const BasicDropzone = <T extends FieldValues = FieldValues>({
  control,
  name,
  title = '',
  showRequired = false,
  accept = { 'application/pdf': ['.pdf'] },
  multiple = false,
}: BasicDropzoneProps<T>) => {

  return (
    <div>
      {title && (
        <Typography 
          variant="subtitle2" 
          gutterBottom
          sx={{
            fontWeight: 600,
            color: 'grey.800',
            mb: 1
          }}
        >
          {title} {showRequired && <Box component="span" sx={{ color: (theme) => theme.palette.error.main }}>*</Box>}
        </Typography>
      )}

      <Stack spacing={1} direction="column">
        <TypedController
          name={name as Path<T>}
          control={control}
          render={({ field, fieldState }) => (

            <>

              <FileDropzone
                onDrop={field.onChange}
                accept={accept}
                multiple={multiple}
                values={field.value}
              />

              {fieldState.invalid && (

                <Typography

                  variant="caption"

                  sx={{

                    display: 'flex',

                    alignItems: 'center',

                    gap: 0.5,

                    color: (theme) => theme.palette.error.main,

                    mt: 1

                  }}

                >

                  <ErrorOutlineIcon fontSize="small" />

                  {fieldState.error?.message}

                </Typography>

              )}

            </>

          )}

        />

      </Stack>

    </div>

  );

};

export default BasicDropzone;

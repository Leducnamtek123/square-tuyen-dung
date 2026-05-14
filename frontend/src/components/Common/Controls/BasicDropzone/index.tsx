import React from 'react';

import { useDropzone, Accept } from 'react-dropzone';
import { compressImageFiles } from '@/utils/imageCompression';

import { Control, Controller, FieldValues, Path } from 'react-hook-form';

import { Stack, Box, Typography, Button } from "@mui/material";

import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';

import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

interface FileDropzoneProps {
  accept?: Accept;
  onDrop: (files: File[]) => void;
  values?: File[] | null;
}

const FileDropzone = ({ accept, onDrop, values }: FileDropzoneProps) => {

  const handleDrop = async (files: File[]) => {
    const compressed = await compressImageFiles(files);
    onDrop(compressed);
  };

  const { getRootProps, getInputProps } = useDropzone({

    accept,

    onDrop: handleDrop,

  });

  return (

    <Box

      sx={{

        borderStyle: 'dashed',

        borderWidth: 2,

        borderColor: (theme) => theme.palette.grey[300],

        borderRadius: 3,

        backgroundColor: (theme) => theme.palette.grey[50],

        transition: 'all 0.2s ease-in-out',

        cursor: 'pointer',

        py: 6,

        '&:hover': {

          borderColor: (theme) => theme.palette.primary.main,

          backgroundColor: (theme) => theme.palette.primary.background,

        },

      }}

      {...getRootProps({ className: 'dropzone' })}

    >

      <input {...getInputProps()} />

      <Stack

        direction="column"

        alignItems="center"

        spacing={2}

      >

        {!values ? (

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

              Kéo hồ sơ của bạn vào đây

            </Typography>

            <Typography variant="body2" color="text.secondary">

              Hoặc bạn có thể

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

              Chọn hồ sơ từ máy bạn

            </Button>

            <Typography 

              variant="caption" 

              sx={{ 

                color: (theme) => theme.palette.grey[500],

                mt: 1 

              }}

            >

              Hỗ trợ định dạng .pdf

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

              {values.length >= 0 && values[0].name}

            </Typography>

            <Button

              variant="outlined"

              size="medium"

              color="primary"

              sx={{

                px: 3,

                

              }}

            >

              Đổi tập tin

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
}

const BasicDropzone = <T extends FieldValues = FieldValues>({ control, name, title = '', showRequired = false }: BasicDropzoneProps<T>) => {

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

        <Controller

          name={name as Path<T>}

          control={control}

          render={({ field, fieldState }) => (

            <>

              <FileDropzone
                onDrop={field.onChange}
                accept={{ 'image/*': [] }}
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

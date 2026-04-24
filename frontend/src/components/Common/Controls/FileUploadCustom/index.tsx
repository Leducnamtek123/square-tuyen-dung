'use client';
import React from 'react';

import { Control, Controller, FieldValues, Path } from 'react-hook-form';

import { Stack, Alert, Box, Button, Typography } from "@mui/material";

import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

import FileUploadIcon from '@mui/icons-material/FileUpload';

import FilePresentIcon from '@mui/icons-material/FilePresent';

interface Props<T extends FieldValues = FieldValues> {
  control: Control<T>;
  name: string;
  title?: string;
  showRequired?: boolean;
}

const FileUploadCustom = <T extends FieldValues = FieldValues>({
  control,
  name,
  title = '',
  showRequired = false,
}: Props<T>) => {
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const handleInputClick = (e: React.MouseEvent) => {
    e.preventDefault();
    inputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, onChange: (file: File | null) => void) => {
    const file = event.target.files?.[0];
    setSelectedFile(file || null);

    onChange(file || null);

  };

  return (

    <div>

      {title && (

        <Typography 

          variant="subtitle2" 

          gutterBottom 

          sx={{

            fontWeight: 500,

            color: 'text.primary',

            mb: 1

          }}

        >

          {title} {showRequired && <span style={{ color: 'error.main' }}>*</span>}

        </Typography>

      )}

      <Stack spacing={2} direction="column">

        <Box

          sx={{

            border: '2px dashed',

            borderColor: 'grey.200',

            borderRadius: 2,

            p: 3,

            textAlign: 'center',

            bgcolor: 'grey.50',

            cursor: 'pointer',

            transition: 'all 0.2s ease-in-out',

            '&:hover': {

              borderColor: 'primary.main',

              bgcolor: 'primary.background'

            }

          }}

          onClick={handleInputClick}

        >

          {!selectedFile ? (

            <>

              <FileUploadIcon 

                sx={{ 

                  fontSize: 40, 

                  color: 'primary.main',

                  mb: 1

                }} 

              />

              <Typography variant="subtitle1" sx={{ color: 'text.primary', mb: 0.5 }}>

                KÃ©o tháº£ file vÃ o Ä‘Ã¢y hoáº·c

              </Typography>

              <Button

                variant="contained"

                color="primary"

                sx={{

                  px: 3,

                  py: 1,

                  borderRadius: 2,

                  textTransform: 'none',

                  boxShadow: 'none'

                }}

              >

                Chá»n file

              </Button>

              <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary' }}>

                Chá»‰ cháº¥p nháº­n file PDF

              </Typography>

            </>

          ) : (

            <Alert 

              icon={<FilePresentIcon fontSize="inherit" />} 

              severity="success"

              sx={{

                '& .MuiAlert-message': {

                  display: 'flex',

                  alignItems: 'center',

                  gap: 1

                }

              }}

            >

              <Typography variant="body2">

                {selectedFile?.name}

              </Typography>

              <Button

                size="small"

                color="error"

                variant="text"

                onClick={(e) => {

                  e.stopPropagation();

                  setSelectedFile(null);

                }}

                sx={{ ml: 2 }}

              >

                XÃ³a

              </Button>

            </Alert>

          )}

        </Box>

      </Stack>

      <Controller

        name={name as Path<T>}

        control={control}

        render={({ field, fieldState }) => (

          <>

            <input

              name={name}

              hidden

              accept=".pdf"

              type="file"

              ref={inputRef}

              onChange={(e) => handleFileChange(e, field.onChange)}

            />

            {fieldState.invalid && (

              <Typography

                variant="caption"

                sx={{

                  display: 'flex',

                  alignItems: 'center',

                  gap: 0.5,

                  color: 'error.main',

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

    </div>

  );

};

export default FileUploadCustom;

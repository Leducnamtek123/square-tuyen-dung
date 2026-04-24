'use client';
import React from 'react';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { Stack, Box, Button, Typography, Chip } from "@mui/material";
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import FilePresentIcon from '@mui/icons-material/FilePresent';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation('common');
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
          sx={{ fontWeight: 500, color: 'text.primary', mb: 1 }}
        >
          {title} {showRequired && <span style={{ color: '#dc2626' }}>*</span>}
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
              bgcolor: 'rgba(42, 169, 225, 0.04)'
            }
          }}
          onClick={handleInputClick}
        >
          {!selectedFile ? (
            <>
              <FileUploadIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="subtitle1" sx={{ color: 'text.primary', mb: 0.5 }}>
                {t('fileUpload.dragDropOrSelect')}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                sx={{ px: 3, py: 1, borderRadius: 2, textTransform: 'none', boxShadow: 'none' }}
              >
                {t('fileUpload.selectFile')}
              </Button>
              <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary' }}>
                {t('fileUpload.pdfOnly')}
              </Typography>
            </>
          ) : (
            /* Custom file chip — avoids MUI Alert's internal alpha() on success color */
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1.5,
                p: 1.5,
                borderRadius: 2,
                bgcolor: 'rgba(5, 150, 105, 0.06)',
                border: '1px solid rgba(5, 150, 105, 0.3)',
              }}
            >
              <FilePresentIcon sx={{ color: '#059669', fontSize: 22 }} />
              <Typography variant="body2" noWrap sx={{ color: '#059669', fontWeight: 500, flex: 1, textAlign: 'left' }}>
                {selectedFile?.name}
              </Typography>
              <Button
                size="small"
                variant="outlined"
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFile(null);
                }}
                sx={{ minWidth: 'auto', px: 1.5, borderRadius: 1.5, textTransform: 'none' }}
              >
                {t('fileUpload.delete')}
              </Button>
            </Box>
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
                sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'error.main', mt: 1 }}
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

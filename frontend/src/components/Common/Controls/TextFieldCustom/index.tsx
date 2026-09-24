'use client';
import React from 'react';
import { Control, FieldValues, Path } from 'react-hook-form';
import { InputAdornment, TextField, Typography } from "@mui/material";
import { SxProps, Theme } from '@mui/material/styles';
import ValidationError from '../ValidationError';
import TypedController from '../TypedController';

const EMPTY_SX: SxProps<Theme> = {};

interface Props<T extends FieldValues = FieldValues> {
  name: string;
  control: Control<T>;
  title?: string | null;
  showRequired?: boolean;
  placeholder?: string;
  helperText?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  type?: string;
  maxLength?: number;
  numericOnly?: boolean;
  sx?: SxProps<Theme>;
}

const TextFieldCustom = <T extends FieldValues = FieldValues>({
  name,
  control,
  title = null,
  showRequired = false,
  placeholder = '',
  helperText = '',
  disabled = false,
  icon = null,
  type = 'text',
  maxLength,
  numericOnly = false,
  sx = EMPTY_SX,
}: Props<T>) => {

  // Format display number with comma
  const formatDisplay = (value: unknown) => {
    if (type !== 'number' || !value) return value;
    return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  return (
    <div>
      {title && (
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, display: 'block', color: 'text.primary' }}>
          {title}{showRequired && <span style={{ color: 'red', marginLeft: '4px' }}>*</span>}
        </Typography>
      )}

      <TypedController
        name={name as Path<T>}
        control={control}
        render={({ field, fieldState }) => (

          <>

            <TextField
              sx={sx}
              fullWidth

              variant="outlined"

              size="small"
              id={field.name}
              name={field.name}
              placeholder={placeholder}
              value={formatDisplay(field.value) ?? ''}
              onChange={(e) => {
                let value = e.target.value;

                if (numericOnly) {
                  value = value.replace(/\D/g, '');
                } else if (type === 'number') {
                  value = value.replace(/,/g, '');
                  if (!/^\d*$/.test(value)) return;
                }

                if (typeof maxLength === 'number' && value.length > maxLength) {
                  value = value.slice(0, maxLength);
                }

                field.onChange(value);
              }}

              onBlur={field.onBlur}

              error={fieldState.invalid}

              disabled={disabled}

              helperText={!fieldState.invalid ? helperText : ''}

              slotProps={{
                input: {
                  startAdornment: icon && (
                    <InputAdornment position="start">{icon}</InputAdornment>
                  ),
                },
                htmlInput: {
                  inputMode: type === 'number' || numericOnly ? 'numeric' : 'text',
                  ...(typeof maxLength === 'number' ? { maxLength } : {}),
                },
              }}

            />

            {fieldState.invalid && (
              <ValidationError message={fieldState.error?.message} />
            )}

          </>

        )}

      />

    </div>

  );

};

export default TextFieldCustom;

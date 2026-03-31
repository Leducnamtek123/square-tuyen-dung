import React from 'react';

import { Control, Controller, FieldValues, Path } from 'react-hook-form';

import { InputAdornment, TextField, Typography } from "@mui/material";
import { SxProps, Theme } from '@mui/material/styles';
import ValidationError from '../ValidationError';

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
  sx = {},
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

      <Controller
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
              placeholder={placeholder}
              value={formatDisplay(field.value)}
              onChange={(e) => {

                const value = e.target.value.replace(/,/g, '');

                if (type === 'number' && !/^\d*$/.test(value)) return;

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
                  inputMode: type === 'number' ? 'numeric' : 'text',
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

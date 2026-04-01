import React from 'react';

import { Control, Controller } from 'react-hook-form';

import { TextField, Typography } from "@mui/material";
import ValidationError from '../ValidationError';

import type { SxProps, Theme } from '@mui/material/styles';

interface Props<T extends Record<string, unknown>> {
  name: string;
  control: Control<T | import('react-hook-form').FieldValues>;
  title?: string | null;
  showRequired?: boolean;
  placeholder?: string;
  disabled?: boolean;
  maxRows?: number;
  minRows?: number;
  sx?: SxProps<Theme>;
}

const MultilineTextFieldCustom = <T extends Record<string, unknown>>({
  name,
  control,
  title = null,
  showRequired = false,
  placeholder = '',
  disabled = false,
  maxRows = 10,
  minRows = 4,
  sx
}: Props<T>) => {

  return (

    <div>

      {title && (

        <Typography variant="subtitle2" gutterBottom>

           {title} {showRequired && <span style={{ color: 'red' }}>*</span>}

        </Typography>

      )}

      <Controller

        name={name}

        control={control}

        render={({ field, fieldState }) => (

          <>

            <TextField

              fullWidth

            //   size="small"

              id={field.name}
              placeholder={placeholder}
              value={field.value}
              onChange={field.onChange}

              onBlur={field.onBlur}

              error={fieldState.invalid}

              disabled={disabled}

              multiline

              maxRows={maxRows}

              minRows={minRows}

              variant="outlined"

              sx={sx}

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

export default MultilineTextFieldCustom;

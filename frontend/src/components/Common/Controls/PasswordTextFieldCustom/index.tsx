import React from 'react';

import { Control, Controller, FieldValues, Path } from 'react-hook-form';

import { Box, InputAdornment, OutlinedInput, Typography } from "@mui/material";
import { SxProps, Theme } from '@mui/material/styles';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import ValidationError from '../ValidationError';

const EMPTY_SX = {};

interface Props<T extends FieldValues = FieldValues> {
  name: string;
  control: Control<T>;
  title?: string | null;
  showRequired?: boolean;
  placeholder?: string;
  sx?: SxProps<Theme>;
}

const PasswordTextFieldCustom = <T extends FieldValues = FieldValues>({
  name,
  control,
  title = null,
  showRequired = false,
  placeholder = '',
  sx = EMPTY_SX,
}: Props<T>) => {

  const [showPassword, setShowPassword] = React.useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  return (

    <div>

      {title && (

        <Typography variant="subtitle2" gutterBottom>

          {title} {showRequired && <span style={{ color: 'red' }}>*</span>}

        </Typography>

      )}

      <Controller

        name={name as Path<T>}

        control={control}

        render={({ field, fieldState }) => (

          <>

            <OutlinedInput
              sx={sx}
              fullWidth

              size="small"

              id={name}

              placeholder={placeholder}

              type={showPassword ? 'text' : 'password'}

              endAdornment={

                <InputAdornment position="end">

                  <Box

                    sx={{ cursor: 'pointer' }}

                    onClick={handleClickShowPassword}

                    onMouseDown={handleMouseDownPassword}

                  >

                    {showPassword ? <VisibilityOff /> : <Visibility />}

                  </Box>

                </InputAdornment>

              }

              value={field.value}

              onChange={field.onChange}

              error={fieldState.invalid}

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

export default PasswordTextFieldCustom;

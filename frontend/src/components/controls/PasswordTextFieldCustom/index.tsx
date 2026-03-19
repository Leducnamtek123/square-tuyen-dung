import React from 'react';

import { Control, Controller } from 'react-hook-form';

import { Box, InputAdornment, OutlinedInput, Typography } from "@mui/material";
import { Visibility, VisibilityOff } from '@mui/icons-material';
import ValidationError from '../ValidationError';

interface Props {
  name: string;
  control: Control<any>;
  title?: string | null;
  showRequired?: boolean;
  placeholder?: string;
  sx?: any;
}

const PasswordTextFieldCustom = ({
  name,
  control,
  title = null,
  showRequired = false,
  placeholder = '',
  sx = {},
}: Props) => {

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

        name={name}

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

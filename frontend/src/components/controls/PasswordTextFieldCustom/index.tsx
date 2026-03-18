// @ts-nocheck
import React from 'react';

import { Controller } from 'react-hook-form';

import { Box, InputAdornment, OutlinedInput, Typography } from "@mui/material";
import { Visibility, VisibilityOff } from '@mui/icons-material';
import ValidationError from '../ValidationError';

interface Props {
  [key: string]: any;
}



const PasswordTextFieldCustom = ({

  name,

  control,

  title = null,

  showRequired = false,

  placeholder = '',

}: Props) => {

  const [showPassword, setShowPassword] = React.useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event) => {

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

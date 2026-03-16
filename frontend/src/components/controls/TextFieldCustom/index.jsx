import React from 'react';

import { Controller } from 'react-hook-form';

import { InputAdornment, TextField, Typography } from "@mui/material";

import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const TextFieldCustom = ({

  name,

  control,

  title = null,

  showRequired = false,

  placeholder = '',

  helperText = '',

  disabled = false,

  icon = null,

  type = 'text',

}) => {

  // Format display number with comma

  const formatDisplay = (value) => {

    if (type !== 'number' || !value) return value;

    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  };

  return (

    <div>

      {title && (
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, display: 'block', color: 'text.primary' }}>
          {title}{showRequired && <span style={{ color: 'red', marginLeft: '4px' }}>*</span>}
        </Typography>
      )}

      <Controller

        name={name}

        control={control}

        render={({ field, fieldState }) => (

          <>

            <TextField

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

                  inputProps: {

                    inputMode: type === 'number' ? 'numeric' : 'text',

                  },

                  startAdornment: icon && (

                    <InputAdornment position="start">{icon}</InputAdornment>

                  ),

                }

              }}

            />

            {fieldState.invalid && (

              <span

                style={{

                  color: 'red',

                  fontSize: 13,

                  marginTop: 1,

                  marginLeft: 1,

                }}

              >

                <ErrorOutlineIcon fontSize="small" />{' '}

                {fieldState.error?.message}

              </span>

            )}

          </>

        )}

      />

    </div>

  );

};

export default TextFieldCustom;

'use client';
import React from 'react';
import { Control, FieldValues, Path } from 'react-hook-form';
import { IconButton, InputAdornment, TextField, Typography } from "@mui/material";
import { SxProps, Theme } from '@mui/material/styles';
import { Visibility, VisibilityOff } from '@mui/icons-material';
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
  sx?: SxProps<Theme>;
}

const PasswordTextFieldCustom = <T extends FieldValues = FieldValues>({
  name,
  control,
  title = null,
  showRequired = false,
  placeholder = '',
  helperText = '',
  disabled = false,
  sx = EMPTY_SX,
}: Props<T>) => {
  const [showPassword, setShowPassword] = React.useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
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
              id={name}
              name={field.name}
              placeholder={placeholder}
              type={showPassword ? 'text' : 'password'}
              value={field.value ?? ''}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={fieldState.invalid}
              disabled={disabled}
              helperText={!fieldState.invalid ? helperText : ''}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment
                      position="end"
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        maxHeight: 'none',
                        mr: 0.5,
                      }}
                    >
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                        size="small"
                        tabIndex={-1}
                        sx={{
                          p: 0.5,
                          color: '#64748B',
                          '&:hover': {
                            color: '#0F172A',
                            backgroundColor: 'transparent',
                          },
                        }}
                      >
                        {showPassword ? <VisibilityOff sx={{ fontSize: 20 }} /> : <Visibility sx={{ fontSize: 20 }} />}
                      </IconButton>
                    </InputAdornment>
                  ),
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

export default PasswordTextFieldCustom;

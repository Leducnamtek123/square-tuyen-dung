/*
MyJob Recruitment System - Part of MyJob Platform

Author: Bui Khanh Huy
Email: khuy220@gmail.com
Copyright (c) 2023 Bui Khanh Huy

License: MIT License
See the LICENSE file in the project root for full license information.
*/

import React from 'react';
import { Controller } from 'react-hook-form';
import { Autocomplete, TextField, Typography } from "@mui/material";

import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
const TextFieldAutoCompleteCustom = ({
  name,
  control,
  title = null,
  showRequired=false,
  placeholder = '',
  disabled = false,
  options,
  loading,
  handleSelect,
  helperText = '',
}) => {
  const [open, setOpen] = React.useState(false);

  return (
    <div>
      {title && (
        <Typography variant="subtitle2" gutterBottom>
          {title} {showRequired && <span style={{ color: 'red' }}>*</span>}
        </Typography>
      )}
      <Controller
        control={control}
        name={name}
        defaultValue=""
        render={({ field, fieldState }) => (
          <>
            <Autocomplete
              freeSolo
              id={field.name}
              disabled={disabled}
              open={open}
              onOpen={() => {
                setOpen(true);
              }}
              onClose={() => {
                setOpen(false);
              }}
              getOptionLabel={(option) =>
                option?.description || field.value || ''
              }
              options={options}
              loading={loading}
              onChange={handleSelect}
              inputValue={field.value}
              onInputChange={(e, newValue) => field.onChange(newValue || '')}
              renderInput={(params) => (
                <TextField
                error={fieldState.invalid}
                  {...params}
                  size="small"
                  placeholder={placeholder}
                  helperText={!fieldState.invalid ? helperText : ''}
                  slotProps={{
                    input: {
                      ...params.InputProps,
                    }
                  }}
                />
              )}
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

export default TextFieldAutoCompleteCustom;


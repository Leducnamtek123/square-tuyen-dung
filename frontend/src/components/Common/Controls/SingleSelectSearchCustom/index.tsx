'use client';
import React from 'react';

import { useTheme } from '@mui/material/styles';

import { Control, Controller, FieldValues, Path } from 'react-hook-form';

import TextField from '@mui/material/TextField';

import Autocomplete from '@mui/material/Autocomplete';
import { useTranslation } from 'react-i18next';
import type { SelectOption } from '@/types/models';

const EMPTY_OPTIONS: SelectOption[] = [];

interface Props<T extends FieldValues = FieldValues> {
  name: string;
  control: Control<T>;
  placeholder?: string;
  options?: SelectOption[];
  noOptionsText?: string;
}

const SingleSelectSearchCustom = <T extends FieldValues = FieldValues>({
  placeholder = '',
  name,
  control,
  options = EMPTY_OPTIONS,
  noOptionsText,
}: Props<T>) => {

  const theme = useTheme();
  const { t } = useTranslation('common');

  return (

    <Controller

      name={name as Path<T>}

      control={control}

      render={({ field }) => (

        <Autocomplete

          fullWidth

          id={field.name}

          options={options}

          {...(noOptionsText ? { noOptionsText } : {})}

          autoHighlight={false}

          getOptionLabel={(option) => typeof option.name === 'string' ? t(`choices.${option.name}`, option.name) : option.name}

          value={options.find((o) => o.id === field.value) || null}

          onChange={(e, value) => field.onChange(value?.id || '')}

        renderInput={(params) => (

            <TextField

              {...params}

              size="small"

              placeholder={placeholder}

              sx={{
                backgroundColor: theme.palette.mode === 'light' ? 'white' : '#121212',
                borderRadius: 999,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 999,
                  backgroundColor: theme.palette.mode === 'light' ? 'white' : '#121212',
                  '& fieldset': {
                    borderColor: 'rgba(26, 64, 125, 0.18)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(26, 64, 125, 0.35)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: theme.palette.primary.main,
                    borderWidth: 1,
                  },
                },
                '& .MuiInputBase-input': {
                  px: 1.5,
                },
              }}

            />

          )}

        />

      )}

    />

  );

};

export default SingleSelectSearchCustom;

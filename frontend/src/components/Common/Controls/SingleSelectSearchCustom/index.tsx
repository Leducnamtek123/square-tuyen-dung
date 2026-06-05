'use client';
import React from 'react';

import { useTheme } from '@mui/material/styles';

import { Control, Controller, FieldValues, Path } from 'react-hook-form';

import TextField from '@mui/material/TextField';

import Autocomplete from '@mui/material/Autocomplete';
import { useTranslation } from 'react-i18next';
import type { SelectOption } from '@/types/models';

const EMPTY_OPTIONS: SelectOption[] = [];

const optionMatchesValue = (optionId: string | number | null | undefined, valueId: string | number | null | undefined) =>
  optionId !== null && optionId !== undefined && valueId !== null && valueId !== undefined && String(optionId) === String(valueId);

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

          noOptionsText={noOptionsText || t('noOptions')}
          loadingText={t('loading')}
          openText={t('autocomplete.open')}
          closeText={t('autocomplete.close')}
          clearText={t('autocomplete.clear')}

          autoHighlight={false}

          getOptionLabel={(option) => typeof option.name === 'string' ? t(`choices.${option.name}`, option.name) : option.name}

          value={options.find((o) => field.value !== undefined && field.value !== null && optionMatchesValue(o.id, field.value)) || null}

          isOptionEqualToValue={(option, value) => optionMatchesValue(option.id, value.id)}

          onChange={(e, value) => field.onChange(value?.id ?? '')}

        renderInput={(params) => (

            <TextField

              {...params}

              size="small"

              placeholder={placeholder}

              sx={{
                backgroundColor: theme.palette.mode === 'light' ? 'white' : '#121212',
                borderRadius: 999,
                boxShadow: '0 10px 26px rgba(26, 64, 125, 0.08)',
                '& .MuiOutlinedInput-root': {
                  minHeight: 48,
                  borderRadius: 999,
                  backgroundColor: theme.palette.mode === 'light' ? 'white' : '#121212',
                  transition: 'box-shadow 180ms ease, border-color 180ms ease',
                  '& fieldset': {
                    borderColor: 'rgba(26, 64, 125, 0.14)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(26, 64, 125, 0.35)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: theme.palette.primary.main,
                    borderWidth: 1,
                  },
                  '&.Mui-focused': {
                    boxShadow: '0 0 0 4px rgba(42, 169, 225, 0.16), 0 16px 34px rgba(26, 64, 125, 0.12)',
                  },
                },
                '& .MuiInputBase-input': {
                  px: 1.5,
                  fontWeight: 600,
                  color: 'text.primary',
                  '&::placeholder': {
                    color: 'text.secondary',
                    opacity: 0.78,
                  },
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

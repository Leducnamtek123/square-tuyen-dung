'use client';
import React from 'react';

import { useTheme } from '@mui/material/styles';

import { Control, Controller, FieldValues, Path } from 'react-hook-form';

import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

import Autocomplete from '@mui/material/Autocomplete';
import { useTranslation } from 'react-i18next';
import type { SelectOption } from '@/types/models';
const ControllerAny = Controller as any;

const EMPTY_OPTIONS: SelectOption[] = [];

const optionMatchesValue = (optionId: string | number | null | undefined, valueId: string | number | null | undefined) =>
  optionId !== null && optionId !== undefined && valueId !== null && valueId !== undefined && String(optionId) === String(valueId);

interface Props<T extends FieldValues = FieldValues> {
  name: string;
  control: Control<T>;
  placeholder?: string;
  options?: SelectOption[];
  noOptionsText?: string;
  variant?: 'default' | 'hero';
  startIcon?: React.ReactNode;
}

const SingleSelectSearchCustom = <T extends FieldValues = FieldValues>({
  placeholder = '',
  name,
  control,
  options = EMPTY_OPTIONS,
  noOptionsText,
  variant = 'default',
  startIcon,
}: Props<T>) => {

  const theme = useTheme();
  const { t } = useTranslation('common');
  const isHero = variant === 'hero';

  return (

    <ControllerAny

      name={name as Path<T>}

      control={control}

      render={({ field }: any) => (

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

          slotProps={{
            paper: {
              sx: {
                width: 'max-content',
                minWidth: isHero ? { xs: 280, sm: 440, md: 540 } : 280,
                maxWidth: 620,
                mt: 1,
                p: 0.5,
                boxShadow: '0 22px 50px rgba(15, 23, 42, 0.18)',
                border: '1px solid rgba(226, 232, 240, 0.95)',
                borderRadius: 3,
              },
            },
            listbox: {
              sx: {
                display: 'grid',
                gridTemplateColumns: isHero ? { xs: '1fr', sm: 'repeat(2, 1fr)' } : '1fr',
                gap: '4px 8px',
                p: 1,
                maxHeight: 380,
                overflowY: 'auto',
                '& .MuiAutocomplete-option': {
                  borderRadius: 2,
                  py: 1,
                  px: 1.5,
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#334155',
                  transition: 'all 0.15s ease',
                  '&:hover, &.Mui-focused': {
                    backgroundColor: 'rgba(124, 58, 237, 0.08)',
                    color: '#7c3aed',
                  },
                  '&[aria-selected="true"]': {
                    backgroundColor: 'rgba(124, 58, 237, 0.14)',
                    color: '#7c3aed',
                    fontWeight: 700,
                  },
                },
              },
            },
          }}
          renderInput={(params) => (

            <TextField

              {...params}

              size="small"

              placeholder={placeholder}
              slotProps={{
                input: {
                  ...params.InputProps,
                  startAdornment: startIcon ? (
                    <InputAdornment
                      position="start"
                      sx={{
                        color: isHero ? 'rgba(71, 85, 105, 0.55)' : 'text.secondary',
                        ml: isHero ? 0.5 : 0,
                      }}
                    >
                      {startIcon}
                    </InputAdornment>
                  ) : params.InputProps.startAdornment,
                },
              }}

              sx={{
                backgroundColor: isHero ? 'transparent' : theme.palette.mode === 'light' ? 'white' : '#121212',
                borderRadius: isHero ? 1 : 999,
                boxShadow: isHero ? 'none' : '0 10px 26px rgba(15, 23, 42, 0.08)',
                '& .MuiOutlinedInput-root': {
                  minHeight: isHero ? 56 : 48,
                  borderRadius: isHero ? 1 : 999,
                  backgroundColor: isHero ? 'transparent' : theme.palette.mode === 'light' ? 'white' : '#121212',
                  transition: 'box-shadow 180ms ease, border-color 180ms ease',
                  '& fieldset': {
                    borderColor: isHero ? 'transparent' : 'rgba(226, 232, 240, 0.95)',
                  },
                  '&:hover fieldset': {
                    borderColor: isHero ? 'transparent' : 'rgba(15, 23, 42, 0.26)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: isHero ? 'transparent' : theme.palette.primary.main,
                    borderWidth: 1,
                  },
                  '&.Mui-focused': {
                    boxShadow: isHero ? 'none' : '0 0 0 4px rgba(15, 23, 42, 0.14), 0 16px 34px rgba(15, 23, 42, 0.08)',
                  },
                },
                '& .MuiInputBase-input': {
                  px: 1.5,
                  fontWeight: 600,
                  fontSize: isHero ? 14 : undefined,
                  color: 'text.primary',
                  '&::placeholder': {
                    color: isHero ? 'rgba(71, 85, 105, 0.62)' : 'text.secondary',
                    opacity: isHero ? 1 : 0.78,
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

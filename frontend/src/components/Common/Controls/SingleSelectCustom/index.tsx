'use client';
import React from 'react';
import { Control, FieldValues, Path } from 'react-hook-form';
import { Autocomplete, TextField, Typography } from "@mui/material";
import { SxProps, Theme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import ValidationError from '../ValidationError';
import TypedController from '../TypedController';
import type { SelectOption } from '@/types/models';

const EMPTY_SX: SxProps<Theme> = {};
const EMPTY_OPTIONS: SelectOption[] = [];

interface Props<T extends FieldValues = FieldValues> {
  name: string;
  control: Control<T>;
  options?: SelectOption[];
  title?: string | null;
  showRequired?: boolean;
  placeholder?: string;
  disabledPlaceholder?: string;
  disabled?: boolean;
  loading?: boolean;
  noOptionsText?: string;
  sx?: SxProps<Theme>;
}

const SingleSelectCustom = <T extends FieldValues = FieldValues>({
  name,
  control,
  options = EMPTY_OPTIONS,
  title = null,
  showRequired = false,
  placeholder = '',
  disabledPlaceholder,
  disabled = false,
  loading = false,
  noOptionsText,
  sx = EMPTY_SX,
}: Props<T>) => {
  const { t } = useTranslation('common');
  const activePlaceholder = disabled && disabledPlaceholder ? disabledPlaceholder : placeholder;

  return (
    <div>
      {title && (
        <Typography variant="subtitle2" gutterBottom sx={{ color: disabled ? 'text.disabled' : 'inherit' }}>
          {title} {showRequired && <span style={{ color: 'red' }}>*</span>}
        </Typography>
      )}

      <TypedController
        name={name as Path<T>}
        control={control}
        render={({ field, fieldState }) => (
          <>
            <Autocomplete
              sx={{
                ...sx,
                ...(disabled && {
                  opacity: 0.75,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#f8fafc',
                  },
                }),
              }}
              fullWidth
              disabled={disabled}
              loading={loading}
              id={field.name}
              clearOnBlur
              options={options}
              noOptionsText={noOptionsText || t('noOptions')}
              loadingText={t('loading')}
              openText={t('autocomplete.open')}
              closeText={t('autocomplete.close')}
              clearText={t('autocomplete.clear')}
              autoHighlight={false}
              getOptionLabel={(option) => typeof option.name === 'string' ? t(`choices.${option.name}`, option.name) : option.name}
              value={options.find((o) => o.id == field.value) || null}
              onChange={(e, value) => field.onChange(value?.id ?? null)}
              slotProps={{
                popper: {
                  sx: { zIndex: 9999 },
                },
              }}
              renderInput={(params) => (
                <TextField
                  error={fieldState.invalid}
                  {...params}
                  size="small"
                  placeholder={activePlaceholder}
                  disabled={disabled}
                />
              )}
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

export default SingleSelectCustom;

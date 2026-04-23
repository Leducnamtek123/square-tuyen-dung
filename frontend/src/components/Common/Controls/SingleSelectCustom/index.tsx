import React from 'react';

import { Control, Controller, FieldValues, Path } from 'react-hook-form';

import { Autocomplete, TextField, Typography } from "@mui/material";
import { SxProps, Theme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import ValidationError from '../ValidationError';

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
  sx?: SxProps<Theme>;
}

const SingleSelectCustom = <T extends FieldValues = FieldValues>({
  name,
  control,
  options = EMPTY_OPTIONS,
  title = null,
  showRequired = false,
  placeholder = '',
  sx = EMPTY_SX,
}: Props<T>) => {
  const { t } = useTranslation('common');

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

            <Autocomplete
              sx={sx}
              fullWidth

              id={field.name}

              clearOnBlur

              options={options}

              autoHighlight={false}

              getOptionLabel={(option) => typeof option.name === 'string' ? t(`choices.${option.name}`, option.name) : option.name}

              value={options.find((o) => o.id == field.value) || null}

              onChange={(e, value) => field.onChange(value?.id ?? null)}

              renderInput={(params) => (

                <TextField  error={fieldState.invalid} {...params} size="small" placeholder={placeholder} />

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

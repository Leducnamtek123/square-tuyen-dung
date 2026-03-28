import React from 'react';

import { Control, Controller } from 'react-hook-form';

import { Autocomplete, TextField, Typography } from "@mui/material";
import { useTranslation } from 'react-i18next';
import ValidationError from '../ValidationError';

interface Props {
  name: string;
  control: Control<any>;
  options?: any[];
  title?: string | null;
  showRequired?: boolean;
  placeholder?: string;
  sx?: any;
}

const SingleSelectCustom = ({
  name,
  control,
  options = [],
  title = null,
  showRequired = false,
  placeholder = '',
  sx = {},
}: Props) => {
  const { t } = useTranslation('common');

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

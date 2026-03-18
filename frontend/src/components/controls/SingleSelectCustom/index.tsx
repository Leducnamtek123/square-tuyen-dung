// @ts-nocheck
import React from 'react';

import { Controller } from 'react-hook-form';

import { Autocomplete, TextField, Typography } from "@mui/material";
import ValidationError from '../ValidationError';

interface Props {
  [key: string]: any;
}



const SingleSelectCustom = ({

  name,

  control,

  options = [],

  title = null,

  showRequired = false,

  placeholder = '',

}: Props) => {

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

              fullWidth

              id={field.name}

              clearOnBlur

              options={options}

              autoHighlight={false}

              getOptionLabel={(option) => option.name}

              value={options.find((o) => o.id === field.value) || null}

              onChange={(e, value) => field.onChange(value?.id || null)}

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

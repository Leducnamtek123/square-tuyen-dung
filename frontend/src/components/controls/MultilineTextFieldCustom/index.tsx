// @ts-nocheck
import React from 'react';

import { Controller } from 'react-hook-form';

import { TextField, Typography } from "@mui/material";
import ValidationError from '../ValidationError';

interface Props {
  [key: string]: any;
}



const MultilineTextFieldCustom = ({

  name,

  control,

  title = null,

  showRequired = false,

  placeholder = '',

  disabled = false,

  maxRows = 10,

  minRows = 4

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

            <TextField

              fullWidth

            //   size="small"

              id={field.name}
              placeholder={placeholder}
              value={field.value}
              onChange={field.onChange}

              onBlur={field.onBlur}

              error={fieldState.invalid}

              disabled={disabled}

              multiline

              maxRows={maxRows}

              minRows={minRows}

              variant="outlined"

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

export default MultilineTextFieldCustom;

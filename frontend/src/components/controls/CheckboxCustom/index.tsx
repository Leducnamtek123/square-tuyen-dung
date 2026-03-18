// @ts-nocheck
import React from 'react';

import { Controller } from 'react-hook-form';

import { Checkbox, FormControlLabel } from "@mui/material";
import ValidationError from '../ValidationError';

interface Props {
  [key: string]: any;
}



const CheckboxCustom = ({ name, control, title = '', disabled = false }: Props) => {

  return (

    <div>

      <Controller

        name={name}

        control={control}

        render={({ field, fieldState }) => (

          <>

            <FormControlLabel

              control={

                <Checkbox checked={Boolean(field.value)} value={true} onChange={field.onChange} />

              }

              label={title}

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

export default CheckboxCustom;

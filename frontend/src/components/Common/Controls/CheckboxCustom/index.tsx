import React from 'react';

import { Control, Controller } from 'react-hook-form';

import { Checkbox, FormControlLabel } from "@mui/material";
import ValidationError from '../ValidationError';

interface Props {
  name: string;
  control: Control<any>;
  title?: string;
  disabled?: boolean;
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

'use client';

import React from 'react';

import { Control, Controller, FieldValues, Path } from 'react-hook-form';

import { Checkbox, FormControlLabel } from "@mui/material";
import ValidationError from '../ValidationError';

interface Props<T extends FieldValues = FieldValues> {
  name: string;
  control: Control<T>;
  title?: string;
  disabled?: boolean;
}

const CheckboxCustom = <T extends FieldValues = FieldValues>({ name, control, title = '', disabled = false }: Props<T>) => {

  return (

    <div>

      <Controller

        name={name as Path<T>}

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

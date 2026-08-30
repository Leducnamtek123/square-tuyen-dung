'use client';

import React from 'react';
import { Control, FieldValues, Path } from 'react-hook-form';
import { Checkbox, FormControlLabel } from "@mui/material";
import ValidationError from '../ValidationError';
import TypedController from '../TypedController';

interface Props<T extends FieldValues = FieldValues> {
  name: string;
  control: Control<T>;
  title?: string;
  disabled?: boolean;
}

const CheckboxCustom = <T extends FieldValues = FieldValues>({ name, control, title = '', disabled = false }: Props<T>) => {
  return (
    <div>
      <TypedController
        name={name as Path<T>}
        control={control}
        render={({ field, fieldState }) => (
          <>
            <FormControlLabel
              control={
                <Checkbox
                  checked={Boolean(field.value)}
                  value={true}
                  disabled={disabled}
                  onChange={field.onChange}
                />
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

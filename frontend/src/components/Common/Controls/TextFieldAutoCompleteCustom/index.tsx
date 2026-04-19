import React from 'react';

import { Control, Controller, FieldValues, Path } from 'react-hook-form';

import { Autocomplete, TextField, Typography } from "@mui/material";
import { SxProps, Theme } from '@mui/material/styles';
import ValidationError from '../ValidationError';
import type { SelectOption } from '@/types/models';
interface Props<T extends FieldValues = FieldValues> {
  name: string;
  control: Control<T>;
  title?: string | null;
  showRequired?: boolean;
  placeholder?: string;
  disabled?: boolean;
  options: SelectOption[];
  loading?: boolean;
  handleSelect?: (event: React.SyntheticEvent, value: string | SelectOption | null) => void;
  helperText?: string;
  sx?: SxProps<Theme>;
}

const TextFieldAutoCompleteCustom = <T extends FieldValues = FieldValues>({
  name,
  control,
  title = null,
  showRequired=false,
  placeholder = '',
  disabled = false,
  options,
  loading,
  handleSelect,
  helperText = '',
  sx = {},
}: Props<T>) => {

  const [open, setOpen] = React.useState(false);

  return (

    <div>

      {title && (

        <Typography variant="subtitle2" gutterBottom>

          {title} {showRequired && <span style={{ color: 'red' }}>*</span>}

        </Typography>

      )}

      <Controller

        control={control}

        name={name as Path<T>}

        render={({ field, fieldState }) => (

          <>

            <Autocomplete
              sx={sx}
              freeSolo

              id={field.name}

              disabled={disabled}

              open={open}

              onOpen={() => {

                setOpen(true);

              }}

              onClose={() => {

                setOpen(false);

              }}

              getOptionLabel={(option) =>
                typeof option === 'string'
                  ? option
                  : (option?.description as string) || (option?.name as string) || field.value || ''
              }

              options={options}

              loading={loading}

              onChange={handleSelect}

              inputValue={field.value}

              onInputChange={(e, newValue) => field.onChange(newValue || '')}

              renderInput={(params) => (

                <TextField

                error={fieldState.invalid}

                  {...params}

                  size="small"

                  placeholder={placeholder}

                  helperText={!fieldState.invalid ? helperText : ''}

                  slotProps={{

                    input: {

                      ...params.InputProps,

                    }

                  }}

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

export default TextFieldAutoCompleteCustom;

import React from 'react';

import { Control, Controller } from 'react-hook-form';

import { Autocomplete, TextField, Typography } from "@mui/material";
import ValidationError from '../ValidationError';

interface Props {
  name: string;
  control: Control<any>;
  title?: string | null;
  showRequired?: boolean;
  placeholder?: string;
  disabled?: boolean;
  options: any[];
  loading?: boolean;
  handleSelect?: (event: any, value: any) => void;
  helperText?: string;
  sx?: any;
}

const TextFieldAutoCompleteCustom = ({
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
}: Props) => {

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

        name={name}

        defaultValue=""

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

                option?.description || field.value || ''

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

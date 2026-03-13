import React from 'react';

import { Controller } from 'react-hook-form';

import { Checkbox, FormControlLabel } from "@mui/material";

import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const CheckboxCustom = ({ name, control, title = '', disabled = false }) => {

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

              <span

                style={{

                  color: 'red',

                  fontSize: 13,

                  marginTop: 1,

                  marginLeft: 1,

                }}

              >

                <ErrorOutlineIcon fontSize="small" />{' '}

                {fieldState.error?.message}

              </span>

            )}

          </>

        )}

      />

    </div>

  );

};

export default CheckboxCustom;

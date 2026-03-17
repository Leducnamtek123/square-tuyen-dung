import React from 'react';

import { Controller } from 'react-hook-form';

import Radio from '@mui/material/Radio';

import RadioGroup from '@mui/material/RadioGroup';

import FormControlLabel from '@mui/material/FormControlLabel';

import { FormLabel, Typography } from "@mui/material";

import FormControl from '@mui/material/FormControl';
import ValidationError from '../ValidationError';

const RadioCustom = ({

  name,

  control,

  title = '',

  showRequired = false,

  options = [],

}) => {

  return (

    <div>

      <Controller

        name={name}

        control={control}

        render={({ field, fieldState }) => (

          <>

            <FormControl>

              <FormLabel id={name}>

                <Typography variant="subtitle2" gutterBottom color="black">

                  {title}{' '}

                  {showRequired && <span style={{ color: 'red' }}>*</span>}

                </Typography>

              </FormLabel>

              <RadioGroup

                row

                aria-labelledby={name}

                name={name}

                value={field.value}

                onChange={(e) => field.onChange(e.target.value)}

              >

                {options.map((value) => (

                  <FormControlLabel

                    key={value.id}

                    value={value.id}

                    control={<Radio />}

                    label={value.name}

                  />

                ))}

              </RadioGroup>

              {fieldState.invalid && (
                <ValidationError message={fieldState.error?.message} />
              )}

            </FormControl>

          </>

        )}

      />

    </div>

  );

};

export default RadioCustom;

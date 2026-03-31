import React from 'react';
import { Controller, Control, FieldValues, Path } from 'react-hook-form';
import Rating from '@mui/material/Rating';
import Typography from '@mui/material/Typography';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

interface RatingCustomProps<T extends FieldValues = FieldValues> {
  name: string;
  control: Control<T>;
  title?: string | null;
  onChangeActive?: (event: React.SyntheticEvent, value: number) => void;
  [key: string]: unknown;
}

const RatingCustom = <T extends FieldValues = FieldValues>({ name, control, title = null, onChangeActive, ...props }: RatingCustomProps<T>) => {

  return (

    <div>

      {title && (

        <Typography variant="subtitle2" gutterBottom>

          {title}

        </Typography>

      )}

      <Controller

        defaultValue={5 as unknown as undefined}

        name={name as Path<T>}

        control={control}

        render={({ field, fieldState }) => (

          <>

            <Rating

              size="large"

              value={field.value}

              onChange={field.onChange}

              onChangeActive={onChangeActive}

              {...props}

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

export default RatingCustom;

import React from 'react';
import { Controller, Control } from 'react-hook-form';
import Rating from '@mui/material/Rating';
import Typography from '@mui/material/Typography';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

interface RatingCustomProps {
  name: string;
  control: Control<any>;
  title?: string | null;
  onChangeActive?: (event: React.SyntheticEvent, value: number) => void;
  [key: string]: any;
}

const RatingCustom = ({ name, control, title = null, onChangeActive, ...props }: RatingCustomProps) => {

  return (

    <div>

      {title && (

        <Typography variant="subtitle2" gutterBottom>

          {title}

        </Typography>

      )}

      <Controller

        defaultValue={5}

        name={name}

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

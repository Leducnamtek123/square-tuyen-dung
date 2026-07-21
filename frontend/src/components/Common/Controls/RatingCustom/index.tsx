'use client';
import React from 'react';
import { Controller, Control, FieldValues, Path, PathValue } from 'react-hook-form';
import Rating from '@mui/material/Rating';
const RatingAny = Rating as unknown as React.ComponentType<any>;
import Typography from '@mui/material/Typography';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
const ControllerAny = Controller as any;

type RatingBaseProps = Record<string, any>;

type RatingCustomProps<T extends FieldValues = FieldValues> = RatingBaseProps & {
  name: string;
  control: Control<T>;
  title?: string | null;
  onChangeActive?: (event: React.SyntheticEvent, value: number) => void;
};

const RatingCustom = <T extends FieldValues = FieldValues>({ name, control, title = null, onChangeActive, ...props }: RatingCustomProps<T>) => {

  return (

    <div>

      {title && (

        <Typography variant="subtitle2" gutterBottom>

          {title}

        </Typography>

      )}

      <ControllerAny

        defaultValue={5 as PathValue<T, Path<T>>}

        name={name as Path<T>}

        control={control}

        render={({ field, fieldState }: any) => (

          <>

            <RatingAny

              size="large"

              value={field.value ?? 0}

              onChange={(_event: any, value: number | null) => field.onChange(value ?? 0)}

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

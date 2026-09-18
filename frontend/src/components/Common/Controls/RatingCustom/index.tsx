'use client';
import React from 'react';
import { Control, FieldValues, Path, PathValue } from 'react-hook-form';
import Rating from '@mui/material/Rating';
import Typography from '@mui/material/Typography';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import StarOutlineRoundedIcon from '@mui/icons-material/StarOutlineRounded';
import TypedController from '../TypedController';

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

      <TypedController
        defaultValue={5 as PathValue<T, Path<T>>}
        name={name as Path<T>}
        control={control}
        render={({ field, fieldState }) => (
          <>
            <Rating
              size="large"
              value={Number(field.value) || 0}
              onChange={(_event, value: number | null) => field.onChange(value ?? 0)}
              onChangeActive={onChangeActive}
              icon={<StarRoundedIcon fontSize="inherit" />}
              emptyIcon={<StarOutlineRoundedIcon fontSize="inherit" />}
              {...props}
              sx={{
                '& .MuiRating-iconFilled': { color: '#f59e0b' },
                '& .MuiRating-iconHover': { color: '#d97706' },
                ...props.sx,
              }}
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

import React from 'react';

import { Control, Controller, FieldValues, Path } from 'react-hook-form';

import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import dayjs from '@/configs/moment-config';

import { Typography, Box, SxProps, Theme } from "@mui/material";

import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import type { Dayjs } from 'dayjs';

const EMPTY_SX: SxProps<Theme> = {};

interface Props<T extends FieldValues = FieldValues> {
    name: string;
    control: Control<T>;
    title?: string | null;
    showRequired?: boolean;
    minDateTime?: Dayjs | string | null;
    maxDateTime?: Dayjs | string | null;
    fullWidth?: boolean;
    sx?: SxProps<Theme>;
}

const DateTimePickerCustom = <T extends FieldValues = FieldValues>({
    name,
    control,
    title = null,
    showRequired = false,
    minDateTime = null,
    maxDateTime = null,
    fullWidth = true,
    sx = EMPTY_SX,
}: Props<T>) => {

    const parseDate = (date: Dayjs | string | null | undefined) => {
        if (!date) return undefined;
        try {
            const parsedDate = dayjs(date);
            return parsedDate.isValid() ? parsedDate : undefined;
        } catch {
            return undefined;
        }
    };

    return (

        <LocalizationProvider dateAdapter={AdapterDayjs}>

            <Box sx={{ width: fullWidth ? '100%' : 'auto', ...sx }}>

                {title && (

                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, color: 'text.secondary' }}>

                        {title} {showRequired && <Box component="span" sx={{ color: 'error.main' }}>*</Box>}

                    </Typography>

                )}

                <Controller

                    name={name as Path<T>}

                    control={control}

                    render={({ field, fieldState }) => (

                        <>

                            <DateTimePicker

                                value={parseDate(field.value)}

                                onChange={(newValue) => {

                                    const date = parseDate(newValue);

                                    field.onChange(date ? date.format('YYYY-MM-DDTHH:mm') : null);

                                }}

                                minDateTime={parseDate(minDateTime)}

                                maxDateTime={parseDate(maxDateTime)}

                                format="DD-MM-YYYY HH:mm"

                                sx={{

                                    width: '100%',

                                    '& .MuiOutlinedInput-root': {

                                        borderRadius: '8px',

                                        bgcolor: 'background.paper',

                                    },

                                }}

                                slotProps={{

                                    textField: {

                                        fullWidth: true,

                                        error: !!fieldState.error,

                                        helperText: fieldState.error?.message,

                                        size: 'small',

                                    },

                                }}

                            />

                            {fieldState.error && (

                                <Typography

                                    variant="caption"

                                    color="error"

                                    sx={{ mt: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}

                                >

                                    <ErrorOutlineIcon sx={{ fontSize: 10 }} />

                                    {fieldState.error.message}

                                </Typography>

                            )}

                        </>

                    )}

                />

            </Box>

        </LocalizationProvider>

    );

};

export default DateTimePickerCustom;

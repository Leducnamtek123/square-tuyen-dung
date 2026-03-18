// @ts-nocheck
import React from 'react';
import { TextField, InputAdornment, Box } from "@mui/material";
import { useTranslation } from 'react-i18next';

import SearchIcon from '@mui/icons-material/Search';

interface Props {
  [key: string]: any;
}



const JobFilters = ({ searchTerm, onSearchChange }) => {
    const { t } = useTranslation('admin');
    return (
        <Box sx={{ mb: 3 }}>
            <TextField
                fullWidth
                variant="outlined"
                placeholder={t('pages.jobs.filter.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                slotProps={{
                    input: {
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }
                }}
            />
        </Box>
    );
};

export default JobFilters;

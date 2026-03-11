import React from 'react';
import { TextField, InputAdornment } from "@mui/material";

import SearchIcon from '@mui/icons-material/Search';

const UserFilters = ({ search, onSearchChange }) => {
    return (
        <TextField
            fullWidth
            variant="outlined"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            sx={{ mb: 2 }}
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
    );
};

export default UserFilters;

import React from 'react';
import { TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const UserFilters = ({ search, onSearchChange }) => {
    return (
        <TextField
            fullWidth
            variant="outlined"
            placeholder="Tìm kiếm theo tên hoặc email..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            InputProps={{
                startAdornment: (
                    <InputAdornment position="start">
                        <SearchIcon />
                    </InputAdornment>
                ),
            }}
            sx={{ mb: 2 }}
        />
    );
};

export default UserFilters;

import React from 'react';
import { Card, Box, TextField, InputAdornment } from "@mui/material";

import SearchIcon from '@mui/icons-material/Search';

const JobFilters = ({ searchTerm, onSearchChange }) => {
    return (
        <Card sx={{ mb: 3 }}>
            <Box sx={{ p: 2 }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Search by job title or company..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    size="small"
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon color="action" />
                                </InputAdornment>
                            ),
                        }
                    }}
                />
            </Box>
        </Card>
    );
};

export default JobFilters;

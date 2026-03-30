import React from 'react';
import { Box, TextField, InputAdornment, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import { useTranslation } from 'react-i18next';
import { ROLES_NAME } from '../../../../configs/constants';

interface UserFiltersProps {
    search: string;
    role: string;
    onSearchChange: (value: string) => void;
    onRoleChange: (value: string) => void;
}

const UserFilters = ({ search, role, onSearchChange, onRoleChange }: UserFiltersProps) => {
    const { t } = useTranslation('admin');

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onSearchChange(e.target.value);
    };

    const handleRoleChange = (e: SelectChangeEvent<string>) => {
        onRoleChange(e.target.value);
    };

    return (
        <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
                size="small"
                placeholder={t('pages.users.searchPlaceholder')}
                value={search}
                onChange={handleSearchChange}
                sx={{ width: 400 }}
                slotProps={{
                    input: {
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon fontSize="small" color="action" />
                            </InputAdornment>
                        ),
                    }
                }}
            />
            
            <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel id="role-filter-label">{t('pages.users.filters.role')}</InputLabel>
                <Select
                    labelId="role-filter-label"
                    value={role}
                    label={t('pages.users.filters.role')}
                    onChange={handleRoleChange}
                >
                    <MenuItem value="">{t('pages.users.filters.allRoles')}</MenuItem>
                    <MenuItem value={ROLES_NAME.ADMIN}>{t('pages.users.roles.admin')}</MenuItem>
                    <MenuItem value={ROLES_NAME.EMPLOYER}>{t('pages.users.roles.employer')}</MenuItem>
                    <MenuItem value={ROLES_NAME.JOB_SEEKER}>{t('pages.users.roles.jobSeeker')}</MenuItem>
                </Select>
            </FormControl>
        </Box>
    );
};

export default UserFilters;

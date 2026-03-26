import React from 'react';
import { TextField, InputAdornment, Stack, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from "@mui/material";
import { useTranslation } from 'react-i18next';

import SearchIcon from '@mui/icons-material/Search';
import { ROLES_NAME } from '../../../../configs/constants';

interface UserFiltersProps {
    search: string;
    role: string;
    onSearchChange: (value: string) => void;
    onRoleChange: (value: string) => void;
}

const UserFilters = ({ search, role, onSearchChange, onRoleChange }: UserFiltersProps) => {
    const { t } = useTranslation('admin');
    return (
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }}>
            <TextField
                fullWidth
                variant="outlined"
                placeholder={t('pages.users.filter.searchPlaceholder')}
                value={search}
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
            <FormControl sx={{ minWidth: 220 }} size="small">
                <InputLabel id="user-role-filter-label">
                    {t('pages.users.filter.roleLabel')}
                </InputLabel>
                <Select
                    labelId="user-role-filter-label"
                    value={role}
                    label={t('pages.users.filter.roleLabel')}
                    onChange={(e: SelectChangeEvent<string>) => onRoleChange(e.target.value)}
                >
                    <MenuItem value="">{t('pages.users.filter.roleAll')}</MenuItem>
                    <MenuItem value={ROLES_NAME.ADMIN}>{t('pages.users.roles.admin')}</MenuItem>
                    <MenuItem value={ROLES_NAME.EMPLOYER}>{t('pages.users.roles.employer')}</MenuItem>
                    <MenuItem value={ROLES_NAME.JOB_SEEKER}>{t('pages.users.roles.jobSeeker')}</MenuItem>
                </Select>
            </FormControl>
        </Stack>
    );
};

export default UserFilters;

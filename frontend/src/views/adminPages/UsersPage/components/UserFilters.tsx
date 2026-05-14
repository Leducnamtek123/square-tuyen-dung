import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from "@mui/material";
import { useTranslation } from 'react-i18next';
import { ROLES_NAME } from '../../../../configs/constants';
import FilterBar, { filterControlSx } from '@/components/Common/FilterBar';
import type { SxProps, Theme } from '@mui/material/styles';

const roleFilterSx = [{ minWidth: 220 }, filterControlSx] as SxProps<Theme>;

interface UserFiltersProps {
    search: string;
    role: string;
    onSearchChange: (value: string) => void;
    onRoleChange: (value: string) => void;
}

const UserFilters = ({ search, role, onSearchChange, onRoleChange }: UserFiltersProps) => {
    const { t } = useTranslation('admin');

    const handleRoleChange = (e: SelectChangeEvent<string>) => {
        onRoleChange(e.target.value);
    };

    return (
        <FilterBar
            title={t('pages.users.filters.title', 'Bộ lọc người dùng')}
            searchValue={search}
            searchPlaceholder={t('pages.users.searchPlaceholder')}
            onSearchChange={onSearchChange}
            activeFilterCount={role ? 1 : 0}
            onReset={() => {
                onSearchChange('');
                onRoleChange('');
            }}
            resetDisabled={!search && !role}
            resetLabel={t('common.clearFilters', 'Xóa lọc')}
        >
            <FormControl size="small" sx={roleFilterSx}>
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
        </FilterBar>
    );
};

export default UserFilters;

import React from 'react';
import { useTranslation } from 'react-i18next';
import FilterBar from '@/components/Common/FilterBar';

interface JobFiltersProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
}

const JobFilters = ({ searchTerm, onSearchChange }: JobFiltersProps) => {
    const { t } = useTranslation('admin');
    return (
        <FilterBar
            title={t('pages.jobs.filter.title', 'Bộ lọc tin tuyển dụng')}
            searchValue={searchTerm}
            searchPlaceholder={t('pages.jobs.filter.searchPlaceholder')}
            onSearchChange={onSearchChange}
            onReset={() => onSearchChange('')}
            resetDisabled={!searchTerm}
            resetLabel={t('common.clearFilters', 'Xóa lọc')}
        />
    );
};

export default JobFilters;

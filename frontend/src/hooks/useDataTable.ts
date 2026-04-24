'use client';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { SortingState, RowSelectionState, OnChangeFn } from '@tanstack/react-table';

interface UseDataTableOptions {
  initialPageSize?: number;
  initialSorting?: SortingState;
  debounceMs?: number;
}

export const useDataTable = (options: UseDataTableOptions = {}) => {
  const { initialPageSize = 10, initialSorting = [], debounceMs = 500 } = options;
  
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [sorting, setSorting] = useState<SortingState>(initialSorting);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Handle debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchTerm, debounceMs]);

  const ordering = useMemo(() => {
    if (sorting.length === 0) return undefined;
    const { id, desc } = sorting[0];
    return `${desc ? '-' : ''}${id}`;
  }, [sorting]);

  const onPaginationChange = useCallback((newPagination: { pageIndex: number; pageSize: number }) => {
    setPage(newPagination.pageIndex);
    setPageSize(newPagination.pageSize);
  }, []);

  const onSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
    setPage(0);
  }, []);

  const onSortingChange: OnChangeFn<SortingState> = useCallback((updaterOrValue) => {
    setSorting(updaterOrValue);
    setPage(0); // Reset page when sorting changes
  }, []);

  return {
    // States
    page,
    setPage,
    pageSize,
    setPageSize,
    sorting,
    setSorting,
    rowSelection,
    setRowSelection,
    searchTerm,
    setSearchTerm,
    debouncedSearchTerm,
    
    // Computed
    ordering,
    pagination: {
        pageIndex: page,
        pageSize,
    },
    
    // Handlers
    onPaginationChange,
    onSearchChange,
    onSortingChange,
    onRowSelectionChange: setRowSelection,
  };
};

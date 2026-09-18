import React from 'react';

export type SortOrder = 'asc' | 'desc';

export interface ColumnDef<T> {
  id: string;
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T, index: number) => React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  width?: string | number;
  minWidth?: string | number;
  hideOnMobile?: boolean;
}

export interface FilterOption {
  label: string;
  value: string | number | boolean;
}

export interface FilterDef {
  id: string;
  label: string;
  type?: 'select' | 'text' | 'boolean';
  options?: FilterOption[];
  value: any;
}

export interface BulkAction<T> {
  id: string;
  label: string;
  icon?: React.ReactNode;
  color?: 'primary' | 'error' | 'warning' | 'info' | 'success' | 'inherit';
  variant?: 'contained' | 'outlined' | 'text';
  onClick: (selectedRows: T[]) => void | Promise<void>;
  requiresConfirmation?: boolean;
  confirmTitle?: string;
  confirmMessage?: string;
}

export interface AdminDataGridProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  totalCount?: number;
  page?: number; // 1-indexed
  pageSize?: number;
  pageSizeOptions?: number[];
  onPageChange?: (newPage: number) => void;
  onPageSizeChange?: (newPageSize: number) => void;
  orderBy?: string;
  order?: SortOrder;
  onSortChange?: (columnId: string, order: SortOrder) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  searchPlaceholder?: string;
  filters?: FilterDef[];
  onFilterChange?: (filterId: string, value: any) => void;
  onResetFilters?: () => void;
  selectable?: boolean;
  selectedRows?: T[];
  onSelectRows?: (rows: T[]) => void;
  getRowId?: (row: T, index?: number) => string | number;
  bulkActions?: BulkAction<T>[];
  onExport?: (format: 'csv' | 'excel') => void;
  onRefresh?: () => void;
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  title?: string;
  subtitle?: string;
  headerAction?: React.ReactNode;
  onRowClick?: (row: T) => void;
  dense?: boolean;
}

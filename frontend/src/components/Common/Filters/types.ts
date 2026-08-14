import type React from 'react';

export type FilterFieldType =
  | 'SELECT'
  | 'MULTI_SELECT'
  | 'SEARCH_SELECT'
  | 'TEXT'
  | 'NUMBER'
  | 'NUMBER_RANGE'
  | 'DATE'
  | 'DATE_RANGE'
  | 'BOOLEAN'
  | 'RADIO'
  | 'CHECKBOX'
  | 'LOCATION';

export interface FilterOption {
  id: string | number;
  name: string;
  label?: string;
  value?: string | number;
  [key: string]: any;
}

export interface FilterFieldConfig<TValue = any> {
  key: string;
  label: string;
  type: FilterFieldType;
  queryKey?: string;
  placeholder?: string;
  icon?: React.ElementType;
  options?: FilterOption[];
  defaultValue?: TValue;
  dependsOn?: string;
  getOptions?: (parentValue: any, allConfig: any) => FilterOption[];
  formatLabel?: (value: TValue, options?: FilterOption[], allConfig?: any) => string;
}

export interface FilterSystemConfig {
  id: string;
  title: string;
  fields: FilterFieldConfig[];
  defaultValues: Record<string, any>;
  ignoredCountKeys?: string[];
  pageKey?: string;
  pageSizeKey?: string;
  primaryFieldKey?: string;
  syncWithUrl?: boolean;
}

export type FilterValues = Record<string, any>;

export interface ActiveFilterTag {
  key: string;
  label: string;
  valueLabel: string;
  rawPayloadValue: any;
}


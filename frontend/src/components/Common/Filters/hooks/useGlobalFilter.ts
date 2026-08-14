import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import type { FilterSystemConfig, FilterValues, ActiveFilterTag } from '../types';

export interface UseGlobalFilterOptions<T extends FilterValues> {
  config: FilterSystemConfig;
  initialAppliedValues?: T;
  allConfig?: any;
  onApply?: (appliedValues: T) => void;
  onReset?: () => void;
  syncWithUrl?: boolean;
}

const getUrlParams = <T extends FilterValues>(config: FilterSystemConfig): Partial<T> => {
  if (typeof window === 'undefined') return {};
  try {
    const searchParams = new URLSearchParams(window.location.search);
    const params: Record<string, any> = {};
    searchParams.forEach((value, key) => {
      if (value !== undefined && value !== null && value !== '') {
        params[key] = value;
      }
    });
    return params as Partial<T>;
  } catch {
    return {};
  }
};

const updateUrlParams = (values: Record<string, any>, ignoredKeys: string[] = ['page', 'pageSize']) => {
  if (typeof window === 'undefined') return;
  try {
    const url = new URL(window.location.href);
    const searchParams = url.searchParams;

    Object.entries(values).forEach(([key, val]) => {
      if (ignoredKeys.includes(key)) return;
      if (val !== undefined && val !== null && val !== '') {
        searchParams.set(key, String(val));
      } else {
        searchParams.delete(key);
      }
    });

    const newUrl = `${url.pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}${url.hash}`;
    window.history.replaceState(null, '', newUrl);
  } catch (e) {
    // Ignore history replace errors
  }
};

export function useGlobalFilter<T extends FilterValues>({
  config,
  initialAppliedValues,
  allConfig,
  onApply,
  onReset,
  syncWithUrl = config.syncWithUrl ?? true,
}: UseGlobalFilterOptions<T>) {
  const isInitialized = useRef(false);

  const defaultValues = useMemo<T>(() => {
    const urlParams = syncWithUrl ? getUrlParams<T>(config) : {};
    return {
      ...config.defaultValues,
      ...initialAppliedValues,
      ...urlParams,
    } as T;
  }, [config, initialAppliedValues, syncWithUrl]);

  const [appliedValues, setAppliedValues] = useState<T>(defaultValues);
  const [draftValues, setDraftValues] = useState<T>(defaultValues);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Synchronize on mount if URL parameters existed
  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true;
      if (syncWithUrl) {
        const urlParams = getUrlParams<T>(config);
        if (Object.keys(urlParams).length > 0) {
          const merged = { ...defaultValues, ...urlParams } as T;
          setAppliedValues(merged);
          setDraftValues(merged);
          onApply?.(merged);
        }
      }
    }
  }, [config, defaultValues, onApply, syncWithUrl]);

  const updateDraftValue = useCallback((key: keyof T, value: any) => {
    setDraftValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const activeFilterCount = useMemo(() => {
    const ignored = config.ignoredCountKeys || ['page', 'pageSize'];
    return Object.keys(appliedValues).filter((key) => {
      if (ignored.includes(key)) return false;
      const val = appliedValues[key];
      return val !== undefined && val !== null && val !== '';
    }).length;
  }, [appliedValues, config.ignoredCountKeys]);

  const activeTags = useMemo<ActiveFilterTag[]>(() => {
    const tags: ActiveFilterTag[] = [];
    const ignored = config.ignoredCountKeys || ['page', 'pageSize'];

    config.fields.forEach((field) => {
      if (ignored.includes(field.key)) return;
      const rawVal = appliedValues[field.key];
      if (rawVal !== undefined && rawVal !== null && rawVal !== '') {
        const options = field.getOptions ? field.getOptions(appliedValues[field.dependsOn || ''], allConfig) : field.options;
        const valLabel = field.formatLabel
          ? field.formatLabel(rawVal, options, allConfig)
          : String(rawVal);

        tags.push({
          key: field.key,
          label: field.label,
          valueLabel: valLabel || String(rawVal),
          rawPayloadValue: rawVal,
        });
      }
    });

    return tags;
  }, [appliedValues, config.fields, config.ignoredCountKeys, allConfig]);

  const handleApply = useCallback(
    (customDraft?: T) => {
      const nextValues = {
        ...(customDraft || draftValues),
        [config.pageKey || 'page']: 1,
      } as T;

      setDraftValues(nextValues);
      setAppliedValues(nextValues);
      if (syncWithUrl) {
        updateUrlParams(nextValues, config.ignoredCountKeys);
      }
      onApply?.(nextValues);
      setDrawerOpen(false);
    },
    [draftValues, config.pageKey, config.ignoredCountKeys, onApply, syncWithUrl]
  );

  const handleFieldChangeImmediate = useCallback(
    (key: keyof T, value: any) => {
      const nextValues = {
        ...appliedValues,
        ...draftValues,
        [key]: value,
        [config.pageKey || 'page']: 1,
      } as T;

      setDraftValues(nextValues);
      setAppliedValues(nextValues);
      if (syncWithUrl) {
        updateUrlParams(nextValues, config.ignoredCountKeys);
      }
      onApply?.(nextValues);
    },
    [appliedValues, draftValues, config.pageKey, config.ignoredCountKeys, onApply, syncWithUrl]
  );

  const handleReset = useCallback(() => {
    const resetValues = {
      ...config.defaultValues,
      [config.pageKey || 'page']: 1,
    } as T;

    setDraftValues(resetValues);
    setAppliedValues(resetValues);
    if (syncWithUrl) {
      updateUrlParams(resetValues, config.ignoredCountKeys);
    }
    onReset?.();
  }, [config.defaultValues, config.pageKey, config.ignoredCountKeys, onReset, syncWithUrl]);

  const handleRemoveTag = useCallback(
    (tagKey: string) => {
      const fieldConfig = config.fields.find((f) => f.key === tagKey);
      const defaultVal = fieldConfig ? fieldConfig.defaultValue ?? '' : '';

      const nextValues = {
        ...appliedValues,
        [tagKey]: defaultVal,
        [config.pageKey || 'page']: 1,
      } as T;

      setDraftValues(nextValues);
      setAppliedValues(nextValues);
      if (syncWithUrl) {
        updateUrlParams(nextValues, config.ignoredCountKeys);
      }
      onApply?.(nextValues);
    },
    [appliedValues, config.fields, config.pageKey, config.ignoredCountKeys, onApply, syncWithUrl]
  );

  return {
    appliedValues,
    draftValues,
    setDraftValues,
    updateDraftValue,
    drawerOpen,
    setDrawerOpen,
    activeFilterCount,
    activeTags,
    handleApply,
    handleFieldChangeImmediate,
    handleReset,
    handleRemoveTag,
  };
}


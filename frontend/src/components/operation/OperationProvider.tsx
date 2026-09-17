'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { OperationPayload } from './types';
import operationService from '@/services/operationService';
import { OperationDetailModal } from './OperationDetailModal';

export interface OperationContextValue {
  operations: Record<string, OperationPayload>;
  activeOperations: OperationPayload[]; // operations where status === 'queued' || status === 'running'
  registerOperation: (id: string, initialData?: OperationPayload) => void;
  dismissOperation: (id: string) => void;
  clearCompletedOperations: () => void;
  openOperationDetail: (id: string) => void;
}

export interface OperationProviderProps {
  children: React.ReactNode;
  initialOperations?: Record<string, OperationPayload>;
}

export const OperationContext = createContext<OperationContextValue | null>(null);

const STORAGE_KEY = 'active_operations_ids';

export const OperationProvider: React.FC<OperationProviderProps> = ({
  children,
  initialOperations = {},
}) => {
  const [operations, setOperations] = useState<Record<string, OperationPayload>>(initialOperations);
  const [activeDetailOperationId, setActiveDetailOperationId] = useState<string | null>(null);
  const operationsRef = useRef(operations);
  operationsRef.current = operations;

  // Active operations: status is 'queued' or 'running'
  const activeOperations = useMemo(() => {
    return Object.values(operations).filter(
      (op) => op.status === 'queued' || op.status === 'running'
    );
  }, [operations]);

  // Initial load from localStorage
  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const loadedOps: Record<string, OperationPayload> = {};
        parsed.forEach((item: unknown) => {
          if (typeof item === 'string') {
            loadedOps[item] = {
              id: item,
              type: 'general',
              title: 'Đang tải tác vụ...',
              status: 'running',
              progress: 0,
              steps: [],
            };
          } else if (item && typeof item === 'object' && 'id' in item) {
            const opItem = item as OperationPayload;
            loadedOps[opItem.id] = opItem;
          }
        });

        if (Object.keys(loadedOps).length > 0) {
          setOperations((prev) => ({ ...loadedOps, ...prev }));

          // Query fresh data from service
          Object.keys(loadedOps).forEach((id) => {
            operationService
              .getOperation(id)
              .then((fresh) => {
                if (fresh) {
                  setOperations((prev) => ({ ...prev, [fresh.id]: fresh }));
                }
              })
              .catch(() => {
                // Ignore initial fetch errors
              });
          });
        }
      }
    } catch {
      // Ignore localStorage parse errors
    }
  }, []);

  // Persist active operation IDs to localStorage whenever operations state updates
  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      const activeIds = Object.values(operations)
        .filter((op) => op.status === 'queued' || op.status === 'running')
        .map((op) => op.id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(activeIds));
    } catch {
      // Ignore storage errors (quota/sandbox)
    }
  }, [operations]);

  // Background polling every 4000ms when there are active operations
  const activeIdsKey = activeOperations
    .map((op) => op.id)
    .sort()
    .join(',');

  useEffect(() => {
    if (!activeIdsKey) return;

    let isMounted = true;
    let timerId: ReturnType<typeof setTimeout> | null = null;

    const poll = async () => {
      const currentOps = operationsRef.current;
      const currentActiveIds = Object.values(currentOps)
        .filter((op) => op.status === 'queued' || op.status === 'running')
        .map((op) => op.id);

      if (currentActiveIds.length === 0) return;

      try {
        // Query getActiveOperations() to discover or bulk-sync active operations
        try {
          const bulkRes = await operationService.getActiveOperations();
          if (isMounted && bulkRes?.results && Array.isArray(bulkRes.results)) {
            setOperations((prev) => {
              const next = { ...prev };
              let updatedAny = false;
              bulkRes.results.forEach((op) => {
                next[op.id] = op;
                updatedAny = true;
              });
              return updatedAny ? next : prev;
            });
          }
        } catch {
          // Ignore bulk endpoint errors and proceed to individual polls
        }

        // Poll individual active operations to catch transitions to 'completed' or 'failed'
        const results = await Promise.allSettled(
          currentActiveIds.map((id) => operationService.getOperation(id))
        );

        if (isMounted) {
          setOperations((prev) => {
            const next = { ...prev };
            let updatedAny = false;
            results.forEach((res) => {
              if (res.status === 'fulfilled' && res.value) {
                next[res.value.id] = res.value;
                updatedAny = true;
              }
            });
            return updatedAny ? next : prev;
          });
        }
      } catch {
        // Ignore background polling errors
      } finally {
        if (isMounted) {
          timerId = setTimeout(poll, 4000);
        }
      }
    };

    timerId = setTimeout(poll, 4000);

    return () => {
      isMounted = false;
      if (timerId) clearTimeout(timerId);
    };
  }, [activeIdsKey]);

  // Register a new operation
  const registerOperation = useCallback((id: string, initialData?: OperationPayload) => {
    setOperations((prev) => {
      const existing = prev[id];
      const newOp: OperationPayload = initialData || existing || {
        id,
        type: 'general',
        title: 'Đang xử lý tác vụ...',
        status: 'queued',
        progress: 0,
        steps: [],
      };
      return {
        ...prev,
        [id]: newOp,
      };
    });

    if (!initialData) {
      operationService
        .getOperation(id)
        .then((fresh) => {
          if (fresh) {
            setOperations((prev) => ({ ...prev, [fresh.id]: fresh }));
          }
        })
        .catch(() => {
          // Ignore fetch error
        });
    }
  }, []);

  // Dismiss an individual operation
  const dismissOperation = useCallback((id: string) => {
    setOperations((prev) => {
      if (!prev[id]) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  // Clear all completed, failed, or cancelled operations
  const clearCompletedOperations = useCallback(() => {
    setOperations((prev) => {
      const next: Record<string, OperationPayload> = {};
      let changed = false;
      Object.entries(prev).forEach(([id, op]) => {
        if (op.status === 'queued' || op.status === 'running') {
          next[id] = op;
        } else {
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, []);

  // Open global operation detail modal
  const openOperationDetail = useCallback((id: string) => {
    setActiveDetailOperationId(id);
  }, []);

  const closeOperationDetail = useCallback(() => {
    setActiveDetailOperationId(null);
  }, []);

  // Cancel operation if user cancels from detail modal
  const handleCancelOperation = useCallback(async () => {
    if (!activeDetailOperationId) return;
    try {
      const res = await operationService.cancelOperation(activeDetailOperationId);
      if (res?.operation) {
        setOperations((prev) => ({ ...prev, [res.operation.id]: res.operation }));
      }
    } catch {
      // Ignore
    }
  }, [activeDetailOperationId]);

  // Maintain last viewed operation object so modal doesn't flash empty during exit transition
  const activeDetailOperation = activeDetailOperationId
    ? operations[activeDetailOperationId] ?? null
    : null;
  const lastViewedOpRef = useRef<OperationPayload | null>(null);
  if (activeDetailOperation) {
    lastViewedOpRef.current = activeDetailOperation;
  }
  const modalOperation = activeDetailOperation || lastViewedOpRef.current;

  const contextValue = useMemo<OperationContextValue>(
    () => ({
      operations,
      activeOperations,
      registerOperation,
      dismissOperation,
      clearCompletedOperations,
      openOperationDetail,
    }),
    [
      operations,
      activeOperations,
      registerOperation,
      dismissOperation,
      clearCompletedOperations,
      openOperationDetail,
    ]
  );

  return (
    <OperationContext.Provider value={contextValue}>
      {children}
      <OperationDetailModal
        open={Boolean(activeDetailOperationId)}
        onClose={closeOperationDetail}
        operation={modalOperation}
        onCancel={
          modalOperation &&
          (modalOperation.status === 'running' || modalOperation.status === 'queued')
            ? handleCancelOperation
            : undefined
        }
      />
    </OperationContext.Provider>
  );
};

export const useOperationContext = (): OperationContextValue => {
  const context = useContext(OperationContext);
  if (!context) {
    throw new Error('useOperationContext must be used within an OperationProvider');
  }
  return context;
};

export default OperationProvider;

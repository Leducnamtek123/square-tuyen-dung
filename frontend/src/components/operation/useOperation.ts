import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
  OperationPayload,
  OperationStep,
  UseOperationOptions,
} from './types';
import operationService, {
  type CancelOperationResponse,
} from '@/services/operationService';

export interface UseOperationReturn {
  operation: OperationPayload | null;
  isLoading: boolean;
  error: Error | null;
  isRunning: boolean;
  isCompleted: boolean;
  isFailed: boolean;
  isCancelled: boolean;
  currentStep: OperationStep | null;
  refetch: () => Promise<OperationPayload | null>;
  cancel: () => Promise<CancelOperationResponse | null>;
  setOperation: React.Dispatch<React.SetStateAction<OperationPayload | null>>;
}

const toError = (err: unknown): Error => {
  if (err instanceof Error) return err;
  if (typeof err === 'object' && err !== null && 'message' in err && typeof (err as Record<string, unknown>).message === 'string') {
    return new Error((err as Record<string, unknown>).message as string);
  }
  return new Error(String(err));
};

export function useOperation(options: UseOperationOptions = {}): UseOperationReturn {
  const {
    operationId,
    initialData = null,
    pollingInterval = 2000,
    enabled,
    onCompleted,
    onError,
  } = options;

  const isEnabled = enabled ?? Boolean(operationId);

  const [operation, setOperation] = useState<OperationPayload | null>(initialData || null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Computed status flags
  const isRunning = operation?.status === 'running' || operation?.status === 'queued';
  const isCompleted = operation?.status === 'completed';
  const isFailed = operation?.status === 'failed';
  const isCancelled = operation?.status === 'cancelled';

  // Computed current step
  const currentStep = useMemo<OperationStep | null>(() => {
    if (!operation?.steps || operation.steps.length === 0) {
      return null;
    }
    if (operation.currentStepKey) {
      const step = operation.steps.find((s) => s.key === operation.currentStepKey);
      if (step) return step;
    }
    return operation.steps.find((s) => s.status === 'running') ?? null;
  }, [operation?.steps, operation?.currentStepKey]);

  // Keep callback refs fresh
  const onCompletedRef = useRef(onCompleted);
  onCompletedRef.current = onCompleted;

  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  // Track terminal callback notifications to prevent redundant invocations
  const notifiedTerminalRef = useRef<{ id: string; status: string } | null>(null);

  // Reset state and notified terminal flag when operationId changes
  useEffect(() => {
    setOperation(initialData || null);
    setError(null);
    notifiedTerminalRef.current = null;
  }, [operationId]);

  useEffect(() => {
    if (!operation) return;

    const currentNotified = notifiedTerminalRef.current;
    if (currentNotified?.id === operation.id && currentNotified?.status === operation.status) {
      return;
    }

    if (operation.status === 'completed') {
      notifiedTerminalRef.current = { id: operation.id, status: 'completed' };
      onCompletedRef.current?.(operation.result ?? null, operation);
    } else if (operation.status === 'failed') {
      notifiedTerminalRef.current = { id: operation.id, status: 'failed' };
      onErrorRef.current?.(operation.error ?? null, operation);
    }
  }, [operation]);

  // Initial immediate fetch
  useEffect(() => {
    if (!isEnabled || !operationId) {
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    operationService
      .getOperation(operationId)
      .then((data) => {
        if (isMounted) {
          setOperation(data);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          setError(toError(err));
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isEnabled, operationId]);

  // Auto-polling when isRunning (chained setTimeout to eliminate request overlap)
  useEffect(() => {
    if (!isEnabled || !operationId || !isRunning) {
      return;
    }

    let isMounted = true;
    let timerId: ReturnType<typeof setTimeout> | null = null;

    const poll = async () => {
      try {
        const data = await operationService.getOperation(operationId);
        if (isMounted) {
          setOperation(data);
          setError(null);
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError(toError(err));
        }
      } finally {
        if (isMounted) {
          timerId = setTimeout(poll, pollingInterval);
        }
      }
    };

    timerId = setTimeout(poll, pollingInterval);

    return () => {
      isMounted = false;
      if (timerId) {
        clearTimeout(timerId);
      }
    };
  }, [isEnabled, operationId, isRunning, pollingInterval]);

  // Actions
  const refetch = useCallback(async (): Promise<OperationPayload | null> => {
    if (!operationId) return null;
    setIsLoading(true);
    try {
      const data = await operationService.getOperation(operationId);
      setOperation(data);
      setError(null);
      return data;
    } catch (err: unknown) {
      setError(toError(err));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [operationId]);

  const cancel = useCallback(async (): Promise<CancelOperationResponse | null> => {
    if (!operationId) return null;
    try {
      const res = await operationService.cancelOperation(operationId);
      if (res?.operation) {
        setOperation(res.operation);
      } else {
        setOperation((prev) => (prev ? { ...prev, status: 'cancelled' } : null));
      }
      return res;
    } catch (err: unknown) {
      setError(toError(err));
      throw err;
    }
  }, [operationId]);

  return {
    operation,
    isLoading,
    error,
    isRunning,
    isCompleted,
    isFailed,
    isCancelled,
    currentStep,
    refetch,
    cancel,
    setOperation,
  };
}

export default useOperation;

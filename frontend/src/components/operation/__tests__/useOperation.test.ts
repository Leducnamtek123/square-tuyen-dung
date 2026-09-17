/**
 * @jest-environment jsdom
 */
import { act } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { useOperation } from '../useOperation';
import operationService from '@/services/operationService';
import type { OperationPayload } from '../types';

jest.mock('@/services/operationService', () => ({
  __esModule: true,
  default: {
    getOperation: jest.fn(),
    getActiveOperations: jest.fn(),
    cancelOperation: jest.fn(),
  },
  operationService: {
    getOperation: jest.fn(),
    getActiveOperations: jest.fn(),
    cancelOperation: jest.fn(),
  },
}));

describe('useOperation hook', () => {
  const mockQueuedOp: OperationPayload = {
    id: 'op_100',
    type: 'candidate.ai_scan',
    title: 'AI Resume Scan',
    status: 'queued',
    progress: 0,
    currentStepKey: 'extract',
    steps: [
      { key: 'extract', label: 'Extracting text', status: 'running', progress: 50 },
      { key: 'analyze', label: 'Analyzing skills', status: 'pending', progress: 0 },
    ],
  };

  const mockRunningOp: OperationPayload = {
    id: 'op_100',
    type: 'candidate.ai_scan',
    title: 'AI Resume Scan',
    status: 'running',
    progress: 50,
    currentStepKey: 'extract',
    steps: [
      { key: 'extract', label: 'Extracting text', status: 'running', progress: 50 },
      { key: 'analyze', label: 'Analyzing skills', status: 'pending', progress: 0 },
    ],
  };

  const mockCompletedOp: OperationPayload = {
    id: 'op_100',
    type: 'candidate.ai_scan',
    title: 'AI Resume Scan',
    status: 'completed',
    progress: 100,
    currentStepKey: 'analyze',
    steps: [
      { key: 'extract', label: 'Extracting text', status: 'completed', progress: 100 },
      { key: 'analyze', label: 'Analyzing skills', status: 'completed', progress: 100 },
    ],
    result: { matchScore: 92 },
  };

  const mockFailedOp: OperationPayload = {
    id: 'op_100',
    type: 'candidate.ai_scan',
    title: 'AI Resume Scan',
    status: 'failed',
    progress: 40,
    currentStepKey: 'extract',
    steps: [
      { key: 'extract', label: 'Extracting text', status: 'failed', errorMessage: 'Corrupt PDF' },
    ],
    error: { message: 'Failed to parse file', code: 'PARSE_ERROR' },
  };

  const mockCancelledOp: OperationPayload = {
    id: 'op_100',
    type: 'candidate.ai_scan',
    title: 'AI Resume Scan',
    status: 'cancelled',
    progress: 50,
    currentStepKey: 'extract',
    steps: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads operation on mount and updates state correctly', async () => {
    (operationService.getOperation as jest.Mock).mockResolvedValueOnce(mockCompletedOp);

    const { result } = renderHook(() => useOperation({ operationId: 'op_100' }));

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.operation?.id).toBe('op_100');
    expect(result.current.operation?.progress).toBe(100);
    expect(result.current.isCompleted).toBe(true);
    expect(result.current.isRunning).toBe(false);
    expect(result.current.isFailed).toBe(false);
    expect(result.current.isCancelled).toBe(false);
  });

  it('computes status flags correctly for running and queued operations', async () => {
    (operationService.getOperation as jest.Mock).mockResolvedValueOnce(mockQueuedOp);

    const { result } = renderHook(() =>
      useOperation({ operationId: 'op_100', pollingInterval: 60000 })
    );

    await waitFor(() => {
      expect(result.current.operation?.status).toBe('queued');
    });

    expect(result.current.isRunning).toBe(true);
    expect(result.current.isCompleted).toBe(false);
    expect(result.current.isFailed).toBe(false);
    expect(result.current.isCancelled).toBe(false);
  });

  it('computes currentStep by currentStepKey or fallback to running step', async () => {
    (operationService.getOperation as jest.Mock).mockResolvedValueOnce(mockQueuedOp);

    const { result } = renderHook(() =>
      useOperation({ operationId: 'op_100', pollingInterval: 60000 })
    );

    await waitFor(() => {
      expect(result.current.currentStep).not.toBeNull();
    });

    expect(result.current.currentStep?.key).toBe('extract');
  });

  it('triggers onCompleted when operation finishes', async () => {
    const onCompleted = jest.fn();
    (operationService.getOperation as jest.Mock).mockResolvedValueOnce(mockCompletedOp);

    const { result } = renderHook(() =>
      useOperation({
        operationId: 'op_100',
        onCompleted,
      })
    );

    await waitFor(() => {
      expect(result.current.isCompleted).toBe(true);
    });

    expect(onCompleted).toHaveBeenCalledTimes(1);
    expect(onCompleted).toHaveBeenCalledWith({ matchScore: 92 }, mockCompletedOp);
  });

  it('triggers onError when operation fails', async () => {
    const onError = jest.fn();
    (operationService.getOperation as jest.Mock).mockResolvedValueOnce(mockFailedOp);

    const { result } = renderHook(() =>
      useOperation({
        operationId: 'op_100',
        onError,
      })
    );

    await waitFor(() => {
      expect(result.current.isFailed).toBe(true);
    });

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(
      { message: 'Failed to parse file', code: 'PARSE_ERROR' },
      mockFailedOp
    );
  });

  it('handles cancel action and updates operation status', async () => {
    (operationService.getOperation as jest.Mock).mockResolvedValueOnce(mockQueuedOp);
    (operationService.cancelOperation as jest.Mock).mockResolvedValueOnce({
      success: true,
      operation: mockCancelledOp,
    });

    const { result } = renderHook(() =>
      useOperation({ operationId: 'op_100', pollingInterval: 60000 })
    );

    await waitFor(() => {
      expect(result.current.isRunning).toBe(true);
    });

    await act(async () => {
      await result.current.cancel();
    });

    expect(operationService.cancelOperation).toHaveBeenCalledWith('op_100');
    expect(result.current.isCancelled).toBe(true);
    expect(result.current.isRunning).toBe(false);
  });

  it('supports manual refetch and setOperation', async () => {
    (operationService.getOperation as jest.Mock)
      .mockResolvedValueOnce(mockQueuedOp)
      .mockResolvedValueOnce(mockCompletedOp);

    const { result } = renderHook(() =>
      useOperation({ operationId: 'op_100', pollingInterval: 60000 })
    );

    await waitFor(() => {
      expect(result.current.operation?.status).toBe('queued');
    });

    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.isCompleted).toBe(true);

    act(() => {
      result.current.setOperation(mockCancelledOp);
    });

    expect(result.current.isCancelled).toBe(true);
  });

  it('uses initialData immediately before fetching', () => {
    (operationService.getOperation as jest.Mock).mockImplementation(
      () => new Promise(() => {}) // pending promise
    );

    const { result } = renderHook(() =>
      useOperation({
        operationId: 'op_100',
        initialData: mockQueuedOp,
      })
    );

    expect(result.current.operation).toEqual(mockQueuedOp);
    expect(result.current.isRunning).toBe(true);
  });

  it('does not fetch if enabled is false or operationId is missing', () => {
    const { result } = renderHook(() =>
      useOperation({
        operationId: null,
      })
    );

    expect(operationService.getOperation).not.toHaveBeenCalled();
    expect(result.current.operation).toBeNull();
  });

  it('auto-polls while running and stops when completed', async () => {
    (operationService.getOperation as jest.Mock)
      .mockResolvedValueOnce(mockRunningOp)
      .mockResolvedValueOnce(mockCompletedOp);

    const { result } = renderHook(() =>
      useOperation({
        operationId: 'op_100',
        pollingInterval: 50,
      })
    );

    await waitFor(() => {
      expect(result.current.operation?.status).toBe('running');
    });

    await waitFor(() => {
      expect(result.current.operation?.status).toBe('completed');
    });

    expect(operationService.getOperation).toHaveBeenCalledTimes(2);
  });

  it('resets state when operationId changes', async () => {
    const mockOp200: OperationPayload = {
      id: 'op_200',
      type: 'exchange.import',
      title: 'Import',
      status: 'running',
      progress: 10,
      steps: [],
    };

    (operationService.getOperation as jest.Mock)
      .mockResolvedValueOnce(mockCompletedOp)
      .mockResolvedValueOnce(mockOp200);

    let currentId: string = 'op_100';
    const { result, rerender } = renderHook(() =>
      useOperation({ operationId: currentId, pollingInterval: 60000 })
    );

    await waitFor(() => {
      expect(result.current.isCompleted).toBe(true);
    });

    currentId = 'op_200';
    rerender();

    // After switching ID, previous completed status is immediately cleared
    expect(result.current.isCompleted).toBe(false);

    await waitFor(() => {
      expect(result.current.operation?.id).toBe('op_200');
    });
    expect(result.current.isRunning).toBe(true);
  });
});

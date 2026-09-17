/**
 * @jest-environment jsdom
 */
import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { OperationCenterDock } from '../OperationCenterDock';
import { OperationProvider, useOperationContext } from '../OperationProvider';
import type { OperationPayload } from '../types';
import operationService from '@/services/operationService';

// Mock operationService
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

describe('OperationCenterDock & OperationProvider', () => {
  const mockRunningOp: OperationPayload = {
    id: 'op_running_1',
    type: 'candidate.ai_scan',
    title: 'AI Resume Scan & Skill Matching',
    status: 'running',
    progress: 64,
    currentStepKey: 'extract_skills',
    steps: [
      {
        key: 'upload_parse',
        label: 'Tải và phân tích CV',
        status: 'completed',
        progress: 100,
      },
      {
        key: 'extract_skills',
        label: 'Trích xuất kỹ năng chuyên môn',
        status: 'running',
        progress: 45,
      },
    ],
    createdAt: '2026-09-17T10:00:00Z',
    updatedAt: '2026-09-17T10:00:10Z',
  };

  const mockQueuedOp: OperationPayload = {
    id: 'op_queued_2',
    type: 'export.pdf',
    title: 'Xuất file PDF báo cáo',
    status: 'queued',
    progress: 0,
    steps: [],
  };

  const mockCompletedOp: OperationPayload = {
    id: 'op_completed_3',
    type: 'candidate.bulk_export',
    title: 'Xuất danh sách ứng viên',
    status: 'completed',
    progress: 100,
    steps: [
      {
        key: 'fetch_data',
        label: 'Thu thập dữ liệu',
        status: 'completed',
        progress: 100,
      },
    ],
  };

  const mockFailedOp: OperationPayload = {
    id: 'op_failed_4',
    type: 'sync.data',
    title: 'Đồng bộ hóa dữ liệu HR',
    status: 'failed',
    progress: 30,
    error: {
      message: 'Mất kết nối máy chủ dữ liệu',
    },
    steps: [
      {
        key: 'sync_step',
        label: 'Đồng bộ dữ liệu',
        status: 'failed',
        errorMessage: 'Lỗi timeout kết nối',
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    (operationService.getActiveOperations as jest.Mock).mockResolvedValue({
      results: [],
    });
    (operationService.getOperation as jest.Mock).mockResolvedValue(mockRunningOp);
  });

  describe('OperationCenterDock UI Component', () => {
    it('is hidden when there are no active operations', () => {
      const { container } = render(
        <OperationCenterDock
          operations={{}}
          activeOperations={[]}
        />
      );
      expect(container.firstChild).toBeNull();
    });

    it('renders collapsed pill with active count', () => {
      render(
        <OperationCenterDock
          operations={{ [mockRunningOp.id]: mockRunningOp }}
          activeOperations={[mockRunningOp]}
        />
      );

      // Should display collapsed badge text indicating active running operations
      expect(screen.getByText(/1 tác vụ đang/i)).toBeInTheDocument();
      // Should have expand trigger button
      expect(screen.getByRole('button', { name: /trung tâm tác vụ|mở trung tâm/i })).toBeInTheDocument();
    });

    it('toggles between collapsed and expanded modes when clicked', () => {
      render(
        <OperationCenterDock
          operations={{
            [mockRunningOp.id]: mockRunningOp,
            [mockQueuedOp.id]: mockQueuedOp,
          }}
          activeOperations={[mockRunningOp, mockQueuedOp]}
        />
      );

      // Initially collapsed
      expect(screen.getByText(/2 tác vụ đang/i)).toBeInTheDocument();
      expect(screen.queryByText(/Trung tâm tác vụ \(Operation Center\)/i)).not.toBeInTheDocument();

      // Click to expand
      const expandBtn = screen.getByRole('button', { name: /trung tâm tác vụ|mở trung tâm/i });
      fireEvent.click(expandBtn);

      // Now expanded
      expect(screen.getByText(/Trung tâm tác vụ/i)).toBeInTheDocument();
      expect(screen.getByText('AI Resume Scan & Skill Matching')).toBeInTheDocument();
      expect(screen.getByText('Xuất file PDF báo cáo')).toBeInTheDocument();

      // Click minimize/thu gọn button
      const minimizeBtn = screen.getByRole('button', { name: /thu gọn|minimize/i });
      fireEvent.click(minimizeBtn);

      // Should be collapsed again
      expect(screen.queryByText(/Trung tâm tác vụ \(Operation Center\)/i)).not.toBeInTheDocument();
      expect(screen.getByText(/2 tác vụ đang/i)).toBeInTheDocument();
    });

    it('renders operation items with title, progress, step label, and action buttons', () => {
      const handleOpenDetail = jest.fn();
      render(
        <OperationCenterDock
          operations={{ [mockRunningOp.id]: mockRunningOp }}
          activeOperations={[mockRunningOp]}
          defaultExpanded={true}
          onOpenDetail={handleOpenDetail}
        />
      );

      expect(screen.getByText('AI Resume Scan & Skill Matching')).toBeInTheDocument();
      expect(screen.getByText(/Trích xuất kỹ năng chuyên môn/i)).toBeInTheDocument();
      expect(screen.getByText('64%')).toBeInTheDocument();

      // Click detail button
      const detailBtn = screen.getByRole('button', { name: /chi tiết/i });
      fireEvent.click(detailBtn);
      expect(handleOpenDetail).toHaveBeenCalledWith('op_running_1');
    });

    it('renders dismiss button for completed and failed operations and triggers onDismiss', () => {
      const handleDismiss = jest.fn();
      render(
        <OperationCenterDock
          operations={{
            [mockRunningOp.id]: mockRunningOp,
            [mockCompletedOp.id]: mockCompletedOp,
            [mockFailedOp.id]: mockFailedOp,
          }}
          activeOperations={[mockRunningOp]}
          defaultExpanded={true}
          onDismissOperation={handleDismiss}
        />
      );

      // Completed and Failed operations should have dismiss (X) buttons
      const dismissButtons = screen.getAllByRole('button', { name: /xóa|bỏ qua|dismiss/i });
      expect(dismissButtons.length).toBeGreaterThanOrEqual(2);

      fireEvent.click(dismissButtons[0]);
      expect(handleDismiss).toHaveBeenCalled();
    });

    it('supports clear completed button in header', () => {
      const handleClearCompleted = jest.fn();
      render(
        <OperationCenterDock
          operations={{
            [mockRunningOp.id]: mockRunningOp,
            [mockCompletedOp.id]: mockCompletedOp,
          }}
          activeOperations={[mockRunningOp]}
          defaultExpanded={true}
          onClearCompleted={handleClearCompleted}
        />
      );

      const clearBtn = screen.getByRole('button', { name: /xóa đã xong|dọn dẹp|xóa hoàn tất/i });
      fireEvent.click(clearBtn);
      expect(handleClearCompleted).toHaveBeenCalledTimes(1);
    });
  });

  describe('OperationProvider & Context Integration', () => {
    // Helper testing component to consume context
    const TestConsumer: React.FC = () => {
      const {
        operations,
        activeOperations,
        registerOperation,
        dismissOperation,
        clearCompletedOperations,
        openOperationDetail,
      } = useOperationContext();

      return (
        <div>
          <div data-testid="active-count">{activeOperations.length}</div>
          <div data-testid="total-count">{Object.keys(operations).length}</div>
          <button
            data-testid="register-btn"
            onClick={() => registerOperation(mockRunningOp.id, mockRunningOp)}
          >
            Register Running
          </button>
          <button
            data-testid="register-completed-btn"
            onClick={() => registerOperation(mockCompletedOp.id, mockCompletedOp)}
          >
            Register Completed
          </button>
          <button
            data-testid="dismiss-btn"
            onClick={() => dismissOperation(mockCompletedOp.id)}
          >
            Dismiss Completed
          </button>
          <button
            data-testid="clear-completed-btn"
            onClick={() => clearCompletedOperations()}
          >
            Clear Completed
          </button>
          <button
            data-testid="open-detail-btn"
            onClick={() => openOperationDetail(mockRunningOp.id)}
          >
            Open Detail
          </button>
          <OperationCenterDock />
        </div>
      );
    };

    it('provides initial empty state and updates state when operations are registered', () => {
      render(
        <OperationProvider>
          <TestConsumer />
        </OperationProvider>
      );

      expect(screen.getByTestId('active-count')).toHaveTextContent('0');
      expect(screen.getByTestId('total-count')).toHaveTextContent('0');

      // Register running operation
      fireEvent.click(screen.getByTestId('register-btn'));

      expect(screen.getByTestId('active-count')).toHaveTextContent('1');
      expect(screen.getByTestId('total-count')).toHaveTextContent('1');

      // Floating dock should appear with pill
      expect(screen.getByText(/1 tác vụ đang/i)).toBeInTheDocument();
    });

    it('persists active operations to localStorage', async () => {
      render(
        <OperationProvider>
          <TestConsumer />
        </OperationProvider>
      );

      fireEvent.click(screen.getByTestId('register-btn'));

      await waitFor(() => {
        const stored = localStorage.getItem('active_operations_ids');
        expect(stored).toBeTruthy();
        expect(stored).toContain('op_running_1');
      });
    });

    it('loads persisted operations from localStorage on initial mount', async () => {
      localStorage.setItem('active_operations_ids', JSON.stringify(['op_running_1']));
      (operationService.getOperation as jest.Mock).mockResolvedValue(mockRunningOp);

      render(
        <OperationProvider>
          <TestConsumer />
        </OperationProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('active-count')).toHaveTextContent('1');
      });
    });

    it('dismisses an individual operation', () => {
      render(
        <OperationProvider>
          <TestConsumer />
        </OperationProvider>
      );

      fireEvent.click(screen.getByTestId('register-completed-btn'));
      expect(screen.getByTestId('total-count')).toHaveTextContent('1');

      fireEvent.click(screen.getByTestId('dismiss-btn'));
      expect(screen.getByTestId('total-count')).toHaveTextContent('0');
    });

    it('clears completed operations while preserving active operations', () => {
      render(
        <OperationProvider>
          <TestConsumer />
        </OperationProvider>
      );

      fireEvent.click(screen.getByTestId('register-btn')); // active
      fireEvent.click(screen.getByTestId('register-completed-btn')); // completed

      expect(screen.getByTestId('total-count')).toHaveTextContent('2');
      expect(screen.getByTestId('active-count')).toHaveTextContent('1');

      fireEvent.click(screen.getByTestId('clear-completed-btn'));

      expect(screen.getByTestId('total-count')).toHaveTextContent('1');
      expect(screen.getByTestId('active-count')).toHaveTextContent('1');
    });

    it('opens global OperationDetailModal when openOperationDetail is invoked', async () => {
      render(
        <OperationProvider>
          <TestConsumer />
        </OperationProvider>
      );

      fireEvent.click(screen.getByTestId('register-btn'));
      fireEvent.click(screen.getByTestId('open-detail-btn'));

      // OperationDetailModal should open globally
      await waitFor(() => {
        expect(screen.getAllByText('AI Resume Scan & Skill Matching').length).toBeGreaterThanOrEqual(1);
        expect(screen.getByText('candidate.ai_scan')).toBeInTheDocument();
      });
    });
  });
});

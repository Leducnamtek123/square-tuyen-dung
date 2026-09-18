/**
 * @jest-environment jsdom
 */
import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { OperationProgress } from '../OperationProgress';
import { OperationTimeline } from '../OperationTimeline';
import { OperationDetailModal } from '../OperationDetailModal';
import type { OperationPayload } from '../types';

describe('Universal Operation Activity Components', () => {
  const mockRunningOperation: OperationPayload = {
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
        detail: 'Đã hoàn tất đọc 5/5 trang',
        resultSummary: '1,420 từ trích xuất',
        startedAt: '2026-09-17T10:00:00Z',
        completedAt: '2026-09-17T10:00:05Z',
      },
      {
        key: 'extract_skills',
        label: 'Trích xuất kỹ năng chuyên môn',
        status: 'running',
        progress: 45,
        detail: 'Đang trích xuất 45/100 kỹ năng...',
        startedAt: '2026-09-17T10:00:05Z',
      },
      {
        key: 'match_job',
        label: 'So khớp yêu cầu công việc',
        status: 'pending',
        progress: 0,
      },
    ],
    metadata: {
      initiator: 'HR Admin (nam@square.vn)',
    },
    createdAt: '2026-09-17T10:00:00Z',
    updatedAt: '2026-09-17T10:00:10Z',
  };

  const mockCompletedOperation: OperationPayload = {
    id: 'op_completed_1',
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
        resultSummary: 'Đã xuất 150 ứng viên',
      },
    ],
    result: {
      downloadUrl: 'https://cdn.example.com/exports/candidates.xlsx',
      totalCount: 150,
    },
    createdAt: '2026-09-17T09:00:00Z',
    finishedAt: '2026-09-17T09:01:20Z',
  };

  const mockFailedOperation: OperationPayload = {
    id: 'op_failed_1',
    type: 'ai.matching',
    title: 'Tính toán điểm tương đồng AI',
    status: 'failed',
    progress: 30,
    currentStepKey: 'vector_search',
    steps: [
      {
        key: 'preprocess',
        label: 'Tiền xử lý hồ sơ',
        status: 'completed',
        progress: 100,
      },
      {
        key: 'vector_search',
        label: 'Truy vấn vector tương đồng',
        status: 'failed',
        progress: 30,
        errorMessage: 'Lỗi kết nối máy chủ AI Vector DB',
      },
    ],
    error: {
      code: 'AI_SERVICE_UNAVAILABLE',
      message: 'Không thể kết nối đến dịch vụ AI embedding',
      detail: 'Timeout after 30000ms connecting to vector cluster',
    },
    createdAt: '2026-09-17T08:00:00Z',
  };

  describe('OperationProgress (Level 1: Inline Component)', () => {
    it('handles null/undefined operation gracefully', () => {
      const { container } = render(<OperationProgress operation={null} />);
      expect(container.firstChild).toBeNull();
    });

    it('renders running state with title, running step label, percentage, and triggers onOpenDetail', () => {
      const handleOpenDetail = jest.fn();
      render(
        <OperationProgress
          operation={mockRunningOperation}
          onOpenDetail={handleOpenDetail}
        />
      );

      expect(screen.getByText('AI Resume Scan & Skill Matching')).toBeInTheDocument();
      expect(screen.getByText(/Trích xuất kỹ năng chuyên môn/i)).toBeInTheDocument();
      expect(screen.getByText('64%')).toBeInTheDocument();

      const detailBtn = screen.getByRole('button', { name: /xem chi tiết/i });
      expect(detailBtn).toBeInTheDocument();
      fireEvent.click(detailBtn);
      expect(handleOpenDetail).toHaveBeenCalledTimes(1);
    });

    it('renders completed state with green checkmark and complete label', () => {
      render(<OperationProgress operation={mockCompletedOperation} />);

      expect(screen.getByText('Xuất danh sách ứng viên')).toBeInTheDocument();
      expect(screen.getByText(/Hoàn tất/i)).toBeInTheDocument();
    });

    it('renders failed state with error representation', () => {
      render(<OperationProgress operation={mockFailedOperation} />);

      expect(screen.getByText('Tính toán điểm tương đồng AI')).toBeInTheDocument();
      expect(screen.getByText('30%')).toBeInTheDocument();
    });

    it('hides percentage or current step when props are false', () => {
      render(
        <OperationProgress
          operation={mockRunningOperation}
          showPercentage={false}
          showCurrentStep={false}
        />
      );

      expect(screen.queryByText('64%')).not.toBeInTheDocument();
      expect(screen.queryByText(/Trích xuất kỹ năng chuyên môn/i)).not.toBeInTheDocument();
    });

    it('supports size="sm" styling without crashing', () => {
      const { container } = render(
        <OperationProgress operation={mockRunningOperation} size="sm" />
      );
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('OperationTimeline (Level 2: Vertical Stepper / Expandable Card)', () => {
    it('handles null/undefined operation gracefully', () => {
      const { container } = render(<OperationTimeline operation={null} />);
      expect(container.firstChild).toBeNull();
    });

    it('renders all steps, completed checkmarks, running indicator, and step details', () => {
      render(<OperationTimeline operation={mockRunningOperation} />);

      expect(screen.getByText('AI Resume Scan & Skill Matching')).toBeInTheDocument();
      expect(screen.getByText('Tải và phân tích CV')).toBeInTheDocument();
      expect(screen.getByText('Đã hoàn tất đọc 5/5 trang')).toBeInTheDocument();
      expect(screen.getByText('1,420 từ trích xuất')).toBeInTheDocument();

      expect(screen.getByText('Trích xuất kỹ năng chuyên môn')).toBeInTheDocument();
      expect(screen.getByText('Đang trích xuất 45/100 kỹ năng...')).toBeInTheDocument();

      expect(screen.getByText('So khớp yêu cầu công việc')).toBeInTheDocument();
    });

    it('renders failed step with errorMessage and triggers onRetryStep when clicked', () => {
      const handleRetryStep = jest.fn();
      render(
        <OperationTimeline
          operation={mockFailedOperation}
          onRetryStep={handleRetryStep}
        />
      );

      expect(screen.getByText('Lỗi kết nối máy chủ AI Vector DB')).toBeInTheDocument();
      const retryBtn = screen.getByRole('button', { name: /thử lại/i });
      expect(retryBtn).toBeInTheDocument();

      fireEvent.click(retryBtn);
      expect(handleRetryStep).toHaveBeenCalledWith('vector_search');
    });

    it('supports expandable card behavior with toggle', () => {
      render(
        <OperationTimeline
          operation={mockRunningOperation}
          expandable={true}
          defaultExpanded={true}
        />
      );

      expect(screen.getByText('Tải và phân tích CV')).toBeInTheDocument();
    });

    it('triggers onOpenDetail when provided and clicked', () => {
      const handleOpenDetail = jest.fn();
      render(
        <OperationTimeline
          operation={mockRunningOperation}
          onOpenDetail={handleOpenDetail}
        />
      );

      const detailBtn = screen.getByRole('button', { name: /xem chi tiết/i });
      fireEvent.click(detailBtn);
      expect(handleOpenDetail).toHaveBeenCalledTimes(1);
    });
  });

  describe('OperationDetailModal (Level 3: Full Detail Dialog)', () => {
    it('does not render dialog content when open is false', () => {
      render(
        <OperationDetailModal
          open={false}
          onClose={jest.fn()}
          operation={mockRunningOperation}
        />
      );

      expect(screen.queryByText('Chi tiết tác vụ')).not.toBeInTheDocument();
    });

    it('renders modal with title, operation type, status, and closes when close button is clicked', () => {
      const handleClose = jest.fn();
      render(
        <OperationDetailModal
          open={true}
          onClose={handleClose}
          operation={mockRunningOperation}
        />
      );

      expect(screen.getAllByText('AI Resume Scan & Skill Matching').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('candidate.ai_scan')).toBeInTheDocument();
      expect(screen.getByText(/HR Admin/i)).toBeInTheDocument();

      const closeButtons = screen.getAllByRole('button', { name: /đóng|close/i });
      fireEvent.click(closeButtons[0]);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('renders cancel button for running operation and triggers onCancel', () => {
      const handleCancel = jest.fn();
      render(
        <OperationDetailModal
          open={true}
          onClose={jest.fn()}
          operation={mockRunningOperation}
          onCancel={handleCancel}
        />
      );

      const cancelBtn = screen.getByRole('button', { name: /hủy tác vụ|đang hủy/i });
      expect(cancelBtn).toBeInTheDocument();
      expect(cancelBtn).not.toBeDisabled();

      fireEvent.click(cancelBtn);
      expect(handleCancel).toHaveBeenCalledTimes(1);
    });

    it('disables cancel button when isCancelling is true', () => {
      render(
        <OperationDetailModal
          open={true}
          onClose={jest.fn()}
          operation={mockRunningOperation}
          onCancel={jest.fn()}
          isCancelling={true}
        />
      );

      const cancelBtn = screen.getByRole('button', { name: /hủy tác vụ|đang hủy/i });
      expect(cancelBtn).toBeDisabled();
    });

    it('renders error alert and retry button for failed operation', () => {
      const handleRetry = jest.fn();
      render(
        <OperationDetailModal
          open={true}
          onClose={jest.fn()}
          operation={mockFailedOperation}
          onRetry={handleRetry}
        />
      );

      expect(screen.getByText(/AI_SERVICE_UNAVAILABLE/i)).toBeInTheDocument();
      expect(screen.getByText(/Không thể kết nối đến dịch vụ AI embedding/i)).toBeInTheDocument();

      const retryBtn = screen.getByRole('button', { name: /thử lại/i });
      fireEvent.click(retryBtn);
      expect(handleRetry).toHaveBeenCalledTimes(1);
    });

    it('renders result payload data when operation completed', () => {
      render(
        <OperationDetailModal
          open={true}
          onClose={jest.fn()}
          operation={mockCompletedOperation}
        />
      );

      expect(screen.getByText(/https:\/\/cdn.example.com\/exports\/candidates.xlsx/i)).toBeInTheDocument();
      expect(screen.getAllByText(/150/i).length).toBeGreaterThanOrEqual(1);
    });
  });
});

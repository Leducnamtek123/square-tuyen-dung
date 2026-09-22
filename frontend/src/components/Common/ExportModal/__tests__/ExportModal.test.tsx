/**
 * @jest-environment jsdom
 */
import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ExportModal } from '../ExportModal';
import type { ExportColumn, ExportScope } from '../types';

// Mock xlsxUtils
jest.mock('@/utils/xlsxUtils', () => ({
  generateBlob: jest.fn(() => new Blob(['mock data'], { type: 'text/csv' })),
  triggerDownload: jest.fn(),
  exportToXLSX: jest.fn(),
}));

const mockColumns: ExportColumn[] = [
  { id: 'title', label: 'Tiêu đề', checked: true },
  { id: 'createdDate', label: 'Ngày tạo', checked: true },
  { id: 'status', label: 'Trạng thái', checked: false },
];

const mockFetchData = jest.fn(async (scope: ExportScope) => [
  { title: 'Lập trình viên React', createdDate: '2026-07-29', status: 'Đang tuyển' },
  { title: 'Kỹ sư AI', createdDate: '2026-07-28', status: 'Tạm dừng' },
]);

describe('ExportModal Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders modal with correct default options and preview header when open', async () => {
    render(
      <ExportModal
        open={true}
        onClose={jest.fn()}
        columns={mockColumns}
        fetchData={mockFetchData}
        totalRecords={{ all: 100, filtered: 50, selected: 0 }}
      />
    );

    expect(screen.getByText('Xuất dữ liệu (Export)')).toBeInTheDocument();
    expect(screen.getByText('Tên file xuất')).toBeInTheDocument();
    expect(screen.getByText('Định dạng file')).toBeInTheDocument();
    expect(screen.getByText('Phạm vi dữ liệu')).toBeInTheDocument();
    expect(screen.getByText('Xuất file dữ liệu')).toBeInTheDocument();

    await waitFor(() => {
      expect(mockFetchData).toHaveBeenCalledWith('filtered');
    });
  });

  it('allows toggling columns with Select All and Clear All buttons', async () => {
    render(
      <ExportModal
        open={true}
        onClose={jest.fn()}
        columns={mockColumns}
        fetchData={mockFetchData}
      />
    );

    const selectAllBtn = screen.getByText('Chọn tất cả');
    fireEvent.click(selectAllBtn);

    const clearAllBtn = screen.getByText('Bỏ chọn tất cả');
    fireEvent.click(clearAllBtn);
  });

  it('executes progress generation state and transitions to success', async () => {
    const handleSuccess = jest.fn();

    render(
      <ExportModal
        open={true}
        onClose={jest.fn()}
        columns={mockColumns}
        fetchData={mockFetchData}
        onExportSuccess={handleSuccess}
      />
    );

    const generateBtn = screen.getByText('Xuất file dữ liệu');
    fireEvent.click(generateBtn);

    await waitFor(
      () => {
        expect(screen.getByText('Xuất dữ liệu thành công!')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    expect(screen.getByText('Tải xuống')).toBeInTheDocument();
    expect(screen.getByText('Đóng')).toBeInTheDocument();
  });
});

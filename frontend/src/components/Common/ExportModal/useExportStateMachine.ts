import { useState, useEffect, useCallback, useRef } from 'react';
import type { ExportColumn, ExportFormat, ExportModalProps, ExportScope, ExportStatus } from './types';
import xlsxUtils from '@/utils/xlsxUtils';
import exchangeService from '@/services/exchangeService';
import dayjs from 'dayjs';

export function useExportStateMachine(props: ExportModalProps) {
  const {
    open,
    defaultFileName = 'DanhSachTinTuyenDung',
    columns: initialColumns,
    fetchData,
    entity,
    filters,
    totalRecords,
    onClose,
  } = props;

  const [status, setStatus] = useState<ExportStatus>('config');
  const [format, setFormat] = useState<ExportFormat>('xlsx');
  const [scope, setScope] = useState<ExportScope>('filtered');
  const [fileName, setFileName] = useState<string>(() => {
    const today = dayjs().format('YYYY-MM-DD');
    return `${defaultFileName}_${today}`;
  });
  const [columns, setColumns] = useState<ExportColumn[]>(initialColumns);

  const [previewRows, setPreviewRows] = useState<Record<string, any>[]>([]);
  const [isPreviewLoading, setIsPreviewLoading] = useState<boolean>(false);

  const [progress, setProgress] = useState<number>(0);
  const [progressStepText, setProgressStepText] = useState<string>('Preparing file...');

  const [generatedBlob, setGeneratedBlob] = useState<Blob | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [generatedFileName, setGeneratedFileName] = useState<string>('');
  const [exportRecordCount, setExportRecordCount] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Sync initial state when modal opens
  useEffect(() => {
    if (open) {
      setStatus('config');
      const today = dayjs().format('YYYY-MM-DD');
      setFileName(`${defaultFileName}_${today}`);
      setColumns(initialColumns);
      setProgress(0);
      setGeneratedBlob(null);
      setDownloadUrl(null);
      setErrorMessage('');

      // Auto select scope logic if selected rows are available/unavailable
      if (totalRecords?.selected && totalRecords.selected > 0) {
        setScope('selected');
      } else if (totalRecords?.filtered && totalRecords.filtered > 0) {
        setScope('filtered');
      } else {
        setScope('all');
      }
    }
  }, [open, defaultFileName, initialColumns, totalRecords]);

  // Load preview data when scope changes or modal opens
  const loadPreviewData = useCallback(async () => {
    if (!open) return;
    if (!fetchData) {
      setPreviewRows([]);
      return;
    }
    setIsPreviewLoading(true);
    try {
      const data = await fetchData(scope);
      setPreviewRows(data.slice(0, 10));
    } catch (err) {
      setPreviewRows([]);
    } finally {
      setIsPreviewLoading(false);
    }
  }, [open, scope, fetchData]);

  useEffect(() => {
    if (open && status === 'config') {
      loadPreviewData();
    }
  }, [open, scope, status, loadPreviewData]);

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  // Column toggles
  const handleToggleColumn = useCallback((colId: string) => {
    setColumns((prev) =>
      prev.map((c) => (c.id === colId ? { ...c, checked: !c.checked } : c))
    );
  }, []);

  const handleSelectAllColumns = useCallback(() => {
    setColumns((prev) => prev.map((c) => ({ ...c, checked: true })));
  }, []);

  const handleClearAllColumns = useCallback(() => {
    setColumns((prev) => prev.map((c) => ({ ...c, checked: false })));
  }, []);

  // Process and filter fields for client-side fallback export
  const transformDataForExport = (rawRows: Record<string, any>[], activeCols: ExportColumn[]) => {
    return rawRows.map((row) => {
      const formattedRow: Record<string, any> = {};
      activeCols.forEach((col) => {
        if (col.getValue) {
          formattedRow[col.label] = col.getValue(row);
        } else if (col.accessorKey && row[col.accessorKey] !== undefined) {
          formattedRow[col.label] = row[col.accessorKey];
        } else {
          formattedRow[col.label] = row[col.id] ?? '';
        }
      });
      return formattedRow;
    });
  };

  // Start Generation Flow
  const handleStartGenerate = useCallback(async () => {
    const activeColumns = columns.filter((c) => c.checked);
    if (activeColumns.length === 0) {
      setErrorMessage('Vui lòng chọn ít nhất một cột để xuất.');
      setStatus('error');
      return;
    }

    setStatus('generating');
    setProgress(10);
    setProgressStepText('Đang khởi tạo tác vụ xuất dữ liệu...');

    const ext = format === 'csv' ? '.csv' : '.xlsx';
    const cleanName = fileName.trim().endsWith(ext) ? fileName.trim() : `${fileName.trim()}${ext}`;

    // Path 1: Backend Exchange API (Production grade, chunked & async-capable)
    if (entity) {
      try {
        const selectedColumnIds = activeColumns.map((c) => c.id);
        const exportRes = await exchangeService.createExport(entity, format, selectedColumnIds, {
          ...filters,
          scope,
          fileName: cleanName,
        });

        const exportJobId = exportRes.exportId;

        // If completed immediately
        if (exportRes.status === 'completed' && exportRes.downloadUrl) {
          setProgress(100);
          setProgressStepText('Xuất dữ liệu hoàn tất.');
          setDownloadUrl(exportRes.downloadUrl);
          setGeneratedFileName(cleanName);
          setExportRecordCount(exportRes.totalRows ?? 0);
          setStatus('success');
          if (props.onExportSuccess) {
            props.onExportSuccess(cleanName, format, exportRes.totalRows ?? 0);
          }
          return;
        }

        // Asynchronous polling
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = setInterval(async () => {
          try {
            const job = await exchangeService.getExportJob(exportJobId);
            setProgress(job.progress);
            setProgressStepText(job.currentStep || 'Đang xử lý dữ liệu...');

            if (job.status === 'completed') {
              if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
              setProgress(100);
              setDownloadUrl(job.downloadUrl || `/api/v1/exchange/exports/${job.exportId}/download/`);
              setGeneratedFileName(job.fileName || cleanName);
              setExportRecordCount(job.totalRows ?? 0);
              setStatus('success');
              if (props.onExportSuccess) {
                props.onExportSuccess(cleanName, format, job.totalRows ?? 0);
              }
            } else if (job.status === 'failed') {
              if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
              setErrorMessage(job.errorMessage || 'Tạo file xuất thất bại.');
              setStatus('error');
            }
          } catch (pollErr) {
            // keep polling on transient network hiccup
          }
        }, 1200);
      } catch (err: any) {
        setErrorMessage(err?.response?.data?.errors?.detail || err?.message || 'Không thể tạo file xuất.');
        setStatus('error');
      }
      return;
    }

    // Path 2: Client-side fetchData fallback
    if (fetchData) {
      try {
        setProgress(30);
        setProgressStepText('Đang nạp dữ liệu bản ghi...');
        const fullData = await fetchData(scope);

        setProgress(60);
        setProgressStepText(`Đang định dạng ${fullData.length} bản ghi...`);
        const exportedData = transformDataForExport(fullData, activeColumns);

        setProgress(85);
        setProgressStepText(`Đang kết xuất cấu trúc file ${format.toUpperCase()}...`);
        const blob = await xlsxUtils.generateBlob(exportedData, format);

        setProgress(100);
        setProgressStepText('Hoàn tất kết xuất file.');
        setGeneratedBlob(blob);
        setGeneratedFileName(cleanName);
        setExportRecordCount(fullData.length);

        setStatus('success');
        if (props.onExportSuccess) {
          props.onExportSuccess(cleanName, format, fullData.length);
        }
      } catch (err: any) {
        setErrorMessage(err?.message || 'Không thể tạo file. Vui lòng thử lại.');
        setStatus('error');
      }
    }
  }, [columns, scope, fetchData, entity, filters, format, fileName, props]);

  // Download Trigger
  const handleDownload = useCallback(async () => {
    if (downloadUrl) {
      window.open(downloadUrl, '_blank');
      return;
    }
    if (generatedBlob && generatedFileName) {
      xlsxUtils.triggerDownload(generatedBlob, generatedFileName);
    }
  }, [downloadUrl, generatedBlob, generatedFileName]);

  // Retry
  const handleRetry = useCallback(() => {
    setStatus('config');
    setErrorMessage('');
  }, []);

  return {
    status,
    format,
    setFormat,
    scope,
    setScope,
    fileName,
    setFileName,
    columns,
    previewRows,
    isPreviewLoading,
    progress,
    progressStepText,
    generatedFileName,
    exportRecordCount,
    errorMessage,
    handleToggleColumn,
    handleSelectAllColumns,
    handleClearAllColumns,
    handleStartGenerate,
    handleDownload,
    handleRetry,
    onClose,
  };
}
export default useExportStateMachine;

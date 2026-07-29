import { useState, useEffect, useCallback, useRef } from 'react';
import type { ExportColumn, ExportFormat, ExportModalProps, ExportOptionsState, ExportScope, ExportStatus } from './types';
import xlsxUtils from '@/utils/xlsxUtils';
import dayjs from 'dayjs';

export function useExportStateMachine(props: ExportModalProps) {
  const { open, defaultFileName = 'DanhSachTinTuyenDung', columns: initialColumns, fetchData, totalRecords, onClose } = props;

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
  const [generatedFileName, setGeneratedFileName] = useState<string>('');
  const [exportRecordCount, setExportRecordCount] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync initial state when modal opens
  useEffect(() => {
    if (open) {
      setStatus('config');
      const today = dayjs().format('YYYY-MM-DD');
      setFileName(`${defaultFileName}_${today}`);
      setColumns(initialColumns);
      setProgress(0);
      setGeneratedBlob(null);
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
    setIsPreviewLoading(true);
    try {
      const data = await fetchData(scope);
      setPreviewRows(data.slice(0, 10));
    } catch (err) {
      // Fallback empty array on preview error
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

  // Process and filter fields for export
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
    setProgress(0);
    setProgressStepText('Preparing file...');

    // Fake / smooth progress sequence: 0% -> 25% -> 60% -> 90% -> 100%
    const updateProgressStep = (percent: number, msg: string) => {
      return new Promise<void>((resolve) => {
        timerRef.current = setTimeout(() => {
          setProgress(percent);
          setProgressStepText(msg);
          resolve();
        }, 300);
      });
    };

    try {
      await updateProgressStep(15, 'Preparing data scope...');
      
      const fullData = await fetchData(scope);
      await updateProgressStep(45, `Filtering ${fullData.length} records...`);

      const exportedData = transformDataForExport(fullData, activeColumns);
      await updateProgressStep(75, `Generating ${format.toUpperCase()} structure...`);

      const blob = xlsxUtils.generateBlob(exportedData, format);
      const ext = format === 'csv' ? '.csv' : '.xlsx';
      const cleanName = fileName.trim().endsWith(ext) ? fileName.trim() : `${fileName.trim()}${ext}`;

      await updateProgressStep(100, 'Finalizing file creation...');

      setGeneratedBlob(blob);
      setGeneratedFileName(cleanName);
      setExportRecordCount(fullData.length);

      // Brief pause to allow user to visually appreciate 100% completion
      setTimeout(() => {
        setStatus('success');
        if (props.onExportSuccess) {
          props.onExportSuccess(cleanName, format, fullData.length);
        }
      }, 400);

    } catch (err: any) {
      setErrorMessage(err?.message || 'Không thể tạo file. Vui lòng thử lại.');
      setStatus('error');
    }
  }, [columns, scope, fetchData, format, fileName, props]);

  // Download Trigger
  const handleDownload = useCallback(() => {
    if (generatedBlob && generatedFileName) {
      xlsxUtils.triggerDownload(generatedBlob, generatedFileName);
    }
  }, [generatedBlob, generatedFileName]);

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

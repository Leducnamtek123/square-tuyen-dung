import { useState, useEffect, useCallback, useRef } from 'react';
import type { ImportModalProps, ImportStep, ImportConfigState } from './types';
import type {
  ExchangeDefinition,
  ImportPreviewResponse,
  ImportJobState,
  ActivityStep,
  StepStatus,
} from '@/types/exchange';
import exchangeService from '@/services/exchangeService';

export function useImportStateMachine(props: ImportModalProps) {
  const { open, entity, onSuccess, onClose } = props;

  // Lifecycle step
  const [step, setStep] = useState<ImportStep>('upload');

  // Definition
  const [definition, setDefinition] = useState<ExchangeDefinition | null>(null);
  const [isDefinitionLoading, setIsDefinitionLoading] = useState(false);

  // Config
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<ImportConfigState['mode']>('create');
  const [matchBy, setMatchBy] = useState<string>('');

  // Validation & Preview
  const [isValidating, setIsValidating] = useState(false);
  const [previewData, setPreviewData] = useState<ImportPreviewResponse | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Filter in preview table
  const [previewFilter, setPreviewFilter] = useState<'all' | 'valid' | 'invalid'>('all');

  // Committing & Progress
  const [isCommitting, setIsCommitting] = useState(false);
  const [commitJob, setCommitJob] = useState<ImportJobState | null>(null);
  const [commitError, setCommitError] = useState<string | null>(null);

  // Progressive Activity Steps
  const [activitySteps, setActivitySteps] = useState<ActivityStep[]>([
    { id: 'upload', label: 'Tải file và phân tích cấu trúc', status: 'pending' },
    { id: 'validate', label: 'Kiểm tra dữ liệu và logic trường', status: 'pending' },
    { id: 'relations', label: 'Kiểm tra liên kết & tính toàn vẹn', status: 'pending' },
    { id: 'commit', label: 'Lưu trữ bản ghi vào hệ thống', status: 'pending' },
  ]);
  const [progressPercent, setProgressPercent] = useState(0);
  const [currentStepText, setCurrentStepText] = useState('');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch Definition on open
  useEffect(() => {
    if (!open) return;

    // Reset all state on open
    setStep('upload');
    setFile(null);
    setPreviewData(null);
    setValidationError(null);
    setCommitJob(null);
    setCommitError(null);
    setProgressPercent(0);
    setElapsedSeconds(0);
    setActivitySteps([
      { id: 'upload', label: 'Tải file và phân tích cấu trúc', status: 'pending' },
      { id: 'validate', label: 'Kiểm tra dữ liệu và logic trường', status: 'pending' },
      { id: 'relations', label: 'Kiểm tra liên kết & tính toàn vẹn', status: 'pending' },
      { id: 'commit', label: 'Lưu trữ bản ghi vào hệ thống', status: 'pending' },
    ]);

    setIsDefinitionLoading(true);
    exchangeService
      .getDefinition(entity)
      .then((def) => {
        setDefinition(def);
        if (def.defaultMatchingKey) {
          setMatchBy(def.defaultMatchingKey);
        } else if (def.matchingKeys && def.matchingKeys.length > 0) {
          setMatchBy(def.matchingKeys[0]);
        }
        if (def.supportedModes && def.supportedModes.length > 0) {
          setMode(def.supportedModes[0]);
        }
      })
      .catch((err) => {
        setValidationError('Không thể tải cấu hình nhập dữ liệu cho đối tượng này.');
      })
      .finally(() => {
        setIsDefinitionLoading(false);
      });
  }, [open, entity]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Timer for elapsed seconds during processing
  useEffect(() => {
    if (step === 'committing' || isValidating) {
      const startTime = Date.now();
      timerRef.current = setInterval(() => {
        setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [step, isValidating]);

  // Download Template
  const handleDownloadTemplate = useCallback(async () => {
    try {
      await exchangeService.downloadTemplate(entity);
    } catch (err: any) {
      alert('Không thể tải file mẫu. Vui lòng thử lại sau.');
    }
  }, [entity]);

  // Upload & Validate
  const handleStartValidate = useCallback(async () => {
    if (!file) {
      setValidationError('Vui lòng chọn file dữ liệu Excel (.xlsx) hoặc CSV (.csv).');
      return;
    }

    setIsValidating(true);
    setValidationError(null);
    setProgressPercent(20);
    setCurrentStepText('Đang tải file lên máy chủ và phân tích cấu trúc...');

    setActivitySteps([
      { id: 'upload', label: 'Tải file và phân tích cấu trúc', status: 'running' },
      { id: 'validate', label: 'Kiểm tra dữ liệu và logic trường', status: 'pending' },
      { id: 'relations', label: 'Kiểm tra liên kết & tính toàn vẹn', status: 'pending' },
      { id: 'commit', label: 'Lưu trữ bản ghi vào hệ thống', status: 'pending' },
    ]);

    try {
      const res = await exchangeService.validateImport(entity, file, mode, matchBy);
      setPreviewData(res);
      setProgressPercent(100);
      setCurrentStepText('Kiểm tra dữ liệu hoàn tất.');

      setActivitySteps([
        { id: 'upload', label: 'Tải file và phân tích cấu trúc', status: 'completed' },
        { id: 'validate', label: 'Kiểm tra dữ liệu và logic trường', status: 'completed' },
        { id: 'relations', label: 'Kiểm tra liên kết & tính toàn vẹn', status: 'completed' },
        { id: 'commit', label: 'Lưu trữ bản ghi vào hệ thống', status: 'pending' },
      ]);

      setStep('preview');
    } catch (err: any) {
      const msg =
        err?.response?.data?.errors?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        'Kiểm tra file thất bại. Vui lòng kiểm tra lại định dạng file.';
      setValidationError(msg);
      setActivitySteps((prev) =>
        prev.map((s, idx) => (idx === 0 ? { ...s, status: 'failed', detail: msg } : s))
      );
    } finally {
      setIsValidating(false);
    }
  }, [entity, file, mode, matchBy]);

  // Download Error Report
  const handleDownloadErrorReport = useCallback(async () => {
    if (!previewData?.importId) return;
    try {
      await exchangeService.downloadErrorReport(previewData.importId);
    } catch (err: any) {
      alert('Không thể tải báo cáo lỗi. Vui lòng thử lại sau.');
    }
  }, [previewData]);

  // Poll Import Job until completion
  const startPollingJob = useCallback(
    (jobId: string) => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

      pollIntervalRef.current = setInterval(async () => {
        try {
          const job = await exchangeService.getImportJob(jobId);
          setCommitJob(job);
          setProgressPercent(job.progress);
          setCurrentStepText(job.currentStep || 'Đang xử lý...');

          if (job.status === 'completed') {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
            setIsCommitting(false);
            setStep('result');
            setActivitySteps((prev) =>
              prev.map((s) => ({ ...s, status: 'completed' }))
            );
            if (onSuccess) onSuccess(job);
          } else if (job.status === 'failed') {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
            setIsCommitting(false);
            setStep('result');
            setCommitError(job.currentStep || 'Xảy ra lỗi trong quá trình lưu dữ liệu.');
            setActivitySteps((prev) =>
              prev.map((s) => (s.id === 'commit' ? { ...s, status: 'failed', detail: job.currentStep } : s))
            );
          }
        } catch (pollErr) {
          // Keep polling on transient network hiccups
        }
      }, 1500);
    },
    [onSuccess]
  );

  // Confirm Import Commit
  const handleConfirmCommit = useCallback(async () => {
    if (!previewData?.importId) return;

    setIsCommitting(true);
    setCommitError(null);
    setStep('committing');
    setProgressPercent(15);
    setCurrentStepText('Đang khởi tạo giao dịch lưu dữ liệu...');

    setActivitySteps([
      { id: 'upload', label: 'Tải file và phân tích cấu trúc', status: 'completed' },
      { id: 'validate', label: 'Kiểm tra dữ liệu và logic trường', status: 'completed' },
      { id: 'relations', label: 'Kiểm tra liên kết & tính toàn vẹn', status: 'completed' },
      { id: 'commit', label: 'Lưu trữ bản ghi vào hệ thống', status: 'running' },
    ]);

    try {
      const job = await exchangeService.confirmImport(previewData.importId);
      setCommitJob(job);
      setProgressPercent(job.progress);

      if (job.status === 'completed') {
        setIsCommitting(false);
        setStep('result');
        setActivitySteps((prev) =>
          prev.map((s) => ({ ...s, status: 'completed' }))
        );
        if (onSuccess) onSuccess(job);
      } else if (job.status === 'failed') {
        setIsCommitting(false);
        setStep('result');
        setCommitError(job.currentStep || 'Nhập dữ liệu thất bại.');
        setActivitySteps((prev) =>
          prev.map((s) => (s.id === 'commit' ? { ...s, status: 'failed', detail: job.currentStep } : s))
        );
      } else {
        // Asynchronous job - poll for completion
        startPollingJob(previewData.importId);
      }
    } catch (err: any) {
      setIsCommitting(false);
      const msg =
        err?.response?.data?.errors?.detail ||
        err?.message ||
        'Không thể lưu dữ liệu. Giao dịch đã được hoàn tác để bảo vệ tính toàn vẹn.';
      setCommitError(msg);
      setStep('result');
      setActivitySteps((prev) =>
        prev.map((s) => (s.id === 'commit' ? { ...s, status: 'failed', detail: msg } : s))
      );
    }
  }, [previewData, onSuccess, startPollingJob]);

  // Back navigation
  const handleBackToUpload = useCallback(() => {
    setStep('upload');
    setValidationError(null);
  }, []);

  return {
    step,
    definition,
    isDefinitionLoading,
    file,
    setFile,
    mode,
    setMode,
    matchBy,
    setMatchBy,
    isValidating,
    previewData,
    previewFilter,
    setPreviewFilter,
    validationError,
    isCommitting,
    commitJob,
    commitError,
    activitySteps,
    progressPercent,
    currentStepText,
    elapsedSeconds,
    handleDownloadTemplate,
    handleStartValidate,
    handleDownloadErrorReport,
    handleConfirmCommit,
    handleBackToUpload,
  };
}
export default useImportStateMachine;

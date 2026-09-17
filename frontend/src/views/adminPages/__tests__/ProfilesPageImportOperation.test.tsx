/**
 * @jest-environment jsdom
 */
import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  adaptVieclam24hImportOperation,
  OperationProvider,
} from '@/components/operation';
import type { Vieclam24hImportJob } from '@/services/adminManagementService';
import ProfilesPage from '../ProfilesPage';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: any) => options?.defaultValue || key,
    i18n: { changeLanguage: () => Promise.resolve() },
  }),
}));

jest.mock('@/hooks/useConfig', () => ({
  useConfig: () => ({
    allConfig: {
      careers: [],
      cities: [],
      experiences: [],
      positions: [],
      academicLevels: [],
      typeOfWorkplaces: [],
      jobTypes: [],
      genders: [],
      maritalStatuses: [],
    },
  }),
}));

const mockGetVieclam24hImportJob = jest.fn();
const mockGetVieclam24hCatalog = jest.fn().mockResolvedValue({
  occupations: [],
  topOccupations: [],
  provinces: [],
  provincesAll: [],
  recommendedOccupationIds: [],
});

jest.mock('@/services/adminManagementService', () => {
  const actual = jest.requireActual('@/services/adminManagementService');
  return {
    __esModule: true,
    default: {
      ...actual.default,
      getVieclam24hImportJob: (id: any) => mockGetVieclam24hImportJob(id),
      getVieclam24hCatalog: () => mockGetVieclam24hCatalog(),
      getProfiles: jest.fn().mockResolvedValue({ results: [], count: 0 }),
    },
  };
});

describe('Flow 2: Vieclam24h Candidate Data Sync Operation Integration', () => {
  describe('adaptVieclam24hImportOperation', () => {
    it('returns null when job is null', () => {
      expect(adaptVieclam24hImportOperation(null)).toBeNull();
    });

    it('maps 0-9% progress to authenticate running and others pending', () => {
      const job: Vieclam24hImportJob = {
        id: 1,
        status: 'processing',
        progress: 5,
        createdCount: 0,
        updatedCount: 0,
        skippedCount: 0,
        sourceUrl: 'https://ntd.vieclam24h.vn/tim-kiem-ung-vien-nhanh',
        sourceAccount: 'hr@example.com',
      };

      const op = adaptVieclam24hImportOperation(job);
      expect(op).not.toBeNull();
      expect(op?.id).toBeDefined();
      expect(op?.type).toBe('vieclam24h.import');
      expect(op?.title).toContain('1');
      expect(op?.status).toBe('running');
      expect(op?.progress).toBe(5);
      expect(op?.currentStepKey).toBe('authenticate');
      expect(op?.steps).toHaveLength(5);

      expect(op?.steps[0]).toMatchObject({ key: 'authenticate', status: 'running' });
      expect(op?.steps[1]).toMatchObject({ key: 'fetch_candidates', status: 'pending' });
      expect(op?.steps[2]).toMatchObject({ key: 'parse_normalize', status: 'pending' });
      expect(op?.steps[3]).toMatchObject({ key: 'deduplicate_save', status: 'pending' });
      expect(op?.steps[4]).toMatchObject({ key: 'generate_report', status: 'pending' });
    });

    it('maps 10-39% progress to authenticate completed and fetch_candidates running', () => {
      const job: Vieclam24hImportJob = {
        id: 2,
        status: 'processing',
        progress: 25,
        createdCount: 0,
        updatedCount: 0,
        skippedCount: 0,
        sourceUrl: 'https://ntd.vieclam24h.vn/tim-kiem-ung-vien-nhanh',
        sourceAccount: 'hr@example.com',
      };

      const op = adaptVieclam24hImportOperation(job);
      expect(op?.currentStepKey).toBe('fetch_candidates');
      expect(op?.steps[0]).toMatchObject({ key: 'authenticate', status: 'completed' });
      expect(op?.steps[1]).toMatchObject({ key: 'fetch_candidates', status: 'running' });
      expect(op?.steps[2]).toMatchObject({ key: 'parse_normalize', status: 'pending' });
      expect(op?.steps[3]).toMatchObject({ key: 'deduplicate_save', status: 'pending' });
      expect(op?.steps[4]).toMatchObject({ key: 'generate_report', status: 'pending' });
    });

    it('maps 40-69% progress to fetch_candidates completed and parse_normalize running', () => {
      const job: Vieclam24hImportJob = {
        id: 3,
        status: 'processing',
        progress: 55,
        createdCount: 0,
        updatedCount: 0,
        skippedCount: 0,
        sourceUrl: 'https://ntd.vieclam24h.vn/tim-kiem-ung-vien-nhanh',
        sourceAccount: 'hr@example.com',
      };

      const op = adaptVieclam24hImportOperation(job);
      expect(op?.currentStepKey).toBe('parse_normalize');
      expect(op?.steps[0]).toMatchObject({ key: 'authenticate', status: 'completed' });
      expect(op?.steps[1]).toMatchObject({ key: 'fetch_candidates', status: 'completed' });
      expect(op?.steps[2]).toMatchObject({ key: 'parse_normalize', status: 'running' });
      expect(op?.steps[3]).toMatchObject({ key: 'deduplicate_save', status: 'pending' });
      expect(op?.steps[4]).toMatchObject({ key: 'generate_report', status: 'pending' });
    });

    it('maps 70-94% progress to parse_normalize completed and deduplicate_save running', () => {
      const job: Vieclam24hImportJob = {
        id: 4,
        status: 'processing',
        progress: 80,
        createdCount: 0,
        updatedCount: 0,
        skippedCount: 0,
        sourceUrl: 'https://ntd.vieclam24h.vn/tim-kiem-ung-vien-nhanh',
        sourceAccount: 'hr@example.com',
      };

      const op = adaptVieclam24hImportOperation(job);
      expect(op?.currentStepKey).toBe('deduplicate_save');
      expect(op?.steps[0]).toMatchObject({ key: 'authenticate', status: 'completed' });
      expect(op?.steps[1]).toMatchObject({ key: 'fetch_candidates', status: 'completed' });
      expect(op?.steps[2]).toMatchObject({ key: 'parse_normalize', status: 'completed' });
      expect(op?.steps[3]).toMatchObject({ key: 'deduplicate_save', status: 'running' });
      expect(op?.steps[4]).toMatchObject({ key: 'generate_report', status: 'pending' });
    });

    it('maps 95%+ progress to deduplicate_save completed and generate_report running', () => {
      const job: Vieclam24hImportJob = {
        id: 5,
        status: 'processing',
        progress: 95,
        createdCount: 5,
        updatedCount: 2,
        skippedCount: 1,
        sourceUrl: 'https://ntd.vieclam24h.vn/tim-kiem-ung-vien-nhanh',
        sourceAccount: 'hr@example.com',
      };

      const op = adaptVieclam24hImportOperation(job);
      expect(op?.currentStepKey).toBe('generate_report');
      expect(op?.steps[0]).toMatchObject({ key: 'authenticate', status: 'completed' });
      expect(op?.steps[1]).toMatchObject({ key: 'fetch_candidates', status: 'completed' });
      expect(op?.steps[2]).toMatchObject({ key: 'parse_normalize', status: 'completed' });
      expect(op?.steps[3]).toMatchObject({ key: 'deduplicate_save', status: 'completed' });
      expect(op?.steps[4]).toMatchObject({ key: 'generate_report', status: 'running' });
    });

    it('maps completed status to all 5 steps completed and progress 100', () => {
      const job: Vieclam24hImportJob = {
        id: 6,
        status: 'completed',
        progress: 100,
        createdCount: 10,
        updatedCount: 3,
        skippedCount: 1,
        sourceUrl: 'https://ntd.vieclam24h.vn/tim-kiem-ung-vien-nhanh',
        sourceAccount: 'hr@example.com',
      };

      const op = adaptVieclam24hImportOperation(job);
      expect(op?.status).toBe('completed');
      expect(op?.progress).toBe(100);
      expect(op?.steps.every((s) => s.status === 'completed')).toBe(true);
      expect(op?.result).toEqual({
        createdCount: 10,
        updatedCount: 3,
        skippedCount: 1,
      });
    });

    it('maps failed status to active step marked failed with errorMessage', () => {
      const job: Vieclam24hImportJob = {
        id: 7,
        status: 'failed',
        progress: 50,
        createdCount: 0,
        updatedCount: 0,
        skippedCount: 0,
        sourceUrl: 'https://ntd.vieclam24h.vn/tim-kiem-ung-vien-nhanh',
        sourceAccount: 'hr@example.com',
        errorMessage: 'Lỗi giải mã tài khoản Vieclam24h',
      };

      const op = adaptVieclam24hImportOperation(job);
      expect(op?.status).toBe('failed');
      expect(op?.error?.message).toBe('Lỗi giải mã tài khoản Vieclam24h');
      expect(op?.steps[2]).toMatchObject({
        key: 'parse_normalize',
        status: 'failed',
        errorMessage: 'Lỗi giải mã tài khoản Vieclam24h',
      });
    });
  });

  describe('ProfilesPage UI Integration with OperationTimeline', () => {
    let queryClient: QueryClient;

    beforeEach(() => {
      queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false },
        },
      });
      window.localStorage.clear();
      jest.clearAllMocks();
    });

    it('renders OperationTimeline in dialog when import job is active', async () => {
      const mockActiveJob: Vieclam24hImportJob = {
        id: 88,
        status: 'processing',
        progress: 45,
        createdCount: 0,
        updatedCount: 0,
        skippedCount: 0,
        sourceUrl: 'https://ntd.vieclam24h.vn/tim-kiem-ung-vien-nhanh',
        sourceAccount: 'hr@example.com',
      };

      window.localStorage.setItem('admin-profiles-vieclam24h-import-job-id', '88');
      mockGetVieclam24hImportJob.mockResolvedValue(mockActiveJob);

      render(
        <QueryClientProvider client={queryClient}>
          <OperationProvider>
            <ProfilesPage />
          </OperationProvider>
        </QueryClientProvider>
      );

      // OperationTimeline renders the 5 step labels
      await waitFor(() => {
        expect(screen.getAllByText('Đăng nhập portal Vieclam24h').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Tải danh sách ứng viên').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Chuẩn hóa dữ liệu hồ sơ').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Đối soát trùng lặp & lưu CSDL').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Tổng hợp báo cáo kết quả').length).toBeGreaterThan(0);
      });
    });

    it('persists operation registration in OperationProvider so closing modal maintains tracking', async () => {
      const mockActiveJob: Vieclam24hImportJob = {
        id: 99,
        status: 'processing',
        progress: 30,
        createdCount: 0,
        updatedCount: 0,
        skippedCount: 0,
        sourceUrl: 'https://ntd.vieclam24h.vn/tim-kiem-ung-vien-nhanh',
        sourceAccount: 'hr@example.com',
      };

      window.localStorage.setItem('admin-profiles-vieclam24h-import-job-id', '99');
      mockGetVieclam24hImportJob.mockResolvedValue(mockActiveJob);

      let capturedOps: Record<string, any> = {};
      const ContextWatcher = () => {
        const { operations } = require('@/components/operation').useOperationContext();
        React.useEffect(() => {
          capturedOps = operations;
        }, [operations]);
        return null;
      };

      render(
        <QueryClientProvider client={queryClient}>
          <OperationProvider>
            <ProfilesPage />
            <ContextWatcher />
          </OperationProvider>
        </QueryClientProvider>
      );

      await waitFor(() => {
        const matching = Object.values(capturedOps).find(
          (op: any) => op.type === 'vieclam24h.import' && op.metadata?.jobId === 99
        );
        expect(matching).toBeDefined();
        expect((matching as any).status).toBe('running');
      });
    });
  });
});

/**
 * @jest-environment jsdom
 */
import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { adaptResumeAnalysisOperation } from '@/components/operation';
import AIAnalysisDrawerStatePanels from '../AIAnalysisDrawerStatePanels';
import AIAnalysisComponent from '../../AppliedResumeTable/AIAnalysisComponent';
import type { AIAnalysisData } from '../types';
import type { JobPostActivity } from '@/types/models';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { changeLanguage: () => Promise.resolve() },
  }),
}));

describe('Flow 1: Candidate Resume AI Screening Operation Integration', () => {
  describe('adaptResumeAnalysisOperation', () => {
    it('maps 0-24% progress to extract_text running and others pending', () => {
      const data: AIAnalysisData = {
        id: 101,
        fullName: 'Nguyen Van A',
        aiAnalysisStatus: 'processing',
        aiAnalysisProgress: 15,
      };

      const op = adaptResumeAnalysisOperation(data, 15);
      expect(op.id).toBeDefined();
      expect(op.type).toBe('candidate.ai_scan');
      expect(op.status).toBe('running');
      expect(op.progress).toBe(15);
      expect(op.currentStepKey).toBe('extract_text');

      expect(op.steps).toHaveLength(4);
      expect(op.steps[0]).toMatchObject({ key: 'extract_text', status: 'running' });
      expect(op.steps[1]).toMatchObject({ key: 'criteria_match', status: 'pending' });
      expect(op.steps[2]).toMatchObject({ key: 'llm_evaluation', status: 'pending' });
      expect(op.steps[3]).toMatchObject({ key: 'scoring_finalize', status: 'pending' });
    });

    it('maps 25-44% progress to extract_text completed and criteria_match running', () => {
      const data: AIAnalysisData = {
        id: 102,
        aiAnalysisStatus: 'processing',
        aiAnalysisProgress: 35,
      };

      const op = adaptResumeAnalysisOperation(data, 35);
      expect(op.currentStepKey).toBe('criteria_match');
      expect(op.steps[0]).toMatchObject({ key: 'extract_text', status: 'completed' });
      expect(op.steps[1]).toMatchObject({ key: 'criteria_match', status: 'running' });
      expect(op.steps[2]).toMatchObject({ key: 'llm_evaluation', status: 'pending' });
      expect(op.steps[3]).toMatchObject({ key: 'scoring_finalize', status: 'pending' });
    });

    it('maps 45-69% progress to criteria_match completed and llm_evaluation running', () => {
      const data: AIAnalysisData = {
        id: 103,
        aiAnalysisStatus: 'processing',
        aiAnalysisProgress: 55,
      };

      const op = adaptResumeAnalysisOperation(data, 55);
      expect(op.currentStepKey).toBe('llm_evaluation');
      expect(op.steps[0]).toMatchObject({ key: 'extract_text', status: 'completed' });
      expect(op.steps[1]).toMatchObject({ key: 'criteria_match', status: 'completed' });
      expect(op.steps[2]).toMatchObject({ key: 'llm_evaluation', status: 'running' });
      expect(op.steps[3]).toMatchObject({ key: 'scoring_finalize', status: 'pending' });
    });

    it('maps 70-99% progress to llm_evaluation completed and scoring_finalize running', () => {
      const data: AIAnalysisData = {
        id: 104,
        aiAnalysisStatus: 'processing',
        aiAnalysisProgress: 80,
      };

      const op = adaptResumeAnalysisOperation(data, 80);
      expect(op.currentStepKey).toBe('scoring_finalize');
      expect(op.steps[0]).toMatchObject({ key: 'extract_text', status: 'completed' });
      expect(op.steps[1]).toMatchObject({ key: 'criteria_match', status: 'completed' });
      expect(op.steps[2]).toMatchObject({ key: 'llm_evaluation', status: 'completed' });
      expect(op.steps[3]).toMatchObject({ key: 'scoring_finalize', status: 'running' });
    });

    it('maps 100% or completed status to all steps completed', () => {
      const data: AIAnalysisData = {
        id: 105,
        aiAnalysisStatus: 'completed',
        aiAnalysisProgress: 100,
        aiAnalysisScore: 92,
      };

      const op = adaptResumeAnalysisOperation(data, 100);
      expect(op.status).toBe('completed');
      expect(op.progress).toBe(100);
      expect(op.steps.every((s) => s.status === 'completed')).toBe(true);
    });

    it('maps failed status to active step failed with error message', () => {
      const data: AIAnalysisData = {
        id: 106,
        aiAnalysisStatus: 'failed',
        aiAnalysisProgress: 30,
        aiAnalysisSummary: 'Không tìm thấy tệp CV để phân tích',
      };

      const op = adaptResumeAnalysisOperation(data, 30);
      expect(op.status).toBe('failed');
      expect(op.error?.message).toBe('Không tìm thấy tệp CV để phân tích');
      expect(op.steps[1]).toMatchObject({
        key: 'criteria_match',
        status: 'failed',
        errorMessage: 'Không tìm thấy tệp CV để phân tích',
      });
    });
  });

  describe('AIAnalysisDrawerStatePanels UI', () => {
    it('renders OperationTimeline when isProcessing is true', () => {
      const mockData: AIAnalysisData = {
        id: 201,
        fullName: 'Tran Thi B',
        aiAnalysisStatus: 'processing',
        aiAnalysisProgress: 40,
      };

      const { container } = render(
        <AIAnalysisDrawerStatePanels
          data={mockData}
          analyzing={true}
          scanProgress={40}
          isProcessing={true}
          isCompleted={false}
          isFailed={false}
          stats={{ matchingSkills: 2, missingSkills: 1, totalSkills: 3 }}
          onAnalyze={jest.fn()}
          onSaveReview={jest.fn()}
          t={(k: string) => k}
        />
      );

      // OperationTimeline renders stepper steps with labels
      expect(screen.getByText('Đọc & trích xuất tệp hồ sơ/CV')).toBeInTheDocument();
      expect(screen.getByText('Đối soát tiêu chí & yêu cầu công việc')).toBeInTheDocument();
      expect(screen.getByText('Phân tích chuyên sâu với AI')).toBeInTheDocument();
      expect(screen.getByText('Tổng hợp dẫn chứng & tính điểm')).toBeInTheDocument();
      // Should show progress percentage
      expect(screen.getByText('40%')).toBeInTheDocument();
    });
  });

  describe('AIAnalysisComponent in AppliedResumeTable', () => {
    it('renders OperationProgress when row.aiAnalysisStatus is processing', () => {
      const mockRow = {
        id: 301,
        fullName: 'Le Van C',
        aiAnalysisStatus: 'processing',
        aiAnalysisProgress: 60,
      } as unknown as JobPostActivity;

      const onOpenDrawer = jest.fn();
      render(<AIAnalysisComponent row={mockRow} onOpenDrawer={onOpenDrawer} />);

      // OperationProgress renders percentage and active step
      expect(screen.getByText('60%')).toBeInTheDocument();
      expect(screen.getByText('· Phân tích chuyên sâu với AI')).toBeInTheDocument();
    });
  });
});

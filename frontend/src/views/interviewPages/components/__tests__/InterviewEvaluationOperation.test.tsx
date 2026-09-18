/**
 * @jest-environment jsdom
 */
import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { adaptInterviewEvaluationOperation } from '@/components/operation';
import { InterviewCompletedView } from '../InterviewCompletedView';
import { CandidateEvaluationModal } from '@/views/jobSeekerPages/MyInterviewsPage/components/CandidateEvaluationModal';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/phong-van/test',
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, ...props }: any) => <a {...props}>{children}</a>,
}));

jest.mock('@/services/interviewService', () => ({
  __esModule: true,
  default: {
    getSessionDetail: jest.fn().mockResolvedValue({}),
    getSessionDetailByInviteToken: jest.fn().mockResolvedValue({}),
  },
  interviewService: {
    getSessionDetail: jest.fn().mockResolvedValue({}),
    getSessionDetailByInviteToken: jest.fn().mockResolvedValue({}),
  },
}));

jest.mock('@/utils/transformers', () => ({
  transformInterviewSession: (data: any) => data,
}));

describe('InterviewEvaluationOperation & UI Integration', () => {
  describe('adaptInterviewEvaluationOperation', () => {
    it('returns null for empty or null session', () => {
      expect(adaptInterviewEvaluationOperation(null)).toBeNull();
    });

    it('correctly maps running / processing state with 5 steps', () => {
      const session = {
        id: 101,
        status: 'processing',
        candidateName: 'Nguyen Van A',
        jobName: 'Senior Backend Engineer',
      };

      const op = adaptInterviewEvaluationOperation(session as any);
      expect(op).not.toBeNull();
      expect(op?.id).toBe('op_interview_eval_101');
      expect(op?.type).toBe('interview.evaluate');
      expect(op?.status).toBe('running');
      expect(op?.title).toContain('101');
      expect(op?.steps).toHaveLength(5);

      const stepKeys = op?.steps.map((s) => s.key);
      expect(stepKeys).toEqual([
        'sync_recording',
        'transcribe_align',
        'ai_scoring',
        'apply_weights',
        'publish_report',
      ]);
    });

    it('correctly maps completed state with scores and finished steps', () => {
      const session = {
        id: 102,
        status: 'completed',
        aiOverallScore: 8.5,
        aiTechnicalScore: 9.0,
        aiCommunicationScore: 8.0,
        aiSummary: 'Danh gia nang luc tot',
      };

      const op = adaptInterviewEvaluationOperation(session as any);
      expect(op).not.toBeNull();
      expect(op?.status).toBe('completed');
      expect(op?.progress).toBe(100);
      expect(op?.result).toEqual({
        overallScore: 8.5,
        technicalScore: 9.0,
        communicationScore: 8.0,
        summary: 'Danh gia nang luc tot',
      });
      expect(op?.steps.every((s) => s.status === 'completed')).toBe(true);
    });

    it('correctly maps failed state with error details', () => {
      const session = {
        id: 103,
        status: 'failed',
        aiSummary: 'Loi khong the danh gia',
      };

      const op = adaptInterviewEvaluationOperation(session as any);
      expect(op).not.toBeNull();
      expect(op?.status).toBe('failed');
      expect(op?.error?.code).toBe('EVALUATION_FAILED');
      expect(op?.error?.message).toContain('Loi khong the danh gia');
    });
  });

  describe('InterviewCompletedView with OperationTimeline', () => {
    it('renders OperationTimeline during processing', () => {
      const session = {
        id: 201,
        status: 'processing',
        jobName: 'Golang Engineer',
        companyName: 'Square Corp',
        questions: [{ text: 'Question 1' }],
      };

      render(
        <InterviewCompletedView
          session={session as any}
          isProcessing={true}
        />
      );

      expect(screen.getByText(/Đánh giá phỏng vấn AI #201/i)).toBeInTheDocument();
      expect(screen.getByText(/Đồng bộ dữ liệu phòng phỏng vấn/i)).toBeInTheDocument();
      expect(screen.getByText(/AI đánh giá năng lực & chuyên môn/i)).toBeInTheDocument();
    });
  });

  describe('CandidateEvaluationModal with OperationTimeline', () => {
    it('renders OperationTimeline when session status is processing', () => {
      const session = {
        id: 301,
        status: 'processing',
        jobName: 'Frontend Engineer',
        companyName: 'Tech Corp',
      };

      render(
        <CandidateEvaluationModal
          session={session as any}
          onClose={jest.fn()}
        />
      );

      expect(screen.getByText(/Đánh giá phỏng vấn AI #301/i)).toBeInTheDocument();
      expect(screen.getByText(/Đồng bộ dữ liệu phòng phỏng vấn/i)).toBeInTheDocument();
    });
  });
});

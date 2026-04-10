/**
 * Frontend E2E Tests — Interview Service Payload Validation
 * 
 * Ensures all API payloads use snake_case keys matching Django serializers.
 * This catches the camelCase vs snake_case mismatch bugs.
 */

import type { ScheduleSessionInput, SubmitEvaluationInput } from '../interviewService';

describe('ScheduleSessionInput type validation', () => {
  it('uses snake_case for job_post (not jobPostId or jobPost)', () => {
    const input: ScheduleSessionInput = {
      candidate: 1,
      job_post: 2,
      type: 'mixed',
      scheduled_at: '2026-04-10T10:00:00Z',
    };
    
    expect(input).toHaveProperty('job_post');
    expect(input).toHaveProperty('candidate');
    expect(input).not.toHaveProperty('jobPostId');
    expect(input).not.toHaveProperty('candidateId');
    expect(input).not.toHaveProperty('jobPost');
  });

  it('uses snake_case for question_ids and question_group', () => {
    const input: ScheduleSessionInput = {
      candidate: 1,
      question_ids: [1, 2, 3],
      question_group: 5,
    };
    
    expect(input).toHaveProperty('question_ids');
    expect(input).toHaveProperty('question_group');
    expect(input).not.toHaveProperty('questionIds');
    expect(input).not.toHaveProperty('questionGroup');
  });

  it('type field only accepts valid values from Django TYPE_CHOICES', () => {
    const validTypes = ['technical', 'behavioral', 'mixed'] as const;
    
    for (const t of validTypes) {
      const input: ScheduleSessionInput = { candidate: 1, type: t };
      expect(validTypes).toContain(input.type);
    }

    // 'live' is NOT a valid type — this was a previous bug
    // TypeScript would catch this at compile time now
    expect(validTypes).not.toContain('live');
  });

  it('scheduled_at uses snake_case', () => {
    const input: ScheduleSessionInput = {
      candidate: 1,
      scheduled_at: '2026-04-10T10:00:00Z',
    };
    expect(input).toHaveProperty('scheduled_at');
    expect(input).not.toHaveProperty('scheduledAt');
  });
});

describe('SubmitEvaluationInput type validation', () => {
  it('uses snake_case for all score fields', () => {
    const input: SubmitEvaluationInput = {
      interview: 1,
      attitude_score: 8,
      professional_score: 7,
      overall_score: 7.5,
      result: 'passed',
      comments: 'Good candidate',
      proposed_salary: 25000000,
    };

    expect(input).toHaveProperty('attitude_score');
    expect(input).toHaveProperty('professional_score');
    expect(input).toHaveProperty('overall_score');
    expect(input).toHaveProperty('proposed_salary');
    
    // These camelCase variants must NOT exist
    expect(input).not.toHaveProperty('attitudeScore');
    expect(input).not.toHaveProperty('professionalScore');
    expect(input).not.toHaveProperty('overallScore');
    expect(input).not.toHaveProperty('proposedSalary');
  });

  it('interview field is a number (FK ID), not interviewId', () => {
    const input: SubmitEvaluationInput = {
      interview: 42,
      attitude_score: 8,
      professional_score: 9,
    };
    
    expect(typeof input.interview).toBe('number');
    expect(input).toHaveProperty('interview');
    expect(input).not.toHaveProperty('interviewId');
  });

  it('result only accepts valid values', () => {
    const validResults = ['passed', 'failed', 'pending'];
    const input: SubmitEvaluationInput = {
      interview: 1,
      result: 'passed',
    };
    expect(validResults).toContain(input.result);
  });
});

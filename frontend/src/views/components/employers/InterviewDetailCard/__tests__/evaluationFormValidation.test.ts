import {
  buildEvaluationPayload,
  createEvaluationFormFromEvaluation,
  getEvaluationFormValidationError,
} from '../evaluationFormValidation';
import type { EvalFormType } from '../types';

const baseForm: EvalFormType = {
  attitude_score: 8,
  professional_score: 7,
  result: 'passed',
  comments: ' Good candidate ',
  proposed_salary: 25000000,
};

describe('Interview HR evaluation form validation', () => {
  it.each([
    ['attitude_score', -0.1],
    ['attitude_score', 10.1],
    ['attitude_score', Number.NaN],
    ['attitude_score', 8.123],
    ['professional_score', -0.1],
    ['professional_score', 10.1],
    ['professional_score', Number.NaN],
    ['professional_score', 7.123],
  ] as const)('rejects invalid %s value', (fieldName, value) => {
    expect(
      getEvaluationFormValidationError({
        ...baseForm,
        [fieldName]: value,
      }),
    ).toBe('scoreInvalid');
  });

  it('rejects negative proposed salary', () => {
    expect(
      getEvaluationFormValidationError({
        ...baseForm,
        proposed_salary: -1,
      }),
    ).toBe('proposedSalaryInvalid');
  });

  it('rejects decimal proposed salary before submitting to the backend integer field', () => {
    expect(
      getEvaluationFormValidationError({
        ...baseForm,
        proposed_salary: 1000.5,
      }),
    ).toBe('proposedSalaryInvalid');
  });

  it('builds a normalized snake_case payload with calculated overall score', () => {
    expect(buildEvaluationPayload(42, baseForm)).toEqual({
      interview: 42,
      attitude_score: 8,
      professional_score: 7,
      overall_score: 7.5,
      result: 'passed',
      comments: 'Good candidate',
      proposed_salary: 25000000,
    });
  });

  it('rounds calculated overall score to the backend decimal precision', () => {
    expect(
      buildEvaluationPayload(42, {
        ...baseForm,
        attitude_score: 8.12,
        professional_score: 7.13,
      }),
    ).toMatchObject({
      attitude_score: 8.12,
      professional_score: 7.13,
      overall_score: 7.63,
    });
  });

  it('hydrates professional score from the professionalScore camelCase field', () => {
    expect(
      createEvaluationFormFromEvaluation({
        id: 1,
        attitudeScore: 9,
        professionalScore: 6,
        result: 'passed',
        comments: null,
        proposedSalary: null,
      }),
    ).toEqual({
      attitude_score: 9,
      professional_score: 6,
      result: 'passed',
      comments: '',
      proposed_salary: 0,
    });
  });

  it('preserves zero values when hydrating an existing evaluation', () => {
    expect(
      createEvaluationFormFromEvaluation({
        id: 1,
        attitude_score: 0,
        professional_score: 0,
        result: 'pending',
        comments: '',
        proposed_salary: 0,
      }),
    ).toMatchObject({
      attitude_score: 0,
      professional_score: 0,
      proposed_salary: 0,
    });
  });
});

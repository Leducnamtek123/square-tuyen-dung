import type { SubmitEvaluationInput } from '@/services/interviewService';
import type { InterviewEvaluation } from '@/types/models';
import type { EvalFormType } from './types';

export type EvaluationFormValidationError =
  | 'scoreInvalid'
  | 'proposedSalaryInvalid';

const SCORE_MIN = 0;
const SCORE_MAX = 10;

const toFiniteNumber = (value: number | string): number => {
  if (value === '') return 0;
  return Number(value);
};

const isScoreValid = (value: number): boolean =>
  Number.isFinite(value) && value >= SCORE_MIN && value <= SCORE_MAX;

const firstDefined = <T>(...values: Array<T | null | undefined>): T | undefined =>
  values.find((value): value is T => value !== null && value !== undefined);

export const createEvaluationFormFromEvaluation = (
  evaluation: InterviewEvaluation,
): EvalFormType => ({
  attitude_score: firstDefined(evaluation.attitude_score, evaluation.attitudeScore, 0) ?? 0,
  professional_score: firstDefined(evaluation.professional_score, evaluation.professionalScore, 0) ?? 0,
  result: evaluation.result ?? 'pending',
  comments: evaluation.comments ?? '',
  proposed_salary: firstDefined(evaluation.proposed_salary, evaluation.proposedSalary, 0) ?? 0,
});

export const getEvaluationFormValidationError = (
  form: EvalFormType,
): EvaluationFormValidationError | null => {
  const attitudeScore = toFiniteNumber(form.attitude_score);
  const professionalScore = toFiniteNumber(form.professional_score);
  const proposedSalary = toFiniteNumber(form.proposed_salary);

  if (!isScoreValid(attitudeScore) || !isScoreValid(professionalScore)) {
    return 'scoreInvalid';
  }

  if (!Number.isFinite(proposedSalary) || proposedSalary < 0) {
    return 'proposedSalaryInvalid';
  }

  return null;
};

export const buildEvaluationPayload = (
  interviewId: number,
  form: EvalFormType,
): SubmitEvaluationInput => {
  const attitudeScore = toFiniteNumber(form.attitude_score);
  const professionalScore = toFiniteNumber(form.professional_score);

  return {
    interview: interviewId,
    attitude_score: attitudeScore,
    professional_score: professionalScore,
    overall_score: (attitudeScore + professionalScore) / 2,
    result: form.result,
    comments: form.comments.trim(),
    proposed_salary: toFiniteNumber(form.proposed_salary),
  };
};

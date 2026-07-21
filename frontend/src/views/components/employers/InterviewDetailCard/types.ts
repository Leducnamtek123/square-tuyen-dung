export interface EvalFormType {
  attitude_score: number | string;
  professional_score: number | string;
  result: 'passed' | 'failed' | 'pending';
  comments: string;
  proposed_salary: number | string;
}

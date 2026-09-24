export type SeverityLevel = 'P0' | 'P1' | 'P2' | 'P3';

export type LifecycleState =
  | 'initial'
  | 'slow_api'
  | 'success'
  | 'empty'
  | 'error_500'
  | 'error_401'
  | 'error_403'
  | 'error_404'
  | 'error_422'
  | 'error_429'
  | 'network_offline'
  | 'retry'
  | 'submitting'
  | 'double_submit'
  | 'pagination'
  | 'search'
  | 'filter'
  | 'modal'
  | 'drawer'
  | 'refresh';

export interface UXIssue {
  route: string;
  state: LifecycleState | string;
  severity: SeverityLevel;
  issue: string;
  expected: string;
  screenshot?: string;
  request?: string;
  component?: string;
  timestamp?: string;
}

export interface StateCheckResult {
  state: LifecycleState | string;
  status: 'PASS' | 'FAIL' | 'WARN';
  details?: string;
  screenshot?: string;
}

export interface StateMatrixRecord {
  route: string;
  title?: string;
  testedStates: StateCheckResult[];
  issues: UXIssue[];
}

export interface AuditSummary {
  timestamp: string;
  totalRoutesTested: number;
  totalChecks: number;
  totalIssues: number;
  p0Count: number;
  p1Count: number;
  p2Count: number;
  p3Count: number;
  records: StateMatrixRecord[];
}

export type AIAnalysisData = {
  id?: string | number;
  fullName?: string;
  jobName?: string;
  aiAnalysisStatus?: 'processing' | 'completed' | 'failed' | 'idle' | string;
  aiAnalysisProgress?: number;
  resumeFileUrl?: string;
  aiAnalysisMatchingSkills?: string | string[];
  aiAnalysisMissingSkills?: string | string[];
  aiAnalysisSkills?: string | string[];
  aiAnalysisSummary?: string;
  aiAnalysisPros?: string | string[];
  aiAnalysisCons?: string | string[];
  aiAnalysisScore?: number;
  aiAnalysisEffectiveScore?: number;
  aiAnalysisCriteria?: Array<Record<string, unknown>>;
  aiAnalysisEvidence?: {
    criteria_results?: Array<Record<string, unknown>>;
    evidence?: Array<Record<string, unknown>>;
    identity_warnings?: Array<Record<string, unknown>>;
    identityWarnings?: Array<Record<string, unknown>>;
  } | Array<Record<string, unknown>>;
  aiAnalysisReviewStatus?: 'ai_only' | 'reviewed' | 'overridden' | string;
  aiAnalysisHrOverrideScore?: number | null;
  aiAnalysisHrOverrideNote?: string | null;
  aiAnalysisReviewedAt?: string | null;
  aiAnalysisReviewedBy?: { id?: number; fullName?: string; email?: string } | null;
};

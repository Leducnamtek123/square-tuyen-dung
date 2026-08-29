import httpRequest from '../utils/httpRequest';
import { normalizePaginatedResponse, unwrapDataResponse } from '../utils/apiResponse';
import { cleanParams } from '../utils/params';
import type {
  CVTemplateRecord,
  CandidateCVListItem,
  CandidateCVRecord,
  PublicCVRecord,
  CVSuggestionRecord,
  AICvReviewResult,
} from '../types/cvBuilder';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const unwrapDetailResponse = <T>(raw: unknown): T => {
  let value = raw;
  for (let depth = 0; depth < 3; depth += 1) {
    if (!isRecord(value) || !('data' in value)) break;
    value = value.data;
  }
  return value as T;
};

export interface TemplateFilterParams extends Record<string, any> {
  category?: string;
  search?: string;
  ordering?: string;
  is_popular?: boolean;
}

export interface SuggestionFilterParams extends Record<string, any> {
  industry?: string;
  suggestion_type?: string;
  search?: string;
}

export const cvBuilderService = {
  // 1. Get List of CV Templates
  async getTemplates(params?: TemplateFilterParams): Promise<CVTemplateRecord[]> {
    const cleaned = cleanParams((params || {}) as Record<string, any>);
    const res = await httpRequest.get('cv/templates/', { params: cleaned });
    return normalizePaginatedResponse<CVTemplateRecord>(res).results;
  },

  // 2. Get Details of a CV Template
  async getTemplateDetail(idOrCode: string | number): Promise<CVTemplateRecord> {
    const res = await httpRequest.get(`cv/templates/${idOrCode}/`);
    return unwrapDetailResponse<CVTemplateRecord>(res);
  },

  // 3. Get Candidate's Saved CVs List
  async getCandidateCVs(params?: { search?: string; ordering?: string }): Promise<CandidateCVListItem[]> {
    const cleaned = cleanParams(params || {});
    const res = await httpRequest.get('cv/candidate-cvs/', { params: cleaned });
    return normalizePaginatedResponse<CandidateCVListItem>(res).results;
  },

  // 4. Get Candidate's Saved CV Details
  async getCandidateCVDetail(id: number | string): Promise<CandidateCVRecord> {
    const res = await httpRequest.get(`cv/candidate-cvs/${id}/`);
    return unwrapDetailResponse<CandidateCVRecord>(res);
  },

  // 5. Create a new Candidate CV
  async createCandidateCV(payload: {
    template?: number | null;
    template_code: string;
    title: string;
    theme_config: any;
    cv_data: any;
    thumbnail_url?: string | null;
    is_main_cv?: boolean;
    is_public?: boolean;
  }): Promise<CandidateCVRecord> {
    const res = await httpRequest.post('cv/candidate-cvs/', payload);
    return unwrapDetailResponse<CandidateCVRecord>(res);
  },

  // 6. Update / Auto-Save Candidate CV
  async updateCandidateCV(
    id: number | string,
    payload: {
      template?: number | null;
      template_code?: string;
      title?: string;
      theme_config?: any;
      cv_data?: any;
      thumbnail_url?: string | null;
      pdf_url?: string | null;
      is_main_cv?: boolean;
      is_public?: boolean;
    }
  ): Promise<CandidateCVRecord> {
    const res = await httpRequest.patch(`cv/candidate-cvs/${id}/`, payload);
    return unwrapDetailResponse<CandidateCVRecord>(res);
  },

  // 7. Duplicate a Candidate CV
  async duplicateCandidateCV(id: number | string): Promise<CandidateCVRecord> {
    const res = await httpRequest.post(`cv/candidate-cvs/${id}/duplicate/`);
    return unwrapDetailResponse<CandidateCVRecord>(res);
  },

  // 8. Set as Primary / Main CV
  async setMainCandidateCV(id: number | string): Promise<{ detail: string; id: number }> {
    const res = await httpRequest.post(`cv/candidate-cvs/${id}/set-main/`);
    return unwrapDetailResponse<{ detail: string; id: number }>(res);
  },

  // 9. Delete a Candidate CV
  async deleteCandidateCV(id: number | string): Promise<void> {
    await httpRequest.delete(`cv/candidate-cvs/${id}/`);
  },

  // 10. Get Public Web CV by Slug
  async getPublicCV(slug: string): Promise<PublicCVRecord> {
    const res = await httpRequest.get(`cv/public/${slug}/`);
    return unwrapDetailResponse<PublicCVRecord>(res);
  },

  // 11. Get Industry Writing Suggestions
  async getSuggestions(params?: SuggestionFilterParams): Promise<CVSuggestionRecord[]> {
    const cleaned = cleanParams((params || {}) as Record<string, any>);
    const res = await httpRequest.get('cv/suggestions/', { params: cleaned });
    return normalizePaginatedResponse<CVSuggestionRecord>(res).results;
  },

  // 12. Review CV With AI (ATS Scoring & Optimization)
  async reviewCvWithAI(id: number | string): Promise<AICvReviewResult> {
    const res = await httpRequest.post(`cv/candidate-cvs/${id}/ai-review/`);
    return unwrapDetailResponse<AICvReviewResult>(res);
  },
};

export default cvBuilderService;

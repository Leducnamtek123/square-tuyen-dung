import httpRequest from '../utils/httpRequest';
import { normalizePaginatedResponse, unwrapDataResponse } from '../utils/apiResponse';
import { cleanParams } from '../utils/params';
import type { PaginatedResponse } from '../types/api';
import type { VoiceProfile, VoiceProfileGrant, VoiceProfileSample } from '../types/models';
import type { AdminListParams } from './adminManagementService';

type IdType = string | number;

export type VoiceProfilePayload = {
  name: string;
  description?: string;
  language?: string;
  voice_type?: 'cloned' | 'preset';
  status?: string;
  preset_voice_id?: string;
  preset_engine?: string;
  consent_confirmed?: boolean;
};

export type VoiceProfileGrantPayload = {
  company?: IdType | null;
  jobPost?: IdType | null;
  isDefault?: boolean;
  isActive?: boolean;
  note?: string;
};

const multipartConfig = { headers: { 'Content-Type': 'multipart/form-data' } };

const voiceProfileService = {
  getVoiceProfiles: (params: AdminListParams = {}): Promise<PaginatedResponse<VoiceProfile>> => {
    return (httpRequest.get('interview/web/voice-profiles/', {
      params: cleanParams(params),
    }) as Promise<unknown>).then((data) => normalizePaginatedResponse<VoiceProfile>(data));
  },

  createVoiceProfile: (data: VoiceProfilePayload): Promise<VoiceProfile> => {
    return (httpRequest.post('interview/web/voice-profiles/', data) as Promise<unknown>)
      .then(unwrapDataResponse<VoiceProfile>);
  },

  updateVoiceProfile: (id: IdType, data: Partial<VoiceProfilePayload>): Promise<VoiceProfile> => {
    return (httpRequest.patch(`interview/web/voice-profiles/${id}/`, data) as Promise<unknown>)
      .then(unwrapDataResponse<VoiceProfile>);
  },

  deleteVoiceProfile: (id: IdType): Promise<void> => {
    return httpRequest.delete(`interview/web/voice-profiles/${id}/`);
  },

  uploadSample: (id: IdType, data: FormData): Promise<VoiceProfileSample> => {
    return (httpRequest.post(`interview/web/voice-profiles/${id}/samples/`, data, multipartConfig) as Promise<unknown>)
      .then(unwrapDataResponse<VoiceProfileSample>);
  },

  createGrant: (id: IdType, data: VoiceProfileGrantPayload): Promise<VoiceProfileGrant> => {
    return (httpRequest.post(`interview/web/voice-profiles/${id}/grants/`, data) as Promise<unknown>)
      .then(unwrapDataResponse<VoiceProfileGrant>);
  },

  deleteGrant: (id: IdType): Promise<void> => {
    return httpRequest.delete(`interview/admin/voice-profile-grants/${id}/`);
  },
};

export default voiceProfileService;

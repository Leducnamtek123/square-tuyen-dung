import httpRequest from '../utils/httpRequest';
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
    return httpRequest.get<PaginatedResponse<VoiceProfile>>('interview/web/voice-profiles/', {
      params: cleanParams(params),
    });
  },

  createVoiceProfile: (data: VoiceProfilePayload): Promise<VoiceProfile> => {
    return httpRequest.post<VoiceProfile>('interview/web/voice-profiles/', data);
  },

  updateVoiceProfile: (id: IdType, data: Partial<VoiceProfilePayload>): Promise<VoiceProfile> => {
    return httpRequest.patch<VoiceProfile>(`interview/web/voice-profiles/${id}/`, data);
  },

  deleteVoiceProfile: (id: IdType): Promise<void> => {
    return httpRequest.delete(`interview/web/voice-profiles/${id}/`);
  },

  uploadSample: (id: IdType, data: FormData): Promise<VoiceProfileSample> => {
    return httpRequest.post<VoiceProfileSample>(`interview/web/voice-profiles/${id}/samples/`, data, multipartConfig);
  },

  createGrant: (id: IdType, data: VoiceProfileGrantPayload): Promise<VoiceProfileGrant> => {
    return httpRequest.post<VoiceProfileGrant>(`interview/web/voice-profiles/${id}/grants/`, data);
  },

  deleteGrant: (id: IdType): Promise<void> => {
    return httpRequest.delete(`interview/admin/voice-profile-grants/${id}/`);
  },
};

export default voiceProfileService;

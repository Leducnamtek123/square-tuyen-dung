export interface FormValues {
  job_post: string | number;
  candidate: string | number;
  scheduled_at: string;
  voice_profile: string | number;
  selected_group: string | number;
  selected_questions: number[];

  // AI Studio & Avatar Parameters
  ai_avatar_id?: string;
  avatar_image_url?: string;
  avatar_backdrop?: string;
  avatar_background_url?: string;
  interviewer_name?: string;
  ai_voice?: string;
  ai_speed?: number;
}


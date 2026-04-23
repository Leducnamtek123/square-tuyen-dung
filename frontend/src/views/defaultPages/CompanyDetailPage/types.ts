import type { Company } from "../../../types/models";

type CompanyDetailLocation = {
  address?: string;
  lat?: number;
  lng?: number;
  city?: number;
  district?: number;
  ward?: number;
};

export type CompanyDetailProps = Omit<Partial<Company>, 'location'> & {
  location?: CompanyDetailLocation | null;
  facebookUrl?: string;
  youtubeUrl?: string;
  linkedinUrl?: string;
  followNumber?: number;
  isFollowed?: boolean;
  companyImages?: { imageUrl: string }[];
};

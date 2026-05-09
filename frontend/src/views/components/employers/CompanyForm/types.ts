type EditorState = import('draft-js').EditorState;

export interface CompanyFormValues {
  companyName: string;
  taxCode: string;
  employeeSize: number;
  fieldOperation: string;
  location: {
    city: number | string;
    district: number | string;
    address: string;
    lat: number | string;
    lng: number | string;
  };
  since?: string | Date | null;
  companyEmail: string;
  companyPhone: string;
  websiteUrl?: string;
  facebookUrl?: string;
  youtubeUrl?: string;
  linkedinUrl?: string;
  description?: EditorState;
}

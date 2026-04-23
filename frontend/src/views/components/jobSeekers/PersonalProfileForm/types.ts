export interface PersonalProfileFormValues {
  user: {
    fullName: string;
  };
  phone: string;
  birthday: Date | string | null;
  gender: string;
  maritalStatus: string;
  location: {
    city: number | string;
    district: number | string;
    address: string;
  };
  idCardNumber?: string;
  idCardIssueDate?: Date | null;
  idCardIssuePlace?: string;
  taxCode?: string;
  socialInsuranceNo?: string;
  permanentAddress?: string;
  contactAddress?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

export interface PersonalProfileFormProps {
  handleUpdateProfile: (data: PersonalProfileFormValues) => void;
  editData: Partial<PersonalProfileFormValues> | null;
}

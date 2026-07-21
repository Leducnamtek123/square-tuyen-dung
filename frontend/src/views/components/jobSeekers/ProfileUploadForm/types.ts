export interface FormValues {
  file: File | File[] | null;
  title: string;
  position: number | string;
  academicLevel: number | string;
  experience: number | string;
  career: number | string;
  city: number | string;
  salaryMin: number;
  salaryMax: number;
  typeOfWorkplace: number | string;
  jobType: number | string;
  description: string;
  skillsSummary: string;
}

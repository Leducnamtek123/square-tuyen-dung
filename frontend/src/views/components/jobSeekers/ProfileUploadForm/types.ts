export interface FormValues {
  file: File[] | null;
  title: string;
  position: number | string;
  academicLevel: number | string;
  experience: number | string;
  career: number | string;
  city: number | string;
  salaryMin: number;
  salaryMax: number;
  expectedSalary: number | null;
  typeOfWorkplace: number | string;
  jobType: number | string;
  description: string;
  skillsSummary: string;
}

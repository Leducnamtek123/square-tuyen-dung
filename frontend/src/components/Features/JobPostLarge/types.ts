export interface JobPostLargeProps {
  id: string | number;
  slug: string;
  companyImageUrl?: string;
  companyName: string;
  jobName: string;
  cityId: number | string | undefined;
  deadline: string | Date;
  isUrgent?: boolean;
  isHot?: boolean;
  salaryMin?: number;
  salaryMax?: number;
}

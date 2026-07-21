import React from 'react';
import jobPostActivityService from '../../../../services/jobPostActivityService';
import RightSidebarRenderer from './RightSidebarRenderer';

interface JobPostChatActivityData {
  id: string;
  userId: string;
  fullName?: string;
  userEmail?: string;
  companyId?: string;
  companySlug?: string;
  companyName?: string;
  companyImageUrl?: string;
  jobPostTitle?: string;
}

interface AppliedResumeChatData {
  id: string;
  userId: string;
  fullName?: string;
  userEmail?: string;
  avatarUrl?: string;
  jobPostTitle?: string;
}

const RightSidebar = () => {
  return (
    <RightSidebarRenderer
      titleKey="appliedJobs"
      noDataKey="noAppliedJobs"
      fetchData={(params) => jobPostActivityService.getJobPostChatActivity<JobPostChatActivityData>(params)}
      mapDataToUI={(value) => ({
        id: value.id,
        imageUrl: value?.companyImageUrl || '',
        primaryText: value?.jobPostTitle || '',
        secondaryText: value?.companyName || '',
        partnerId: value?.userId || '',
        userDataWrapper: {
          userId: value?.userId,
          name: value?.fullName,
          email: value?.userEmail,
          avatarUrl: value?.companyImageUrl,
          company: {
            companyId: value?.companyId,
            slug: value?.companySlug,
            companyName: value?.companyName,
            imageUrl: value?.companyImageUrl,
          },
        }
      })}
    />
  );
};

const EmployerSidebar = () => {
  return (
    <RightSidebarRenderer
      titleKey="candidates"
      noDataKey="noCandidates"
      fetchData={(params) => jobPostActivityService.getAppliedResumeChat<AppliedResumeChatData>(params)}
      mapDataToUI={(value) => ({
        id: value.id,
        imageUrl: value?.avatarUrl || '',
        primaryText: value?.fullName || '',
        secondaryText: value?.jobPostTitle || '',
        partnerId: value?.userId || '',
        userDataWrapper: {
          userId: value?.userId,
          name: value?.fullName,
          email: value?.userEmail,
          avatarUrl: value?.avatarUrl,
          company: null,
        }
      })}
    />
  );
};

const MainRightSidebar = Object.assign(RightSidebar, { Employer: EmployerSidebar });

export default MainRightSidebar;

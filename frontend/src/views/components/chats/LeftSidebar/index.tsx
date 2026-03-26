import React from 'react';
import SidebarRenderer from './SidebarRenderer';

const LeftSidebar = () => {
  return (
    <SidebarRenderer
      searchPlaceholderKey="searchPlaceholderCompany"
      getSubtextName={(user) => `${user?.company?.companyName || '---'}`}
    />
  );
};

const EmployerSidebar = () => {
  return (
    <SidebarRenderer
      searchPlaceholderKey="searchPlaceholderCandidate"
      getSubtextName={(user) => `${user?.email || '---'}`}
    />
  );
};

const MainLeftSidebar = Object.assign(LeftSidebar, { Employer: EmployerSidebar });
export default MainLeftSidebar;

import React from 'react';
import SidebarRenderer from './SidebarRenderer';

const LeftSidebar = () => {
  return (
    <SidebarRenderer
      searchPlaceholderKey="searchPlaceholderCompany"
      getSubtextName={(user) => {
        const cName = user?.company?.companyName;
        const uName = user?.name;
        if (cName && uName && cName !== uName) return cName;
        return user?.email || cName || '';
      }}
    />
  );
};

const EmployerSidebar = () => {
  return (
    <SidebarRenderer
      searchPlaceholderKey="searchPlaceholderCandidate"
      getSubtextName={(user) => user?.email || ''}
    />
  );
};

const MainLeftSidebar = Object.assign(LeftSidebar, { Employer: EmployerSidebar });
export default MainLeftSidebar;

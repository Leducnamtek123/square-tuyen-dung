'use client';

import React from 'react';
import { Collapse, List, ListItem } from '@mui/material';
import GridViewIcon from '@mui/icons-material/GridView';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import { ROUTES } from '@/configs/constants';
import MenuItem from './MenuItem';

interface AdminMenuProps {
  t: (key: string) => string;
  location: { pathname?: string };
  expandedItems: Record<string, boolean>;
  handleExpand: (section: string) => void;
}

const AdminMenu = ({ t, location, expandedItems, handleExpand }: AdminMenuProps) => {
  return (
    <>
      <ListItem disablePadding>
        <MenuItem icon={GridViewIcon} text={t('admin:sidebar.systemOverview')} to={`/${ROUTES.ADMIN.DASHBOARD}`} state={{ selected: location.pathname === `/${ROUTES.ADMIN.DASHBOARD}` }} />
      </ListItem>
      <ListItem disablePadding>
        <MenuItem icon={AccountCircleOutlinedIcon} text={t('admin:sidebar.systemAndUsers')} kind="group" state={{ expanded: expandedItems.system }} onClick={() => handleExpand('system')} />
      </ListItem>
      <Collapse in={expandedItems.system} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <MenuItem text={t('admin:sidebar.usersAndPermissions')} to={`/${ROUTES.ADMIN.USERS}`} kind="child" state={{ selected: location.pathname === `/${ROUTES.ADMIN.USERS}` }} />
          <MenuItem text={t('admin:sidebar.systemConfiguration')} to={`/${ROUTES.ADMIN.SETTINGS}`} kind="child" state={{ selected: location.pathname === `/${ROUTES.ADMIN.SETTINGS}` }} />
        </List>
      </Collapse>
      
      <ListItem disablePadding>
        <MenuItem icon={BusinessOutlinedIcon} text={t('admin:sidebar.generalCategories')} kind="group" state={{ expanded: expandedItems.categories }} onClick={() => handleExpand('categories')} />
      </ListItem>
      <Collapse in={expandedItems.categories} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <MenuItem text={t('admin:sidebar.careersManagement')} to={`/${ROUTES.ADMIN.CAREERS}`} kind="child" state={{ selected: location.pathname === `/${ROUTES.ADMIN.CAREERS}` }} />
          <MenuItem text={t('admin:sidebar.citiesManagement')} to={`/${ROUTES.ADMIN.CITIES}`} kind="child" state={{ selected: location.pathname === `/${ROUTES.ADMIN.CITIES}` }} />
          <MenuItem text={t('admin:sidebar.districtsManagement')} to={`/${ROUTES.ADMIN.DISTRICTS}`} kind="child" state={{ selected: location.pathname === `/${ROUTES.ADMIN.DISTRICTS}` }} />
          <MenuItem text={t('admin:sidebar.wardsManagement')} to={`/${ROUTES.ADMIN.WARDS}`} kind="child" state={{ selected: location.pathname === `/${ROUTES.ADMIN.WARDS}` }} />
        </List>
      </Collapse>

      <ListItem disablePadding>
        <MenuItem icon={BusinessOutlinedIcon} text={t('admin:sidebar.contentManagement')} kind="group" state={{ expanded: expandedItems.content }} onClick={() => handleExpand('content')} />
      </ListItem>
      <Collapse in={expandedItems.content} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <MenuItem text={t('admin:sidebar.bannersManagement')} to={`/${ROUTES.ADMIN.BANNERS}`} kind="child" state={{ selected: location.pathname === `/${ROUTES.ADMIN.BANNERS}` }} />
          <MenuItem text="Banner Types" to={`/${ROUTES.ADMIN.BANNER_TYPES}`} kind="child" state={{ selected: location.pathname === `/${ROUTES.ADMIN.BANNER_TYPES}` }} />
          <MenuItem text={t('admin:sidebar.feedbacksManagement')} to={`/${ROUTES.ADMIN.FEEDBACKS}`} kind="child" state={{ selected: location.pathname === `/${ROUTES.ADMIN.FEEDBACKS}` }} />
          <MenuItem text={t('admin:sidebar.articlesManagement')} to={`/${ROUTES.ADMIN.ARTICLES}`} kind="child" state={{ selected: location.pathname?.startsWith(`/${ROUTES.ADMIN.ARTICLES}`) ?? false }} />
          <MenuItem text={t('admin:sidebar.chatWithEmployers')} to={`/${ROUTES.ADMIN.CHAT}`} kind="child" state={{ selected: location.pathname === `/${ROUTES.ADMIN.CHAT}` }} />
        </List>
      </Collapse>

      <ListItem disablePadding>
        <MenuItem icon={BusinessOutlinedIcon} text={t('admin:sidebar.infoAndProfiles')} kind="group" state={{ expanded: expandedItems.profiles }} onClick={() => handleExpand('profiles')} />
      </ListItem>
      <Collapse in={expandedItems.profiles} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <MenuItem text={t('admin:sidebar.companyManagement')} to={`/${ROUTES.ADMIN.COMPANIES}`} kind="child" state={{ selected: location.pathname === `/${ROUTES.ADMIN.COMPANIES}` }} />
          <MenuItem text={t('admin:sidebar.candidateProfiles')} to={`/${ROUTES.ADMIN.PROFILES}`} kind="child" state={{ selected: location.pathname === `/${ROUTES.ADMIN.PROFILES}` }} />
          <MenuItem text={t('admin:sidebar.resumeManagement')} to={`/${ROUTES.ADMIN.RESUMES}`} kind="child" state={{ selected: location.pathname === `/${ROUTES.ADMIN.RESUMES}` }} />
        </List>
      </Collapse>

      <ListItem disablePadding>
        <MenuItem icon={FactCheckOutlinedIcon} text={t('admin:sidebar.recruitmentAndInterviews')} kind="group" state={{ expanded: expandedItems.recruitment }} onClick={() => handleExpand('recruitment')} />
      </ListItem>
      <Collapse in={expandedItems.recruitment} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <MenuItem text={t('admin:sidebar.jobPosts')} to={`/${ROUTES.ADMIN.JOBS}`} kind="child" state={{ selected: location.pathname === `/${ROUTES.ADMIN.JOBS}` }} />
          <MenuItem text={t('admin:sidebar.activityLogs')} to={`/${ROUTES.ADMIN.JOB_ACTIVITY}`} kind="child" state={{ selected: location.pathname === `/${ROUTES.ADMIN.JOB_ACTIVITY}` }} />
          <MenuItem text={t('admin:sidebar.interviewSchedule')} to={`/${ROUTES.ADMIN.INTERVIEWS}`} kind="child" state={{ selected: location.pathname === `/${ROUTES.ADMIN.INTERVIEWS}` }} />
          <MenuItem text={t('admin:sidebar.jobNotifications')} to={`/${ROUTES.ADMIN.JOB_NOTIFICATIONS}`} kind="child" state={{ selected: location.pathname === `/${ROUTES.ADMIN.JOB_NOTIFICATIONS}` }} />
          <MenuItem icon={VideoLibraryIcon} text="Interview UI Preview" to="/admin/interview-preview" kind="child" state={{ selected: location.pathname === '/admin/interview-preview' }} />
        </List>
      </Collapse>
    </>
  );
};

export default AdminMenu;



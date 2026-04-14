import React from 'react';
import { Collapse, List, ListItem } from '@mui/material';
import GridViewIcon from '@mui/icons-material/GridView';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import { ROUTES } from '@/configs/constants';
import MenuItem from './MenuItem';

interface AdminMenuProps {
  t: (key: string) => string;
  location: Record<string, unknown>;
  expandedItems: Record<string, boolean>;
  handleExpand: (section: string) => void;
}

const AdminMenu = ({ t, location, expandedItems, handleExpand }: AdminMenuProps) => {
  return (
    <>
      <ListItem disablePadding>
        <MenuItem icon={GridViewIcon} text={t('admin:sidebar.systemOverview')} to={`/${ROUTES.ADMIN.DASHBOARD}`} isSelected={location.pathname === `/${ROUTES.ADMIN.DASHBOARD}`} />
      </ListItem>
      <ListItem disablePadding>
        <MenuItem icon={AccountCircleOutlinedIcon} text={t('admin:sidebar.systemAndUsers')} hasChildren isExpanded={expandedItems.system} onClick={() => handleExpand('system')} />
      </ListItem>
      <Collapse in={expandedItems.system} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <MenuItem text={t('admin:sidebar.usersAndPermissions')} to={`/${ROUTES.ADMIN.USERS}`} isSelected={location.pathname === `/${ROUTES.ADMIN.USERS}`} isChild />
          <MenuItem text={t('admin:sidebar.systemConfiguration')} to={`/${ROUTES.ADMIN.SETTINGS}`} isSelected={location.pathname === `/${ROUTES.ADMIN.SETTINGS}`} isChild />
        </List>
      </Collapse>
      
      <ListItem disablePadding>
        <MenuItem icon={BusinessOutlinedIcon} text={t('admin:sidebar.generalCategories')} hasChildren isExpanded={expandedItems.categories} onClick={() => handleExpand('categories')} />
      </ListItem>
      <Collapse in={expandedItems.categories} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <MenuItem text={t('admin:sidebar.careersManagement')} to={`/${ROUTES.ADMIN.CAREERS}`} isSelected={location.pathname === `/${ROUTES.ADMIN.CAREERS}`} isChild />
          <MenuItem text={t('admin:sidebar.citiesManagement')} to={`/${ROUTES.ADMIN.CITIES}`} isSelected={location.pathname === `/${ROUTES.ADMIN.CITIES}`} isChild />
          <MenuItem text={t('admin:sidebar.districtsManagement')} to={`/${ROUTES.ADMIN.DISTRICTS}`} isSelected={location.pathname === `/${ROUTES.ADMIN.DISTRICTS}`} isChild />
          <MenuItem text={t('admin:sidebar.wardsManagement')} to={`/${ROUTES.ADMIN.WARDS}`} isSelected={location.pathname === `/${ROUTES.ADMIN.WARDS}`} isChild />
        </List>
      </Collapse>

      <ListItem disablePadding>
        <MenuItem icon={BusinessOutlinedIcon} text={t('admin:sidebar.contentManagement')} hasChildren isExpanded={expandedItems.content} onClick={() => handleExpand('content')} />
      </ListItem>
      <Collapse in={expandedItems.content} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <MenuItem text={t('admin:sidebar.bannersManagement')} to={`/${ROUTES.ADMIN.BANNERS}`} isSelected={location.pathname === `/${ROUTES.ADMIN.BANNERS}`} isChild />
          <MenuItem text={t('admin:sidebar.feedbacksManagement')} to={`/${ROUTES.ADMIN.FEEDBACKS}`} isSelected={location.pathname === `/${ROUTES.ADMIN.FEEDBACKS}`} isChild />
          <MenuItem text={t('admin:sidebar.chatWithEmployers')} to={`/${ROUTES.ADMIN.CHAT}`} isSelected={location.pathname === `/${ROUTES.ADMIN.CHAT}`} isChild />
        </List>
      </Collapse>

      <ListItem disablePadding>
        <MenuItem icon={BusinessOutlinedIcon} text={t('admin:sidebar.infoAndProfiles')} hasChildren isExpanded={expandedItems.profiles} onClick={() => handleExpand('profiles')} />
      </ListItem>
      <Collapse in={expandedItems.profiles} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <MenuItem text={t('admin:sidebar.companyManagement')} to={`/${ROUTES.ADMIN.COMPANIES}`} isSelected={location.pathname === `/${ROUTES.ADMIN.COMPANIES}`} isChild />
          <MenuItem text={t('admin:sidebar.candidateProfiles')} to={`/${ROUTES.ADMIN.PROFILES}`} isSelected={location.pathname === `/${ROUTES.ADMIN.PROFILES}`} isChild />
          <MenuItem text={t('admin:sidebar.resumeManagement')} to={`/${ROUTES.ADMIN.RESUMES}`} isSelected={location.pathname === `/${ROUTES.ADMIN.RESUMES}`} isChild />
        </List>
      </Collapse>

      <ListItem disablePadding>
        <MenuItem icon={FactCheckOutlinedIcon} text={t('admin:sidebar.recruitmentAndInterviews')} hasChildren isExpanded={expandedItems.recruitment} onClick={() => handleExpand('recruitment')} />
      </ListItem>
      <Collapse in={expandedItems.recruitment} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <MenuItem text={t('admin:sidebar.jobPosts')} to={`/${ROUTES.ADMIN.JOBS}`} isSelected={location.pathname === `/${ROUTES.ADMIN.JOBS}`} isChild />
          <MenuItem text={t('admin:sidebar.activityLogs')} to={`/${ROUTES.ADMIN.JOB_ACTIVITY}`} isSelected={location.pathname === `/${ROUTES.ADMIN.JOB_ACTIVITY}`} isChild />
          <MenuItem text={t('admin:sidebar.interviewSchedule')} to={`/${ROUTES.ADMIN.INTERVIEWS}`} isSelected={location.pathname === `/${ROUTES.ADMIN.INTERVIEWS}`} isChild />
          <MenuItem text={t('admin:sidebar.jobNotifications')} to={`/${ROUTES.ADMIN.JOB_NOTIFICATIONS}`} isSelected={location.pathname === `/${ROUTES.ADMIN.JOB_NOTIFICATIONS}`} isChild />
        </List>
      </Collapse>
    </>
  );
};

export default AdminMenu;

import React from 'react';
import { Collapse, List, ListItem } from '@mui/material';
import GridViewIcon from '@mui/icons-material/GridView';
import ListAltOutlinedIcon from '@mui/icons-material/ListAltOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import { ROUTES, APP_NAME } from '@/configs/constants';
import MenuItem from './MenuItem';

interface EmployerMenuProps {
  t: (key: string) => string;
  location: Record<string, unknown>;
  expandedItems: Record<string, boolean>;
  handleExpand: (section: string) => void;
}

const EmployerMenu = ({ t, location, expandedItems, handleExpand }: EmployerMenuProps) => {
  return (
    <>
      <ListItem disablePadding>
        <MenuItem icon={GridViewIcon} text={t('employer:sidebar.dashboard')} to={`/${ROUTES.EMPLOYER.DASHBOARD}`} isSelected={location.pathname === `/${ROUTES.EMPLOYER.DASHBOARD}`} />
      </ListItem>

      <ListItem disablePadding>
        <MenuItem icon={ListAltOutlinedIcon} text={t('employer:sidebar.jobPostList')} to={`/${ROUTES.EMPLOYER.JOB_POST}`} isSelected={location.pathname === `/${ROUTES.EMPLOYER.JOB_POST}`} />
      </ListItem>

      <ListItem disablePadding>
        <MenuItem icon={FactCheckOutlinedIcon} text={t('employer:sidebar.candidateManagement')} hasChildren isExpanded={expandedItems.candidates} onClick={() => handleExpand('candidates')} />
      </ListItem>
      <Collapse in={expandedItems.candidates} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <MenuItem text={t('employer:sidebar.appliedApplications')} to={`/${ROUTES.EMPLOYER.APPLIED_PROFILE}`} isSelected={location.pathname === `/${ROUTES.EMPLOYER.APPLIED_PROFILE}`} isChild />
          <MenuItem text={t('employer:sidebar.savedProfiles')} to={`/${ROUTES.EMPLOYER.SAVED_PROFILE}`} isSelected={location.pathname === `/${ROUTES.EMPLOYER.SAVED_PROFILE}`} isChild />
          <MenuItem text={t('employer:sidebar.findCandidates')} to={`/${ROUTES.EMPLOYER.PROFILE}`} isSelected={location.pathname === `/${ROUTES.EMPLOYER.PROFILE}`} isChild />
        </List>
      </Collapse>

      <ListItem disablePadding>
        <MenuItem icon={FactCheckOutlinedIcon} text={t('employer:sidebar.onlineInterviews')} hasChildren isExpanded={expandedItems.interviews} onClick={() => handleExpand('interviews')} />
      </ListItem>
      <Collapse in={expandedItems.interviews} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <MenuItem text={t('employer:sidebar.interviewList')} to={`/${ROUTES.EMPLOYER.INTERVIEW_LIST}`} isSelected={location.pathname === `/${ROUTES.EMPLOYER.INTERVIEW_LIST}`} isChild />
          <MenuItem text={t('employer:sidebar.interviewLive')} to={`/${ROUTES.EMPLOYER.INTERVIEW_LIVE}`} isSelected={location.pathname === `/${ROUTES.EMPLOYER.INTERVIEW_LIVE}`} isChild />
          <MenuItem text={t('employer:sidebar.questionBank')} to={`/${ROUTES.EMPLOYER.QUESTION_BANK}`} isSelected={location.pathname === `/${ROUTES.EMPLOYER.QUESTION_BANK}`} isChild />
          <MenuItem text={t('employer:sidebar.questionSets')} to={`/${ROUTES.EMPLOYER.QUESTION_GROUPS}`} isSelected={location.pathname === `/${ROUTES.EMPLOYER.QUESTION_GROUPS}`} isChild />
        </List>
      </Collapse>

      <ListItem disablePadding>
        <MenuItem icon={NotificationsNoneOutlinedIcon} text={`${APP_NAME} ${t('employer:sidebar.notifications')}`} to={`/${ROUTES.EMPLOYER.NOTIFICATION}`} isSelected={location.pathname === `/${ROUTES.EMPLOYER.NOTIFICATION}`} />
      </ListItem>

      <ListItem disablePadding>
        <MenuItem icon={BusinessOutlinedIcon} text={t('employer:sidebar.accountManagement')} hasChildren isExpanded={expandedItems.account} onClick={() => handleExpand('account')} />
      </ListItem>
      <Collapse in={expandedItems.account} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <MenuItem text={t('employer:sidebar.companyInfo')} to={`/${ROUTES.EMPLOYER.COMPANY}`} isSelected={location.pathname === `/${ROUTES.EMPLOYER.COMPANY}`} isChild />
          <MenuItem text={t('employer:sidebar.employerVerification')} to={`/${ROUTES.EMPLOYER.VERIFICATION}`} isSelected={location.pathname === `/${ROUTES.EMPLOYER.VERIFICATION}`} isChild />
          <MenuItem text={t('employer:sidebar.account')} to={`/${ROUTES.EMPLOYER.ACCOUNT}`} isSelected={location.pathname === `/${ROUTES.EMPLOYER.ACCOUNT}`} isChild />
          <MenuItem text={t('employer:sidebar.settings')} to={`/${ROUTES.EMPLOYER.SETTING}`} isSelected={location.pathname === `/${ROUTES.EMPLOYER.SETTING}`} isChild />
        </List>
      </Collapse>

      <ListItem disablePadding>
        <MenuItem icon={GroupsOutlinedIcon} text={t('employer:sidebar.employeeRoles')} to={`/${ROUTES.EMPLOYER.EMPLOYEES}`} isSelected={location.pathname === `/${ROUTES.EMPLOYER.EMPLOYEES}`} />
      </ListItem>
    </>
  );
};

export default EmployerMenu;

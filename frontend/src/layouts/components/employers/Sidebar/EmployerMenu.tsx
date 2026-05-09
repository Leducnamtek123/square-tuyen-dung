'use client';

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
  t: (key: string, options?: any) => string;
  location: { pathname?: string };
  expandedItems: Record<string, boolean>;
  handleExpand: (section: string) => void;
}

const EmployerMenu = ({ t, location, expandedItems, handleExpand }: EmployerMenuProps) => {
  return (
    <>
      <ListItem disablePadding>
        <MenuItem icon={GridViewIcon} text={t('employer:sidebar.dashboard')} to={`/${ROUTES.EMPLOYER.DASHBOARD}`} state={{ selected: location.pathname === `/${ROUTES.EMPLOYER.DASHBOARD}` }} />
      </ListItem>

      <ListItem disablePadding>
        <MenuItem icon={ListAltOutlinedIcon} text={t('employer:sidebar.jobPostList')} to={`/${ROUTES.EMPLOYER.JOB_POST}`} state={{ selected: location.pathname === `/${ROUTES.EMPLOYER.JOB_POST}` }} />
      </ListItem>

      <ListItem disablePadding>
        <MenuItem icon={FactCheckOutlinedIcon} text={t('employer:sidebar.candidateManagement')} kind="group" state={{ expanded: expandedItems.candidates }} onClick={() => handleExpand('candidates')} />
      </ListItem>
      <Collapse in={expandedItems.candidates} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <MenuItem text={t('employer:sidebar.appliedApplications')} to={`/${ROUTES.EMPLOYER.APPLIED_PROFILE}`} kind="child" state={{ selected: location.pathname === `/${ROUTES.EMPLOYER.APPLIED_PROFILE}` }} />
          <MenuItem text={t('employer:sidebar.savedProfiles')} to={`/${ROUTES.EMPLOYER.SAVED_PROFILE}`} kind="child" state={{ selected: location.pathname === `/${ROUTES.EMPLOYER.SAVED_PROFILE}` }} />
          <MenuItem text={t('employer:sidebar.findCandidates')} to={`/${ROUTES.EMPLOYER.PROFILE}`} kind="child" state={{ selected: location.pathname === `/${ROUTES.EMPLOYER.PROFILE}` }} />
        </List>
      </Collapse>

      <ListItem disablePadding>
        <MenuItem icon={FactCheckOutlinedIcon} text={t('employer:sidebar.onlineInterviews')} kind="group" state={{ expanded: expandedItems.interviews }} onClick={() => handleExpand('interviews')} />
      </ListItem>
      <Collapse in={expandedItems.interviews} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <MenuItem text={t('employer:sidebar.interviewList')} to={`/${ROUTES.EMPLOYER.INTERVIEW_LIST}`} kind="child" state={{ selected: location.pathname === `/${ROUTES.EMPLOYER.INTERVIEW_LIST}` }} />
          <MenuItem text={t('employer:sidebar.interviewLive')} to={`/${ROUTES.EMPLOYER.INTERVIEW_LIVE}`} kind="child" state={{ selected: location.pathname === `/${ROUTES.EMPLOYER.INTERVIEW_LIVE}` }} />
          <MenuItem text={t('employer:sidebar.questionBank')} to={`/${ROUTES.EMPLOYER.QUESTION_BANK}`} kind="child" state={{ selected: location.pathname === `/${ROUTES.EMPLOYER.QUESTION_BANK}` }} />
          <MenuItem text={t('employer:sidebar.questionSets')} to={`/${ROUTES.EMPLOYER.QUESTION_GROUPS}`} kind="child" state={{ selected: location.pathname === `/${ROUTES.EMPLOYER.QUESTION_GROUPS}` }} />
        </List>
      </Collapse>

      <ListItem disablePadding>
        <MenuItem icon={NotificationsNoneOutlinedIcon} text={`${APP_NAME} ${t('employer:sidebar.notifications')}`} to={`/${ROUTES.EMPLOYER.NOTIFICATION}`} state={{ selected: location.pathname === `/${ROUTES.EMPLOYER.NOTIFICATION}` }} />
      </ListItem>

      <ListItem disablePadding>
        <MenuItem icon={BusinessOutlinedIcon} text={t('employer:sidebar.accountManagement')} kind="group" state={{ expanded: expandedItems.account }} onClick={() => handleExpand('account')} />
      </ListItem>
      <Collapse in={expandedItems.account} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <MenuItem text={t('employer:sidebar.companyInfo')} to={`/${ROUTES.EMPLOYER.COMPANY}`} kind="child" state={{ selected: location.pathname === `/${ROUTES.EMPLOYER.COMPANY}` }} />
          <MenuItem text={t('employer:sidebar.employerVerification')} to={`/${ROUTES.EMPLOYER.VERIFICATION}`} kind="child" state={{ selected: location.pathname === `/${ROUTES.EMPLOYER.VERIFICATION}` }} />
          <MenuItem text={t('employer:sidebar.account')} to={`/${ROUTES.EMPLOYER.ACCOUNT}`} kind="child" state={{ selected: location.pathname === `/${ROUTES.EMPLOYER.ACCOUNT}` }} />
          <MenuItem text={t('employer:sidebar.settings')} to={`/${ROUTES.EMPLOYER.SETTING}`} kind="child" state={{ selected: location.pathname === `/${ROUTES.EMPLOYER.SETTING}` }} />
        </List>
      </Collapse>

      <ListItem disablePadding>
        <MenuItem icon={GroupsOutlinedIcon} text={t('employer:sidebar.employeeRoles')} to={`/${ROUTES.EMPLOYER.EMPLOYEES}`} state={{ selected: location.pathname === `/${ROUTES.EMPLOYER.EMPLOYEES}` }} />
      </ListItem>
    </>
  );
};

export default EmployerMenu;



'use client';

import React from 'react';
import { Collapse, List, ListItem } from '@mui/material';
import GridViewIcon from '@mui/icons-material/GridView';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import ListAltOutlinedIcon from '@mui/icons-material/ListAltOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import VideoCameraFrontOutlinedIcon from '@mui/icons-material/VideoCameraFrontOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined';
import LaunchOutlinedIcon from '@mui/icons-material/LaunchOutlined';
import { ROUTES, APP_NAME, LINKS } from '@/configs/constants';
import { getLocalizedRouteVariants, localizeRoutePath } from '@/configs/routeLocalization';
import MenuItem from './MenuItem';

interface EmployerMenuProps {
  t: (key: string, options?: any) => string;
  location: { pathname?: string };
  expandedItems: Record<string, boolean>;
  handleExpand: (section: string) => void;
  language: string;
  liveInterviewCount?: number;
  isCollapsed?: boolean;
}

const EmployerMenu = ({ t, location, expandedItems, handleExpand, language, liveInterviewCount = 0, isCollapsed = false }: EmployerMenuProps) => {
  const routePath = (route: string) => localizeRoutePath(`/${route}`, language);
  const isSelected = (route: string) => {
    const pathname = location.pathname || '';
    return getLocalizedRouteVariants(`/${route}`).some((path) => pathname === path || pathname.startsWith(`${path}/`));
  };

  return (
    <>
      <ListItem disablePadding>
        <MenuItem icon={GridViewIcon} text={t('employer:sidebar.dashboard')} to={routePath(ROUTES.EMPLOYER.DASHBOARD)} isCollapsed={isCollapsed} state={{ selected: isSelected(ROUTES.EMPLOYER.DASHBOARD) }} />
      </ListItem>

      <ListItem disablePadding>
        <MenuItem icon={SmartToyOutlinedIcon} text={t('employer:sidebar.agentAssistants')} to={routePath(ROUTES.EMPLOYER.AGENT_ASSISTANTS)} isCollapsed={isCollapsed} state={{ selected: isSelected(ROUTES.EMPLOYER.AGENT_ASSISTANTS) }} />
      </ListItem>

      <ListItem disablePadding>
        <MenuItem icon={ListAltOutlinedIcon} text={t('employer:sidebar.jobPostList')} to={routePath(ROUTES.EMPLOYER.JOB_POST)} isCollapsed={isCollapsed} state={{ selected: isSelected(ROUTES.EMPLOYER.JOB_POST) }} />
      </ListItem>

      <ListItem disablePadding>
        <MenuItem
          icon={PeopleAltOutlinedIcon}
          text={t('employer:sidebar.candidateManagement')}
          kind="group"
          isCollapsed={isCollapsed}
          state={{ expanded: expandedItems.candidates }}
          onClick={() => handleExpand('candidates')}
          subItems={[
            { text: t('employer:sidebar.appliedApplications'), to: routePath(ROUTES.EMPLOYER.APPLIED_PROFILE), isSelected: isSelected(ROUTES.EMPLOYER.APPLIED_PROFILE) },
            { text: t('employer:sidebar.savedProfiles'), to: routePath(ROUTES.EMPLOYER.SAVED_PROFILE), isSelected: isSelected(ROUTES.EMPLOYER.SAVED_PROFILE) },
            { text: t('employer:sidebar.findCandidates'), to: routePath(ROUTES.EMPLOYER.PROFILE), isSelected: isSelected(ROUTES.EMPLOYER.PROFILE) },
          ]}
        />
      </ListItem>
      {!isCollapsed && (
        <Collapse in={expandedItems.candidates} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <MenuItem text={t('employer:sidebar.appliedApplications')} to={routePath(ROUTES.EMPLOYER.APPLIED_PROFILE)} kind="child" isCollapsed={isCollapsed} state={{ selected: isSelected(ROUTES.EMPLOYER.APPLIED_PROFILE) }} />
            <MenuItem text={t('employer:sidebar.savedProfiles')} to={routePath(ROUTES.EMPLOYER.SAVED_PROFILE)} kind="child" isCollapsed={isCollapsed} state={{ selected: isSelected(ROUTES.EMPLOYER.SAVED_PROFILE) }} />
            <MenuItem text={t('employer:sidebar.findCandidates')} to={routePath(ROUTES.EMPLOYER.PROFILE)} kind="child" isCollapsed={isCollapsed} state={{ selected: isSelected(ROUTES.EMPLOYER.PROFILE) }} />
          </List>
        </Collapse>
      )}

      <ListItem disablePadding>
        <MenuItem
          icon={VideoCameraFrontOutlinedIcon}
          text={t('employer:sidebar.onlineInterviews')}
          kind="group"
          isCollapsed={isCollapsed}
          state={{ expanded: expandedItems.interviews }}
          onClick={() => handleExpand('interviews')}
          subItems={[
            { text: t('employer:sidebar.interviewList'), to: routePath(ROUTES.EMPLOYER.INTERVIEW_LIST), isSelected: isSelected(ROUTES.EMPLOYER.INTERVIEW_LIST) },
            { text: t('employer:sidebar.interviewLive'), to: routePath(ROUTES.EMPLOYER.INTERVIEW_LIVE), badgeContent: liveInterviewCount, isSelected: isSelected(ROUTES.EMPLOYER.INTERVIEW_LIVE) },
            { text: t('employer:sidebar.questionBank'), to: routePath(ROUTES.EMPLOYER.QUESTION_BANK), isSelected: isSelected(ROUTES.EMPLOYER.QUESTION_BANK) },
            { text: t('employer:sidebar.questionSets'), to: routePath(ROUTES.EMPLOYER.QUESTION_GROUPS), isSelected: isSelected(ROUTES.EMPLOYER.QUESTION_GROUPS) },
          ]}
        />
      </ListItem>
      {!isCollapsed && (
        <Collapse in={expandedItems.interviews} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <MenuItem text={t('employer:sidebar.interviewList')} to={routePath(ROUTES.EMPLOYER.INTERVIEW_LIST)} kind="child" isCollapsed={isCollapsed} state={{ selected: isSelected(ROUTES.EMPLOYER.INTERVIEW_LIST) }} />
            <MenuItem text={t('employer:sidebar.interviewLive')} to={routePath(ROUTES.EMPLOYER.INTERVIEW_LIVE)} kind="child" badgeContent={liveInterviewCount} isCollapsed={isCollapsed} state={{ selected: isSelected(ROUTES.EMPLOYER.INTERVIEW_LIVE) }} />
            <MenuItem text={t('employer:sidebar.questionBank')} to={routePath(ROUTES.EMPLOYER.QUESTION_BANK)} kind="child" isCollapsed={isCollapsed} state={{ selected: isSelected(ROUTES.EMPLOYER.QUESTION_BANK) }} />
            <MenuItem text={t('employer:sidebar.questionSets')} to={routePath(ROUTES.EMPLOYER.QUESTION_GROUPS)} kind="child" isCollapsed={isCollapsed} state={{ selected: isSelected(ROUTES.EMPLOYER.QUESTION_GROUPS) }} />
          </List>
        </Collapse>
      )}

      <ListItem disablePadding>
        <MenuItem icon={NotificationsNoneOutlinedIcon} text={t('employer:sidebar.notifications')} to={routePath(ROUTES.EMPLOYER.NOTIFICATION)} isCollapsed={isCollapsed} state={{ selected: isSelected(ROUTES.EMPLOYER.NOTIFICATION) }} />
      </ListItem>

      <ListItem disablePadding>
        <MenuItem
          icon={ManageAccountsOutlinedIcon}
          text={t('employer:sidebar.accountManagement')}
          kind="group"
          isCollapsed={isCollapsed}
          state={{ expanded: expandedItems.account }}
          onClick={() => handleExpand('account')}
          subItems={[
            { text: t('employer:sidebar.companyInfo'), to: routePath(ROUTES.EMPLOYER.COMPANY), isSelected: isSelected(ROUTES.EMPLOYER.COMPANY) },
            { text: t('employer:sidebar.employerVerification'), to: routePath(ROUTES.EMPLOYER.VERIFICATION), isSelected: isSelected(ROUTES.EMPLOYER.VERIFICATION) },
            { text: t('employer:sidebar.account'), to: routePath(ROUTES.EMPLOYER.ACCOUNT), isSelected: isSelected(ROUTES.EMPLOYER.ACCOUNT) },
            { text: t('employer:sidebar.settings'), to: routePath(ROUTES.EMPLOYER.SETTING), isSelected: isSelected(ROUTES.EMPLOYER.SETTING) },
          ]}
        />
      </ListItem>
      {!isCollapsed && (
        <Collapse in={expandedItems.account} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <MenuItem text={t('employer:sidebar.companyInfo')} to={routePath(ROUTES.EMPLOYER.COMPANY)} kind="child" isCollapsed={isCollapsed} state={{ selected: isSelected(ROUTES.EMPLOYER.COMPANY) }} />
            <MenuItem text={t('employer:sidebar.employerVerification')} to={routePath(ROUTES.EMPLOYER.VERIFICATION)} kind="child" isCollapsed={isCollapsed} state={{ selected: isSelected(ROUTES.EMPLOYER.VERIFICATION) }} />
            <MenuItem text={t('employer:sidebar.account')} to={routePath(ROUTES.EMPLOYER.ACCOUNT)} kind="child" isCollapsed={isCollapsed} state={{ selected: isSelected(ROUTES.EMPLOYER.ACCOUNT) }} />
            <MenuItem text={t('employer:sidebar.settings')} to={routePath(ROUTES.EMPLOYER.SETTING)} kind="child" isCollapsed={isCollapsed} state={{ selected: isSelected(ROUTES.EMPLOYER.SETTING) }} />
          </List>
        </Collapse>
      )}

      <ListItem disablePadding>
        <MenuItem icon={LaunchOutlinedIcon} text={t('employer:sidebar.squareHrmAdmin')} to={LINKS.SQUARE_HRM_ADMIN_LINK} external isCollapsed={isCollapsed} />
      </ListItem>
    </>
  );
};

export default EmployerMenu;

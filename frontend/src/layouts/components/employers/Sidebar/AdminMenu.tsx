'use client';

import React from 'react';
import { Collapse, List, ListItem } from '@mui/material';
import GridViewIcon from '@mui/icons-material/GridView';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import RecordVoiceOverOutlinedIcon from '@mui/icons-material/RecordVoiceOverOutlined';
import { ROUTES, LINKS } from '@/configs/constants';
import { getLocalizedRouteVariants, localizeRoutePath } from '@/configs/routeLocalization';
import MenuItem from './MenuItem';

import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import ContactPageOutlinedIcon from '@mui/icons-material/ContactPageOutlined';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';

interface AdminMenuProps {
  t: (key: string) => string;
  location: { pathname?: string };
  expandedItems: Record<string, boolean>;
  handleExpand: (section: string) => void;
  language: string;
  isCollapsed?: boolean;
}

const AdminMenu = ({ t, location, expandedItems, handleExpand, language, isCollapsed = false }: AdminMenuProps) => {
  const routePath = (route: string) => localizeRoutePath(`/${route}`, language);
  const isSelected = (route: string) => {
    const pathname = location.pathname || '';
    return getLocalizedRouteVariants(`/${route}`).some((path) => pathname === path || pathname.startsWith(`${path}/`));
  };

  return (
    <>
      <ListItem disablePadding>
        <MenuItem icon={GridViewIcon} text={t('admin:sidebar.systemOverview')} to={routePath(ROUTES.ADMIN.DASHBOARD)} isCollapsed={isCollapsed} state={{ selected: isSelected(ROUTES.ADMIN.DASHBOARD) }} />
      </ListItem>
      <ListItem disablePadding>
        <MenuItem icon={SmartToyOutlinedIcon} text={t('admin:sidebar.agentAssistants')} to={routePath(ROUTES.ADMIN.AGENT_ASSISTANTS)} isCollapsed={isCollapsed} state={{ selected: isSelected(ROUTES.ADMIN.AGENT_ASSISTANTS) }} />
      </ListItem>
      <ListItem disablePadding>
        <MenuItem
          icon={AccountCircleOutlinedIcon}
          text={t('admin:sidebar.systemAndUsers')}
          kind="group"
          isCollapsed={isCollapsed}
          state={{ expanded: expandedItems.system }}
          onClick={() => handleExpand('system')}
          subItems={[
            { text: t('admin:sidebar.usersAndPermissions'), to: routePath(ROUTES.ADMIN.USERS), isSelected: isSelected(ROUTES.ADMIN.USERS) },
            { text: t('admin:sidebar.systemConfiguration'), to: routePath(ROUTES.ADMIN.SETTINGS), isSelected: isSelected(ROUTES.ADMIN.SETTINGS) },
            { text: t('admin:sidebar.auditLogs'), to: routePath(ROUTES.ADMIN.AUDIT_LOGS), isSelected: isSelected(ROUTES.ADMIN.AUDIT_LOGS) },
            { text: t('admin:sidebar.squareHrmAdmin'), to: LINKS.SQUARE_HRM_ADMIN_LINK, external: true },
          ]}
        />
      </ListItem>
      {!isCollapsed && (
        <Collapse in={expandedItems.system} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <MenuItem text={t('admin:sidebar.usersAndPermissions')} to={routePath(ROUTES.ADMIN.USERS)} kind="child" isCollapsed={isCollapsed} state={{ selected: isSelected(ROUTES.ADMIN.USERS) }} />
            <MenuItem text={t('admin:sidebar.systemConfiguration')} to={routePath(ROUTES.ADMIN.SETTINGS)} kind="child" isCollapsed={isCollapsed} state={{ selected: isSelected(ROUTES.ADMIN.SETTINGS) }} />
            <MenuItem text={t('admin:sidebar.auditLogs')} to={routePath(ROUTES.ADMIN.AUDIT_LOGS)} kind="child" isCollapsed={isCollapsed} state={{ selected: isSelected(ROUTES.ADMIN.AUDIT_LOGS) }} />
            <MenuItem text={t('admin:sidebar.squareHrmAdmin')} to={LINKS.SQUARE_HRM_ADMIN_LINK} kind="child" external isCollapsed={isCollapsed} />
          </List>
        </Collapse>
      )}
      
      <ListItem disablePadding>
        <MenuItem
          icon={CategoryOutlinedIcon}
          text={t('admin:sidebar.generalCategories')}
          kind="group"
          isCollapsed={isCollapsed}
          state={{ expanded: expandedItems.categories }}
          onClick={() => handleExpand('categories')}
          subItems={[
            { text: t('admin:sidebar.careersManagement'), to: routePath(ROUTES.ADMIN.CAREERS), isSelected: isSelected(ROUTES.ADMIN.CAREERS) },
            { text: t('admin:sidebar.citiesManagement'), to: routePath(ROUTES.ADMIN.CITIES), isSelected: isSelected(ROUTES.ADMIN.CITIES) },
            { text: t('admin:sidebar.districtsManagement'), to: routePath(ROUTES.ADMIN.DISTRICTS), isSelected: isSelected(ROUTES.ADMIN.DISTRICTS) },
            { text: t('admin:sidebar.wardsManagement'), to: routePath(ROUTES.ADMIN.WARDS), isSelected: isSelected(ROUTES.ADMIN.WARDS) },
          ]}
        />
      </ListItem>
      {!isCollapsed && (
        <Collapse in={expandedItems.categories} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <MenuItem text={t('admin:sidebar.careersManagement')} to={routePath(ROUTES.ADMIN.CAREERS)} kind="child" isCollapsed={isCollapsed} state={{ selected: isSelected(ROUTES.ADMIN.CAREERS) }} />
            <MenuItem text={t('admin:sidebar.citiesManagement')} to={routePath(ROUTES.ADMIN.CITIES)} kind="child" isCollapsed={isCollapsed} state={{ selected: isSelected(ROUTES.ADMIN.CITIES) }} />
            <MenuItem text={t('admin:sidebar.districtsManagement')} to={routePath(ROUTES.ADMIN.DISTRICTS)} kind="child" isCollapsed={isCollapsed} state={{ selected: isSelected(ROUTES.ADMIN.DISTRICTS) }} />
            <MenuItem text={t('admin:sidebar.wardsManagement')} to={routePath(ROUTES.ADMIN.WARDS)} kind="child" isCollapsed={isCollapsed} state={{ selected: isSelected(ROUTES.ADMIN.WARDS) }} />
          </List>
        </Collapse>
      )}

      <ListItem disablePadding>
        <MenuItem
          icon={ArticleOutlinedIcon}
          text={t('admin:sidebar.contentManagement')}
          kind="group"
          isCollapsed={isCollapsed}
          state={{ expanded: expandedItems.content }}
          onClick={() => handleExpand('content')}
          subItems={[
            { text: t('admin:sidebar.bannersManagement'), to: routePath(ROUTES.ADMIN.BANNERS), isSelected: isSelected(ROUTES.ADMIN.BANNERS) },
            { text: t('admin:sidebar.bannerTypes'), to: routePath(ROUTES.ADMIN.BANNER_TYPES), isSelected: isSelected(ROUTES.ADMIN.BANNER_TYPES) },
            { text: t('admin:sidebar.feedbacksManagement'), to: routePath(ROUTES.ADMIN.FEEDBACKS), isSelected: isSelected(ROUTES.ADMIN.FEEDBACKS) },
            { text: t('admin:sidebar.contactMessages'), to: routePath(ROUTES.ADMIN.CONTACT_MESSAGES), isSelected: isSelected(ROUTES.ADMIN.CONTACT_MESSAGES) },
            { text: t('admin:sidebar.articlesManagement'), to: routePath(ROUTES.ADMIN.ARTICLES), isSelected: isSelected(ROUTES.ADMIN.ARTICLES) },
            { text: t('admin:sidebar.chatWithEmployers'), to: routePath(ROUTES.ADMIN.CHAT), isSelected: isSelected(ROUTES.ADMIN.CHAT) },
          ]}
        />
      </ListItem>
      {!isCollapsed && (
        <Collapse in={expandedItems.content} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <MenuItem text={t('admin:sidebar.bannersManagement')} to={routePath(ROUTES.ADMIN.BANNERS)} kind="child" isCollapsed={isCollapsed} state={{ selected: isSelected(ROUTES.ADMIN.BANNERS) }} />
            <MenuItem text={t('admin:sidebar.bannerTypes')} to={routePath(ROUTES.ADMIN.BANNER_TYPES)} kind="child" isCollapsed={isCollapsed} state={{ selected: isSelected(ROUTES.ADMIN.BANNER_TYPES) }} />
            <MenuItem text={t('admin:sidebar.feedbacksManagement')} to={routePath(ROUTES.ADMIN.FEEDBACKS)} kind="child" isCollapsed={isCollapsed} state={{ selected: isSelected(ROUTES.ADMIN.FEEDBACKS) }} />
            <MenuItem text={t('admin:sidebar.contactMessages')} to={routePath(ROUTES.ADMIN.CONTACT_MESSAGES)} kind="child" isCollapsed={isCollapsed} state={{ selected: isSelected(ROUTES.ADMIN.CONTACT_MESSAGES) }} />
            <MenuItem text={t('admin:sidebar.articlesManagement')} to={routePath(ROUTES.ADMIN.ARTICLES)} kind="child" isCollapsed={isCollapsed} state={{ selected: isSelected(ROUTES.ADMIN.ARTICLES) }} />
            <MenuItem text={t('admin:sidebar.chatWithEmployers')} to={routePath(ROUTES.ADMIN.CHAT)} kind="child" isCollapsed={isCollapsed} state={{ selected: isSelected(ROUTES.ADMIN.CHAT) }} />
          </List>
        </Collapse>
      )}

      <ListItem disablePadding>
        <MenuItem
          icon={ContactPageOutlinedIcon}
          text={t('admin:sidebar.infoAndProfiles')}
          kind="group"
          isCollapsed={isCollapsed}
          state={{ expanded: expandedItems.profiles }}
          onClick={() => handleExpand('profiles')}
          subItems={[
            { text: t('admin:sidebar.companyManagement'), to: routePath(ROUTES.ADMIN.COMPANIES), isSelected: isSelected(ROUTES.ADMIN.COMPANIES) },
            { text: t('admin:sidebar.companyVerifications'), to: routePath(ROUTES.ADMIN.COMPANY_VERIFICATIONS), isSelected: isSelected(ROUTES.ADMIN.COMPANY_VERIFICATIONS) },
            { text: t('admin:sidebar.candidateProfiles'), to: routePath(ROUTES.ADMIN.PROFILES), isSelected: isSelected(ROUTES.ADMIN.PROFILES) },
            { text: t('admin:sidebar.resumeManagement'), to: routePath(ROUTES.ADMIN.RESUMES), isSelected: isSelected(ROUTES.ADMIN.RESUMES) },
          ]}
        />
      </ListItem>
      {!isCollapsed && (
        <Collapse in={expandedItems.profiles} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <MenuItem text={t('admin:sidebar.companyManagement')} to={routePath(ROUTES.ADMIN.COMPANIES)} kind="child" isCollapsed={isCollapsed} state={{ selected: isSelected(ROUTES.ADMIN.COMPANIES) }} />
            <MenuItem text={t('admin:sidebar.companyVerifications')} to={routePath(ROUTES.ADMIN.COMPANY_VERIFICATIONS)} kind="child" isCollapsed={isCollapsed} state={{ selected: isSelected(ROUTES.ADMIN.COMPANY_VERIFICATIONS) }} />
            <MenuItem text={t('admin:sidebar.candidateProfiles')} to={routePath(ROUTES.ADMIN.PROFILES)} kind="child" isCollapsed={isCollapsed} state={{ selected: isSelected(ROUTES.ADMIN.PROFILES) }} />
            <MenuItem text={t('admin:sidebar.resumeManagement')} to={routePath(ROUTES.ADMIN.RESUMES)} kind="child" isCollapsed={isCollapsed} state={{ selected: isSelected(ROUTES.ADMIN.RESUMES) }} />
          </List>
        </Collapse>
      )}

      <ListItem disablePadding>
        <MenuItem
          icon={WorkOutlineOutlinedIcon}
          text={t('admin:sidebar.recruitmentAndInterviews')}
          kind="group"
          isCollapsed={isCollapsed}
          state={{ expanded: expandedItems.recruitment }}
          onClick={() => handleExpand('recruitment')}
          subItems={[
            { text: t('admin:sidebar.jobPosts'), to: routePath(ROUTES.ADMIN.JOBS), isSelected: isSelected(ROUTES.ADMIN.JOBS) },
            { text: t('admin:sidebar.questionBank'), to: routePath(ROUTES.ADMIN.QUESTIONS), isSelected: isSelected(ROUTES.ADMIN.QUESTIONS) },
            { text: t('admin:sidebar.interviewQuestionSets'), to: routePath(ROUTES.ADMIN.QUESTION_GROUPS), isSelected: isSelected(ROUTES.ADMIN.QUESTION_GROUPS) },
            { text: t('admin:sidebar.trustReports'), to: routePath(ROUTES.ADMIN.TRUST_REPORTS), isSelected: isSelected(ROUTES.ADMIN.TRUST_REPORTS) },
            { text: t('admin:sidebar.activityLogs'), to: routePath(ROUTES.ADMIN.JOB_ACTIVITY), isSelected: isSelected(ROUTES.ADMIN.JOB_ACTIVITY) },
            { text: t('admin:sidebar.interviewSchedule'), to: routePath(ROUTES.ADMIN.INTERVIEWS), isSelected: isSelected(ROUTES.ADMIN.INTERVIEWS) },
            { text: t('admin:sidebar.voiceProfiles'), to: routePath(ROUTES.ADMIN.VOICE_PROFILES), isSelected: isSelected(ROUTES.ADMIN.VOICE_PROFILES) },
            { text: t('admin:sidebar.jobNotifications'), to: routePath(ROUTES.ADMIN.JOB_NOTIFICATIONS), isSelected: isSelected(ROUTES.ADMIN.JOB_NOTIFICATIONS) },
            { text: t('admin:sidebar.interviewPreview'), to: routePath(ROUTES.ADMIN.INTERVIEW_PREVIEW), isSelected: isSelected(ROUTES.ADMIN.INTERVIEW_PREVIEW) },
          ]}
        />
      </ListItem>
      {!isCollapsed && (
        <Collapse in={expandedItems.recruitment} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <MenuItem text={t('admin:sidebar.jobPosts')} to={routePath(ROUTES.ADMIN.JOBS)} kind="child" isCollapsed={isCollapsed} state={{ selected: isSelected(ROUTES.ADMIN.JOBS) }} />
            <MenuItem text={t('admin:sidebar.questionBank')} to={routePath(ROUTES.ADMIN.QUESTIONS)} kind="child" isCollapsed={isCollapsed} state={{ selected: isSelected(ROUTES.ADMIN.QUESTIONS) }} />
            <MenuItem text={t('admin:sidebar.interviewQuestionSets')} to={routePath(ROUTES.ADMIN.QUESTION_GROUPS)} kind="child" isCollapsed={isCollapsed} state={{ selected: isSelected(ROUTES.ADMIN.QUESTION_GROUPS) }} />
            <MenuItem text={t('admin:sidebar.trustReports')} to={routePath(ROUTES.ADMIN.TRUST_REPORTS)} kind="child" isCollapsed={isCollapsed} state={{ selected: isSelected(ROUTES.ADMIN.TRUST_REPORTS) }} />
            <MenuItem text={t('admin:sidebar.activityLogs')} to={routePath(ROUTES.ADMIN.JOB_ACTIVITY)} kind="child" isCollapsed={isCollapsed} state={{ selected: isSelected(ROUTES.ADMIN.JOB_ACTIVITY) }} />
            <MenuItem text={t('admin:sidebar.interviewSchedule')} to={routePath(ROUTES.ADMIN.INTERVIEWS)} kind="child" isCollapsed={isCollapsed} state={{ selected: isSelected(ROUTES.ADMIN.INTERVIEWS) }} />
            <MenuItem icon={RecordVoiceOverOutlinedIcon} text={t('admin:sidebar.voiceProfiles')} to={routePath(ROUTES.ADMIN.VOICE_PROFILES)} kind="child" isCollapsed={isCollapsed} state={{ selected: isSelected(ROUTES.ADMIN.VOICE_PROFILES) }} />
            <MenuItem text={t('admin:sidebar.jobNotifications')} to={routePath(ROUTES.ADMIN.JOB_NOTIFICATIONS)} kind="child" isCollapsed={isCollapsed} state={{ selected: isSelected(ROUTES.ADMIN.JOB_NOTIFICATIONS) }} />
            <MenuItem icon={VideoLibraryIcon} text={t('admin:sidebar.interviewPreview')} to={routePath(ROUTES.ADMIN.INTERVIEW_PREVIEW)} kind="child" isCollapsed={isCollapsed} state={{ selected: isSelected(ROUTES.ADMIN.INTERVIEW_PREVIEW) }} />
          </List>
        </Collapse>
      )}

    </>
  );
};

export default AdminMenu;

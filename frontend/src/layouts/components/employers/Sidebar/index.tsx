import React, { useState } from 'react';

import { Link, NavLink, useLocation } from 'react-router-dom';

import { useTranslation } from 'react-i18next';

import { Avatar, Box, Divider, Drawer, useTheme, Toolbar, List, ListItem, ListItemIcon, ListItemText, ListItemButton, Collapse } from "@mui/material";

import PropTypes from 'prop-types';

import { styled } from '@mui/material/styles';

import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

import ArrowRightIcon from '@mui/icons-material/ArrowRight';

import GridViewIcon from '@mui/icons-material/GridView';

import ListAltOutlinedIcon from '@mui/icons-material/ListAltOutlined';

import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';

import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';

import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';

import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';

import { IMAGES, ROUTES, APP_NAME } from '../../../../configs/constants';

interface SidebarProps {
  drawerWidth: number;
  isAdmin?: boolean;
}

interface MobileSidebarProps extends SidebarProps {
  container?: any;
  mobileOpen: boolean;
  handleDrawerToggle: () => void;
}

interface MenuItemProps {
  icon?: any;
  text: string;
  to?: string;
  onClick?: () => void;
  isSelected?: boolean;
  isExpanded?: boolean;
  hasChildren?: boolean;
  isChild?: boolean;
}



const StyledListItemButton = styled(ListItemButton)<{ component?: React.ElementType; to?: string }>(({ theme }) => ({

  borderRadius: '8px',

  marginBottom: '2px',

  color: theme.palette.text.secondary,

  textDecoration: 'none',

  position: 'relative',

  '&:hover': {

    backgroundColor: theme.palette.primary.background,

    color: theme.palette.text.secondary,

    textDecoration: 'none',

  },

  '&.Mui-selected': {

    backgroundColor: theme.palette.primary.background,

    color: theme.palette.primary.main,

    fontWeight: 600,

    '&:hover': {

      backgroundColor: theme.palette.primary.background,

      color: theme.palette.primary.main,

    },

  },

  '& .MuiTypography-root': {

    color: 'inherit',

  },

  '& .MuiListItemIcon-root': {

    color: 'inherit',

  },

  '&.active': {

    backgroundColor: theme.palette.primary.background,

    color: theme.palette.primary.main,

    fontWeight: 600,

    '&:hover': {

      backgroundColor: theme.palette.primary.background,

      color: theme.palette.primary.main,

    },

  },

}));

const MenuItem = ({ icon: Icon, text, to, onClick, isSelected, isExpanded, hasChildren, isChild }: MenuItemProps) => {

  return (

    <StyledListItemButton

      component={(to ? NavLink : 'div') as any}

      to={to}

      onClick={onClick}

      selected={isSelected}

      sx={{

        pl: isChild ? 3 : 2,

        ...(hasChildren ? {} : { '& .MuiListItemIcon-root': { ml: 0 } })

      }}

    >

      {!isChild && Icon && (

        <ListItemIcon sx={{ minWidth: 35 }}>

          <Icon fontSize="small" />

        </ListItemIcon>

      )}

      {isChild && (

        <Box

          sx={{

            width: 4,

            height: 4,

            borderRadius: '50%',

            backgroundColor: 'text.secondary',

            mr: 1.5,

            ml: 1,

          }}

        />

      )}

      <ListItemText

        primary={text}

        slotProps={{

          primary: {

            variant: 'body2',

            fontSize: '0.9rem',

          }

        }}

      />

      {hasChildren && (

        <Box component="span" sx={{ ml: 'auto' }}>

          {isExpanded ? (

            <ArrowDropDownIcon fontSize="small" />

          ) : (

            <ArrowRightIcon fontSize="small" />

          )}

        </Box>

      )}

    </StyledListItemButton>

  );

};

const DrawerContent = ({ isAdmin }: { isAdmin?: boolean }) => {

  const { t } = useTranslation(['admin', 'employer']);

  const location = useLocation();

  const theme = useTheme();

  const [expandedItems, setExpandedItems] = useState({

    candidates: true,

    interviews: true,

    account: true,

    system: true,

    categories: true,

    profiles: true,

    recruitment: true,

    content: true,

  });

  const handleExpand = (section: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [section]: !prev[section as keyof typeof prev]
    }));
  };

  return (

    <div>

      <Toolbar sx={{ px: 2, py: 1.5 }}>

        <Box

          component={Link}

          to={`/${isAdmin ? ROUTES.ADMIN.DASHBOARD : ROUTES.EMPLOYER.DASHBOARD}`}

          sx={{

            width: '100%',

            display: 'flex',

            justifyContent: 'center'

          }}

        >

          <Avatar

            src={IMAGES.getTextLogo(

              theme.palette.mode === 'light' ? 'dark' : 'light'

            )}

            sx={{

              height: 48,

              width: 'auto',

            }}

            variant="rounded"

            alt="LOGO"

          />

        </Box>

      </Toolbar>

      <Divider sx={{ borderColor: 'grey.500' }} />

      <Box sx={{ px: 1.5, py: 1.5 }}>

        <List component="nav" disablePadding>

          {isAdmin ? (

            <>

              {/* Dashboard */}

              <ListItem disablePadding>

                <MenuItem

                  icon={GridViewIcon}

                  text={t('admin:sidebar.systemOverview')}

                  to={`/${ROUTES.ADMIN.DASHBOARD}`}

                  isSelected={location.pathname === `/${ROUTES.ADMIN.DASHBOARD}`}

                />

              </ListItem>

              {/* System & Users */}

              <ListItem disablePadding>

                <MenuItem

                  icon={AccountCircleOutlinedIcon}

                  text={t('admin:sidebar.systemAndUsers')}

                  hasChildren

                  isExpanded={expandedItems.system}

                  onClick={() => handleExpand('system')}

                />

              </ListItem>

              <Collapse in={expandedItems.system} timeout="auto" unmountOnExit>

                <List component="div" disablePadding>

                  <MenuItem

                    text={t('admin:sidebar.usersAndPermissions')}

                    to={`/${ROUTES.ADMIN.USERS}`}

                    isSelected={location.pathname === `/${ROUTES.ADMIN.USERS}`}

                    isChild

                  />

                  <MenuItem

                    text={t('admin:sidebar.systemConfiguration')}

                    to={`/${ROUTES.ADMIN.SETTINGS}`}

                    isSelected={location.pathname === `/${ROUTES.ADMIN.SETTINGS}`}

                    isChild

                  />

                </List>

              </Collapse>

              {/* General Categories */}

              <ListItem disablePadding>

                <MenuItem

                  icon={BusinessOutlinedIcon}

                  text={t('admin:sidebar.generalCategories')}

                  hasChildren

                  isExpanded={expandedItems.categories}

                  onClick={() => handleExpand('categories')}

                />

              </ListItem>

              <Collapse in={expandedItems.categories} timeout="auto" unmountOnExit>

                <List component="div" disablePadding>

                  <MenuItem

                    text={t('admin:sidebar.careersManagement')}

                    to={`/${ROUTES.ADMIN.CAREERS}`}

                    isSelected={location.pathname === `/${ROUTES.ADMIN.CAREERS}`}

                    isChild

                  />

                  <MenuItem

                    text={t('admin:sidebar.citiesManagement')}

                    to={`/${ROUTES.ADMIN.CITIES}`}

                    isSelected={location.pathname === `/${ROUTES.ADMIN.CITIES}`}

                    isChild

                  />

                  <MenuItem

                    text={t('admin:sidebar.districtsManagement')}

                    to={`/${ROUTES.ADMIN.DISTRICTS}`}

                    isSelected={location.pathname === `/${ROUTES.ADMIN.DISTRICTS}`}

                    isChild

                  />
                  <MenuItem

                    text={t('admin:sidebar.wardsManagement')}

                    to={`/${ROUTES.ADMIN.WARDS}`}

                    isSelected={location.pathname === `/${ROUTES.ADMIN.WARDS}`}

                    isChild

                  />

                </List>

              </Collapse>

              {/* Content Management */}

              <ListItem disablePadding>

                <MenuItem

                  icon={BusinessOutlinedIcon}

                  text="Quản lý nội dung"

                  hasChildren

                  isExpanded={expandedItems.content}

                  onClick={() => handleExpand('content')}

                />

              </ListItem>

              <Collapse in={expandedItems.content} timeout="auto" unmountOnExit>

                <List component="div" disablePadding>

                  <MenuItem

                    text="Quản lý Banner"

                    to={`/${ROUTES.ADMIN.BANNERS}`}

                    isSelected={location.pathname === `/${ROUTES.ADMIN.BANNERS}`}

                    isChild

                  />

                  <MenuItem

                    text="Quản lý Đánh giá"

                    to={`/${ROUTES.ADMIN.FEEDBACKS}`}

                    isSelected={location.pathname === `/${ROUTES.ADMIN.FEEDBACKS}`}

                    isChild

                  />

                </List>

              </Collapse>

              <ListItem disablePadding>

                <MenuItem

                  icon={BusinessOutlinedIcon}

                  text={t('admin:sidebar.infoAndProfiles')}

                  hasChildren

                  isExpanded={expandedItems.profiles}

                  onClick={() => handleExpand('profiles')}

                />

              </ListItem>

              <Collapse in={expandedItems.profiles} timeout="auto" unmountOnExit>

                <List component="div" disablePadding>

                  <MenuItem

                    text={t('admin:sidebar.companyManagement')}

                    to={`/${ROUTES.ADMIN.COMPANIES}`}

                    isSelected={location.pathname === `/${ROUTES.ADMIN.COMPANIES}`}

                    isChild

                  />

                  <MenuItem

                    text={t('admin:sidebar.candidateProfiles')}

                    to={`/${ROUTES.ADMIN.PROFILES}`}

                    isSelected={location.pathname === `/${ROUTES.ADMIN.PROFILES}`}

                    isChild

                  />

                  <MenuItem

                    text={t('admin:sidebar.resumeManagement')}

                    to={`/${ROUTES.ADMIN.RESUMES}`}

                    isSelected={location.pathname === `/${ROUTES.ADMIN.RESUMES}`}

                    isChild

                  />

                </List>

              </Collapse>

              {/* Recruitment & Interviews */}

              <ListItem disablePadding>

                <MenuItem

                  icon={FactCheckOutlinedIcon}

                  text={t('admin:sidebar.recruitmentAndInterviews')}

                  hasChildren

                  isExpanded={expandedItems.recruitment}

                  onClick={() => handleExpand('recruitment')}

                />

              </ListItem>

              <Collapse in={expandedItems.recruitment} timeout="auto" unmountOnExit>

                <List component="div" disablePadding>

                  <MenuItem

                    text={t('admin:sidebar.jobPosts')}

                    to={`/${ROUTES.ADMIN.JOBS}`}

                    isSelected={location.pathname === `/${ROUTES.ADMIN.JOBS}`}

                    isChild

                  />

                  <MenuItem

                    text={t('admin:sidebar.activityLogs')}

                    to={`/${ROUTES.ADMIN.JOB_ACTIVITY}`}

                    isSelected={location.pathname === `/${ROUTES.ADMIN.JOB_ACTIVITY}`}

                    isChild

                  />

                  <MenuItem

                    text={t('admin:sidebar.questionBank')}

                    to={`/${ROUTES.ADMIN.QUESTIONS}`}

                    isSelected={location.pathname === `/${ROUTES.ADMIN.QUESTIONS}`}

                    isChild

                  />

                  <MenuItem

                    text={t('admin:sidebar.interviewQuestionSets')}

                    to={`/${ROUTES.ADMIN.QUESTION_GROUPS}`}

                    isSelected={location.pathname === `/${ROUTES.ADMIN.QUESTION_GROUPS}`}

                    isChild

                  />

                  <MenuItem

                    text={t('admin:sidebar.interviewSchedule')}

                    to={`/${ROUTES.ADMIN.INTERVIEWS}`}

                    isSelected={location.pathname === `/${ROUTES.ADMIN.INTERVIEWS}`}

                    isChild

                  />

                  <MenuItem

                    text={t('admin:sidebar.interviewLive')}

                    to={`/${ROUTES.ADMIN.INTERVIEW_LIVE}`}

                    isSelected={location.pathname === `/${ROUTES.ADMIN.INTERVIEW_LIVE}`}

                    isChild

                  />

                  <MenuItem

                    text={t('admin:sidebar.jobNotifications')}

                    to={`/${ROUTES.ADMIN.JOB_NOTIFICATIONS}`}

                    isSelected={location.pathname === `/${ROUTES.ADMIN.JOB_NOTIFICATIONS}`}

                    isChild

                  />

                </List>

              </Collapse>

            </>

          ) : (

            <>

              {/* Overview */}

              <ListItem disablePadding>

                <MenuItem

                  icon={GridViewIcon}

                  text={t('employer:sidebar.dashboard')}

                  to={`/${ROUTES.EMPLOYER.DASHBOARD}`}

                  isSelected={location.pathname === `/${ROUTES.EMPLOYER.DASHBOARD}`}

                />

              </ListItem>

              {/* Recruitment Management */}

              <ListItem disablePadding>

                <MenuItem

                  icon={ListAltOutlinedIcon}

                  text={t('employer:sidebar.jobPostList')}

                  to={`/${ROUTES.EMPLOYER.JOB_POST}`}

                  isSelected={location.pathname === `/${ROUTES.EMPLOYER.JOB_POST}`}

                />

              </ListItem>

              {/* Candidate Management */}

              <ListItem disablePadding>

                <MenuItem

                  icon={FactCheckOutlinedIcon}

                  text={t('employer:sidebar.candidateManagement')}

                  hasChildren

                  isExpanded={expandedItems.candidates}

                  onClick={() => handleExpand('candidates')}

                />

              </ListItem>

              <Collapse in={expandedItems.candidates} timeout="auto" unmountOnExit>

                <List component="div" disablePadding>

                  <MenuItem

                    text={t('employer:sidebar.appliedApplications')}

                    to={`/${ROUTES.EMPLOYER.APPLIED_PROFILE}`}

                    isSelected={location.pathname === `/${ROUTES.EMPLOYER.APPLIED_PROFILE}`}

                    isChild

                  />

                  <MenuItem

                    text={t('employer:sidebar.savedProfiles')}

                    to={`/${ROUTES.EMPLOYER.SAVED_PROFILE}`}

                    isSelected={location.pathname === `/${ROUTES.EMPLOYER.SAVED_PROFILE}`}

                    isChild

                  />

                  <MenuItem

                    text={t('employer:sidebar.findCandidates')}

                    to={`/${ROUTES.EMPLOYER.PROFILE}`}

                    isSelected={location.pathname === `/${ROUTES.EMPLOYER.PROFILE}`}

                    isChild

                  />

                </List>

              </Collapse>

              {/* Online Interviews */}

              <ListItem disablePadding>

                <MenuItem

                  icon={FactCheckOutlinedIcon}

                  text={t('employer:sidebar.onlineInterviews')}

                  hasChildren

                  isExpanded={expandedItems.interviews}

                  onClick={() => handleExpand('interviews')}

                />

              </ListItem>

              <Collapse in={expandedItems.interviews} timeout="auto" unmountOnExit>

                <List component="div" disablePadding>

                  <MenuItem

                    text={t('employer:sidebar.interviewList')}

                    to={`/${ROUTES.EMPLOYER.INTERVIEW_LIST}`}

                    isSelected={location.pathname === `/${ROUTES.EMPLOYER.INTERVIEW_LIST}`}

                    isChild

                  />

                  <MenuItem

                    text={t('employer:sidebar.interviewLive')}

                    to={`/${ROUTES.EMPLOYER.INTERVIEW_LIVE}`}

                    isSelected={location.pathname === `/${ROUTES.EMPLOYER.INTERVIEW_LIVE}`}

                    isChild

                  />

                  <MenuItem

                    text={t('employer:sidebar.questionBank')}

                    to={`/${ROUTES.EMPLOYER.QUESTION_BANK}`}

                    isSelected={location.pathname === `/${ROUTES.EMPLOYER.QUESTION_BANK}`}

                    isChild

                  />

                  <MenuItem

                    text={t('employer:sidebar.questionSets')}

                    to={`/${ROUTES.EMPLOYER.QUESTION_GROUPS}`}

                    isSelected={location.pathname === `/${ROUTES.EMPLOYER.QUESTION_GROUPS}`}

                    isChild

                  />

                </List>

              </Collapse>

              {/* Notifications */}

              <ListItem disablePadding>

                <MenuItem

                  icon={NotificationsNoneOutlinedIcon}

                  text={`${APP_NAME} ${t('employer:sidebar.notifications')}`}

                  to={`/${ROUTES.EMPLOYER.NOTIFICATION}`}

                  isSelected={location.pathname === `/${ROUTES.EMPLOYER.NOTIFICATION}`}

                />

              </ListItem>

              {/* Account Management */}

              <ListItem disablePadding>

                <MenuItem

                  icon={BusinessOutlinedIcon}

                  text={t('employer:sidebar.accountManagement')}

                  hasChildren

                  isExpanded={expandedItems.account}

                  onClick={() => handleExpand('account')}

                />

              </ListItem>

              <Collapse in={expandedItems.account} timeout="auto" unmountOnExit>

                <List component="div" disablePadding>

                  <MenuItem

                    text={t('employer:sidebar.companyInfo')}

                    to={`/${ROUTES.EMPLOYER.COMPANY}`}

                    isSelected={location.pathname === `/${ROUTES.EMPLOYER.COMPANY}`}

                    isChild

                  />

                  <MenuItem

                    text={t('employer:sidebar.employerVerification')}

                    to={`/${ROUTES.EMPLOYER.VERIFICATION}`}

                    isSelected={location.pathname === `/${ROUTES.EMPLOYER.VERIFICATION}`}

                    isChild

                  />

                  <MenuItem

                    text={t('employer:sidebar.account')}

                    to={`/${ROUTES.EMPLOYER.ACCOUNT}`}

                    isSelected={location.pathname === `/${ROUTES.EMPLOYER.ACCOUNT}`}

                    isChild

                  />

                  <MenuItem

                    text={t('employer:sidebar.settings')}

                    to={`/${ROUTES.EMPLOYER.SETTING}`}

                    isSelected={location.pathname === `/${ROUTES.EMPLOYER.SETTING}`}

                    isChild

                  />
                </List>

              </Collapse>

              <ListItem disablePadding>
                <MenuItem
                  icon={GroupsOutlinedIcon}
                  text={t('employer:sidebar.employeeRoles')}
                  to={`/${ROUTES.EMPLOYER.EMPLOYEES}`}
                  isSelected={location.pathname === `/${ROUTES.EMPLOYER.EMPLOYEES}`}
                />
              </ListItem>

            </>

          )}

          <Divider sx={{ my: 2, borderColor: 'grey.300' }} />

        </List>

      </Box>

    </div>

  );

};

const Sidebar = ({ drawerWidth, isAdmin }: SidebarProps) => {

  const theme = useTheme();

  return (

    <Drawer

      variant="permanent"

      sx={{

        display: {

          xs: 'none',

          sm: 'none',

          md: 'none',

          lg: 'none',

          xl: 'block',

        },

        '& .MuiDrawer-paper': {

          boxSizing: 'border-box',

          width: drawerWidth,

          borderRight: '0px',

          backgroundColor: theme.palette.background.paper,

          boxShadow: (theme as any).customShadows.sidebar,

          borderRadius: '0px 10px 10px 0px',

        },

      }}

      open

    >

      <DrawerContent isAdmin={isAdmin} />

    </Drawer>

  );

};

const MobileSidebar = ({
  drawerWidth,
  container,
  mobileOpen,
  handleDrawerToggle,
  isAdmin,
}: MobileSidebarProps) => {

  const theme = useTheme();

  return (

    <Drawer

      container={container}

      variant="temporary"

      open={mobileOpen}

      onClose={handleDrawerToggle}

      ModalProps={{

        keepMounted: true,

      }}

      sx={{

        display: {

          xs: 'block',

          sm: 'block',

          md: 'block',

          lg: 'block',

          xl: 'none',

        },

        '& .MuiDrawer-paper': {

          boxSizing: 'border-box',

          width: drawerWidth,

          borderRight: '0px',

          backgroundColor: theme.palette.background.paper,

          boxShadow: (theme as any).customShadows.sidebar,

          borderRadius: '0px 10px 10px 0px',

        },

      }}

    >

      <DrawerContent isAdmin={isAdmin} />

    </Drawer>

  );

};

Sidebar.MobileSidebar = MobileSidebar;

export default Sidebar;

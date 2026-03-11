/*
MyJob Recruitment System - Part of MyJob Platform

Author: Bui Khanh Huy
Email: khuy220@gmail.com
Copyright (c) 2023 Bui Khanh Huy

License: MIT License
See the LICENSE file in the project root for full license information.
*/

import React, { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Avatar, Box, Divider, Drawer, useTheme, Toolbar, List, ListItem, ListItemIcon, ListItemText, ListItemButton, Collapse } from "@mui/material";

import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import GridViewIcon from '@mui/icons-material/GridView';
import ListAltOutlinedIcon from '@mui/icons-material/ListAltOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import BookmarkAddedOutlinedIcon from '@mui/icons-material/BookmarkAddedOutlined';
import ContentPasteSearchOutlinedIcon from '@mui/icons-material/ContentPasteSearchOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import LanguageSwitcher from '../../commons/LanguageSwitcher';

import { IMAGES, ROUTES, APP_NAME } from '../../../../configs/constants';

const StyledListItemButton = styled(ListItemButton)(({ theme }) => ({
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

const MenuItem = ({ icon: Icon, text, to, onClick, isSelected, isExpanded, hasChildren, isChild }) => {
  return (
    <StyledListItemButton
      component={to ? NavLink : 'div'}
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

const DrawerContent = ({ isAdmin }) => {
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
  });

  const handleExpand = (section) => {
    setExpandedItems(prev => ({
      ...prev,
      [section]: !prev[section]
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
                  text="System Overview"
                  to={`/${ROUTES.ADMIN.DASHBOARD}`}
                  isSelected={location.pathname === `/${ROUTES.ADMIN.DASHBOARD}`}
                />
              </ListItem>

              {/* System & Users */}
              <ListItem disablePadding>
                <MenuItem
                  icon={AccountCircleOutlinedIcon}
                  text="System & Users"
                  hasChildren
                  isExpanded={expandedItems.system}
                  onClick={() => handleExpand('system')}
                />
              </ListItem>
              <Collapse in={expandedItems.system} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  <MenuItem
                    text="Users & Permissions"
                    to={`/${ROUTES.ADMIN.USERS}`}
                    isSelected={location.pathname === `/${ROUTES.ADMIN.USERS}`}
                    isChild
                  />
                  <MenuItem
                    text="System Configuration"
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
                  text="General Categories"
                  hasChildren
                  isExpanded={expandedItems.categories}
                  onClick={() => handleExpand('categories')}
                />
              </ListItem>
              <Collapse in={expandedItems.categories} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  <MenuItem
                    text="Careers Management"
                    to={`/${ROUTES.ADMIN.CAREERS}`}
                    isSelected={location.pathname === `/${ROUTES.ADMIN.CAREERS}`}
                    isChild
                  />
                  <MenuItem
                    text="Cities Management"
                    to={`/${ROUTES.ADMIN.CITIES}`}
                    isSelected={location.pathname === `/${ROUTES.ADMIN.CITIES}`}
                    isChild
                  />
                  <MenuItem
                    text="Districts Management"
                    to={`/${ROUTES.ADMIN.DISTRICTS}`}
                    isSelected={location.pathname === `/${ROUTES.ADMIN.DISTRICTS}`}
                    isChild
                  />
                </List>
              </Collapse>

              {/* Info & Profiles */}
              <ListItem disablePadding>
                <MenuItem
                  icon={BusinessOutlinedIcon}
                  text="Info & Profiles"
                  hasChildren
                  isExpanded={expandedItems.profiles}
                  onClick={() => handleExpand('profiles')}
                />
              </ListItem>
              <Collapse in={expandedItems.profiles} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  <MenuItem
                    text="Company Management"
                    to={`/${ROUTES.ADMIN.COMPANIES}`}
                    isSelected={location.pathname === `/${ROUTES.ADMIN.COMPANIES}`}
                    isChild
                  />
                  <MenuItem
                    text="Candidate Profiles"
                    to={`/${ROUTES.ADMIN.PROFILES}`}
                    isSelected={location.pathname === `/${ROUTES.ADMIN.PROFILES}`}
                    isChild
                  />
                  <MenuItem
                    text="CV/Resume Management"
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
                  text="Recruitment & Interviews"
                  hasChildren
                  isExpanded={expandedItems.recruitment}
                  onClick={() => handleExpand('recruitment')}
                />
              </ListItem>
              <Collapse in={expandedItems.recruitment} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  <MenuItem
                    text="Job Posts"
                    to={`/${ROUTES.ADMIN.JOBS}`}
                    isSelected={location.pathname === `/${ROUTES.ADMIN.JOBS}`}
                    isChild
                  />
                  <MenuItem
                    text="Activity Logs"
                    to={`/${ROUTES.ADMIN.JOB_ACTIVITY}`}
                    isSelected={location.pathname === `/${ROUTES.ADMIN.JOB_ACTIVITY}`}
                    isChild
                  />
                  <MenuItem
                    text="Question Bank"
                    to={`/${ROUTES.ADMIN.QUESTIONS}`}
                    isSelected={location.pathname === `/${ROUTES.ADMIN.QUESTIONS}`}
                    isChild
                  />
                  <MenuItem
                    text="Interview Question Sets"
                    to={`/${ROUTES.ADMIN.QUESTION_GROUPS}`}
                    isSelected={location.pathname === `/${ROUTES.ADMIN.QUESTION_GROUPS}`}
                    isChild
                  />
                  <MenuItem
                    text="Interview Schedule"
                    to={`/${ROUTES.ADMIN.INTERVIEWS}`}
                    isSelected={location.pathname === `/${ROUTES.ADMIN.INTERVIEWS}`}
                    isChild
                  />
                  <MenuItem
                    text="Direct Company Interviews"
                    to={`/${ROUTES.ADMIN.INTERVIEW_LIVE}`}
                    isSelected={location.pathname === `/${ROUTES.ADMIN.INTERVIEW_LIVE}`}
                    isChild
                  />
                  <MenuItem
                    text="Job Notifications"
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
                  text="Dashboard"
                  to={`/${ROUTES.EMPLOYER.DASHBOARD}`}
                  isSelected={location.pathname === `/${ROUTES.EMPLOYER.DASHBOARD}`}
                />
              </ListItem>

              {/* Recruitment Management */}
              <ListItem disablePadding>
                <MenuItem
                  icon={ListAltOutlinedIcon}
                  text="Job Post List"
                  to={`/${ROUTES.EMPLOYER.JOB_POST}`}
                  isSelected={location.pathname === `/${ROUTES.EMPLOYER.JOB_POST}`}
                />
              </ListItem>

              {/* Candidate Management */}
              <ListItem disablePadding>
                <MenuItem
                  icon={FactCheckOutlinedIcon}
                  text="Candidate Management"
                  hasChildren
                  isExpanded={expandedItems.candidates}
                  onClick={() => handleExpand('candidates')}
                />
              </ListItem>
              <Collapse in={expandedItems.candidates} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  <MenuItem
                    text="Applied Applications"
                    to={`/${ROUTES.EMPLOYER.APPLIED_PROFILE}`}
                    isSelected={location.pathname === `/${ROUTES.EMPLOYER.APPLIED_PROFILE}`}
                    isChild
                  />
                  <MenuItem
                    text="Saved Profiles"
                    to={`/${ROUTES.EMPLOYER.SAVED_PROFILE}`}
                    isSelected={location.pathname === `/${ROUTES.EMPLOYER.SAVED_PROFILE}`}
                    isChild
                  />
                  <MenuItem
                    text="Find Candidates"
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
                  text="Online Interviews"
                  hasChildren
                  isExpanded={expandedItems.interviews}
                  onClick={() => handleExpand('interviews')}
                />
              </ListItem>
              <Collapse in={expandedItems.interviews} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  <MenuItem
                    text="Interview List"
                    to={`/${ROUTES.EMPLOYER.INTERVIEW_LIST}`}
                    isSelected={location.pathname === `/${ROUTES.EMPLOYER.INTERVIEW_LIST}`}
                    isChild
                  />
                  <MenuItem
                    text="Live Interview Room"
                    to={`/${ROUTES.EMPLOYER.INTERVIEW_LIVE}`}
                    isSelected={location.pathname === `/${ROUTES.EMPLOYER.INTERVIEW_LIVE}`}
                    isChild
                  />
                  <MenuItem
                    text="Question Bank"
                    to={`/${ROUTES.EMPLOYER.QUESTION_BANK}`}
                    isSelected={location.pathname === `/${ROUTES.EMPLOYER.QUESTION_BANK}`}
                    isChild
                  />
                  <MenuItem
                    text="Question Sets"
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
                  text={`${APP_NAME} Notifications`}
                  to={`/${ROUTES.EMPLOYER.NOTIFICATION}`}
                  isSelected={location.pathname === `/${ROUTES.EMPLOYER.NOTIFICATION}`}
                />
              </ListItem>

              {/* Account Management */}
              <ListItem disablePadding>
                <MenuItem
                  icon={BusinessOutlinedIcon}
                  text="Account Management"
                  hasChildren
                  isExpanded={expandedItems.account}
                  onClick={() => handleExpand('account')}
                />
              </ListItem>
              <Collapse in={expandedItems.account} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  <MenuItem
                    text="Company Info"
                    to={`/${ROUTES.EMPLOYER.COMPANY}`}
                    isSelected={location.pathname === `/${ROUTES.EMPLOYER.COMPANY}`}
                    isChild
                  />
                  <MenuItem
                    text="Employer Verification"
                    to={`/${ROUTES.EMPLOYER.VERIFICATION}`}
                    isSelected={location.pathname === `/${ROUTES.EMPLOYER.VERIFICATION}`}
                    isChild
                  />

                  <MenuItem
                    text="Account"
                    to={`/${ROUTES.EMPLOYER.ACCOUNT}`}
                    isSelected={location.pathname === `/${ROUTES.EMPLOYER.ACCOUNT}`}
                    isChild
                  />
                  <MenuItem
                    text="Settings"
                    to={`/${ROUTES.EMPLOYER.SETTING}`}
                    isSelected={location.pathname === `/${ROUTES.EMPLOYER.SETTING}`}
                    isChild
                  />
                </List>
              </Collapse>
            </>
          )}
          <Divider sx={{ my: 2, borderColor: 'grey.300' }} />
          <ListItem disablePadding sx={{ px: 2, pb: 2 }}>
            <LanguageSwitcher color="text.primary" />
          </ListItem>
        </List>
      </Box>
    </div>
  );
};

const Sidebar = ({ drawerWidth, isAdmin }) => {
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
          boxShadow: theme.customShadows.sidebar,
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
}) => {
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
          boxShadow: theme.customShadows.sidebar,
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

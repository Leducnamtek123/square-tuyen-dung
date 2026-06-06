'use client';
import * as React from "react";
import { useRouter, usePathname } from 'next/navigation';
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import WorkIcon from "@mui/icons-material/Work";
import ApartmentIcon from "@mui/icons-material/Apartment";
import CircleNotificationsIcon from "@mui/icons-material/CircleNotifications";
import ManageAccountsOutlinedIcon from "@mui/icons-material/ManageAccountsOutlined";
import VideoCameraFrontIcon from "@mui/icons-material/VideoCameraFront";
import { useTranslation } from 'react-i18next';
import { ROUTES, APP_NAME } from "../../../../configs/constants";
import { getLocalizedRouteVariants, localizeRoutePath } from "../../../../configs/routeLocalization";

const TabBar = () => {
  const pathname = usePathname();
  const { push } = useRouter();
  const { t, i18n } = useTranslation(['jobSeeker', 'common']);

  const tabItems = [
    { id: 1, label: t('jobSeeker:nav.myDashboard', { appName: APP_NAME }), icon: <DashboardIcon />, path: localizeRoutePath(`/${ROUTES.JOB_SEEKER.DASHBOARD}`, i18n.language) },
    {
      id: 2,
      label: t('jobSeeker:nav.profile'),
      icon: <AssignmentIndIcon />,
      path: localizeRoutePath(`/${ROUTES.JOB_SEEKER.PROFILE}`, i18n.language),
    },
    {
      id: 3,
      label: t('jobSeeker:nav.jobs'),
      icon: <WorkIcon />,
      path: localizeRoutePath(`/${ROUTES.JOB_SEEKER.MY_JOB}`, i18n.language),
    },
    {
      id: 4,
      label: t('jobSeeker:nav.myCompany'),
      icon: <ApartmentIcon />,
      path: localizeRoutePath(`/${ROUTES.JOB_SEEKER.MY_COMPANY}`, i18n.language),
    },
    {
      id: 5,
      label: t('jobSeeker:nav.myInterviews'),
      icon: <VideoCameraFrontIcon />,
      path: localizeRoutePath(`/${ROUTES.JOB_SEEKER.MY_INTERVIEWS}`, i18n.language),
    },
    {
      id: 6,
      label: t('jobSeeker:nav.notifications'),
      icon: <CircleNotificationsIcon />,
      path: localizeRoutePath(`/${ROUTES.JOB_SEEKER.NOTIFICATION}`, i18n.language),
    },
    {
      id: 7,
      label: t('jobSeeker:nav.accountSettings'),
      icon: <ManageAccountsOutlinedIcon />,
      path: localizeRoutePath(`/${ROUTES.JOB_SEEKER.ACCOUNT}`, i18n.language),
    },
  ];

  const activeTabIndex = tabItems.findLastIndex((tab) =>
    getLocalizedRouteVariants(tab.path).some((path) => pathname.includes(path))
  );

  const [value, setValue] = React.useState(activeTabIndex !== -1 ? activeTabIndex : 0);

  React.useEffect(() => {
    if (activeTabIndex !== -1) {
      setValue(activeTabIndex);
    }
  }, [activeTabIndex]);

  const selectTab = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box
      sx={{
        width: "100%",
        px: 5,
        pt: 2,
        backgroundColor: (theme) => theme.palette.grey[50],
      }}
    >
      <Tabs
        value={value}
        onChange={selectTab}
        variant="scrollable"
        scrollButtons
        allowScrollButtonsMobile
        aria-label={t('jobSeeker:nav.tabsAria')}
        sx={{
          minHeight: '60px',
          '& .MuiTabs-scroller': {
            height: '100%',
            display: 'flex',
            alignItems: 'center'
          },
          '& .MuiTabs-flexContainer': {
            alignItems: 'center'
          },
          '& .MuiTabScrollButton-root': {
            width: 48,
            height: '100%',
            alignSelf: 'center'
          }
        }}
      >
        {tabItems.map((tab) => (
          <Tab
            onClick={() => push(tab.path)}
            key={tab.id}
            icon={tab.icon}
            iconPosition="start"
            label={tab.label}
            sx={{
              mx: 0.5,
              transition: 'all 0.2s ease-in-out',
              '&:first-of-type': {
                ml: 0
              },
              '&:last-of-type': {
                mr: 0
              }
            }}
          />
        ))}
      </Tabs>
    </Box>
  );
};

export default TabBar;

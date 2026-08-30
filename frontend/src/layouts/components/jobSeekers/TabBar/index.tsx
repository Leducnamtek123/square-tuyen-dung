'use client';

import * as React from "react";
import { useRouter, usePathname } from 'next/navigation';
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import GridViewIcon from "@mui/icons-material/GridView";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import ApartmentIcon from "@mui/icons-material/Apartment";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import ManageAccountsOutlinedIcon from "@mui/icons-material/ManageAccountsOutlined";
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";
import AutoFixHighOutlinedIcon from "@mui/icons-material/AutoFixHighOutlined";
import { useTranslation } from 'react-i18next';
import { ROUTES, APP_NAME } from "../../../../configs/constants";
import { getLocalizedRouteVariants, localizeRoutePath } from "../../../../configs/routeLocalization";

const TabBar = () => {
  const pathname = usePathname();
  const { push } = useRouter();
  const { t, i18n } = useTranslation(['jobSeeker', 'common']);

  const tabItems = [
    {
      id: 1,
      label: t('tabs.dashboard', { defaultValue: `Trang chủ ${APP_NAME}` }),
      icon: <GridViewIcon sx={{ fontSize: 20 }} />,
      path: localizeRoutePath(`/${ROUTES.JOB_SEEKER.DASHBOARD}`, i18n.language),
    },
    {
      id: 2,
      label: t('tabs.profile', { defaultValue: 'Hồ sơ của tôi' }),
      icon: <BadgeOutlinedIcon sx={{ fontSize: 20 }} />,
      path: localizeRoutePath(`/${ROUTES.JOB_SEEKER.PROFILE}`, i18n.language),
    },
    {
      id: 2.5,
      label: t('tabs.cvDesign', { defaultValue: 'Trang trí CV' }),
      icon: <AutoFixHighOutlinedIcon sx={{ fontSize: 20 }} />,
      path: localizeRoutePath('/ung-vien/trang-tri-cv', i18n.language),
    },
    {
      id: 3,
      label: t('tabs.jobs', { defaultValue: 'Việc làm' }),
      icon: <WorkOutlineIcon sx={{ fontSize: 20 }} />,
      path: localizeRoutePath(`/${ROUTES.JOB_SEEKER.MY_JOB}`, i18n.language),
    },
    {
      id: 4,
      label: t('tabs.companies', { defaultValue: 'Công ty của tôi' }),
      icon: <ApartmentIcon sx={{ fontSize: 20 }} />,
      path: localizeRoutePath(`/${ROUTES.JOB_SEEKER.MY_COMPANY}`, i18n.language),
    },
    {
      id: 5,
      label: t('tabs.interviews', { defaultValue: 'Phỏng vấn của tôi' }),
      icon: <VideocamOutlinedIcon sx={{ fontSize: 20 }} />,
      path: localizeRoutePath(`/${ROUTES.JOB_SEEKER.MY_INTERVIEWS}`, i18n.language),
    },
    {
      id: 6,
      label: t('tabs.notifications', { defaultValue: 'Thông báo' }),
      icon: <NotificationsNoneOutlinedIcon sx={{ fontSize: 20 }} />,
      path: localizeRoutePath(`/${ROUTES.JOB_SEEKER.NOTIFICATION}`, i18n.language),
    },
    {
      id: 7,
      label: t('tabs.account', { defaultValue: 'Tài khoản & Thiết lập' }),
      icon: <ManageAccountsOutlinedIcon sx={{ fontSize: 20 }} />,
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
        px: { xs: 2, md: 4 },
        backgroundColor: "#ffffff",
        borderBottom: "1px solid #e2e8f0",
        boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
      }}
    >
      <Tabs
        value={value}
        onChange={selectTab}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        aria-label={t('jobSeeker:nav.tabsAria')}
        sx={{
          minHeight: '52px',
          '& .MuiTabs-scroller': {
            display: 'flex',
            alignItems: 'center',
          },
          '& .MuiTabs-indicator': {
            backgroundColor: '#2563eb',
            height: 3,
            borderRadius: '3px 3px 0 0',
          },
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
              minHeight: '52px',
              px: 2,
              mx: 0.5,
              fontSize: '0.9rem',
              fontWeight: 600,
              textTransform: 'none',
              color: '#64748b',
              transition: 'all 0.2s ease-in-out',
              '&.Mui-selected': {
                color: '#2563eb',
                fontWeight: 700,
                '& .MuiSvgIcon-root': {
                  color: '#2563eb',
                },
              },
              '&:hover': {
                color: '#2563eb',
                backgroundColor: '#f8fafc',
              },
            }}
          />
        ))}
      </Tabs>
    </Box>
  );
};

export default TabBar;

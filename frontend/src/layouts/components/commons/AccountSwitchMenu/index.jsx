import * as React from 'react';

import { Stack, Typography, Button, Box } from "@mui/material";

import { useTranslation } from 'react-i18next';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import {

  faArrowRight,

  faBriefcase,

  faUsers,

} from '@fortawesome/free-solid-svg-icons';

import { HOST_NAME, ROUTES } from '../../../../configs/constants';

const AccountSwitchMenu = ({ isShowButton = false }) => {

  const { t } = useTranslation('common');

  const hostName = window.location.hostname;
  const pathname = window.location.pathname || "/";
  const isEmployerPortal =
    pathname.startsWith("/employer") ||
    pathname.startsWith("/employee") ||
    hostName === HOST_NAME.EMPLOYER_MYJOB;

  const openPortal = (toEmployer = false, path = "") => {
    const isSpecial = hostName === 'localhost' || hostName === '127.0.0.1' || /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(hostName);
    const normalizedPath = path ? `/${path.replace(/^\/+/, "")}` : "";
    
    let targetUrl = "";
    if (isSpecial) {
      // Local/IP: Dùng path-based (Sửa thành /employee cho đúng router)
      const baseUrl = toEmployer ? `${window.location.origin}/employee` : window.location.origin;
      targetUrl = `${baseUrl}${normalizedPath}`;
    } else {
      // Production: Dùng Subdomain
      const targetHost = toEmployer ? HOST_NAME.EMPLOYER_MYJOB : HOST_NAME.MYJOB;
      const protocol = window.location.protocol;
      const port = window.location.port ? `:${window.location.port}` : "";
      targetUrl = `${protocol}//${targetHost}${port}${normalizedPath}`;
    }
    
    window.open(targetUrl, "_blank");
  };

  const handleClick = () => {
    openPortal(!isEmployerPortal);
  };

  const handleClickAuth = (isLogin = false) => {

    const path = isLogin ? ROUTES.AUTH.LOGIN : ROUTES.AUTH.REGISTER;

    openPortal(!isEmployerPortal, path);

  }

  const title = React.useMemo(() => {

    return !isEmployerPortal ? (

      <Stack direction="row" alignItems="center">

        <FontAwesomeIcon

          color="#2c95ff"

          icon={faBriefcase}

          fontSize={25}

          style={{ marginRight: 8 }}

        />

        <Stack direction="column">

          <Typography>{t('nav.switch.forEmployers')}</Typography>

          <Typography variant="caption" sx={{ fontSize: 11 }}>

            {t('nav.switch.postFreeJob')}

          </Typography>

        </Stack>

      </Stack>

    ) : (

      <Stack direction="row" alignItems="center">

        <FontAwesomeIcon

          color="#2c95ff"

          icon={faUsers}

          fontSize={25}

          style={{ marginRight: 8 }}

        />

        <Stack direction="column">

          <Typography>{t('nav.switch.forJobSeekers')}</Typography>

          <Typography variant="caption" sx={{ fontSize: 11 }}>

            <FontAwesomeIcon icon={faArrowRight} /> {t('nav.switch.switch')}

          </Typography>

        </Stack>

      </Stack>

    );

  }, [isEmployerPortal, t]);

  return (

    <div>

      {isShowButton ? (

        <Stack spacing={1} sx={{ px: 2 }}>

          <Button

            variant="outlined"

            fullWidth

            color="inherit"

            onClick={() => handleClickAuth(true)}

            size="small"

            sx={{ textTransform: 'inherit' }}

          >

            {isEmployerPortal

              ? t('nav.switch.candidateLogin')

              : t('nav.switch.employerLogin')}

          </Button>

          <Button

            variant="outlined"

            fullWidth

            size="small"

            color="inherit"

            sx={{ textTransform: 'inherit' }}

            onClick={() => handleClickAuth(false)}

          >

            {isEmployerPortal

              ? t('nav.switch.candidateRegister')

              : t('nav.switch.employerRegister')}

          </Button>

        </Stack>

      ) : (

        <Box

          sx={{ ml: 1, cursor: 'pointer' }}

          onClick={handleClick}

        >

          {title}

        </Box>

      )}

    </div>

  );

};

export default React.memo(AccountSwitchMenu);

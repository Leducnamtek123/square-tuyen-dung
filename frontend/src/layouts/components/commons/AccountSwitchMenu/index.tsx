// @ts-nocheck
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
import { buildPortalPath, getPreferredLanguage, isEmployerPortalPath } from '../../../../configs/portalRouting';

interface Props {
  [key: string]: any;
}



const AccountSwitchMenu = ({ isShowButton = false }) => {

  const { t } = useTranslation('common');

  const hostName = window.location.hostname;
  const pathname = window.location.pathname || "/";
  const isEmployerPortal = isEmployerPortalPath(pathname) || hostName.startsWith("employer.");

  const openPortal = (toEmployer = false, path = "") => {
    const normalizedPath = path ? `/${path.replace(/^\/+/, "")}` : "";
    const protocol = window.location.protocol;
    const port = window.location.port ? `:${window.location.port}` : "";
    const language = getPreferredLanguage();

    const mainHost = HOST_NAME.PROJECT;
    let targetUrl = "";

    if (toEmployer) {
      targetUrl = `${protocol}//${mainHost}${port}${buildPortalPath("employer", normalizedPath, language)}`;
    } else {
      targetUrl = `${protocol}//${mainHost}${port}${normalizedPath}`;
    }

    window.location.href = targetUrl;
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

          <Typography sx={{ whiteSpace: 'nowrap', lineHeight: 1.2 }}>{t('nav.switch.forEmployers')}</Typography>

          <Typography variant="caption" sx={{ fontSize: 10, whiteSpace: 'nowrap', lineHeight: 1 }}>

            {t('nav.switch.postFreeJob')}

          </Typography>

        </Stack>

      </Stack>

    ) : (

      <Stack direction="row" alignItems="center">

        <FontAwesomeIcon

          color="#2c95ff"

          icon={faUsers}

          fontSize={20}

          style={{ marginRight: 8 }}

        />

        <Stack direction="column">

          <Typography sx={{ whiteSpace: 'nowrap', lineHeight: 1.2 }}>{t('nav.switch.forJobSeekers')}</Typography>

          <Typography variant="caption" sx={{ fontSize: 10, whiteSpace: 'nowrap', lineHeight: 1 }}>

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

          sx={{ cursor: 'pointer' }}

          onClick={handleClick}

        >

          {title}

        </Box>

      )}

    </div>

  );

};

export default React.memo(AccountSwitchMenu);

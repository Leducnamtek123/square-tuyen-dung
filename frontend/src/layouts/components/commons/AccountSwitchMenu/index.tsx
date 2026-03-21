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

interface AccountSwitchMenuProps {
  isShowButton?: boolean;
}



const AccountSwitchMenu = ({ isShowButton = false }: AccountSwitchMenuProps) => {

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

          color="white"

          icon={faBriefcase}

          fontSize={18}

          style={{ marginRight: 10 }}

        />

        <Stack direction="column">

          <Typography sx={{ whiteSpace: 'nowrap', lineHeight: 1.2, color: 'white', fontWeight: 600, fontSize: '0.875rem' }}>{t('nav.switch.forEmployers')}</Typography>

          <Typography variant="caption" sx={{ fontSize: 11, whiteSpace: 'nowrap', lineHeight: 1, color: 'rgba(255,255,255,0.7)' }}>

            {t('nav.switch.postFreeJob')}

          </Typography>

        </Stack>

      </Stack>

    ) : (

      <Stack direction="row" alignItems="center">

        <FontAwesomeIcon

          color="white"

          icon={faUsers}

          fontSize={18}

          style={{ marginRight: 10 }}

        />

        <Stack direction="column">

          <Typography sx={{ whiteSpace: 'nowrap', lineHeight: 1.2, color: 'white', fontWeight: 600, fontSize: '0.875rem' }}>{t('nav.switch.forJobSeekers')}</Typography>

          <Typography variant="caption" sx={{ fontSize: 11, whiteSpace: 'nowrap', lineHeight: 1, color: 'rgba(255,255,255,0.7)' }}>

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

        sx={{
          cursor: 'pointer',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          px: 2,
          py: 1,
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          transition: 'all 0.3s ease',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderColor: 'rgba(255, 255, 255, 0.4)',
            transform: 'translateY(-1px)',
          },
        }}

        onClick={handleClick}

      >

        {title}

      </Box>

      )}

    </div>

  );

};

export default React.memo(AccountSwitchMenu);

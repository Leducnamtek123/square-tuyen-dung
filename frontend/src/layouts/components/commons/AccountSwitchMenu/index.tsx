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

        /* Drawer mode: compact buttons, text wraps, không cắt */
        <Stack spacing={1} sx={{ px: 2, overflow: 'hidden' }}>

          <Button

            variant="outlined"

            fullWidth

            color="primary"

            onClick={() => handleClickAuth(true)}

            size="small"

            sx={{
              textTransform: 'none',
              fontSize: '0.78rem',
              lineHeight: 1.4,
              whiteSpace: 'normal',
              textAlign: 'center',
              py: 0.75,
              borderRadius: 2,
            }}

          >

            {isEmployerPortal

              ? t('nav.switch.candidateLogin')

              : t('nav.switch.employerLogin')}

          </Button>

          <Button

            variant="outlined"

            fullWidth

            size="small"

            color="primary"

            sx={{
              textTransform: 'none',
              fontSize: '0.78rem',
              lineHeight: 1.4,
              whiteSpace: 'normal',
              textAlign: 'center',
              py: 0.75,
              borderRadius: 2,
            }}

            onClick={() => handleClickAuth(false)}

          >

            {isEmployerPortal

              ? t('nav.switch.candidateRegister')

              : t('nav.switch.employerRegister')}

          </Button>

        </Stack>

      ) : (

        <Button
          variant="contained"
          size="small"
          onClick={handleClick}
          startIcon={
            <FontAwesomeIcon
              icon={!isEmployerPortal ? faBriefcase : faUsers}
              fontSize={12}
            />
          }
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            color: 'white',
            borderRadius: '20px',
            px: 1.5,
            py: 0.6,
            fontSize: '0.78rem',
            fontWeight: 600,
            textTransform: 'none',
            whiteSpace: 'nowrap',
            boxShadow: 'none',
            border: '1px solid rgba(255,255,255,0.3)',
            backdropFilter: 'blur(8px)',
            transition: 'all 0.25s ease',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.25)',
              borderColor: 'rgba(255,255,255,0.55)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              transform: 'translateY(-1px)',
            },
          }}
        >
          {!isEmployerPortal ? t('nav.switch.forEmployers') : t('nav.switch.forJobSeekers')}
        </Button>

      )}

    </div>

  );

};

export default React.memo(AccountSwitchMenu);

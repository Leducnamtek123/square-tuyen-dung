// @ts-nocheck
import React from 'react';

import { Box, Card } from "@mui/material";

import { useTranslation } from "react-i18next";

import { TabTitle } from '../../../utils/generalFunction';

import ProfileDetailCard from '../../components/employers/ProfileDetailCard';

interface Props {
  [key: string]: any;
}



const ProfileDetailPage = () => {

  const { t } = useTranslation('employer');

  TabTitle(t('profileDetailCard.title.profileDetail'))

  return (

    <Card sx={{ p: 3 }}>

      <Box>

        {/* Start: ProfileDetailCard */}

        <ProfileDetailCard />

        {/* End: ProfileDetailCard */}

      </Box>

    </Card>

  );

};

export default ProfileDetailPage;

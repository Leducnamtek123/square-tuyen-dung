import React from 'react';

import { Box, Button, Stack, Typography } from "@mui/material";

import { SVG_IMAGES } from '../../configs/constants';

import SvgIcon from '../SvgIcon';

const NoDataCard = ({

  title = 'No data available',

  content,

  buttonText,

  onClick,

  svgKey = 'ImageSvg1',

}) => {

  return (

    <Stack

      spacing={2}

      alignItems="center"

      justifyContent="center"

      sx={{

        p: 3,

        minHeight: 200,

      }}

    >

      <Box sx={{ width: { xs: 150, sm: 200 } }}>

        <SvgIcon src={SVG_IMAGES[svgKey]} />

      </Box>

      <Typography variant="h6" align="center">

        {title}

      </Typography>

      {content && (

        <Typography variant="body2" align="center" color="text.secondary">

          {content}

        </Typography>

      )}

      {buttonText && (

        <Button variant="contained" onClick={onClick}>

          {buttonText}

        </Button>

      )}

    </Stack>

  );

};

export default NoDataCard;

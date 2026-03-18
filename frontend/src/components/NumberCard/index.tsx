// @ts-nocheck
import React from 'react';

import { Box, Card, Typography } from "@mui/material";

interface Props {
  [key: string]: any;
}



const NumberCard = ({ color, backgroundColor }: Props) => {

  return (

    <Card

      sx={{ p: 1.5, borderColor: color, backgroundColor: backgroundColor }}

      variant="outlined"

    >

      <Box sx={{ p: 1 }}>

        <Typography variant="h3" sx={{ fontWeight: 'bold', color: color }}>

          2

        </Typography>

      </Box>

      <Box>

        <Typography variant="button">Nhà tuyển dụng xem hồ sơ</Typography>

      </Box>

    </Card>

  );

};

export default NumberCard;

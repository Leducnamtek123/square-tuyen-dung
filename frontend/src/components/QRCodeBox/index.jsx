import React from 'react';
import { Stack, Typography } from '@mui/material';
import { QRCodeCanvas } from 'qrcode.react';

const QRCodeBox = ({ value, label, size = 120 }) => (
  <Stack direction="column" alignItems="center" spacing={1}>
    <QRCodeCanvas value={value || '-'} size={size} includeMargin />
    {label ? (
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
    ) : null}
  </Stack>
);

export default QRCodeBox;

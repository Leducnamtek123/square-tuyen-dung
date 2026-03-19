import React from 'react';
import { Stack, Typography } from "@mui/material";
import { QRCodeCanvas } from 'qrcode.react';

interface Props {
  value: string;
  label?: string;
  size?: number;
}

const QRCodeBox = ({ value, label, size = 120 }: Props) => (
  <Stack direction="column" alignItems="center" spacing={1}>
    <QRCodeCanvas value={value || '-'} size={size} marginSize={4} />
    {label ? (
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
    ) : null}
  </Stack>
);

export default QRCodeBox;

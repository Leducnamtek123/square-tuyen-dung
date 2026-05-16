import React from 'react';
import { Viewer, Worker, SpecialZoomLevel } from '@react-pdf-viewer/core';
import { getFilePlugin } from '@react-pdf-viewer/get-file';
import { zoomPlugin } from '@react-pdf-viewer/zoom';
import Button from '@mui/material/Button';
import { Box, Chip, IconButton, Stack } from '@mui/material';
import ZoomOutOutlinedIcon from '@mui/icons-material/ZoomOutOutlined';
import ZoomInOutlinedIcon from '@mui/icons-material/ZoomInOutlined';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { useTranslation } from 'react-i18next';
import toSlug from '@/utils/customData';
import type { Theme } from '@mui/material/styles';

interface PdfProps {
  fileUrl: string;
  title?: string;
}

const Pdf = ({ fileUrl, title = '' }: PdfProps) => {
  const { t } = useTranslation('common');

  if (!fileUrl) return null;

  const zoomPluginInstance = zoomPlugin();
  const getFilePluginInstance = getFilePlugin({
    fileNameGenerator: () => `project_CV-${toSlug(title)}`,
  });

  const { Download } = getFilePluginInstance;
  const { ZoomIn, ZoomOut, Zoom } = zoomPluginInstance;

  return (
    <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
      <Stack
        spacing={0}
        sx={{ border: 1, borderColor: '#e0e0e0', borderRadius: 2, overflow: 'hidden' }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', sm: 'center' }}
          spacing={1}
          sx={{ bgcolor: '#441da0', px: 2, py: 1.25 }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent={{ xs: 'center', sm: 'flex-start' }}
            spacing={0.5}
          >
            <ZoomOut>
              {(props: { onClick: () => void }) => (
                <IconButton aria-label="zoom-out" color="warning" onClick={props.onClick}>
                  <ZoomOutOutlinedIcon />
                </IconButton>
              )}
            </ZoomOut>

            <Zoom>
              {(props: { onZoom: (scale: number | SpecialZoomLevel) => void }) => (
                <Chip
                  sx={{ color: 'white', maxWidth: 130 }}
                  size="small"
                  onClick={() => props.onZoom(SpecialZoomLevel.ActualSize)}
                  label="100%"
                  color="warning"
                />
              )}
            </Zoom>

            <ZoomIn>
              {(props: { onClick: () => void }) => (
                <IconButton aria-label="zoom-in" color="warning" onClick={props.onClick}>
                  <ZoomInOutlinedIcon />
                </IconButton>
              )}
            </ZoomIn>
          </Stack>

          <Stack direction="row" justifyContent={{ xs: 'center', sm: 'flex-end' }}>
            <Download>
              {(props: { onClick: () => void }) => (
                <Button
                  sx={{
                    boxShadow: (theme: Theme & { customShadows?: { medium?: string } }) =>
                      theme.customShadows?.medium || 'none',
                    color: 'white',
                    textTransform: 'none',
                    '&:hover': {
                      transform: 'scale(1.03)',
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                  variant="contained"
                  color="warning"
                  onClick={props.onClick}
                  startIcon={<FileDownloadIcon />}
                >
                  {t('actions.download', { defaultValue: 'Tai xuong' })}
                </Button>
              )}
            </Download>
          </Stack>
        </Stack>

        <Box
          sx={{
            height: 'min(80vh, 900px)',
            minHeight: 520,
            overflow: 'auto',
            bgcolor: '#fff',
          }}
        >
          <Viewer
            fileUrl={fileUrl}
            plugins={[zoomPluginInstance, getFilePluginInstance]}
            defaultScale={SpecialZoomLevel.PageFit}
          />
        </Box>
      </Stack>
    </Worker>
  );
};

export default Pdf;

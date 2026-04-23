import React from 'react';
import { alpha, Box, Chip, Stack, Typography } from '@mui/material';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import { BarVisualizer, RoomAudioRenderer, useTracks, VideoTrack } from '@livekit/components-react';
import { Track } from 'livekit-client';

const InterviewObserverDialogVisualizer = () => {
  const audioTracks = useTracks([Track.Source.Microphone]);
  const videoTracks = useTracks([Track.Source.Camera]);
  const screenTracks = useTracks([Track.Source.ScreenShare]);

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
      {screenTracks.length > 0 && (
        <Box sx={{ width: '100%', flex: 1, position: 'relative', borderRadius: 2, overflow: 'hidden', border: '2px solid', borderColor: alpha('#22c55e', 0.3), bgcolor: '#000' }}>
          <VideoTrack trackRef={screenTracks[0]} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          <Chip
            label="SCREEN SHARE"
            size="small"
            sx={{ position: 'absolute', top: 8, left: 8, fontWeight: 900, fontSize: '0.6rem', letterSpacing: 1, bgcolor: alpha('#22c55e', 0.85), color: '#fff', height: 22 }}
          />
        </Box>
      )}

      {videoTracks.length > 0 ? (
        <Box sx={{ width: screenTracks.length > 0 ? 180 : '100%', height: screenTracks.length > 0 ? 135 : '100%', maxHeight: screenTracks.length > 0 ? 135 : 320, position: screenTracks.length > 0 ? 'absolute' : 'relative', bottom: screenTracks.length > 0 ? 16 : 'auto', right: screenTracks.length > 0 ? 16 : 'auto', zIndex: 2, borderRadius: 2, overflow: 'hidden', border: '2px solid', borderColor: alpha('#a855f7', 0.4), boxShadow: screenTracks.length > 0 ? '0 8px 32px rgba(0,0,0,0.6)' : 'none', bgcolor: '#000' }}>
          <VideoTrack trackRef={videoTracks[0]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </Box>
      ) : (
        <Stack spacing={3} alignItems="center" sx={{ py: 4 }}>
          {audioTracks.length > 0 ? (
            <>
              <Box sx={{ height: 100, width: '100%', maxWidth: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BarVisualizer barCount={15} style={{ height: '60px', width: '200px' }} />
              </Box>
              <Typography variant="caption" sx={{ color: '#22c55e', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <FiberManualRecordIcon sx={{ fontSize: 8, animation: 'pulse 1.5s infinite' }} />
                Live Audio - No Video
              </Typography>
            </>
          ) : (
            <>
              <VolumeUpIcon sx={{ fontSize: 64, color: 'rgba(255,255,255,0.1)' }} />
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.2)', fontWeight: 700 }}>
                Waiting for Audio/Video Tracks...
              </Typography>
            </>
          )}
        </Stack>
      )}

      {(videoTracks.length > 0 || screenTracks.length > 0) && (
        <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 3 }}>
          <Typography variant="caption" sx={{ color: '#22c55e', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 2, fontSize: '0.6rem', display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: 'rgba(0,0,0,0.6)', px: 1.5, py: 0.5, borderRadius: 1 }}>
            <FiberManualRecordIcon sx={{ fontSize: 8, animation: 'pulse 1.5s infinite', '@keyframes pulse': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.3 } } }} />
            LIVE
          </Typography>
        </Box>
      )}
      <RoomAudioRenderer />
    </Box>
  );
};

export default InterviewObserverDialogVisualizer;

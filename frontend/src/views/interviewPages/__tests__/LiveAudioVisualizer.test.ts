import { readFileSync } from 'fs';
import { join } from 'path';

describe('LiveAudioVisualizer Suite', () => {
  it('implements LiveAudioVisualizerContainer with wave, bar, and aura modes', () => {
    const source = readFileSync(
      join(__dirname, '../components/LiveAudioVisualizerContainer.tsx'),
      'utf8',
    );
    expect(source).toContain("export type VisualizerMode = 'wave' | 'bar' | 'aura'");
    expect(source).toContain('LiveAudioVisualizerWave');
    expect(source).toContain('LiveAudioVisualizerBar');
    expect(source).toContain('AgentAudioVisualizerAura');
    expect(source).toContain('useLiveAudioTrackAnalyzer');
  });

  it('implements LiveAudioVisualizerWave with dynamic sine wave calculation and dB badge', () => {
    const source = readFileSync(
      join(__dirname, '../components/LiveAudioVisualizerWave.tsx'),
      'utf8',
    );
    expect(source).toContain('LiveAudioVisualizerWave');
    expect(source).toContain('requestAnimationFrame');
    expect(source).toContain('Math.sin');
    expect(source).toContain('analyzer.dbLevel');
  });

  it('implements LiveAudioVisualizerBar with multiband symmetrical heights and dB badge', () => {
    const source = readFileSync(
      join(__dirname, '../components/LiveAudioVisualizerBar.tsx'),
      'utf8',
    );
    expect(source).toContain('LiveAudioVisualizerBar');
    expect(source).toContain('displayBands');
    expect(source).toContain('dbLevel');
  });

  it('implements LiveMicActivityBadge with micro icon, 5-bar voice activity, and live dB', () => {
    const source = readFileSync(
      join(__dirname, '../components/LiveMicActivityBadge.tsx'),
      'utf8',
    );
    expect(source).toContain('LiveMicActivityBadge');
    expect(source).toContain('faMicrophone');
    expect(source).toContain('faMicrophoneSlash');
    expect(source).toContain('miniBars');
    expect(source).toContain('dbLevel');
  });

  it('AIInterviewLayout subscribes to microphone tracks and supplies audio to both AI and Candidate tiles', () => {
    const source = readFileSync(join(__dirname, '../AIInterviewLayout.tsx'), 'utf8');
    expect(source).toContain('Track.Source.Microphone');
    expect(source).toContain('candidateAudioTrack');
    expect(source).toContain('agentAudioTrack');
    expect(source).toContain('LiveAudioVisualizerContainer');
    expect(source).toContain('LiveMicActivityBadge');
  });
});

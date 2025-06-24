import React, { useState, useRef } from 'react';
import { Box, Button, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { generateSpeech } from '../services/openai';

const CONTEXTS = [
  { key: 'train', label: 'Train Station', video: 'https://trustworthy-voices-videos.s3.amazonaws.com/trimmed_train.mp4' },
  { key: 'hospital', label: 'Hospital', video: 'https://trustworthy-voices-videos.s3.amazonaws.com/trimmed_hospital.mp4' },
  { key: 'car', label: 'Car', video: 'https://trustworthy-voices-videos.s3.amazonaws.com/trimmed_car.mp4' },
];

const PITCH_OPTIONS = [
  'the lowest possible voice',
  'a medium-low voice',
  'a slightly high voice',
  'a very high voice',
];
const VARIATION_OPTIONS = [
  'in a monotone',
  'with slight variation',
  'with some variation',
  'with a lot of variation',
];
const BREATHINESS_OPTIONS = [
  'resonant',
  'slightly breathy',
  'breathy',
  'very breathy',
];
const SPEED_OPTIONS = [
  'and speak very slowly.',
  'and speak slowly.',
  'and speak quickly.',
  'and speak very quickly.',
];

const ExhibitionPage: React.FC = () => {
  const [context, setContext] = useState('train');
  const [pitch, setPitch] = useState(PITCH_OPTIONS[0]);
  const [variation, setVariation] = useState(VARIATION_OPTIONS[0]);
  const [breathiness, setBreathiness] = useState(BREATHINESS_OPTIONS[0]);
  const [speed, setSpeed] = useState(SPEED_OPTIONS[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const getVideoSrc = () => {
    const found = CONTEXTS.find(c => c.key === context);
    if (found && found.key === 'car') {
      return 'https://trustworthy-voices-videos.s3.amazonaws.com/trimmed_car.mp4';
    }
    return found ? found.video : 'https://trustworthy-voices-videos.s3.amazonaws.com/trimmed_train.mp4';
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    setAudioUrl(null);
    const instructions = [pitch, variation, breathiness, speed].join(' ');
    try {
      const text =
        context === 'train'
          ? 'Attention all passengers. The train to Platform 5 is now boarding. Please have your tickets ready.'
          : context === 'hospital'
          ? 'Please can all patients proceed to the waiting room after registration at the front desk.'
          : 'In two hundred meters, turn left. Then, you have reached your destination.';
      const audioBlob = await generateSpeech({
        text,
        voice: 'ballad',
        model: 'gpt-4o-mini-tts',
        instructions,
      });
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
    } catch {
      alert('Failed to generate voice.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          objectFit: 'cover',
          zIndex: 0,
        }}
        src={getVideoSrc()}
      />
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0,0,0,0.35)',
        }}
      >
        <Box sx={{ display: 'flex', mb: 4, gap: 2 }}>
          {CONTEXTS.map(c => (
            <Button
              key={c.key}
              variant={context === c.key ? 'contained' : 'outlined'}
              color="primary"
              sx={{
                fontSize: '1.2rem',
                px: 4,
                py: 1,
                borderRadius: 6,
                fontWeight: 600,
                ...(context !== c.key && {
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  borderColor: 'transparent',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.4)',
                    borderColor: 'transparent',
                  }
                })
              }}
              onClick={() => setContext(c.key)}
            >
              {c.label}
            </Button>
          ))}
        </Box>
        <Box sx={{ mb: 3, fontSize: '1.1rem', color: '#fff', textShadow: '0 1px 8px #000, 0 0px 2px #000', fontWeight: 400 }}>
          Select the prompt that will be used to generate the voice.
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 2,
            mb: 4,
            width: { xs: '98vw', md: '80vw' },
            maxWidth: 1200,
            background: 'rgba(255,255,255,0.85)',
            borderRadius: 4,
            boxShadow: 3,
            p: 3,
          }}
        >
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Pitch</InputLabel>
            <Select value={pitch} onChange={(e) => setPitch(e.target.value)} label="Pitch">
              {PITCH_OPTIONS.map((option) => (
                <MenuItem key={option} value={option}>{option}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Variation</InputLabel>
            <Select value={variation} onChange={(e) => setVariation(e.target.value)} label="Variation">
              {VARIATION_OPTIONS.map((option) => (
                <MenuItem key={option} value={option}>{option}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Breathiness</InputLabel>
            <Select value={breathiness} onChange={(e) => setBreathiness(e.target.value)} label="Breathiness">
              {BREATHINESS_OPTIONS.map((option) => (
                <MenuItem key={option} value={option}>{option}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Speed</InputLabel>
            <Select value={speed} onChange={(e) => setSpeed(e.target.value)} label="Speed">
              {SPEED_OPTIONS.map((option) => (
                <MenuItem key={option} value={option}>{option}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Button
          variant="contained"
          color="secondary"
          size="large"
          sx={{
            fontSize: '1.5rem',
            px: 6,
            py: 2.5,
            borderRadius: 8,
            fontWeight: 700,
            mb: 3,
            minWidth: 320,
            boxShadow: 4,
          }}
          onClick={handleGenerate}
          disabled={isLoading}
        >
          {isLoading ? 'Generating...' : 'Does this voice sound trustworthy?'}
        </Button>
        {audioUrl && (
          <audio controls src={audioUrl} style={{ marginTop: '1rem' }} />
        )}
      </Box>
    </Box>
  );
};

export default ExhibitionPage; 
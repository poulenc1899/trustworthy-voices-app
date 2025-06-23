import React, { useState, useRef } from 'react';
import { Box, Button, IconButton } from '@mui/material';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import { generateSpeech } from '../services/openai';
import Picker from 'react-mobile-picker';

const CONTEXTS = [
  { key: 'train', label: 'Train Station', video: 'https://www.dropbox.com/scl/fi/gls8l2jss7t7ipwcqwv4j/train.webm?rlkey=t92csxcj5fnpslznrv1vl7n4x&raw=1' },
  { key: 'hospital', label: 'Hospital', video: 'https://www.dropbox.com/scl/fi/in7tdufdt2nnw6hsz8mkf/hospital.webm?rlkey=lsq30y9afkgxcj0hcmw9c5e2u&raw=1' },
  { key: 'car', label: 'Car', video: 'https://www.dropbox.com/scl/fi/38qqec99hbmo5xflq3rb2/car.webm?rlkey=2oo8e2uxms69hq09fbbvugebc&raw=1' },
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

const PICKER_OPTIONS: { [key: string]: string[] } = {
  pitch: PITCH_OPTIONS,
  variation: VARIATION_OPTIONS,
  breathiness: BREATHINESS_OPTIONS,
  speed: SPEED_OPTIONS,
};
const DEFAULTS = {
  pitch: PITCH_OPTIONS[0],
  variation: VARIATION_OPTIONS[0],
  breathiness: BREATHINESS_OPTIONS[0],
  speed: SPEED_OPTIONS[0],
};

// Helper for picker item style
const pickerItemStyle = (selected: boolean) => ({
  fontWeight: selected ? 700 : 400,
  color: '#222',
  textShadow: selected ? '0 1px 8px #fff, 0 0px 2px #fff' : 'none',
  fontSize: selected ? '1.1rem' : '1rem',
  textAlign: 'center' as const,
  padding: '0 8px',
  transition: 'font-weight 0.2s, color 0.2s',
});

const ExhibitionPage: React.FC = () => {
  const [context, setContext] = useState('train');
  const [picker, setPicker] = useState(DEFAULTS);
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // react-mobile-picker expects value as { [key]: string }
  const handlePickerChange = (nextValue: typeof picker) => {
    setPicker(nextValue);
  };

  const getVideoSrc = () => {
    const found = CONTEXTS.find(c => c.key === context);
    if (found && found.key === 'car') {
      return CONTEXTS[2].video;
    }
    return found ? found.video : CONTEXTS[0].video;
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    setAudioUrl(null);
    const instructions = [
      picker.pitch,
      picker.variation,
      picker.breathiness,
      picker.speed,
    ].join(' ');
    try {
      const text =
        context === 'train'
          ? 'Attention all passengers. The train to Platform 5 is now boarding. Please have your tickets ready.'
          : context === 'hospital'
          ? 'Please can all patients proceed to the waiting room after registration at the front desk.'
          : 'In two hundred meters, turn left. Then, you have reached your destination.';
      const audioBlob = await generateSpeech({
        text,
        voice: 'ash',
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

  // Fullscreen the whole page
  const handleFullscreen = () => {
    const docElm = document.documentElement;
    if (docElm.requestFullscreen) {
      docElm.requestFullscreen();
    }
  };

  // Seek video to 40s on load
  const handleVideoLoadedMetadata = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 40;
    }
  };

  return (
    <Box sx={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* Video Background */}
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
        onLoadedMetadata={handleVideoLoadedMetadata}
        onError={e => {
          if (context === 'car') (e.target as HTMLVideoElement).src = CONTEXTS[0].video;
        }}
      />
      {/* Overlay */}
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
        {/* Context Selector */}
        <Box sx={{ display: 'flex', mb: 4, gap: 2 }}>
          {CONTEXTS.map(c => (
            <Button
              key={c.key}
              variant={context === c.key ? 'contained' : 'outlined'}
              color="primary"
              sx={{ fontSize: '1.2rem', px: 4, py: 1, borderRadius: 6, fontWeight: 600 }}
              onClick={() => setContext(c.key)}
            >
              {c.label}
            </Button>
          ))}
        </Box>
        {/* Picker Row with 'Speak in' label inline */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            flexWrap: 'nowrap',
            gap: { xs: 1, md: 3 },
            mb: 2,
            width: { xs: '98vw', md: '80vw' },
            maxWidth: 1200,
            minHeight: 120,
            background: 'rgba(255,255,255,0.85)',
            borderRadius: 4,
            boxShadow: 3,
            py: 2,
            px: { xs: 1, md: 4 },
            overflowX: 'auto',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', pr: 2, whiteSpace: 'nowrap', flexShrink: 0 }}>
            <span style={{ fontSize: '1rem', fontWeight: 600, color: '#222', textShadow: '0 1px 8px #fff, 0 0px 2px #fff', whiteSpace: 'nowrap' }}>
              Speak in...
            </span>
          </Box>
          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, minWidth: 0 }}>
            <Picker
              value={picker}
              onChange={handlePickerChange}
              height={160}
              itemHeight={40}
              style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
              className="exhibition-picker"
            >
              {Object.keys(PICKER_OPTIONS).map((name) => (
                <Picker.Column key={name} name={name}>
                  {PICKER_OPTIONS[name].map((option: string) => (
                    <Picker.Item key={option} value={option}>
                      {({ selected }: { selected: boolean }) => (
                        <span style={pickerItemStyle(selected)}>{option}</span>
                      )}
                    </Picker.Item>
                  ))}
                </Picker.Column>
              ))}
            </Picker>
          </Box>
        </Box>
        {/* Instruction below picker */}
        <Box sx={{ mb: 3, fontSize: '1.1rem', color: '#fff', textShadow: '0 1px 8px #000, 0 0px 2px #000', fontWeight: 400 }}>
          Select the prompt that will be used to generate the voice.
        </Box>
        {/* Generate Button */}
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
        {/* Audio Playback */}
        {audioUrl && (
          <audio src={audioUrl} controls autoPlay style={{ marginTop: 16, width: 320 }} />
        )}
        {/* Fullscreen Button */}
        <IconButton
          onClick={handleFullscreen}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            zIndex: 2,
            background: 'rgba(255,255,255,0.7)',
            '&:hover': { background: 'rgba(255,255,255,0.9)' },
          }}
          size="large"
        >
          <FullscreenIcon fontSize="inherit" />
        </IconButton>
      </Box>
    </Box>
  );
};

export default ExhibitionPage; 
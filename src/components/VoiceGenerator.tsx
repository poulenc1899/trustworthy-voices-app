import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Slider,
  TextField,
  Grid,
  IconButton,
  Tooltip,
  Button,
  LinearProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Save as SaveIcon, Description as DescriptionIcon } from '@mui/icons-material';
import { midiController } from '../services/midiController';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { SavedVoicesModal } from './SavedVoicesModal';
import { generateSpeech } from '../services/openai';

const PRESET_TEXTS = {
  'Train Station Announcement': 'Attention all passengers. The train to Platform 5 is now boarding. Please have your tickets ready.',
  'Hospital Announcement': 'Please can all patients proceed to the waiting room after registration at the front desk',
  'Car Navigation Announcement': 'In two hundred meters, turn left. Then, you have reached your destination.',
  'Lab Results Call': 'Hello, this is Dr. Smith calling with your lab results. Your tests came back normal. Please schedule a follow-up appointment at your convenience.',
  'Thanks': 'Thanks for taking part in this voice design research! Your participation is super valuable. Hope you have a great day! ',
  'Call for Participation': 'Please can you help with this exciting and fun research project about synthetic voices?'
};

const AVAILABLE_VOICES = [
  { id: 'ash', name: 'Ash' },
  { id: 'ballad', name: 'Ballad' },
  { id: 'coral', name: 'Coral' },
  { id: 'sage', name: 'Sage' },
  { id: 'verse', name: 'Verse' },
];

interface VoiceSettings {
  participant: string;
  voicePitch: number;
  pitchVariation: number;
  breathiness: number;
  speed: number;
  comments: {
    voicePitch?: string;
    pitchVariation?: string;
    breathiness?: string;
    speed?: string;
  };
  presetText: string;
  timestamp: string;
  openAIRequest: {
    model: string;
    voice: string;
    input: string;
    response_format: string;
  };
}

interface VoiceGeneratorProps {
  commentsEnabled: boolean;
}

export const VoiceGenerator = ({ commentsEnabled }: VoiceGeneratorProps) => {
  const [selectedVoice, setSelectedVoice] = useState('ash');
  const [participant, setParticipant] = useState('');
  const [presetText, setPresetText] = useState('Hospital Announcement');
  const [voicePitch, setVoicePitch] = useState(0);
  const [pitchVariation, setPitchVariation] = useState(0);
  const [breathiness, setBreathiness] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [comments, setComments] = useState<VoiceSettings['comments']>({});
  const [savedVoicesOpen, setSavedVoicesOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeSlider, setActiveSlider] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [cachedAudio, setCachedAudio] = useState<string | null>(null);

  useEffect(() => {
    // Initialize MIDI controller
    midiController.initialize();
  }, []);

  useEffect(() => {
    // Set up MIDI callbacks
    midiController.setOnCCChange(handleMidiCCChange);
    midiController.setOnNoteTrigger(handleGenerateSpeech);

    // Clean up callbacks on unmount
    return () => {
      midiController.setOnCCChange(null);
      midiController.setOnNoteTrigger(null);
    };
  }, [selectedVoice, presetText, voicePitch, pitchVariation, breathiness, speed]);

  const handleMidiCCChange = (slider: string, value: number) => {
    // Map normalized value (0-1) to slider range (-2 to 2)
    const mappedValue = (value * 4) - 2;

    // Set active slider for visual feedback
    setActiveSlider(slider);
    // Clear active slider after animation
    setTimeout(() => setActiveSlider(null), 100);

    switch (slider) {
      case 'voicePitch':
        setVoicePitch(mappedValue);
        break;
      case 'pitchVariation':
        setPitchVariation(mappedValue);
        break;
      case 'breathiness':
        setBreathiness(mappedValue);
        break;
      case 'speed':
        setSpeed(mappedValue);
        break;
    }
  };

  const createStyleInstructions = () => {
    const instructions: string[] = [];

    // Voice Pitch
    if (voicePitch === -2) instructions.push('Speak in the lowest possible pitch.');
    else if (voicePitch === -1) instructions.push('Speak with a medium-low pitch.');
    else if (voicePitch === 1) instructions.push('Speak with a slightly high pitch.');
    else if (voicePitch === 2) instructions.push('Speak with a very high pitch.');

    // Pitch Variation
    if (pitchVariation === -2) instructions.push('speak in a monotone.');
    else if (pitchVariation === -1) instructions.push('speak only with slight variation in pitch.');
    else if (pitchVariation === 1) instructions.push('speak with a slightly elevated variation in pitch.');
    else if (pitchVariation === 2) instructions.push('speak with a extremely elevated variation in pitch');
    // Breathiness
    if (breathiness === -2) instructions.push('Sound very resonant (not breathy).');
    else if (breathiness === -1) instructions.push('Sound slightly resonant (less breathy).');
    else if (breathiness === 1) instructions.push('Sound slightly breathy.');
    else if (breathiness === 2) instructions.push('Sound very breathy (like whispering).');

    // Speed
    if (speed === -2) instructions.push('Speak very slowly.');
    else if (speed === -1) instructions.push('Speak slowly.');
    else if (speed === 1) instructions.push('Speak quickly.');
    else if (speed === 2) instructions.push('Speak very quickly.');

    return instructions.length > 0 ? instructions.join(' ') : null;
  };

  const handleGenerateSpeech = async () => {
    if (!presetText.trim()) return;

    setIsLoading(true);
    try {
      const textToSpeak = PRESET_TEXTS[presetText as keyof typeof PRESET_TEXTS];

      if (!textToSpeak) {
        throw new Error('Please enter some text to speak');
      }

      const styleInstructions = createStyleInstructions();
      
      const audioBlob = await generateSpeech({
        text: textToSpeak,
        voice: selectedVoice,
        model: 'gpt-4o-mini-tts',
        instructions: styleInstructions,
      });

      const url = URL.createObjectURL(audioBlob);
      setCachedAudio(url);

      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play();
      }
    } catch (error) {
      console.error('Error generating speech:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    const settings: VoiceSettings = {
      participant,
      voicePitch,
      pitchVariation,
      breathiness,
      speed,
      comments: commentsEnabled ? comments : {},
      presetText,
      timestamp: new Date().toISOString(),
      openAIRequest: {
        model: 'gpt-4o-mini-tts',
        voice: selectedVoice,
        input: presetText,
        response_format: 'mp3',
      },
    };

    const savedVoices = JSON.parse(localStorage.getItem('savedVoices') || '[]');
    savedVoices.push(settings);
    localStorage.setItem('savedVoices', JSON.stringify(savedVoices));
  };

  useKeyboardShortcuts({
    ' ': () => {
      if (!isLoading) {
        handleGenerateSpeech();
      }
    },
    's': () => {
      if (cachedAudio) {
        handleSave();
      }
    },
  });

  const handleCommentChange = (slider: keyof VoiceSettings['comments'], value: string) => {
    setComments((prev: VoiceSettings['comments']) => ({
      ...prev,
      [slider]: value,
    }));
  };

  const handleReset = () => {
    setVoicePitch(0);
    setPitchVariation(0);
    setBreathiness(0);
    setSpeed(0);
    setComments({});
  };

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          Voice Settings
        </Typography>
        <Box>
          <Tooltip title="View Saved Voices">
            <IconButton onClick={() => setSavedVoicesOpen(true)}>
              <DescriptionIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Participant Name"
            value={participant}
            onChange={(e) => setParticipant(e.target.value)}
            required
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Voice</InputLabel>
            <Select
              value={selectedVoice}
              label="Voice"
              onChange={(e) => setSelectedVoice(e.target.value)}
            >
              {AVAILABLE_VOICES.map((voice) => (
                <MenuItem key={voice.id} value={voice.id}>
                  {voice.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Preset Text</InputLabel>
            <Select
              value={presetText}
              label="Preset Text"
              onChange={(e) => setPresetText(e.target.value)}
            >
              {Object.keys(PRESET_TEXTS).map((text) => (
                <MenuItem key={text} value={text}>
                  {text}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <Typography gutterBottom>Voice Pitch</Typography>
          <Slider
            value={voicePitch}
            onChange={(_, value) => setVoicePitch(value as number)}
            min={-2}
            max={2}
            step={1}
            marks
            valueLabelDisplay="auto"
            sx={{
              '& .MuiSlider-thumb': {
                transition: 'all 0.1s ease',
                ...(activeSlider === 'voicePitch' && {
                  transform: 'scale(1.2)',
                  boxShadow: '0 0 0 8px rgba(25, 118, 210, 0.16)',
                }),
              },
            }}
          />
          {commentsEnabled && (
            <TextField
              fullWidth
              size="small"
              placeholder="Add a comment about this setting..."
              value={comments.voicePitch || ''}
              onChange={(e) => handleCommentChange('voicePitch', e.target.value)}
              sx={{ mt: 1 }}
            />
          )}
        </Grid>

        <Grid item xs={12}>
          <Typography gutterBottom>Pitch Variation</Typography>
          <Slider
            value={pitchVariation}
            onChange={(_, value) => setPitchVariation(value as number)}
            min={-2}
            max={2}
            step={1}
            marks
            valueLabelDisplay="auto"
            sx={{
              '& .MuiSlider-thumb': {
                transition: 'all 0.1s ease',
                ...(activeSlider === 'pitchVariation' && {
                  transform: 'scale(1.2)',
                  boxShadow: '0 0 0 8px rgba(25, 118, 210, 0.16)',
                }),
              },
            }}
          />
          {commentsEnabled && (
            <TextField
              fullWidth
              size="small"
              placeholder="Add a comment about this setting..."
              value={comments.pitchVariation || ''}
              onChange={(e) => handleCommentChange('pitchVariation', e.target.value)}
              sx={{ mt: 1 }}
            />
          )}
        </Grid>

        <Grid item xs={12}>
          <Typography gutterBottom>Breathiness</Typography>
          <Slider
            value={breathiness}
            onChange={(_, value) => setBreathiness(value as number)}
            min={-2}
            max={2}
            step={1}
            marks
            valueLabelDisplay="auto"
            sx={{
              '& .MuiSlider-thumb': {
                transition: 'all 0.1s ease',
                ...(activeSlider === 'breathiness' && {
                  transform: 'scale(1.2)',
                  boxShadow: '0 0 0 8px rgba(25, 118, 210, 0.16)',
                }),
              },
            }}
          />
          {commentsEnabled && (
            <TextField
              fullWidth
              size="small"
              placeholder="Add a comment about this setting..."
              value={comments.breathiness || ''}
              onChange={(e) => handleCommentChange('breathiness', e.target.value)}
              sx={{ mt: 1 }}
            />
          )}
        </Grid>

        <Grid item xs={12}>
          <Typography gutterBottom>Speed</Typography>
          <Slider
            value={speed}
            onChange={(_, value) => setSpeed(value as number)}
            min={-2}
            max={2}
            step={1}
            marks
            valueLabelDisplay="auto"
            sx={{
              '& .MuiSlider-thumb': {
                transition: 'all 0.1s ease',
                ...(activeSlider === 'speed' && {
                  transform: 'scale(1.2)',
                  boxShadow: '0 0 0 8px rgba(25, 118, 210, 0.16)',
                }),
              },
            }}
          />
          {commentsEnabled && (
            <TextField
              fullWidth
              size="small"
              placeholder="Add a comment about this setting..."
              value={comments.speed || ''}
              onChange={(e) => handleCommentChange('speed', e.target.value)}
              sx={{ mt: 1 }}
            />
          )}
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleGenerateSpeech}
              disabled={isLoading}
            >
              {isLoading ? 'Generating...' : 'Generate Speech'}
            </Button>
            <Tooltip title="Save Voice">
              <Button
                variant="contained"
                color="inherit"
                onClick={handleSave}
                disabled={!cachedAudio}
                sx={{ minWidth: '48px', px: 2 }}
              >
                <SaveIcon />
              </Button>
            </Tooltip>
            <Tooltip title="Reset Sliders">
              <Button
                variant="outlined"
                color="primary"
                onClick={handleReset}
                sx={{ minWidth: '48px', px: 2 }}
              >
                Reset
              </Button>
            </Tooltip>
          </Box>
        </Grid>

        {isLoading && (
          <Grid item xs={12}>
            <LinearProgress />
          </Grid>
        )}

        {/* Hidden audio element for playback */}
        <audio
          ref={audioRef}
          style={{ display: 'none' }}
          autoPlay
        />
      </Grid>

      <SavedVoicesModal
        open={savedVoicesOpen}
        onClose={() => setSavedVoicesOpen(false)}
      />
    </Paper>
  );
}; 
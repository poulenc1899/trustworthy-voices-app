import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { generateSpeech } from '../services/openai';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'
import { midiController } from '../services/midiController'

const VOICE_OPTIONS = [
  'alloy',
  'ash',
  'ballad',
  'coral',
  'echo',
  'fable',
  'nova',
  'onyx',
  'sage',
  'shimmer',
];

const PRESET_TEXTS = {
  'Train Station Announcement': 'Attention all passengers. The train to Platform 5 is now boarding. Please have your tickets ready.',
  'Hospital Announcement': 'Please can all patients proceed to the waiting room after registration at the front desk',
  'Car Navigation Announcement': 'In two hundred meters, turn left. Then, you have reached your destination.',
  'Thanks': 'Thanks for taking part in this voice design research! Your participation is super valuable. Hope you have a great day! '};

export default function VoiceGenerator() {
  const [voice, setVoice] = useState('ballad');
  const [textInputOption, setTextInputOption] = useState('Preset Text');
  const [presetText, setPresetText] = useState('Hospital Announcement');
  const [customText, setCustomText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [voiceName, setVoiceName] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [cachedAudio, setCachedAudio] = useState<string | null>(null);

  // Style sliders state
  const [voicePitch, setVoicePitch] = useState(0);
  const [enthusiasm, setEnthusiasm] = useState(0);
  const [tightness, setTightness] = useState(0);
  const [speed, setSpeed] = useState(0);

  const [activeSlider, setActiveSlider] = useState<string | null>(null)

  useEffect(() => {
    // Initialize MIDI controller
    midiController.initialize()
  }, [])

  useEffect(() => {
    // Set up MIDI callbacks
    midiController.setOnCCChange(handleMidiCCChange)
    midiController.setOnNoteTrigger(handleGenerateSpeech)

    // Clean up callbacks on unmount
    return () => {
      midiController.setOnCCChange(null)
      midiController.setOnNoteTrigger(null)
    }
  }, []) // Empty dependency array since these callbacks don't depend on any state

  const handleMidiCCChange = (slider: string, value: number) => {
    // Map normalized value (0-1) to slider range (-2 to 2)
    const mappedValue = (value * 4) - 2

    // Set active slider for visual feedback
    setActiveSlider(slider)
    // Clear active slider after animation
    setTimeout(() => setActiveSlider(null), 100)

    switch (slider) {
      case 'voicePitch':
        setVoicePitch(mappedValue)
        break
      case 'enthusiasm':
        setEnthusiasm(mappedValue)
        break
      case 'tightness':
        setTightness(mappedValue)
        break
      case 'speed':
        setSpeed(mappedValue)
        break
    }
  }

  const handleVoiceChange = (event: SelectChangeEvent) => {
    setVoice(event.target.value);
  };

  const handleTextInputOptionChange = (event: SelectChangeEvent) => {
    setTextInputOption(event.target.value);
  };

  const handlePresetTextChange = (event: SelectChangeEvent) => {
    setPresetText(event.target.value);
  };

  const createStyleInstructions = () => {
    const instructions: string[] = [];

    // Voice Pitch
    if (voicePitch === -2) instructions.push('Speak in the lowest possible pitch.');
    else if (voicePitch === -1) instructions.push('Speak with a medium-low pitch.');
    else if (voicePitch === 1) instructions.push('Speak with a slightly high pitch.');
    else if (voicePitch === 2) instructions.push('Speak with a very high pitch.');

    // Enthusiasm
    if (enthusiasm === -2) instructions.push('Sound very calm and unexcited.');
    else if (enthusiasm === -1) instructions.push('Sound slightly calm.');
    else if (enthusiasm === 1) instructions.push('Sound enthusiastic.');
    else if (enthusiasm === 2) instructions.push('Sound very enthusiastic and excited.');

    // Tightness
    if (tightness === -2) instructions.push('Sound very resonant (not breathy).');
    else if (tightness === -1) instructions.push('Sound slightly resonant (less breathy).');
    else if (tightness === 1) instructions.push('Sound slightly breathy.');
    else if (tightness === 2) instructions.push('Sound very breathy (like whispering).');

    // Speed
    if (speed === -2) instructions.push('Speak very slowly.');
    else if (speed === -1) instructions.push('Speak slowly.');
    else if (speed === 1) instructions.push('Speak quickly.');
    else if (speed === 2) instructions.push('Speak very quickly.');

    return instructions.length > 0 ? instructions.join(' ') : null;
  };

  const handleGenerateSpeech = async () => {
    if (!customText.trim() && !presetText.trim()) return;

    setIsLoading(true);
    try {
      const textToSpeak = textInputOption === 'Preset Text' 
        ? PRESET_TEXTS[presetText as keyof typeof PRESET_TEXTS]
        : customText;

      if (!textToSpeak) {
        throw new Error('Please enter some text to speak');
      }

      const styleInstructions = createStyleInstructions();
      
      const audioBlob = await generateSpeech({
        text: textToSpeak,
        voice,
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

  const handleSaveVoice = () => {
    setSaveDialogOpen(true);
  };

  const handleSaveDialogClose = () => {
    setSaveDialogOpen(false);
    setVoiceName('');
  };

  const handleSaveDialogConfirm = () => {
    if (!voiceName.trim()) {
      return;
    }

    const voiceSettings = {
      voice,
      textInputOption,
      presetText,
      customText,
      voicePitch,
      enthusiasm,
      tightness,
      speed,
    };

    const blob = new Blob([JSON.stringify(voiceSettings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${voiceName.toLowerCase().replace(/\s+/g, '-')}-voice-settings.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    handleSaveDialogClose();
  };

  // Add keyboard shortcuts
  useKeyboardShortcuts({
    ' ': () => {
      if (!isLoading) {
        handleGenerateSpeech()
      }
    },
    's': () => {
      if (cachedAudio) {
        handleSaveVoice()
      }
    }
  })

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        Voice Settings
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Voice</InputLabel>
            <Select value={voice} label="Voice" onChange={handleVoiceChange}>
              {VOICE_OPTIONS.map((v) => (
                <MenuItem key={v} value={v}>
                  {v}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Text Input Option</InputLabel>
            <Select value={textInputOption} label="Text Input Option" onChange={handleTextInputOptionChange}>
              <MenuItem value="Preset Text">Preset Text</MenuItem>
              <MenuItem value="Custom Text">Custom Text</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {textInputOption === 'Preset Text' ? (
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Preset Text</InputLabel>
              <Select value={presetText} label="Preset Text" onChange={handlePresetTextChange}>
                {Object.keys(PRESET_TEXTS).map((key) => (
                  <MenuItem key={key} value={key}>
                    {key}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        ) : (
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Custom Text"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
            />
          </Grid>
        )}

        {/* Style Sliders */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Voice Style Controls
          </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography gutterBottom>Low Pitch - High Pitch</Typography>
          <Slider
            value={voicePitch}
            onChange={(_, value) => setVoicePitch(value as number)}
            min={-2}
            max={2}
            marks
            step={1}
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
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography gutterBottom>Calm - Enthusiastic</Typography>
          <Slider
            value={enthusiasm}
            onChange={(_, value) => setEnthusiasm(value as number)}
            min={-2}
            max={2}
            marks
            step={1}
            sx={{
              '& .MuiSlider-thumb': {
                transition: 'all 0.1s ease',
                ...(activeSlider === 'enthusiasm' && {
                  transform: 'scale(1.2)',
                  boxShadow: '0 0 0 8px rgba(25, 118, 210, 0.16)',
                }),
              },
            }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography gutterBottom>Resonant - Breathy</Typography>
          <Slider
            value={tightness}
            onChange={(_, value) => setTightness(value as number)}
            min={-2}
            max={2}
            marks
            step={1}
            sx={{
              '& .MuiSlider-thumb': {
                transition: 'all 0.1s ease',
                ...(activeSlider === 'tightness' && {
                  transform: 'scale(1.2)',
                  boxShadow: '0 0 0 8px rgba(25, 118, 210, 0.16)',
                }),
              },
            }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography gutterBottom>Slow - Fast</Typography>
          <Slider
            value={speed}
            onChange={(_, value) => setSpeed(value as number)}
            min={-2}
            max={2}
            marks
            step={1}
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
            <Button
              variant="outlined"
              color="primary"
              onClick={handleSaveVoice}
            >
              Save
            </Button>
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

      <Dialog open={saveDialogOpen} onClose={handleSaveDialogClose}>
        <DialogTitle>Save Voice Settings</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Voice Name"
            fullWidth
            value={voiceName}
            onChange={(e) => setVoiceName(e.target.value)}
            placeholder="Enter a name for your voice"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSaveDialogClose}>Cancel</Button>
          <Button onClick={handleSaveDialogConfirm} disabled={!voiceName.trim()}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
} 
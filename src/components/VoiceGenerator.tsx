import { useState } from 'react';
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
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { generateSpeech } from '../services/openai';

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
  'Hospital Announcement': 'Dr. Smith to examination room three. Dr. Smith to examination room three.',
  'Car Navigation Announcement': 'In two hundred feet, turn left. Then, at the next intersection, turn right.',
};

interface VoiceSettings {
  voice: string;
  textInputOption: string;
  presetText: string;
  customText: string;
  masculineFeminine: number;
  assertiveness: number;
  buoyancy: number;
  confidence: number;
  enthusiasm: number;
  nasality: number;
  relaxedness: number;
  smoothness: number;
  tepidity: number;
  tightness: number;
  speed: number;
}

export default function VoiceGenerator() {
  const [voice, setVoice] = useState('ballad');
  const [textInputOption, setTextInputOption] = useState('Preset Text');
  const [presetText, setPresetText] = useState('Hospital Announcement');
  const [customText, setCustomText] = useState('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [voiceName, setVoiceName] = useState('');

  // Style sliders state
  const [masculineFeminine, setMasculineFeminine] = useState(0);
  const [assertiveness, setAssertiveness] = useState(0);
  const [buoyancy, setBuoyancy] = useState(0);
  const [confidence, setConfidence] = useState(0);
  const [enthusiasm, setEnthusiasm] = useState(0);
  const [nasality, setNasality] = useState(0);
  const [relaxedness, setRelaxedness] = useState(0);
  const [smoothness, setSmoothness] = useState(0);
  const [tepidity, setTepidity] = useState(0);
  const [tightness, setTightness] = useState(0);
  const [speed, setSpeed] = useState(0);

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

    // Masculine/Feminine
    if (masculineFeminine === -2) instructions.push('Speak with a very masculine voice.');
    else if (masculineFeminine === -1) instructions.push('Speak with a slightly masculine voice.');
    else if (masculineFeminine === 1) instructions.push('Speak with a slightly feminine voice.');
    else if (masculineFeminine === 2) instructions.push('Speak with a very feminine voice.');

    // Assertiveness
    if (assertiveness === -2) instructions.push('Sound very timid.');
    else if (assertiveness === -1) instructions.push('Sound slightly timid.');
    else if (assertiveness === 1) instructions.push('Sound slightly bold.');
    else if (assertiveness === 2) instructions.push('Sound very bold.');

    // Buoyancy
    if (buoyancy === -2) instructions.push('Sound very deflated.');
    else if (buoyancy === -1) instructions.push('Sound slightly deflated.');
    else if (buoyancy === 1) instructions.push('Sound slightly buoyant.');
    else if (buoyancy === 2) instructions.push('Sound very buoyant.');

    // Confidence
    if (confidence === -2) instructions.push('Sound very shy.');
    else if (confidence === -1) instructions.push('Sound slightly shy.');
    else if (confidence === 1) instructions.push('Sound slightly confident.');
    else if (confidence === 2) instructions.push('Sound very confident.');

    // Enthusiasm
    if (enthusiasm === -2) instructions.push('Sound very calm.');
    else if (enthusiasm === -1) instructions.push('Sound slightly calm.');
    else if (enthusiasm === 1) instructions.push('Sound slightly enthusiastic.');
    else if (enthusiasm === 2) instructions.push('Sound very enthusiastic.');

    // Nasality
    if (nasality === -2) instructions.push('Sound very clear (not nasal).');
    else if (nasality === -1) instructions.push('Sound slightly clear (less nasal).');
    else if (nasality === 1) instructions.push('Sound slightly nasal.');
    else if (nasality === 2) instructions.push('Sound very nasal.');

    // Relaxedness
    if (relaxedness === -2) instructions.push('Sound very tense.');
    else if (relaxedness === -1) instructions.push('Sound slightly tense.');
    else if (relaxedness === 1) instructions.push('Sound slightly relaxed.');
    else if (relaxedness === 2) instructions.push('Sound very relaxed.');

    // Smoothness
    if (smoothness === -2) instructions.push('Speak very staccato, with clear separation between words/syllables.');
    else if (smoothness === -1) instructions.push('Speak staccato, with slight pauses between words.');
    else if (smoothness === 1) instructions.push('Speak legato, connecting words smoothly.');
    else if (smoothness === 2) instructions.push('Speak very legato, smoothly connecting words.');

    // Tepidity
    if (tepidity === -2) instructions.push('Sound very tepid (unlively).');
    else if (tepidity === -1) instructions.push('Sound slightly tepid (less lively).');
    else if (tepidity === 1) instructions.push('Sound slightly vigorous (lively).');
    else if (tepidity === 2) instructions.push('Sound very vigorous (lively).');

    // Tightness
    if (tightness === -2) instructions.push('Sound very tight (not breathy).');
    else if (tightness === -1) instructions.push('Sound slightly tight (less breathy).');
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
      setAudioUrl(url);
    } catch (error) {
      console.error('Error generating speech:', error);
      // TODO: Add error handling UI
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

    const voiceSettings: VoiceSettings = {
      voice,
      textInputOption,
      presetText,
      customText,
      masculineFeminine,
      assertiveness,
      buoyancy,
      confidence,
      enthusiasm,
      nasality,
      relaxedness,
      smoothness,
      tepidity,
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

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
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
          <Typography gutterBottom>Masculine - Feminine</Typography>
          <Slider
            value={masculineFeminine}
            onChange={(_, value) => setMasculineFeminine(value as number)}
            min={-2}
            max={2}
            marks
            step={1}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography gutterBottom>Timid - Bold</Typography>
          <Slider
            value={assertiveness}
            onChange={(_, value) => setAssertiveness(value as number)}
            min={-2}
            max={2}
            marks
            step={1}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography gutterBottom>Deflated - Buoyant</Typography>
          <Slider
            value={buoyancy}
            onChange={(_, value) => setBuoyancy(value as number)}
            min={-2}
            max={2}
            marks
            step={1}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography gutterBottom>Shy - Confident</Typography>
          <Slider
            value={confidence}
            onChange={(_, value) => setConfidence(value as number)}
            min={-2}
            max={2}
            marks
            step={1}
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
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography gutterBottom>Clear - Nasal</Typography>
          <Slider
            value={nasality}
            onChange={(_, value) => setNasality(value as number)}
            min={-2}
            max={2}
            marks
            step={1}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography gutterBottom>Tense - Relaxed</Typography>
          <Slider
            value={relaxedness}
            onChange={(_, value) => setRelaxedness(value as number)}
            min={-2}
            max={2}
            marks
            step={1}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography gutterBottom>Staccato - Legato</Typography>
          <Slider
            value={smoothness}
            onChange={(_, value) => setSmoothness(value as number)}
            min={-2}
            max={2}
            marks
            step={1}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography gutterBottom>Tepid - Vigorous</Typography>
          <Slider
            value={tepidity}
            onChange={(_, value) => setTepidity(value as number)}
            min={-2}
            max={2}
            marks
            step={1}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography gutterBottom>Tight - Breathy</Typography>
          <Slider
            value={tightness}
            onChange={(_, value) => setTightness(value as number)}
            min={-2}
            max={2}
            marks
            step={1}
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
              Save Voice
            </Button>
          </Box>
        </Grid>

        {audioUrl && (
          <Grid item xs={12}>
            <Box sx={{ mt: 2 }}>
              <audio controls src={audioUrl} style={{ width: '100%' }} />
            </Box>
          </Grid>
        )}
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
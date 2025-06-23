import { useState, useEffect } from 'react'
import {
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Grid,
  Divider,
} from '@mui/material'
import type { SelectChangeEvent } from '@mui/material'

interface MidiDevice {
  id: string
  name: string
}

interface CCMapping {
  [key: string]: number | null
}

interface MidiSettingsProps {
  onMidiDeviceSelect: (deviceId: string | null) => void
  onCCMappingChange: (mappings: CCMapping) => void
}

const MidiSettings = ({ onMidiDeviceSelect, onCCMappingChange }: MidiSettingsProps) => {
  const [midiDevices, setMidiDevices] = useState<MidiDevice[]>([])
  const [selectedDevice, setSelectedDevice] = useState<string>('')
  const [ccMappings, setCCMappings] = useState<CCMapping>({
    voicePitch: null,
    pitchVariation: null,
    breathiness: null,
    speed: null,
  })

  useEffect(() => {
    // Request MIDI access
    if (navigator.requestMIDIAccess) {
      navigator.requestMIDIAccess()
        .then((midiAccess) => {
          const devices: MidiDevice[] = []
          midiAccess.inputs.forEach((input) => {
            devices.push({
              id: input.id,
              name: input.name || `MIDI Device ${input.id}`,
            })
          })
          setMidiDevices(devices)
        })
        .catch((error) => {
          console.error('MIDI access error:', error)
        })
    }
  }, [])

  const handleDeviceChange = (event: SelectChangeEvent) => {
    const deviceId = event.target.value
    setSelectedDevice(deviceId)
    onMidiDeviceSelect(deviceId || null)
  }

  const handleCCChange = (slider: string, value: string) => {
    const ccNumber = value === '' ? null : parseInt(value, 10)
    const newMappings = {
      ...ccMappings,
      [slider]: ccNumber,
    }
    setCCMappings(newMappings)
    onCCMappingChange(newMappings)
  }

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        MIDI Settings
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>MIDI Device</InputLabel>
            <Select
              value={selectedDevice}
              label="MIDI Device"
              onChange={handleDeviceChange}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {midiDevices.map((device) => (
                <MenuItem key={device.id} value={device.id}>
                  {device.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" gutterBottom>
            CC Mappings
          </Typography>
        </Grid>

        {Object.keys(ccMappings).map((slider) => (
          <Grid item xs={12} sm={6} key={slider}>
            <TextField
              fullWidth
              label={`${slider} CC`}
              type="number"
              value={ccMappings[slider] === null ? '' : ccMappings[slider]}
              onChange={(e) => handleCCChange(slider, e.target.value)}
              inputProps={{ min: 0, max: 127 }}
              disabled={!selectedDevice}
            />
          </Grid>
        ))}
      </Grid>
    </Paper>
  )
}

export default MidiSettings 
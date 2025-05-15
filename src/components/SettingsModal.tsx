import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
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

interface NoteMapping {
  note: number | null
  channel: number
}

interface SettingsModalProps {
  open: boolean
  onClose: () => void
  onMidiDeviceSelect: (deviceId: string | null) => void
  onCCMappingChange: (mappings: CCMapping) => void
  onNoteMappingChange: (mapping: NoteMapping) => void
}

const SettingsModal = ({
  open,
  onClose,
  onMidiDeviceSelect,
  onCCMappingChange,
  onNoteMappingChange,
}: SettingsModalProps) => {
  const [midiDevices, setMidiDevices] = useState<MidiDevice[]>([])
  const [selectedDevice, setSelectedDevice] = useState<string>('')
  const [ccMappings, setCCMappings] = useState<CCMapping>({
    voicePitch: null,
    enthusiasm: null,
    tightness: null,
    speed: null,
  })
  const [noteMapping, setNoteMapping] = useState<NoteMapping>({
    note: null,
    channel: 0
  })

  // Load saved settings on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('midiSettings')
    if (savedSettings) {
      const { deviceId, mappings, noteMapping: savedNoteMapping } = JSON.parse(savedSettings)
      setSelectedDevice(deviceId || '')
      setCCMappings(mappings)
      setNoteMapping(savedNoteMapping || { note: null, channel: 0 })
      onMidiDeviceSelect(deviceId)
      onCCMappingChange(mappings)
      onNoteMappingChange(savedNoteMapping || { note: null, channel: 0 })
    }
  }, [])

  // Load MIDI devices
  useEffect(() => {
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

  const handleNoteChange = (value: string) => {
    const note = value === '' ? null : parseInt(value, 10)
    const newMapping = {
      ...noteMapping,
      note,
    }
    setNoteMapping(newMapping)
    onNoteMappingChange(newMapping)
  }

  const handleChannelChange = (value: string) => {
    const channel = parseInt(value, 10)
    const newMapping = {
      ...noteMapping,
      channel,
    }
    setNoteMapping(newMapping)
    onNoteMappingChange(newMapping)
  }

  const handleSave = () => {
    const settings = {
      deviceId: selectedDevice,
      mappings: ccMappings,
      noteMapping,
    }
    localStorage.setItem('midiSettings', JSON.stringify(settings))
    onClose()
  }

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>Settings</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
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

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" gutterBottom>
                Generate Button Control
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Note Number"
                type="number"
                value={noteMapping.note === null ? '' : noteMapping.note}
                onChange={(e) => handleNoteChange(e.target.value)}
                inputProps={{ min: 0, max: 127 }}
                disabled={!selectedDevice}
                helperText="MIDI note number to trigger generation"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Channel"
                type="number"
                value={noteMapping.channel}
                onChange={(e) => handleChannelChange(e.target.value)}
                inputProps={{ min: 0, max: 15 }}
                disabled={!selectedDevice}
                helperText="MIDI channel (0-15)"
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          Save Settings
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default SettingsModal 
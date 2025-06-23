import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
} from '@mui/material'
import { Delete as DeleteIcon, PlayArrow as PlayIcon, Download as DownloadIcon } from '@mui/icons-material'
import { generateSpeech } from '../services/openai'

interface VoiceSettings {
  participant: string
  voicePitch: number
  enthusiasm: number
  breathiness: number
  speed: number
  comments: {
    voicePitch?: string
    enthusiasm?: string
    breathiness?: string
    speed?: string
  }
  presetText: string
  timestamp: string
  openAIRequest: {
    model: string
    voice: string
    input: string
    response_format: string
  }
}

interface SavedVoicesModalProps {
  open: boolean
  onClose: () => void
}

export const SavedVoicesModal = ({ open, onClose }: SavedVoicesModalProps) => {
  const [savedVoices, setSavedVoices] = useState<VoiceSettings[]>([])
  const [isPlaying, setIsPlaying] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      const voices = JSON.parse(localStorage.getItem('savedVoices') || '[]')
      setSavedVoices(voices)
    }
  }, [open])

  const handleDelete = (index: number) => {
    const updatedVoices = savedVoices.filter((_, i) => i !== index)
    setSavedVoices(updatedVoices)
    localStorage.setItem('savedVoices', JSON.stringify(updatedVoices))
  }

  const handlePlay = async (voice: VoiceSettings) => {
    if (isPlaying) return

    setIsPlaying(voice.timestamp)
    try {
      const audioBlob = await generateSpeech({
        text: voice.presetText,
        voice: voice.openAIRequest.voice,
        model: voice.openAIRequest.model,
        instructions: createStyleInstructions(voice),
      })

      const url = URL.createObjectURL(audioBlob)
      const audio = new Audio(url)
      audio.onended = () => {
        setIsPlaying(null)
        URL.revokeObjectURL(url)
      }
      audio.play()
    } catch (error) {
      console.error('Error playing saved voice:', error)
      setIsPlaying(null)
    }
  }

  const createStyleInstructions = (voice: VoiceSettings) => {
    const instructions: string[] = []

    // Voice Pitch
    if (voice.voicePitch === -2) instructions.push('Speak in the lowest possible pitch.')
    else if (voice.voicePitch === -1) instructions.push('Speak with a medium-low pitch.')
    else if (voice.voicePitch === 1) instructions.push('Speak with a slightly high pitch.')
    else if (voice.voicePitch === 2) instructions.push('Speak with a very high pitch.')

    // Enthusiasm
    if (voice.enthusiasm === -2) instructions.push('Sound very calm and unexcited.')
    else if (voice.enthusiasm === -1) instructions.push('Sound slightly calm.')
    else if (voice.enthusiasm === 1) instructions.push('Sound enthusiastic.')
    else if (voice.enthusiasm === 2) instructions.push('Sound very enthusiastic and excited.')

    // Breathiness
    if (voice.breathiness === -2) instructions.push('Sound very resonant (not breathy).')
    else if (voice.breathiness === -1) instructions.push('Sound slightly resonant (less breathy).')
    else if (voice.breathiness === 1) instructions.push('Sound slightly breathy.')
    else if (voice.breathiness === 2) instructions.push('Sound very breathy (like whispering).')

    // Speed
    if (voice.speed === -2) instructions.push('Speak very slowly.')
    else if (voice.speed === -1) instructions.push('Speak slowly.')
    else if (voice.speed === 1) instructions.push('Speak quickly.')
    else if (voice.speed === 2) instructions.push('Speak very quickly.')

    return instructions.length > 0 ? instructions.join(' ') : null
  }

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  const handleExport = (format: 'json' | 'excel') => {
    if (format === 'json') {
      const blob = new Blob([JSON.stringify(savedVoices, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'saved-voices.json'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } else {
      // Convert to CSV format
      const headers = ['Timestamp', 'Participant', 'Voice', 'Preset Text', 'Voice Pitch', 'Enthusiasm', 'Breathiness', 'Speed', 'Comments']
      const rows = savedVoices.map(voice => [
        formatDate(voice.timestamp),
        voice.participant,
        voice.openAIRequest.voice,
        voice.presetText,
        voice.voicePitch,
        voice.enthusiasm,
        voice.breathiness,
        voice.speed,
        Object.entries(voice.comments)
          .filter(([, value]) => value)
          .map(([key, value]) => `${key}: ${value}`)
          .join('; ')
      ])

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'saved-voices.csv'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Saved Voices</span>
          <Box>
            <Tooltip title="Export as JSON">
              <IconButton onClick={() => handleExport('json')}>
                <DownloadIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Export as Excel">
              <IconButton onClick={() => handleExport('excel')}>
                <DownloadIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Timestamp</TableCell>
                <TableCell>Participant</TableCell>
                <TableCell>Voice</TableCell>
                <TableCell>Preset Text</TableCell>
                <TableCell>Voice Pitch</TableCell>
                <TableCell>Enthusiasm</TableCell>
                <TableCell>Breathiness</TableCell>
                <TableCell>Speed</TableCell>
                <TableCell>Comments</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {savedVoices.map((voice, index) => (
                <TableRow key={voice.timestamp}>
                  <TableCell>{formatDate(voice.timestamp)}</TableCell>
                  <TableCell>{voice.participant}</TableCell>
                  <TableCell>{voice.openAIRequest.voice}</TableCell>
                  <TableCell>{voice.presetText}</TableCell>
                  <TableCell>{voice.voicePitch}</TableCell>
                  <TableCell>{voice.enthusiasm}</TableCell>
                  <TableCell>{voice.breathiness}</TableCell>
                  <TableCell>{voice.speed}</TableCell>
                  <TableCell>
                    {Object.entries(voice.comments)
                      .filter(([, value]) => value)
                      .map(([key, value]) => (
                        <div key={key}>
                          <strong>{key}:</strong> {value}
                        </div>
                      ))}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => handlePlay(voice)}
                      disabled={isPlaying === voice.timestamp}
                    >
                      <PlayIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(index)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  )
} 
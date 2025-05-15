import { useState } from 'react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import { VoiceGenerator } from './components/VoiceGenerator'
import TopBar from './components/TopBar'
import SettingsModal from './components/SettingsModal'
import { midiController } from './services/midiController'
import './App.css'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
})

function App() {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [commentsEnabled, setCommentsEnabled] = useState(false)

  const handleSettingsClick = () => {
    setSettingsOpen(true)
  }

  const handleSettingsClose = () => {
    setSettingsOpen(false)
  }

  const handleMidiDeviceSelect = (deviceId: string | null) => {
    midiController.selectDevice(deviceId)
  }

  const handleCCMappingChange = (mappings: { [key: string]: number | null }) => {
    midiController.setCCMappings(mappings)
  }

  const handleNoteMappingChange = (mapping: { note: number | null, channel: number }) => {
    midiController.setNoteMapping(mapping)
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <TopBar onSettingsClick={handleSettingsClick} />
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            py: 4,
            px: 2,
          }}
        >
          <Container maxWidth="lg" sx={{ width: '100%' }}>
            <VoiceGenerator commentsEnabled={commentsEnabled} />
          </Container>
        </Box>
        <SettingsModal
          open={settingsOpen}
          onClose={handleSettingsClose}
          onMidiDeviceSelect={handleMidiDeviceSelect}
          onCCMappingChange={handleCCMappingChange}
          onNoteMappingChange={handleNoteMappingChange}
          onCommentsEnabledChange={setCommentsEnabled}
          commentsEnabled={commentsEnabled}
        />
      </Box>
    </ThemeProvider>
  )
}

export default App

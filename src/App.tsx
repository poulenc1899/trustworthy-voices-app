import { useState } from 'react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import { VoiceGenerator } from './components/VoiceGenerator'
import TopBar from './components/TopBar'
import SettingsModal from './components/SettingsModal'
import { midiController } from './services/midiController'
import ExhibitionPage from './components/ExhibitionPage'
import './App.css'
import IconButton from '@mui/material/IconButton'
import SwapHorizIcon from '@mui/icons-material/SwapHoriz'

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
  const [showExhibition, setShowExhibition] = useState(false)

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
        <TopBar onSettingsClick={handleSettingsClick}>
          <Box sx={{ position: 'absolute', top: 12, left: 24, zIndex: 10 }}>
            <IconButton
              onClick={() => setShowExhibition((prev) => !prev)}
              color="primary"
              size="large"
              sx={{ background: 'rgba(255,255,255,0.7)', '&:hover': { background: 'rgba(255,255,255,0.9)' } }}
            >
              <SwapHorizIcon />
            </IconButton>
          </Box>
        </TopBar>
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
            {showExhibition ? (
              <ExhibitionPage />
            ) : (
              <VoiceGenerator commentsEnabled={commentsEnabled} />
            )}
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

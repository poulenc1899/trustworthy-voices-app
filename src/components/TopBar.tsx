import { AppBar, Toolbar, Typography, Box, IconButton } from '@mui/material'
import SettingsIcon from '@mui/icons-material/Settings'
import hexagonLogo from '/hexagon-logo.svg'

interface TopBarProps {
  onSettingsClick: () => void
}

const TopBar = ({ onSettingsClick }: TopBarProps) => {
  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box 
            component="img"
            src={hexagonLogo}
            alt="Trustworthy Voices Logo"
            sx={{
              height: 32,
              width: 32,
              display: 'block',
              filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.1))'
            }}
          />
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              fontWeight: 500,
              color: 'text.primary'
            }}
          >
            Trustworthy Voice Designer
          </Typography>
        </Box>
        <IconButton 
          onClick={onSettingsClick}
          sx={{ 
            color: 'text.secondary',
            '&:hover': {
              color: 'primary.main'
            }
          }}
        >
          <SettingsIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  )
}

export default TopBar 
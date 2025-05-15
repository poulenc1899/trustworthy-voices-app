# Trustworthy Voices - Voice Design Research Tool

A web-based tool for HCI research exploring how people design trustworthy synthetic voices for different contexts. This tool allows participants to experiment with various prosodic and acoustic traits of synthetic voices and capture their design choices for analysis.

## Research Context

This tool is designed for a study exploring how people design trustworthy synthetic voices in different contexts:
- Train station announcements
- Hospital waiting room communications
- Car navigation instructions

Participants will use this tool to design their ideal trustworthy voice for each context, and then discuss their design choices with researchers.

## Features

- **Voice Design Controls**
  - Voice Pitch: Adjust the pitch of the synthetic voice
  - Enthusiasm: Control the emotional expressiveness
  - Breathiness: Modify the voice's resonance and breathiness
  - Speed: Adjust the speaking rate

- **Context-Specific Text**
  - Pre-defined announcements for each context
  - Train station boarding announcements
  - Hospital waiting room instructions
  - Car navigation directions

- **Voice Selection**
  - Multiple synthetic voices available (Ash, Ballad, Coral, Sage, Verse)
  - Each voice can be customized with the above parameters

- **MIDI Controller Support**
  - Connect MIDI controllers for real-time parameter adjustment
  - Visual feedback for MIDI control
  - Keyboard shortcuts for generation (spacebar) and saving (s)

- **Data Collection**
  - Save voice designs with all parameters
  - Record participant comments for each parameter
  - Export data in JSON and Excel formats for analysis
  - Track participant information

## Voice Parameter Instructions

The following instructions are sent to the OpenAI API based on slider values:

### Voice Pitch
| Value | Instruction |
|-------|-------------|
| -2 | Speak in the lowest possible pitch |
| -1 | Speak with a medium-low pitch |
| 0 | Use a neutral pitch |
| 1 | Speak with a slightly high pitch |
| 2 | Speak with a very high pitch |

### Enthusiasm
| Value | Instruction |
|-------|-------------|
| -2 | Sound very calm and unexcited |
| -1 | Sound slightly calm |
| 0 | Use a neutral tone |
| 1 | Sound enthusiastic |
| 2 | Sound very enthusiastic and excited |

### Breathiness
| Value | Instruction |
|-------|-------------|
| -2 | Sound very resonant (not breathy) |
| -1 | Sound slightly resonant (less breathy) |
| 0 | Use a neutral breathiness |
| 1 | Sound slightly breathy |
| 2 | Sound very breathy (like whispering) |

### Speed
| Value | Instruction |
|-------|-------------|
| -2 | Speak very slowly |
| -1 | Speak slowly |
| 0 | Use a neutral speed |
| 1 | Speak quickly |
| 2 | Speak very quickly |

## Data Export

The tool provides two export formats for research analysis:

### JSON Export
- Complete voice design data
- All parameter values
- Participant comments
- Timestamps
- Context information

### Excel Export (CSV)
- Tabular format for easy analysis
- Columns for all parameters
- Participant information
- Comments
- Timestamps
- Context information

## Technical Requirements

- Modern web browser
- OpenAI API key (for voice generation)
- Optional: MIDI controller for real-time parameter adjustment

## Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file with your OpenAI API key:
   ```
   VITE_OPENAI_API_KEY=your_api_key_here
   ```
4. Start the development server: `npm run dev`

## Usage

1. Enter participant information
2. Select a context (train station, hospital, car)
3. Choose a base voice
4. Adjust parameters using sliders or MIDI controller
5. Generate and listen to the voice
6. Save the design
7. Repeat for other contexts
8. Export data for analysis

## Research Protocol

1. Brief participants on the study goals
2. Allow time for exploration of the tool
3. Guide participants through each context
4. Record their voice designs
5. Conduct post-design interview
6. Export and analyze the collected data

## Contributing

This tool is designed for academic research. For contributions or modifications, please contact the research team.

## License

This project is licensed for academic research purposes only.

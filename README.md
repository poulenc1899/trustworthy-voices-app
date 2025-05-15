# Voice Generator App

A React application that generates speech using OpenAI's Text-to-Speech API with customizable voice styles.

## Features

- Multiple voice options (alloy, ash, ballad, etc.)
- Different TTS models (tts-1, tts-1-hd, gpt-4o-mini-tts)
- Preset text options or custom text input
- Voice style controls (masculine/feminine, assertiveness, etc.)
- Real-time audio playback

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory and add your OpenAI API key:
   ```
   VITE_OPENAI_API_KEY=your_openai_api_key_here
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Usage

1. Select a voice from the dropdown menu
2. Choose a TTS model
3. Select either a preset text or enter custom text
4. Adjust voice style controls using the sliders
5. Click "Generate Speech" to create and play the audio

## Security Note

This application currently makes OpenAI API calls directly from the browser. In a production environment, you should:

1. Create a backend proxy to handle API calls
2. Store the API key securely on the server
3. Implement proper authentication and rate limiting

## Technologies Used

- React
- TypeScript
- Material-UI
- OpenAI API
- Vite

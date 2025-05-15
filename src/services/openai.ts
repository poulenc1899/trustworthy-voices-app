import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // Note: In production, you should use a backend proxy
});

interface GenerateSpeechParams {
  text: string;
  voice: string;
  model: string;
  instructions?: string | null;
}

export async function generateSpeech({
  text,
  voice,
  model,
  instructions,
}: GenerateSpeechParams): Promise<Blob> {
  try {
    if (!text) {
      throw new Error('Text is required for speech generation');
    }

    if (!import.meta.env.VITE_OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not set. Please check your .env file.');
    }

    console.log('Generating speech with params:', {
      model,
      voice,
      textLength: text.length,
      hasInstructions: !!instructions,
    });

    const response = await openai.audio.speech.create({
      model,
      voice,
      input: text,
      response_format: 'wav',
      ...(instructions && { instructions }),
    });

    if (!response) {
      throw new Error('No response received from OpenAI API');
    }

    const arrayBuffer = await response.arrayBuffer();
    return new Blob([arrayBuffer], { type: 'audio/wav' });
  } catch (error) {
    console.error('Error generating speech:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to generate speech: ${error.message}`);
    }
    throw error;
  }
} 
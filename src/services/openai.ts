// import OpenAI from 'openai';

interface GenerateSpeechParams {
  text: string;
  voice: string;
  model: string;
  instructions?: string | null;
}

export const generateSpeech = async ({
  text,
  voice,
  model,
  instructions,
}: GenerateSpeechParams): Promise<Blob> => {
  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      voice,
      input: text,
      response_format: 'mp3',
      ...(instructions && { instructions }),
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to generate speech');
  }

  return response.blob();
}; 
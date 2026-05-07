// @ts-nocheck
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const OPENAI_URL = 'https://api.openai.com/v1/images/generations';
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:generateImages';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, provider = 'pollinations' } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'prompt is required' });
  }

  try {
    if (provider === 'openai' && OPENAI_API_KEY) {
      // OpenAI DALL-E 3
      const response = await fetch(OPENAI_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: prompt + ', cartoon style, colorful, kid-friendly, high quality illustration',
          size: '1024x1024',
          quality: 'standard',
          style: 'vivid',
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        return res.status(response.status).json({ error, provider: 'openai' });
      }

      const data = await response.json();
      const imageUrl = data.data?.[0]?.url;
      return res.status(200).json({ imageUrl, provider: 'openai' });
    } else if (provider === 'gemini' && GEMINI_API_KEY) {
      // Google Gemini Imagen
      const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt + ', cartoon style, colorful, kid-friendly, high quality illustration',
          config: {
            numberOfImages: 1,
            aspectRatio: '1:1',
          },
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        return res.status(response.status).json({ error, provider: 'gemini' });
      }

      const data = await response.json();
      const imageUrl = data.images?.[0]?.imageBase64
        ? `data:image/png;base64,${data.images[0].imageBase64}`
        : null;
      
      if (!imageUrl) {
        return res.status(500).json({ error: 'No image returned from Gemini', provider: 'gemini' });
      }
      return res.status(200).json({ imageUrl, provider: 'gemini' });
    } else {
      // Pollinations.ai (default, free, no API key needed)
      const encodedPrompt = encodeURIComponent(prompt + ', cartoon style, colorful, kid-friendly, high quality illustration');
      const seed = Math.floor(Math.random() * 100000);
      const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=800&height=600&nologo=true&seed=${seed}`;
      return res.status(200).json({ imageUrl, provider: 'pollinations' });
    }
  } catch (err) {
    return res.status(500).json({ error: err instanceof Error ? err.message : 'Internal server error', provider });
  }
}

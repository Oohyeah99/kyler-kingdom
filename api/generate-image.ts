// @ts-nocheck
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const OPENAI_URL = 'https://api.openai.com/v1/images/generations';
const GEMINI_MODEL = 'imagen-4.0-fast-generate-001';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:predict`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, provider = 'openai' } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'prompt is required' });
  }

  try {
    if (provider === 'openai' && OPENAI_API_KEY) {
      const response = await fetch(OPENAI_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-image-1',
          prompt: prompt + ', cartoon style, colorful, kid-friendly, high quality illustration',
          n: 1,
          size: '1024x1024',
          quality: 'low',
        }),
        signal: AbortSignal.timeout(120000),
      });

      if (!response.ok) {
        const error = await response.text();
        return res.status(response.status).json({ error, provider: 'openai' });
      }

      const data = await response.json();
      const imageUrl = data.data?.[0]?.url || (data.data?.[0]?.b64_json ? `data:image/png;base64,${data.data[0].b64_json}` : null);
      if (!imageUrl) {
        return res.status(500).json({ error: 'No image in OpenAI response: ' + JSON.stringify(data), provider: 'openai' });
      }
      return res.status(200).json({ imageUrl, provider: 'openai' });
    } else if (provider === 'gemini' && GEMINI_API_KEY) {
      const response = await fetch(GEMINI_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': GEMINI_API_KEY,
        },
        body: JSON.stringify({
          instances: [{ prompt: prompt + ', cartoon style, colorful, kid-friendly, high quality illustration' }],
          parameters: {
            sampleCount: 1,
            aspectRatio: '1:1',
            personGeneration: 'allow_adult',
          },
        }),
        signal: AbortSignal.timeout(120000),
      });

      if (!response.ok) {
        const errText = await response.text();
        return res.status(response.status).json({ error: `Imagen ${response.status}: ${errText}`, provider: 'gemini' });
      }

      const data = await response.json();

      if (data.error) {
        return res.status(500).json({
          error: `Gemini API error: ${JSON.stringify(data.error)}`,
          provider: 'gemini',
        });
      }

      const predictions = data.predictions || [];
      if (!predictions.length) {
        return res.status(500).json({
          error: `No images in Gemini response. Full response: ${JSON.stringify(data).slice(0, 500)}`,
          provider: 'gemini',
        });
      }

      const imageUrl = `data:image/png;base64,${predictions[0].bytesBase64Encoded}`;
      return res.status(200).json({ imageUrl, provider: 'gemini' });
    } else {
      return res.status(400).json({ error: `Unknown provider: ${provider}`, provider });
    }
  } catch (err) {
    const isAbort = err instanceof Error && (err.name === 'AbortError' || err.message?.includes('timed out') || err.message?.includes('aborted'));
    return res.status(500).json({
      error: isAbort
        ? `${provider} image generation timed out. Please try again.`
        : (err instanceof Error ? err.message : 'Internal server error'),
      provider,
    });
  }
}

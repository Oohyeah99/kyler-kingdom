async function generateText(systemPrompt: string, userPrompt: string, maxTokens: number, temperature: number): Promise<string> {
  const response = await fetch('/api/generate-text', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ systemPrompt, userPrompt, maxTokens, temperature }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Text generation failed: ${error}`)
  }

  const data = await response.json()
  return data.text || 'No response available.'
}

export async function generateImage(prompt: string): Promise<string> {
  // Use Pollinations.ai free image generation API (no API key needed)
  // Returns URL directly - img tags load cross-origin URLs without CORS issues
  const encodedPrompt = encodeURIComponent(prompt + ', cartoon style, colorful, kid-friendly, high quality illustration')
  return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=800&height=600&nologo=true&seed=${Math.floor(Math.random() * 100000)}`
}

export async function generateStoryHints(imageDescription: string): Promise<string> {
  return generateText(
    'You are helping a 6-year-old boy practice telling stories about pictures for an English competition. Keep responses simple, fun, and encouraging. Use easy English words.',
    `Look at this picture description and give me story hints in this exact format:

**Who?** — (1-2 sentences about who might be in the picture)
**Where?** — (1-2 sentences about where they are)
**What's happening?** — (2-3 sentences about what might be going on)
**What happens next?** — (2-3 fun ideas for what could happen next)
**Words to use:** — (5-8 simple English words related to the picture that the child can use in their story)

Picture description: ${imageDescription}`,
    500,
    0.8
  )
}

export async function generatePicturePrompt(): Promise<string> {
  const text = await generateText(
    'You create fun, kid-friendly image generation prompts. Keep it to 1-2 sentences. Make it colorful and exciting.',
    `Give me ONE fun image prompt for a 6-year-old boy. It should describe an interesting scene with animals, kids, or fantasy situations.
Examples: "A fluffy orange cat flying on a rainbow over a castle", "A little boy discovering a treasure chest on a pirate ship with dolphins"
Just give me the prompt, nothing else.`,
    100,
    1.0
  )
  return text.trim() || 'A magical forest with colorful animals playing together'
}

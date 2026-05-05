const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyDQoWCikBzvg6Y30hEeyNit_jx3cfUDqls'
const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta'

export async function generateImage(prompt: string): Promise<string> {
  const response = await fetch(`${BASE_URL}/models/imagen-3.0-generate-002:generateImages?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt,
      numberOfImages: 1,
      aspectRatio: '4:3',
      safetySettings: {
        category: 'HARM_CATEGORY_SEVERELY_RESTITUTIVE',
        threshold: 'BLOCK_NONE',
      },
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Image generation failed: ${error}`)
  }

  const data = await response.json()
  return data.generatedImages?.[0]?.image?.imageBytes
}

export async function generateStoryHints(imageDescription: string): Promise<string> {
  const response = await fetch(`${BASE_URL}/models/gemini-2.0-flash:generateContent?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: `You are helping a 6-year-old boy practice telling stories about pictures for an English competition. 
          
Look at this picture description and give me story hints in this exact format:

**Who?** — (1-2 sentences about who might be in the picture)
**Where?** — (1-2 sentences about where they are)
**What's happening?** — (2-3 sentences about what might be going on)
**What happens next?** — (2-3 fun ideas for what could happen next)
**Words to use:** — (5-8 simple English words related to the picture that the child can use in their story)

Keep it simple, fun, and encouraging. Use easy English words.

Picture description: ${imageDescription}`,
        }],
      }],
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 500,
      },
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Story hints generation failed: ${error}`)
  }

  const data = await response.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No hints available. Try again!'
}

export async function generatePicturePrompt(): Promise<string> {
  const response = await fetch(`${BASE_URL}/models/gemini-2.0-flash:generateContent?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: `Give me ONE fun, kid-friendly image generation prompt for a 6-year-old boy. 
It should describe an interesting scene with animals, kids, or fantasy situations. 
Keep it to 1-2 sentences. Make it colorful and exciting. 
Examples: "A fluffy orange cat flying on a rainbow over a castle", "A little boy discovering a treasure chest on a pirate ship with dolphins"

Just give me the prompt, nothing else.`,
        }],
      }],
      generationConfig: {
        temperature: 1.0,
        maxOutputTokens: 100,
      },
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Prompt generation failed: ${error}`)
  }

  const data = await response.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'A magical forest with colorful animals playing together'
}

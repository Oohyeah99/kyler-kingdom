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

const PROMPT_CATEGORIES = [
  {
    name: 'everyday',
    system: 'You create simple, everyday scene prompts for children\'s English storytelling practice. Keep it to 1-2 sentences. Focus on realistic, relatable situations.',
    user: `Give me ONE image prompt for a 6-year-old boy practicing English storytelling. The scene should be from everyday life - parks, schools, homes, playgrounds, gardens, streets, markets, or nature. Include 1-2 clear subjects (people, animals, or objects) doing simple activities.

Examples: "A boy and his dog playing with a ball in a sunny park", "A girl feeding ducks near a small pond in a garden", "Two children sharing snacks on a picnic blanket under a tree"

Just give me the prompt, nothing else.`,
    fallback: 'A boy and his dog playing in a sunny park'
  },
  {
    name: 'fantasy',
    system: 'You create fun fantasy scene prompts for children\'s English storytelling practice. Keep it to 1-2 sentences. Make it imaginative but not scary.',
    user: `Give me ONE fantasy image prompt for a 6-year-old boy practicing English storytelling. Include magical creatures, enchanted places, or imaginary worlds, but keep it friendly and colorful.

Examples: "A friendly dragon teaching puppies to blow sparkly smoke rings in a rainbow meadow", "A little wizard casting colorful spells in a garden of giant flowers"

Just give me the prompt, nothing else.`,
    fallback: 'A friendly dragon playing with puppies in a rainbow meadow'
  },
  {
    name: 'adventure',
    system: 'You create adventure scene prompts for children\'s English storytelling practice. Keep it to 1-2 sentences. Make it exciting but safe and fun.',
    user: `Give me ONE adventure image prompt for a 6-year-old boy practicing English storytelling. Include exploration, discovery, or playful action, but keep it safe and child-friendly.

Examples: "A boy and girl exploring a treehouse filled with old maps and toys", "Children building a sandcastle on a beach with colorful boats in the distance"

Just give me the prompt, nothing else.`,
    fallback: 'Children exploring a colorful treehouse filled with toys'
  },
  {
    name: 'animals',
    system: 'You create animal-focused scene prompts for children\'s English storytelling practice. Keep it to 1-2 sentences. Focus on cute, friendly animal interactions.',
    user: `Give me ONE animal image prompt for a 6-year-old boy practicing English storytelling. Include animals in natural settings doing interesting or cute things.

Examples: "A family of rabbits having a picnic in a flower field", "A baby elephant splashing in a shallow river with birds watching"

Just give me the prompt, nothing else.`,
    fallback: 'A family of rabbits having a picnic in a flower field'
  },
  {
    name: 'school',
    system: 'You create school and learning scene prompts for children\'s English storytelling practice. Keep it to 1-2 sentences. Focus on positive learning experiences.',
    user: `Give me ONE school-themed image prompt for a 6-year-old boy practicing English storytelling. Include classroom activities, playground fun, or learning moments.

Examples: "Children painting colorful pictures at a table in a sunny classroom", "Students planting seeds together in a school garden"

Just give me the prompt, nothing else.`,
    fallback: 'Children painting colorful pictures in a sunny classroom'
  }
]

export async function generatePicturePrompt(): Promise<string> {
  // Randomly select a category for variety
  const category = PROMPT_CATEGORIES[Math.floor(Math.random() * PROMPT_CATEGORIES.length)]
  const text = await generateText(
    category.system,
    category.user,
    100,
    1.0
  )
  return text.trim() || category.fallback
}

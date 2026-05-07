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

export async function generateImage(prompt: string, provider: 'pollinations' | 'openai' | 'gemini' = 'pollinations'): Promise<{ imageUrl: string; provider: string }> {
  // Use serverless API endpoint to keep API keys secure (never exposed to client)
  const response = await fetch('/api/generate-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, provider }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Image generation failed: ${error}`)
  }

  const data = await response.json()
  return { imageUrl: data.imageUrl, provider: data.provider }
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
    user: `Give me ONE image prompt for a 6-year-old boy practicing English storytelling. The scene should be from everyday life. 

The scenes below are just EXAMPLES to show the style - you have FULL CREATIVE FREEDOM to create any everyday scene you want: parks, schools, homes, playgrounds, gardens, streets, markets, nature, beaches, zoos, farms, libraries, sports, cooking, shopping, holidays, seasons, weather, family time, friendships, etc. Include 1-2 clear subjects (people, animals, or objects) doing simple activities.

Style examples (don't copy these, just use them as inspiration): "A boy and his dog playing with a ball in a sunny park", "A girl feeding ducks near a small pond in a garden", "Two children sharing snacks on a picnic blanket under a tree"

Just give me the prompt, nothing else. Be creative - the examples above are just to show the style, not to limit your choices!`,
    fallback: 'A boy and his dog playing in a sunny park'
  },
  {
    name: 'fantasy',
    system: 'You create fun fantasy scene prompts for children\'s English storytelling practice. Keep it to 1-2 sentences. Make it imaginative but not scary.',
    user: `Give me ONE fantasy image prompt for a 6-year-old boy practicing English storytelling. Include magical creatures, enchanted places, or imaginary worlds, but keep it friendly and colorful.

The scenes below are just EXAMPLES to show the style - you have FULL CREATIVE FREEDOM to create any fantasy scene: dragons, unicorns, fairies, wizards, mermaids, space adventures, underwater kingdoms, cloud cities, talking animals, magical forests, enchanted castles, rainbow lands, candy worlds, etc.

Style examples (don't copy these, just use them as inspiration): "A friendly dragon teaching puppies to blow sparkly smoke rings in a rainbow meadow", "A little wizard casting colorful spells in a garden of giant flowers"

Just give me the prompt, nothing else. Be creative - the examples above are just to show the style, not to limit your choices!`,
    fallback: 'A friendly dragon playing with puppies in a rainbow meadow'
  },
  {
    name: 'adventure',
    system: 'You create adventure scene prompts for children\'s English storytelling practice. Keep it to 1-2 sentences. Make it exciting but safe and fun.',
    user: `Give me ONE adventure image prompt for a 6-year-old boy practicing English storytelling. Include exploration, discovery, or playful action, but keep it safe and child-friendly.

The scenes below are just EXAMPLES to show the style - you have FULL CREATIVE FREEDOM to create any adventure: treasure hunts, camping trips, boat rides, mountain hikes, cave exploring, jungle safaris, desert expeditions, island discoveries, space missions, time travel, pirate ships, submarines, hot air balloons, etc.

Style examples (don't copy these, just use them as inspiration): "A boy and girl exploring a treehouse filled with old maps and toys", "Children building a sandcastle on a beach with colorful boats in the distance"

Just give me the prompt, nothing else. Be creative - the examples above are just to show the style, not to limit your choices!`,
    fallback: 'Children exploring a colorful treehouse filled with toys'
  },
  {
    name: 'animals',
    system: 'You create animal-focused scene prompts for children\'s English storytelling practice. Keep it to 1-2 sentences. Focus on cute, friendly animal interactions.',
    user: `Give me ONE animal image prompt for a 6-year-old boy practicing English storytelling. Include animals in natural settings doing interesting or cute things.

The scenes below are just EXAMPLES to show the style - you have FULL CREATIVE FREEDOM to feature any animals: pets, farm animals, wild animals, sea creatures, birds, insects, dinosaurs, mythical creatures, zoo animals, jungle animals, arctic animals, desert animals, forest animals, etc.

Style examples (don't copy these, just use them as inspiration): "A family of rabbits having a picnic in a flower field", "A baby elephant splashing in a shallow river with birds watching"

Just give me the prompt, nothing else. Be creative - the examples above are just to show the style, not to limit your choices!`,
    fallback: 'A family of rabbits having a picnic in a flower field'
  },
  {
    name: 'school',
    system: 'You create school and learning scene prompts for children\'s English storytelling practice. Keep it to 1-2 sentences. Focus on positive learning experiences.',
    user: `Give me ONE school-themed image prompt for a 6-year-old boy practicing English storytelling. Include classroom activities, playground fun, or learning moments.

The scenes below are just EXAMPLES to show the style - you have FULL CREATIVE FREEDOM to create any learning scene: classrooms, libraries, science labs, art rooms, music classes, sports fields, school gardens, field trips, show-and-tell, reading time, science experiments, art projects, music performances, etc.

Style examples (don't copy these, just use them as inspiration): "Children painting colorful pictures at a table in a sunny classroom", "Students planting seeds together in a school garden"

Just give me the prompt, nothing else. Be creative - the examples above are just to show the style, not to limit your choices!`,
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

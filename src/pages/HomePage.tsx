import { Link } from 'react-router-dom'
import { Crown, Sparkles, LetterText, MessageCircle } from 'lucide-react'

const tools = [
  {
    id: 'picture-story',
    name: 'Picture Story',
    description: 'Look at a picture and tell a story!',
    icon: Sparkles,
    color: 'purple',
    path: '/picture-story',
  },
  {
    id: 'pattern-phonics',
    name: 'Pattern Phonics',
    description: 'Sound it out!',
    icon: LetterText,
    color: 'gold',
    path: '/pattern-phonics',
  },
  {
    id: 'qa-practice',
    name: 'Q&A Practice',
    description: 'Practice answering competition questions!',
    icon: MessageCircle,
    color: 'green',
    path: '/qa-practice',
  },
]

const colorMap: Record<string, string> = {
  purple: 'bg-kingdom-purple',
  gold: 'bg-kingdom-gold',
  green: 'bg-kingdom-green',
  sky: 'bg-kingdom-sky',
}

const iconColorMap: Record<string, string> = {
  purple: 'text-kingdom-purple',
  gold: 'text-kingdom-gold',
  green: 'text-kingdom-green',
  sky: 'text-kingdom-sky',
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="text-center pt-12 pb-8 px-4">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-kingdom-purple/10 mb-4 animate-float">
          <Crown className="w-12 h-12 text-kingdom-gold" />
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-gradient mb-3" style={{ lineHeight: 1.3, paddingBottom: '0.1em' }}>
          Kyler Kingdom
        </h1>
        <p className="text-xl text-foreground/70 max-w-md mx-auto">
          Welcome to your kingdom, Kyler! Choose an adventure below.
        </p>
      </header>

      <main className="max-w-4xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {tools.map((tool) => {
            const Icon = tool.icon
            return (
              <Link key={tool.id} to={tool.path} className="card-kingdom block">
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-xl ${colorMap[tool.color]}/15 flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-7 h-7 ${iconColorMap[tool.color]}`} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-1">{tool.name}</h2>
                    <p className="text-foreground/60 text-lg">{tool.description}</p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </main>

      <footer className="text-center py-8 text-foreground/40 text-sm">
        Made with love for Kyler
      </footer>
    </div>
  )
}

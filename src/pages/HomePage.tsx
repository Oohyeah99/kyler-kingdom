import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Crown, Sparkles, LetterText, MessageCircle, Heart, Settings, X, Type } from 'lucide-react'
import { loadSettings, saveSettings } from '../lib/settings'

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
  {
    id: 'heart-in-sync',
    name: 'Heart-In-Sync',
    description: 'Act out words and show you are in sync!',
    icon: Heart,
    color: 'red',
    path: '/heart-in-sync',
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
  red: 'text-kingdom-red',
}

export default function HomePage() {
  const [showSettings, setShowSettings] = useState(false)
  const [fontSizeOffset, setFontSizeOffset] = useState(() => loadSettings().globalFontSize)

  const adjustFontSize = (delta: number) => {
    const newOffset = Math.min(16, Math.max(-8, fontSizeOffset + delta))
    setFontSizeOffset(newOffset)
    saveSettings({ globalFontSize: newOffset })
    // Apply immediately
    document.documentElement.style.fontSize = `${16 + newOffset}px`
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="text-center pt-12 pb-8 px-4 relative">
        {/* Settings button */}
        <button
          onClick={() => setShowSettings(true)}
          className="absolute top-4 right-4 p-2.5 rounded-xl hover:bg-foreground/5 transition-colors"
          title="Settings"
        >
          <Settings className="w-5 h-5 text-foreground/40" />
        </button>

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

      {/* Settings modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4" onClick={() => setShowSettings(false)}>
          <div className="bg-background rounded-2xl w-full max-w-sm p-6 shadow-2xl border-2 border-border" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gradient">Settings</h2>
              <button onClick={() => setShowSettings(false)} className="p-2 rounded-lg hover:bg-foreground/5">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Font size controls */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Type className="w-4 h-4 text-foreground/60" />
                <span className="text-sm font-semibold">Font Size</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => adjustFontSize(-2)}
                  disabled={fontSizeOffset <= -8}
                  className="px-4 py-2 rounded-lg bg-card border-2 border-border text-sm font-bold hover:bg-foreground/5 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  A-
                </button>
                <span className="text-sm text-foreground/60 w-16 text-center">
                  {16 + fontSizeOffset}px
                </span>
                <button
                  onClick={() => adjustFontSize(2)}
                  disabled={fontSizeOffset >= 16}
                  className="px-4 py-2 rounded-lg bg-card border-2 border-border text-sm font-bold hover:bg-foreground/5 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  A+
                </button>
              </div>
              <p className="text-xs text-foreground/40 mt-2">
                This adjusts the overall font size of the app. Your preference is saved.
              </p>
            </div>
          </div>
        </div>
      )}

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

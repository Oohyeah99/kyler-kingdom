import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Shuffle, List, Plus, X, GripVertical, Heart } from 'lucide-react'

interface WordItem {
  id: number
  text: string
}

interface SyncData {
  words: WordItem[]
  seenIds: number[]
}

const DEFAULT_WORDS: WordItem[] = [
  { id: 1, text: 'Cat' },
  { id: 2, text: 'Dog' },
  { id: 3, text: 'Bird' },
  { id: 4, text: 'Fish' },
  { id: 5, text: 'Elephant' },
  { id: 6, text: 'Monkey' },
  { id: 7, text: 'Snake' },
  { id: 8, text: 'Rabbit' },
  { id: 9, text: 'Penguin' },
  { id: 10, text: 'Butterfly' },
  { id: 11, text: 'Run' },
  { id: 12, text: 'Jump' },
  { id: 13, text: 'Sleep' },
  { id: 14, text: 'Eat' },
  { id: 15, text: 'Drink' },
  { id: 16, text: 'Cry' },
  { id: 17, text: 'Laugh' },
  { id: 18, text: 'Swim' },
  { id: 19, text: 'Dance' },
  { id: 20, text: 'Sing' },
  { id: 21, text: 'Ball' },
  { id: 22, text: 'Car' },
  { id: 23, text: 'Plane' },
  { id: 24, text: 'Phone' },
  { id: 25, text: 'Book' },
  { id: 26, text: 'Toothbrush' },
  { id: 27, text: 'Umbrella' },
  { id: 28, text: 'Bicycle' },
  { id: 29, text: 'Train' },
  { id: 30, text: 'Camera' },
  { id: 31, text: 'Apple' },
  { id: 32, text: 'Banana' },
  { id: 33, text: 'Pizza' },
  { id: 34, text: 'Ice cream' },
  { id: 35, text: 'Noodles' },
  { id: 36, text: 'Cake' },
  { id: 37, text: 'Rice' },
  { id: 38, text: 'Egg' },
  { id: 39, text: 'Bread' },
  { id: 40, text: 'Milk' },
  { id: 41, text: 'Doctor' },
  { id: 42, text: 'Teacher' },
  { id: 43, text: 'Police' },
  { id: 44, text: 'Sun' },
  { id: 45, text: 'Moon' },
  { id: 46, text: 'Rain' },
  { id: 47, text: 'Flower' },
  { id: 48, text: 'Tree' },
  { id: 49, text: 'Fire' },
  { id: 50, text: 'Star' },
]

const DATA_KEY = 'kyler_heart_sync_data'

function loadData(): SyncData {
  try {
    const data = localStorage.getItem(DATA_KEY)
    if (data) {
      const parsed = JSON.parse(data)
      if (parsed.words) {
        return { words: parsed.words, seenIds: parsed.seenIds || [] }
      }
    }
  } catch { /* ignore */ }
  return { words: [...DEFAULT_WORDS], seenIds: [] }
}

function saveData(data: SyncData) {
  localStorage.setItem(DATA_KEY, JSON.stringify(data))
}

function getNextId(words: WordItem[]): number {
  return words.length > 0 ? Math.max(...words.map(w => w.id)) + 1 : 1
}

export default function HeartInSyncPage() {
  const [data, setData] = useState<SyncData>({ words: [], seenIds: [] })
  const [view, setView] = useState<'random' | 'all'>('random')
  const [currentWord, setCurrentWord] = useState<WordItem | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newWordText, setNewWordText] = useState('')
  const [draggedId, setDraggedId] = useState<number | null>(null)
  const [expandedWord, setExpandedWord] = useState<WordItem | null>(null)

  useEffect(() => {
    const loaded = loadData()
    let initial = loaded
    if (loaded.words.length > 0) {
      const first = loaded.words[Math.floor(Math.random() * loaded.words.length)]
      setCurrentWord(first)
      if (!loaded.seenIds.includes(first.id)) {
        initial = { ...loaded, seenIds: [...loaded.seenIds, first.id] }
        saveData(initial)
      }
    }
    setData(initial)
  }, [])

  const updateData = (updater: (prev: SyncData) => SyncData) => {
    setData(prev => {
      const next = updater(prev)
      saveData(next)
      return next
    })
  }

  const handleRandom = () => {
    const ws = data.words
    if (ws.length === 0) {
      setCurrentWord(null)
      return
    }

    let pool = ws.filter(w => !data.seenIds.includes(w.id))

    // If all words have been seen, reset but exclude current word so it doesn't repeat immediately
    if (pool.length === 0) {
      const resetIds = currentWord ? [currentWord.id] : []
      pool = ws.filter(w => !resetIds.includes(w.id))
      // Update seenIds to just the current word (or empty)
      updateData(prev => ({ ...prev, seenIds: resetIds }))
    }

    // If pool is still empty (only 1 word total), just use that word
    if (pool.length === 0) {
      pool = ws
    }

    const next = pool[Math.floor(Math.random() * pool.length)]
    setCurrentWord(next)
    updateData(prev => ({
      ...prev,
      seenIds: prev.seenIds.includes(next.id) ? prev.seenIds : [...prev.seenIds, next.id],
    }))
  }

  const handleAddWord = () => {
    const text = newWordText.trim()
    if (!text) return
    updateData(prev => {
      const newW: WordItem = { id: getNextId(prev.words), text }
      return { ...prev, words: [...prev.words, newW] }
    })
    setNewWordText('')
    setShowAddForm(false)
  }

  const handleDeleteWord = (id: number) => {
    updateData(prev => ({
      ...prev,
      words: prev.words.filter(w => w.id !== id),
      seenIds: prev.seenIds.filter(sid => sid !== id),
    }))
    if (currentWord?.id === id) {
      setCurrentWord(null)
    }
    if (expandedWord?.id === id) setExpandedWord(null)
  }

  // Drag and drop handlers
  const handleDragStart = (id: number) => {
    setDraggedId(id)
  }

  const handleDragOver = (e: React.DragEvent, overId: number) => {
    e.preventDefault()
    if (draggedId === null || draggedId === overId) return
    updateData(prev => {
      const ws = [...prev.words]
      const fromIdx = ws.findIndex(w => w.id === draggedId)
      const toIdx = ws.findIndex(w => w.id === overId)
      if (fromIdx === -1 || toIdx === -1) return prev
      const [moved] = ws.splice(fromIdx, 1)
      ws.splice(toIdx, 0, moved)
      return { ...prev, words: ws }
    })
  }

  const handleDragEnd = () => {
    setDraggedId(null)
  }

  const words = data.words

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center gap-4 px-6 py-4">
        <Link to="/" className="btn-kingdom btn-kingdom-gold !px-5 !py-3 !text-base">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Link>
        <h1 className="text-2xl font-bold text-gradient">Heart-In-Sync</h1>
      </header>

      <main className="max-w-4xl mx-auto px-6 pb-16">
        {/* View toggle buttons */}
        <div className="flex flex-wrap gap-3 mb-8">
          <button
            onClick={() => { setView('random'); handleRandom() }}
            className={`btn-kingdom ${view === 'random' ? 'btn-kingdom-primary' : '!bg-foreground/10 !text-foreground hover:!bg-foreground/20'}`}
          >
            <Shuffle className="w-5 h-5 mr-2" />
            Random Word
          </button>
          <button
            onClick={() => { setView('all'); setExpandedWord(null) }}
            className={`btn-kingdom ${view === 'all' ? 'btn-kingdom-primary' : '!bg-foreground/10 !text-foreground hover:!bg-foreground/20'}`}
          >
            <List className="w-5 h-5 mr-2" />
            All Words ({words.length})
          </button>
        </div>

        {/* Random Word View */}
        {view === 'random' && (
          <div className="animate-slide-up">
            {currentWord ? (
              <>
                <div className="bg-card border-2 border-kingdom-purple/30 rounded-2xl p-8 mb-6 shadow-lg">
                  <p className="text-sm text-foreground/50 mb-2 font-semibold">
                    Word {words.findIndex(w => w.id === currentWord.id) + 1} of {words.length}
                  </p>
                  <div className="flex items-center gap-4">
                    <Heart className="w-10 h-10 text-red-400 flex-shrink-0" />
                    <h2 className="text-5xl md:text-6xl font-bold text-foreground leading-tight">
                      {currentWord.text}
                    </h2>
                  </div>
                  <p className="mt-4 text-foreground/50 text-lg">
                    Act it out! Can you guess what I am?
                  </p>
                </div>

                <button
                  onClick={handleRandom}
                  className="btn-kingdom btn-kingdom-primary w-full sm:w-auto"
                >
                  <Shuffle className="w-5 h-5 mr-2" />
                  Next Random Word
                </button>
              </>
            ) : (
              <p className="text-center text-foreground/50 py-12">No words available. Add some!</p>
            )}
          </div>
        )}

        {/* All Words View */}
        {view === 'all' && (
          <div className="animate-slide-up">
            {/* Add Word button */}
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="btn-kingdom !bg-kingdom-green/80 !text-white hover:!bg-kingdom-green mb-6"
            >
              {showAddForm ? <X className="w-5 h-5 mr-2" /> : <Plus className="w-5 h-5 mr-2" />}
              {showAddForm ? 'Cancel' : 'Add Word'}
            </button>

            {/* Add Word form */}
            {showAddForm && (
              <div className="bg-card border-2 border-kingdom-green/30 rounded-2xl p-6 mb-6 animate-slide-up">
                <label className="block text-sm font-semibold mb-2">New Word:</label>
                <input
                  type="text"
                  value={newWordText}
                  onChange={(e) => setNewWordText(e.target.value)}
                  className="w-full p-3 rounded-xl border-2 border-border bg-background text-foreground focus:border-kingdom-green focus:outline-none mb-3 text-lg"
                  placeholder="Type a word to act out..."
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAddWord() }}
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleAddWord}
                    disabled={!newWordText.trim()}
                    className="btn-kingdom btn-kingdom-green disabled:opacity-50"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Word
                  </button>
                  <button
                    onClick={() => { setShowAddForm(false); setNewWordText('') }}
                    className="btn-kingdom !bg-foreground/10 !text-foreground hover:!bg-foreground/20"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* 2-column grid of word cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {words.map((w, index) => (
                <div
                  key={w.id}
                  draggable
                  onDragStart={() => handleDragStart(w.id)}
                  onDragOver={(e) => handleDragOver(e, w.id)}
                  onDragEnd={handleDragEnd}
                  onClick={() => setExpandedWord(w)}
                  className={`bg-card border-2 ${draggedId === w.id ? 'border-kingdom-purple opacity-60' : 'border-border hover:border-kingdom-purple/30'} rounded-xl p-4 transition-colors cursor-pointer`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      <GripVertical
                        className="w-4 h-4 text-foreground/30 flex-shrink-0 mt-1 cursor-move"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-foreground/40 font-semibold mb-1">
                          #{index + 1}
                        </p>
                        <p className="text-xl font-bold text-foreground leading-snug">
                          {w.text}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleDeleteWord(w.id)}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                        title="Delete word"
                      >
                        <X className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {words.length === 0 && (
              <p className="text-center text-foreground/50 py-12">No words yet. Add your first one!</p>
            )}
          </div>
        )}
      </main>

      {/* Expanded word overlay */}
      {expandedWord && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4"
          onClick={() => setExpandedWord(null)}
        >
          <div
            className="bg-background rounded-2xl w-full max-w-2xl p-8 shadow-2xl animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <p className="text-sm text-foreground/50 mb-2 font-semibold">
                  Word {words.findIndex(w => w.id === expandedWord.id) + 1} of {words.length}
                </p>
                <div className="flex items-center gap-4">
                  <Heart className="w-10 h-10 text-red-400 flex-shrink-0" />
                  <h2 className="text-5xl md:text-6xl font-bold text-foreground leading-tight">
                    {expandedWord.text}
                  </h2>
                </div>
              </div>
              <button
                onClick={() => setExpandedWord(null)}
                className="p-2.5 rounded-xl hover:bg-foreground/5 transition-colors flex-shrink-0"
                title="Close"
              >
                <X className="w-6 h-6 text-foreground/60" />
              </button>
            </div>
            <p className="mt-4 text-foreground/50 text-lg">
              Act it out! Can you guess what I am?
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

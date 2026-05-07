import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Shuffle, List, FileText, EyeOff } from 'lucide-react'

interface Question {
  id: number
  text: string
}

const QUESTIONS: Question[] = [
  { id: 1, text: 'What is your favourite color?' },
  { id: 2, text: 'What is your favourite food?' },
  { id: 3, text: 'What is your favourite animal?' },
  { id: 4, text: 'What is your favourite fruit?' },
  { id: 5, text: 'What is your favourite ice cream flavor?' },
  { id: 6, text: 'Do you like to play outside?' },
  { id: 7, text: 'What is your favourite cartoon?' },
  { id: 8, text: 'Do you like to sing?' },
  { id: 9, text: 'What are your hobbies?' },
  { id: 10, text: 'What makes you happy?' },
  { id: 11, text: 'What is your favourite shape?' },
  { id: 12, text: 'What is your favourite vegetable?' },
  { id: 13, text: 'What game do you love to play?' },
  { id: 14, text: 'Tell me about your favourite toy.' },
  { id: 15, text: 'What do you like to do with your family?' },
  { id: 16, text: 'Who is your best friend?' },
  { id: 17, text: 'What is something that makes you laugh?' },
  { id: 18, text: 'What do you eat for breakfast in the morning?' },
  { id: 19, text: 'Tell me one thing you like about your school or classroom.' },
  { id: 20, text: 'What do you like doing the most at school?' },
  { id: 21, text: 'Tell me about your favourite teacher.' },
  { id: 22, text: 'What sports do you like?' },
  { id: 23, text: 'Do you play any musical instruments?' },
  { id: 24, text: 'Do you help your parents at home?' },
  { id: 25, text: 'What does your mother/father do?' },
  { id: 26, text: 'Do you like to play with your mother/father?' },
  { id: 27, text: 'Do you have any pets?' },
  { id: 28, text: 'Who do you play with the most in school?' },
  { id: 29, text: 'What is your favourite thing to do on a rainy day?' },
  { id: 30, text: 'What type of stories do you like?' },
  { id: 31, text: 'At home, who do you like to play with the most?' },
  { id: 32, text: 'What is your favourite snack?' },
  { id: 33, text: 'What do you do when you feel sad?' },
  { id: 34, text: 'What is your favourite song to sing?' },
  { id: 35, text: 'What do you like to do at the playground?' },
  { id: 36, text: 'What is your favourite thing to draw?' },
  { id: 37, text: 'What present do you want for your birthday?' },
  { id: 38, text: 'What is your favourite drink?' },
  { id: 39, text: 'What is something you are really good at doing?' },
  { id: 40, text: 'What is something that makes you feel proud?' },
  { id: 41, text: 'Tell me about a time you were very happy.' },
  { id: 42, text: 'If you could have any superpower, what would it be?' },
  { id: 43, text: 'What do you want to do on your next birthday?' },
  { id: 44, text: 'What is your favourite animal?' },
  { id: 45, text: 'Is it good to share?' },
  { id: 46, text: 'What do you want to be when you grow up?' },
  { id: 47, text: 'Tell me about your family.' },
  { id: 48, text: 'Who usually plays with you at home?' },
  { id: 49, text: 'How would you describe your personality?' },
  { id: 50, text: 'Do you like travelling?' },
  { id: 51, text: 'Have you been outside China? What is your favourite country that you have visited?' },
  { id: 52, text: 'What is the favourite place you have visited in China?' },
  { id: 53, text: 'What is your favourite season?' },
  { id: 54, text: 'Where did you learn your English?' },
]

const NOTES_KEY = 'kyler_qa_notes'

function loadNotes(): Record<number, string> {
  try {
    const data = localStorage.getItem(NOTES_KEY)
    return data ? JSON.parse(data) : {}
  } catch { return {} }
}

function saveNotes(notes: Record<number, string>) {
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes))
}

export default function QAPage() {
  const [view, setView] = useState<'random' | 'all'>('random')
  const [currentQuestion, setCurrentQuestion] = useState<Question>(QUESTIONS[0])
  const [notes, setNotes] = useState<Record<number, string>>({})
  const [showNoteFor, setShowNoteFor] = useState<number | null>(null)

  useEffect(() => {
    setNotes(loadNotes())
    setCurrentQuestion(getRandomQuestion())
  }, [])

  const getRandomQuestion = useCallback(() => {
    const idx = Math.floor(Math.random() * QUESTIONS.length)
    return QUESTIONS[idx]
  }, [])

  const handleRandom = () => {
    let next = getRandomQuestion()
    while (next.id === currentQuestion.id && QUESTIONS.length > 1) {
      next = getRandomQuestion()
    }
    setCurrentQuestion(next)
    setShowNoteFor(null)
  }

  const updateNote = (id: number, text: string) => {
    const updated = { ...notes, [id]: text }
    setNotes(updated)
    saveNotes(updated)
  }

  const toggleNote = (id: number) => {
    setShowNoteFor(prev => prev === id ? null : id)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center gap-4 px-6 py-4">
        <Link to="/" className="btn-kingdom btn-kingdom-gold !px-5 !py-3 !text-base">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Link>
        <h1 className="text-2xl font-bold text-gradient">Q&A Practice</h1>
      </header>

      <main className="max-w-4xl mx-auto px-6 pb-16">
        {/* View toggle buttons */}
        <div className="flex gap-3 mb-8">
          <button
            onClick={() => { setView('random'); handleRandom() }}
            className={`btn-kingdom ${view === 'random' ? 'btn-kingdom-primary' : '!bg-foreground/10 !text-foreground hover:!bg-foreground/20'}`}
          >
            <Shuffle className="w-5 h-5 mr-2" />
            Random Question
          </button>
          <button
            onClick={() => { setView('all'); setShowNoteFor(null) }}
            className={`btn-kingdom ${view === 'all' ? 'btn-kingdom-primary' : '!bg-foreground/10 !text-foreground hover:!bg-foreground/20'}`}
          >
            <List className="w-5 h-5 mr-2" />
            All Questions ({QUESTIONS.length})
          </button>
        </div>

        {/* Random Question View */}
        {view === 'random' && (
          <div className="animate-slide-up">
            <div className="bg-card border-2 border-kingdom-purple/30 rounded-2xl p-8 mb-6 shadow-lg">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-foreground/50 mb-2 font-semibold">
                    Question {currentQuestion.id} of {QUESTIONS.length}
                  </p>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
                    {currentQuestion.text}
                  </h2>
                </div>
                <button
                  onClick={() => toggleNote(currentQuestion.id)}
                  className="p-2.5 rounded-xl hover:bg-kingdom-purple/10 transition-colors flex-shrink-0"
                  title={showNoteFor === currentQuestion.id ? 'Hide note' : 'Show note'}
                >
                  {showNoteFor === currentQuestion.id ? (
                    <EyeOff className="w-6 h-6 text-kingdom-purple" />
                  ) : (
                    <FileText className="w-6 h-6 text-kingdom-purple" />
                  )}
                </button>
              </div>

              {/* Note section */}
              {showNoteFor === currentQuestion.id && (
                <div className="mt-6 pt-6 border-t border-border animate-slide-up">
                  <label className="block text-sm font-semibold mb-2 text-kingdom-purple">
                    Your Notes / Answer Ideas:
                  </label>
                  <textarea
                    value={notes[currentQuestion.id] || ''}
                    onChange={(e) => updateNote(currentQuestion.id, e.target.value)}
                    className="w-full h-32 p-4 rounded-xl border-2 border-kingdom-purple/20 bg-background text-foreground resize-none focus:border-kingdom-purple focus:outline-none text-lg"
                    placeholder="Write your answer ideas or notes here..."
                  />
                </div>
              )}
            </div>

            <button
              onClick={handleRandom}
              className="btn-kingdom btn-kingdom-primary w-full sm:w-auto"
            >
              <Shuffle className="w-5 h-5 mr-2" />
              Next Random Question
            </button>
          </div>
        )}

        {/* All Questions View */}
        {view === 'all' && (
          <div className="space-y-3 animate-slide-up">
            {QUESTIONS.map((q) => (
              <div
                key={q.id}
                className="bg-card border-2 border-border rounded-xl p-4 hover:border-kingdom-purple/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-xs text-foreground/40 font-semibold mb-1">
                      #{q.id}
                    </p>
                    <p className="text-lg font-medium text-foreground">
                      {q.text}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleNote(q.id)}
                    className="p-2 rounded-lg hover:bg-kingdom-purple/10 transition-colors flex-shrink-0"
                    title={showNoteFor === q.id ? 'Hide note' : 'Show note'}
                  >
                    {showNoteFor === q.id ? (
                      <EyeOff className="w-5 h-5 text-kingdom-purple" />
                    ) : (
                      <FileText className="w-5 h-5 text-foreground/40" />
                    )}
                  </button>
                </div>

                {/* Note section */}
                {showNoteFor === q.id && (
                  <div className="mt-3 pt-3 border-t border-border animate-slide-up">
                    <label className="block text-sm font-semibold mb-2 text-kingdom-purple">
                      Your Notes / Answer Ideas:
                    </label>
                    <textarea
                      value={notes[q.id] || ''}
                      onChange={(e) => updateNote(q.id, e.target.value)}
                      className="w-full h-24 p-3 rounded-xl border-2 border-kingdom-purple/20 bg-background text-foreground resize-none focus:border-kingdom-purple focus:outline-none"
                      placeholder="Write your answer ideas or notes here..."
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

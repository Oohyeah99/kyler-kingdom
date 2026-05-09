import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Shuffle, List, FileText, EyeOff, Plus, X, ArrowUp, ArrowDown, RotateCcw } from 'lucide-react'

interface Question {
  id: number
  text: string
}

interface QAData {
  questions: Question[]
  notes: Record<number, string>
}

const DEFAULT_QUESTIONS: Question[] = [
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

const DATA_KEY = 'kyler_qa_data'

function loadData(): QAData {
  try {
    const data = localStorage.getItem(DATA_KEY)
    if (data) return JSON.parse(data)
  } catch { /* ignore */ }
  return { questions: [...DEFAULT_QUESTIONS], notes: {} }
}

function saveData(data: QAData) {
  localStorage.setItem(DATA_KEY, JSON.stringify(data))
}

function getNextId(questions: Question[]): number {
  return questions.length > 0 ? Math.max(...questions.map(q => q.id)) + 1 : 1
}

export default function QAPage() {
  const [data, setData] = useState<QAData>({ questions: [], notes: {} })
  const [view, setView] = useState<'random' | 'all'>('random')
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [showNoteFor, setShowNoteFor] = useState<number | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newQuestionText, setNewQuestionText] = useState('')
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)
  const [expandedQuestion, setExpandedQuestion] = useState<Question | null>(null)
  const [showExpandedNote, setShowExpandedNote] = useState(false)

  useEffect(() => {
    const loaded = loadData()
    setData(loaded)
    if (loaded.questions.length > 0) {
      setCurrentQuestion(loaded.questions[Math.floor(Math.random() * loaded.questions.length)])
    }
  }, [])

  const updateData = (updater: (prev: QAData) => QAData) => {
    setData(prev => {
      const next = updater(prev)
      saveData(next)
      return next
    })
  }

  const getRandomQuestion = useCallback(() => {
    const qs = data.questions
    if (qs.length === 0) return null
    const idx = Math.floor(Math.random() * qs.length)
    return qs[idx]
  }, [data.questions])

  const handleRandom = () => {
    let next = getRandomQuestion()
    while (next && currentQuestion && next.id === currentQuestion.id && data.questions.length > 1) {
      next = getRandomQuestion()
    }
    setCurrentQuestion(next)
    setShowNoteFor(null)
  }

  const updateNote = (id: number, text: string) => {
    updateData(prev => ({ ...prev, notes: { ...prev.notes, [id]: text } }))
  }

  const toggleNote = (id: number) => {
    setShowNoteFor(prev => prev === id ? null : id)
  }

  const handleAddQuestion = () => {
    const text = newQuestionText.trim()
    if (!text) return
    updateData(prev => {
      const newQ: Question = { id: getNextId(prev.questions), text }
      return { ...prev, questions: [...prev.questions, newQ] }
    })
    setNewQuestionText('')
    setShowAddForm(false)
  }

  const handleDeleteRequest = (id: number) => {
    setDeleteConfirmId(id)
  }

  const confirmDelete = (id: number) => {
    updateData(prev => {
      const newNotes = { ...prev.notes }
      delete newNotes[id]
      return { ...prev, questions: prev.questions.filter(q => q.id !== id), notes: newNotes }
    })
    if (currentQuestion?.id === id) {
      setCurrentQuestion(null)
    }
    if (showNoteFor === id) setShowNoteFor(null)
    setDeleteConfirmId(null)
  }

  const cancelDelete = () => {
    setDeleteConfirmId(null)
  }

  const moveQuestion = (id: number, direction: 'up' | 'down') => {
    updateData(prev => {
      const qs = [...prev.questions]
      const idx = qs.findIndex(q => q.id === id)
      if (idx === -1) return prev
      const newIdx = direction === 'up' ? idx - 1 : idx + 1
      if (newIdx < 0 || newIdx >= qs.length) return prev
      const [moved] = qs.splice(idx, 1)
      qs.splice(newIdx, 0, moved)
      return { ...prev, questions: qs }
    })
  }

  const handleRestoreAll = () => {
    if (!confirm('This will restore all default questions. Your custom questions and notes will be kept for questions that still exist. Continue?')) return
    updateData(prev => {
      // Start with defaults, then append any custom questions (ids > 54) that aren't in defaults
      const defaultIds = new Set(DEFAULT_QUESTIONS.map(q => q.id))
      const customQuestions = prev.questions.filter(q => !defaultIds.has(q.id))
      const restored = [...DEFAULT_QUESTIONS, ...customQuestions]
      return { ...prev, questions: restored }
    })
    setCurrentQuestion(null)
    setShowNoteFor(null)
    setDeleteConfirmId(null)
  }

  const questions = data.questions
  const notes = data.notes

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
        <div className="flex flex-wrap gap-3 mb-8">
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
            All Questions ({questions.length})
          </button>
        </div>

        {/* Random Question View */}
        {view === 'random' && (
          <div className="animate-slide-up">
            {currentQuestion ? (
              <>
                <div className="bg-card border-2 border-kingdom-purple/30 rounded-2xl p-8 mb-6 shadow-lg">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm text-foreground/50 mb-2 font-semibold">
                        Question {questions.findIndex(q => q.id === currentQuestion.id) + 1} of {questions.length}
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
              </>
            ) : (
              <p className="text-center text-foreground/50 py-12">No questions available. Add some!</p>
            )}
          </div>
        )}

        {/* All Questions View */}
        {view === 'all' && (
          <div className="animate-slide-up">
            {/* Add Question + Restore All buttons */}
            <div className="flex flex-wrap gap-3 mb-6">
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="btn-kingdom !bg-kingdom-green/80 !text-white hover:!bg-kingdom-green"
              >
                {showAddForm ? <X className="w-5 h-5 mr-2" /> : <Plus className="w-5 h-5 mr-2" />}
                {showAddForm ? 'Cancel' : 'Add Question'}
              </button>
              <button
                onClick={handleRestoreAll}
                className="btn-kingdom !bg-kingdom-gold/80 !text-kingdom-dark hover:!bg-kingdom-gold"
                title="Restore all default questions"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Restore All
              </button>
            </div>

            {/* Add Question form */}
            {showAddForm && (
              <div className="bg-card border-2 border-kingdom-green/30 rounded-2xl p-6 mb-6 animate-slide-up">
                <label className="block text-sm font-semibold mb-2">New Question:</label>
                <textarea
                  value={newQuestionText}
                  onChange={(e) => setNewQuestionText(e.target.value)}
                  className="w-full h-24 p-3 rounded-xl border-2 border-border bg-background text-foreground resize-none focus:border-kingdom-green focus:outline-none mb-3"
                  placeholder="Type your new question here..."
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleAddQuestion}
                    disabled={!newQuestionText.trim()}
                    className="btn-kingdom btn-kingdom-green disabled:opacity-50"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Question
                  </button>
                  <button
                    onClick={() => { setShowAddForm(false); setNewQuestionText('') }}
                    className="btn-kingdom !bg-foreground/10 !text-foreground hover:!bg-foreground/20"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* 2-column grid of question cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {questions.map((q, index) => (
                <div
                  key={q.id}
                  onClick={() => { setExpandedQuestion(q); setShowExpandedNote(false) }}
                  className="bg-card border-2 border-border hover:border-kingdom-purple/30 rounded-xl p-4 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      {/* Up/down reorder buttons */}
                      <div className="flex flex-col gap-0.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => moveQuestion(q.id, 'up')}
                          disabled={index === 0}
                          className="p-0.5 rounded hover:bg-kingdom-purple/10 transition-colors disabled:opacity-20"
                          title="Move up"
                        >
                          <ArrowUp className="w-3.5 h-3.5 text-foreground/40" />
                        </button>
                        <button
                          onClick={() => moveQuestion(q.id, 'down')}
                          disabled={index === questions.length - 1}
                          className="p-0.5 rounded hover:bg-kingdom-purple/10 transition-colors disabled:opacity-20"
                          title="Move down"
                        >
                          <ArrowDown className="w-3.5 h-3.5 text-foreground/40" />
                        </button>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-foreground/40 font-semibold mb-1">
                          #{index + 1}
                        </p>
                        <p className="text-base font-medium text-foreground leading-snug">
                          {q.text}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => toggleNote(q.id)}
                        className="p-1.5 rounded-lg hover:bg-kingdom-purple/10 transition-colors"
                        title={showNoteFor === q.id ? 'Hide note' : 'Show note'}
                      >
                        {showNoteFor === q.id ? (
                          <EyeOff className="w-4 h-4 text-kingdom-purple" />
                        ) : (
                          <FileText className="w-4 h-4 text-foreground/40" />
                        )}
                      </button>
                      {deleteConfirmId === q.id ? (
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => confirmDelete(q.id)}
                            className="px-2 py-1 rounded-lg bg-red-500 text-white text-xs font-bold hover:bg-red-600 transition-colors"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={cancelDelete}
                            className="px-2 py-1 rounded-lg bg-foreground/10 text-foreground text-xs font-bold hover:bg-foreground/20 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleDeleteRequest(q.id)}
                          className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                          title="Delete question"
                        >
                          <X className="w-4 h-4 text-red-400" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Note section */}
                  {showNoteFor === q.id && (
                    <div className="mt-3 pt-3 border-t border-border animate-slide-up" onClick={(e) => e.stopPropagation()}>
                      <label className="block text-sm font-semibold mb-2 text-kingdom-purple">
                        Your Notes / Answer Ideas:
                      </label>
                      <textarea
                        value={notes[q.id] || ''}
                        onChange={(e) => updateNote(q.id, e.target.value)}
                        className="w-full h-20 p-3 rounded-xl border-2 border-kingdom-purple/20 bg-background text-foreground resize-none focus:border-kingdom-purple focus:outline-none text-sm"
                        placeholder="Write your answer ideas or notes here..."
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {questions.length === 0 && (
              <p className="text-center text-foreground/50 py-12">No questions yet. Add your first one!</p>
            )}
          </div>
        )}
      </main>

      {/* Expanded question overlay */}
      {expandedQuestion && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4"
          onClick={() => setExpandedQuestion(null)}
        >
          <div
            className="bg-background rounded-2xl w-full max-w-2xl p-8 shadow-2xl animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <p className="text-sm text-foreground/50 mb-2 font-semibold">
                  Question {questions.findIndex(q => q.id === expandedQuestion.id) + 1} of {questions.length}
                </p>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
                  {expandedQuestion.text}
                </h2>
              </div>
              <button
                onClick={() => setExpandedQuestion(null)}
                className="p-2.5 rounded-xl hover:bg-foreground/5 transition-colors flex-shrink-0"
                title="Close"
              >
                <X className="w-6 h-6 text-foreground/60" />
              </button>
            </div>

            {/* Notes toggle button */}
            <div className="mt-6 pt-4 border-t border-border flex justify-center">
              <button
                onClick={() => setShowExpandedNote(prev => !prev)}
                className="btn-kingdom !bg-kingdom-purple/10 !text-kingdom-purple hover:!bg-kingdom-purple/20"
              >
                {showExpandedNote ? <EyeOff className="w-5 h-5 mr-2" /> : <FileText className="w-5 h-5 mr-2" />}
                {showExpandedNote ? 'Hide Notes' : 'Notes'}
              </button>
            </div>

            {/* Note section — only shown when toggled */}
            {showExpandedNote && (
              <div className="mt-4 animate-slide-up">
                <textarea
                  value={notes[expandedQuestion.id] || ''}
                  onChange={(e) => updateNote(expandedQuestion.id, e.target.value)}
                  className="w-full h-32 p-4 rounded-xl border-2 border-kingdom-purple/20 bg-background text-foreground resize-none focus:border-kingdom-purple focus:outline-none text-lg"
                  placeholder="Write your answer ideas or notes here..."
                />
              </div>
            )}

            {/* Next Question button */}
            <div className="mt-6 pt-4 border-t border-border">
              <button
                onClick={() => {
                  const currentIdx = questions.findIndex(q => q.id === expandedQuestion.id)
                  const nextIdx = (currentIdx + 1) % questions.length
                  setExpandedQuestion(questions[nextIdx])
                  setShowExpandedNote(false)
                }}
                className="btn-kingdom btn-kingdom-primary w-full"
              >
                <Shuffle className="w-5 h-5 mr-2" />
                Next Question
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

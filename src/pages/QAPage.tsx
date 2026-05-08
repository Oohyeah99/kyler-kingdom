import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Shuffle, List, FileText, EyeOff, Plus, X, GripVertical } from 'lucide-react'

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
  const [draggedId, setDraggedId] = useState<number | null>(null)
  const [expandedQuestion, setExpandedQuestion] = useState<Question | null>(null)

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

  const handleDeleteQuestion = (id: number) => {
    updateData(prev => {
      const newNotes = { ...prev.notes }
      delete newNotes[id]
      return { ...prev, questions: prev.questions.filter(q => q.id !== id), notes: newNotes }
    })
    if (currentQuestion?.id === id) {
      setCurrentQuestion(null)
    }
    if (showNoteFor === id) setShowNoteFor(null)
  }

  // Drag and drop handlers
  const handleDragStart = (id: number) => {
    setDraggedId(id)
  }

  const handleDragOver = (e: React.DragEvent, overId: number) => {
    e.preventDefault()
    if (draggedId === null || draggedId === overId) return
    updateData(prev => {
      const qs = [...prev.questions]
      const fromIdx = qs.findIndex(q => q.id === draggedId)
      const toIdx = qs.findIndex(q => q.id === overId)
      if (fromIdx === -1 || toIdx === -1) return prev
      const [moved] = qs.splice(fromIdx, 1)
      qs.splice(toIdx, 0, moved)
      return { ...prev, questions: qs }
    })
  }

  const handleDragEnd = () => {
    setDraggedId(null)
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
            {/* Add Question button */}
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="btn-kingdom !bg-kingdom-green/80 !text-white hover:!bg-kingdom-green mb-6"
            >
              {showAddForm ? <X className="w-5 h-5 mr-2" /> : <Plus className="w-5 h-5 mr-2" />}
              {showAddForm ? 'Cancel' : 'Add Question'}
            </button>

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
                  draggable
                  onDragStart={() => handleDragStart(q.id)}
                  onDragOver={(e) => handleDragOver(e, q.id)}
                  onDragEnd={handleDragEnd}
                  onClick={() => setExpandedQuestion(q)}
                  className={`bg-card border-2 ${draggedId === q.id ? 'border-kingdom-purple opacity-60' : 'border-border hover:border-kingdom-purple/30'} rounded-xl p-4 transition-colors cursor-pointer`}
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
                      <button
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                        title="Delete question"
                      >
                        <X className="w-4 h-4 text-red-400" />
                      </button>
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

            {/* Note section */}
            <div className="mt-6 pt-6 border-t border-border">
              <label className="block text-sm font-semibold mb-2 text-kingdom-purple">
                Your Notes / Answer Ideas:
              </label>
              <textarea
                value={notes[expandedQuestion.id] || ''}
                onChange={(e) => updateNote(expandedQuestion.id, e.target.value)}
                className="w-full h-32 p-4 rounded-xl border-2 border-kingdom-purple/20 bg-background text-foreground resize-none focus:border-kingdom-purple focus:outline-none text-lg"
                placeholder="Write your answer ideas or notes here..."
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

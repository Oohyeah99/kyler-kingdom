import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Sparkles, Lightbulb, RefreshCw, Loader2, Eye, EyeOff, Images, X, Trash2, Settings } from 'lucide-react'
import { generateImage, generateStoryHints, generatePicturePrompt } from '../services/gemini'

interface SavedPicture {
  id: string
  imageUrl: string
  prompt: string
  hints?: string
  provider: string
  timestamp: number
}

const STORAGE_KEY = 'kyler_picture_gallery'

function loadGallery(): SavedPicture[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch { return [] }
}

function saveToGallery(pic: SavedPicture) {
  const gallery = loadGallery()
  gallery.unshift(pic)
  // Keep max 50 pictures
  localStorage.setItem(STORAGE_KEY, JSON.stringify(gallery.slice(0, 50)))
}

function removeFromGallery(id: string) {
  const gallery = loadGallery().filter(p => p.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(gallery))
}

export default function PictureStoryPage() {
  const [imageData, setImageData] = useState<string | null>(null)
  const [imageProvider, setImageProvider] = useState<string>('pollinations')
  const [storyHints, setStoryHints] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [hintLoading, setHintLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imageDescription, setImageDescription] = useState<string>('')
  const [showPrompt, setShowPrompt] = useState(false)
  const [showGallery, setShowGallery] = useState(false)
  const [gallery, setGallery] = useState<SavedPicture[]>([])
  const [reviewPicture, setReviewPicture] = useState<SavedPicture | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState<'pollinations' | 'openai' | 'gemini'>('pollinations')

  // Manual generation mode state
  const [showManualModal, setShowManualModal] = useState(false)
  const [manualPrompt, setManualPrompt] = useState('')
  const [manualProvider, setManualProvider] = useState<'pollinations' | 'openai' | 'gemini'>('pollinations')
  const [promptGenerating, setPromptGenerating] = useState(false)
  const [imageCreating, setImageCreating] = useState(false)

  useEffect(() => {
    setGallery(loadGallery())
  }, [])

  const handleGenerateImage = async () => {
    setGenerating(true)
    setError(null)
    setStoryHints(null)
    setShowPrompt(false)
    setReviewPicture(null)
    try {
      const prompt = await generatePicturePrompt()
      setImageDescription(prompt)
      const result = await generateImage(prompt, selectedProvider)
      setImageData(result.imageUrl)
      setImageProvider(result.provider)
      // Auto-save to gallery
      const pic: SavedPicture = {
        id: Date.now().toString(),
        imageUrl: result.imageUrl,
        prompt,
        provider: result.provider,
        timestamp: Date.now(),
      }
      saveToGallery(pic)
      setGallery(loadGallery())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setGenerating(false)
    }
  }

  const handleGetHints = async () => {
    if (!imageDescription) return
    setHintLoading(true)
    setError(null)
    try {
      const hints = await generateStoryHints(imageDescription)
      setStoryHints(hints)
      // Update gallery entry with hints
      const current = loadGallery()
      const entry = current.find(p => p.prompt === imageDescription)
      if (entry) {
        entry.hints = hints
        localStorage.setItem(STORAGE_KEY, JSON.stringify(current))
        setGallery(current)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setHintLoading(false)
    }
  }

  const handleReview = (pic: SavedPicture) => {
    setImageData(pic.imageUrl)
    setImageDescription(pic.prompt)
    setStoryHints(pic.hints || null)
    setReviewPicture(pic)
    setShowGallery(false)
    setShowPrompt(false)
  }

  const handleDelete = (id: string) => {
    removeFromGallery(id)
    setGallery(loadGallery())
  }

  // Manual mode: generate a prompt
  const handleGenerateManualPrompt = async () => {
    setPromptGenerating(true)
    try {
      const prompt = await generatePicturePrompt()
      setManualPrompt(prompt)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate prompt')
    } finally {
      setPromptGenerating(false)
    }
  }

  // Manual mode: create image from current prompt
  const handleCreateManualImage = async () => {
    if (!manualPrompt.trim()) return
    setImageCreating(true)
    setError(null)
    setStoryHints(null)
    setShowPrompt(false)
    setReviewPicture(null)
    try {
      setImageDescription(manualPrompt)
      const result = await generateImage(manualPrompt, manualProvider)
      setImageData(result.imageUrl)
      setImageProvider(result.provider)
      const pic: SavedPicture = {
        id: Date.now().toString(),
        imageUrl: result.imageUrl,
        prompt: manualPrompt,
        provider: result.provider,
        timestamp: Date.now(),
      }
      saveToGallery(pic)
      setGallery(loadGallery())
      setShowManualModal(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create image')
    } finally {
      setImageCreating(false)
    }
  }

  // Open manual modal
  const handleOpenManual = () => {
    setManualPrompt('')
    setManualProvider(selectedProvider)
    setShowManualModal(true)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center gap-4 px-6 py-4">
        <Link to="/" className="btn-kingdom btn-kingdom-gold !px-5 !py-3 !text-base">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Link>
        <h1 className="text-2xl font-bold text-gradient">Picture Story</h1>
        <div className="ml-auto flex items-center gap-3">
          <button
            onClick={() => setShowSettings(true)}
            className="p-2.5 rounded-lg hover:bg-foreground/5 transition-colors"
            title="Image generator settings"
          >
            <Settings className="w-5 h-5 text-foreground/60" />
          </button>
          <button
            onClick={() => setShowGallery(!showGallery)}
            className="btn-kingdom !bg-kingdom-purple/10 !text-kingdom-purple hover:!bg-kingdom-purple/20 !px-4 !py-2.5"
          >
            <Images className="w-5 h-5 mr-2" />
            Gallery ({gallery.length})
          </button>
        </div>
      </header>

      {/* Gallery overlay */}
      {showGallery && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center pt-16 px-4 overflow-y-auto">
          <div className="bg-background rounded-2xl w-full max-w-3xl p-6 mb-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Picture Gallery</h2>
              <button onClick={() => setShowGallery(false)} className="p-2 rounded-lg hover:bg-foreground/5">
                <X className="w-6 h-6" />
              </button>
            </div>
            {gallery.length === 0 ? (
              <p className="text-center text-foreground/50 py-12">No pictures saved yet. Generate some!</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {gallery.map((pic) => (
                  <div key={pic.id} className="relative group">
                    <button
                      onClick={() => handleReview(pic)}
                      className="w-full rounded-xl overflow-hidden border-2 border-border hover:border-kingdom-gold transition-colors"
                    >
                      <img src={pic.imageUrl} alt={pic.prompt} className="w-full aspect-[4/3] object-cover" />
                      <div className="p-2 text-left">
                        <p className="text-xs text-foreground/50">
                          {new Date(pic.timestamp).toLocaleDateString()}
                          {pic.provider && <span className="ml-1 capitalize">({pic.provider})</span>}
                        </p>
                      </div>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(pic.id) }}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <main className="max-w-4xl mx-auto px-6 pb-16">
        <div className="flex flex-wrap gap-4 mb-8">
          <button
            onClick={handleGenerateImage}
            disabled={generating}
            className="btn-kingdom btn-kingdom-primary"
          >
            {generating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Creating Picture...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Generate (auto)
              </>
            )}
          </button>

          <button
            onClick={handleOpenManual}
            className="btn-kingdom !bg-kingdom-purple/80 !text-white hover:!bg-kingdom-purple"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Generate (manual)
          </button>

          {imageData && (
            <button
              onClick={handleGetHints}
              disabled={hintLoading}
              className="btn-kingdom btn-kingdom-green"
            >
              {hintLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Thinking...
                </>
              ) : (
                <>
                  <Lightbulb className="w-5 h-5 mr-2" />
                  Give Me Hints!
                </>
              )}
            </button>
          )}

          {imageData && !reviewPicture && (
            <button
              onClick={handleGenerateImage}
              disabled={generating}
              className="btn-kingdom !bg-kingdom-sky !text-white hover:!bg-kingdom-sky/90"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              New Picture
            </button>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700">
            Oops! {error}
          </div>
        )}

        {generating && !imageData && (
          <div className="text-center py-20">
            <div className="spinner mx-auto mb-4" />
            <p className="text-lg text-foreground/60">Creating a fun picture for you...</p>
          </div>
        )}

        {imageData && (
          <div className="animate-slide-up">
            <div className="rounded-2xl overflow-hidden border-4 border-kingdom-gold shadow-xl mb-3">
              <img
                src={imageData}
                alt="Generated picture"
                className="w-full h-auto"
              />
            </div>
            {imageProvider && (
              <p className="text-center text-xs text-foreground/40 mb-6">
                Generated by <span className="font-semibold capitalize">{imageProvider}</span>
              </p>
            )}

            {imageDescription && (
              <div className="text-center mb-6">
                {showPrompt ? (
                  <div className="inline-flex flex-col items-center gap-2">
                    <p className="text-lg text-foreground/70 italic">"{imageDescription}"</p>
                    <button
                      onClick={() => setShowPrompt(false)}
                      className="inline-flex items-center gap-1 text-sm text-foreground/40 hover:text-foreground/60 transition-colors"
                    >
                      <EyeOff className="w-3.5 h-3.5" />
                      Hide prompt
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowPrompt(true)}
                    className="inline-flex items-center gap-1 text-sm text-foreground/40 hover:text-foreground/60 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Show prompt
                  </button>
                )}
              </div>
            )}

            {hintLoading && (
              <div className="text-center py-8">
                <div className="spinner mx-auto mb-4" />
                <p className="text-lg text-foreground/60">Thinking of story hints...</p>
              </div>
            )}

            {storyHints && (
              <div className="bg-card border-2 border-kingdom-green/30 rounded-2xl p-6 animate-slide-up">
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="w-6 h-6 text-kingdom-gold" />
                  <h2 className="text-xl font-bold text-kingdom-green">Story Hints</h2>
                </div>
                <div className="prose prose-lg max-w-none whitespace-pre-wrap text-foreground/80 leading-relaxed">
                  {storyHints}
                </div>
              </div>
            )}
          </div>
        )}

        {!imageData && !generating && (
          <div className="text-center py-20">
            <div className="w-24 h-24 rounded-full bg-kingdom-purple/10 flex items-center justify-center mx-auto mb-6 animate-float">
              <Sparkles className="w-12 h-12 text-kingdom-gold" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Ready for a Story?</h2>
            <p className="text-lg text-foreground/60 max-w-md mx-auto">
              Click "Generate Picture" to get a fun picture, then tell your story about it!
            </p>
          </div>
        )}
      </main>

      {/* Settings modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4" onClick={() => setShowSettings(false)}>
          <div className="bg-background rounded-2xl w-full max-w-md p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Image Generator</h2>
              <button onClick={() => setShowSettings(false)} className="p-2 rounded-lg hover:bg-foreground/5">
                <X className="w-6 h-6" />
              </button>
            </div>

            <p className="text-sm text-foreground/60 mb-4">
              Choose which AI service generates your pictures:
            </p>

            <div className="space-y-3">
              <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${selectedProvider === 'pollinations' ? 'border-kingdom-purple bg-kingdom-purple/5' : 'border-border hover:border-foreground/20'}`}>
                <input
                  type="radio"
                  name="provider"
                  value="pollinations"
                  checked={selectedProvider === 'pollinations'}
                  onChange={(e) => setSelectedProvider(e.target.value as any)}
                  className="mt-1"
                />
                <div>
                  <div className="font-semibold">Pollinations.ai</div>
                  <div className="text-xs text-foreground/50">Free, no API key needed. Good quality, fast.</div>
                </div>
              </label>

              <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${selectedProvider === 'openai' ? 'border-kingdom-purple bg-kingdom-purple/5' : 'border-border hover:border-foreground/20'}`}>
                <input
                  type="radio"
                  name="provider"
                  value="openai"
                  checked={selectedProvider === 'openai'}
                  onChange={(e) => setSelectedProvider(e.target.value as any)}
                  className="mt-1"
                />
                <div>
                  <div className="font-semibold">OpenAI DALL-E 3</div>
                  <div className="text-xs text-foreground/50">Higher quality, more detailed images.</div>
                </div>
              </label>

              <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${selectedProvider === 'gemini' ? 'border-kingdom-purple bg-kingdom-purple/5' : 'border-border hover:border-foreground/20'}`}>
                <input
                  type="radio"
                  name="provider"
                  value="gemini"
                  checked={selectedProvider === 'gemini'}
                  onChange={(e) => setSelectedProvider(e.target.value as any)}
                  className="mt-1"
                  disabled
                />
                <div>
                  <div className="font-semibold">Google Gemini Imagen</div>
                  <div className="text-xs text-foreground/50">Coming soon - needs API setup.</div>
                </div>
              </label>
            </div>

            <div className="mt-6 pt-4 border-t border-border">
              <p className="text-xs text-foreground/40">
                Each generated image will show which provider was used. Your selection is saved for next time.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Manual generation modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4" onClick={() => setShowManualModal(false)}>
          <div className="bg-background rounded-2xl w-full max-w-lg p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Manual Image Generation</h2>
              <button onClick={() => setShowManualModal(false)} className="p-2 rounded-lg hover:bg-foreground/5">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Generate Prompt button */}
            <button
              onClick={handleGenerateManualPrompt}
              disabled={promptGenerating}
              className="w-full btn-kingdom !bg-kingdom-purple/80 !text-white hover:!bg-kingdom-purple mb-4 disabled:opacity-50"
            >
              {promptGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating prompt...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Prompt
                </>
              )}
            </button>

            {/* Prompt textarea */}
            {manualPrompt && (
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">Edit Prompt:</label>
                <textarea
                  value={manualPrompt}
                  onChange={(e) => setManualPrompt(e.target.value)}
                  className="w-full h-32 p-3 rounded-xl border-2 border-border bg-card text-foreground resize-none focus:border-kingdom-purple focus:outline-none"
                  placeholder="Edit the generated prompt or type your own..."
                />
              </div>
            )}

            {/* Provider selection */}
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">Image Provider:</label>
              <div className="space-y-2">
                <label className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${manualProvider === 'pollinations' ? 'border-kingdom-purple bg-kingdom-purple/5' : 'border-border hover:border-foreground/20'}`}>
                  <input
                    type="radio"
                    name="manualProvider"
                    value="pollinations"
                    checked={manualProvider === 'pollinations'}
                    onChange={(e) => setManualProvider(e.target.value as any)}
                  />
                  <div className="font-semibold">Pollinations.ai</div>
                </label>

                <label className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${manualProvider === 'openai' ? 'border-kingdom-purple bg-kingdom-purple/5' : 'border-border hover:border-foreground/20'}`}>
                  <input
                    type="radio"
                    name="manualProvider"
                    value="openai"
                    checked={manualProvider === 'openai'}
                    onChange={(e) => setManualProvider(e.target.value as any)}
                  />
                  <div className="font-semibold">OpenAI DALL-E 3</div>
                </label>

                <label className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${manualProvider === 'gemini' ? 'border-kingdom-purple bg-kingdom-purple/5' : 'border-border hover:border-foreground/20'}`}>
                  <input
                    type="radio"
                    name="manualProvider"
                    value="gemini"
                    checked={manualProvider === 'gemini'}
                    onChange={(e) => setManualProvider(e.target.value as any)}
                    disabled
                  />
                  <div>
                    <div className="font-semibold">Google Gemini Imagen</div>
                    <div className="text-xs text-foreground/50">Coming soon</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleCreateManualImage}
                disabled={!manualPrompt.trim() || imageCreating}
                className="flex-1 btn-kingdom btn-kingdom-primary disabled:opacity-50"
              >
                {imageCreating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Creating image...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Create Image
                  </>
                )}
              </button>
              <button
                onClick={() => setShowManualModal(false)}
                className="btn-kingdom !bg-foreground/10 !text-foreground hover:!bg-foreground/20"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

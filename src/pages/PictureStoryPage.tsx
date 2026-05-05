import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Sparkles, Lightbulb, RefreshCw, Loader2 } from 'lucide-react'
import { generateImage, generateStoryHints, generatePicturePrompt } from '../services/gemini'

export default function PictureStoryPage() {
  const [imageData, setImageData] = useState<string | null>(null)
  const [storyHints, setStoryHints] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [hintLoading, setHintLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imageDescription, setImageDescription] = useState<string>('')

  const handleGenerateImage = async () => {
    setGenerating(true)
    setError(null)
    setStoryHints(null)
    try {
      const prompt = await generatePicturePrompt()
      setImageDescription(prompt)
      const base64Image = await generateImage(prompt)
      setImageData(`data:image/png;base64,${base64Image}`)
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setHintLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center gap-4 px-6 py-4">
        <Link to="/" className="btn-kingdom btn-kingdom-gold !px-5 !py-3 !text-base">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Link>
        <h1 className="text-2xl font-bold text-gradient">Picture Story</h1>
      </header>

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
                Generate Picture
              </>
            )}
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

          {imageData && (
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
            <div className="rounded-2xl overflow-hidden border-4 border-kingdom-gold shadow-xl mb-6">
              <img
                src={imageData}
                alt="Generated picture"
                className="w-full h-auto"
              />
            </div>

            {imageDescription && (
              <p className="text-center text-lg text-foreground/70 mb-6 italic">
                "{imageDescription}"
              </p>
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
    </div>
  )
}

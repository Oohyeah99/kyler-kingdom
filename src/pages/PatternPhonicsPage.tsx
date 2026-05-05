import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function PatternPhonicsPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header with back button */}
      <header className="flex items-center gap-4 px-6 py-4 bg-card border-b-2 border-border">
        <Link to="/" className="btn-kingdom btn-kingdom-gold !px-5 !py-3 !text-base">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Link>
        <h1 className="text-2xl font-bold text-gradient">Pattern Phonics</h1>
      </header>

      {/* Embedded Pattern Phonics */}
      <div className="flex-1">
        <iframe
          src="/pattern-phonics.html"
          title="Pattern Phonics"
          className="w-full border-0"
          style={{ height: 'calc(100vh - 73px)' }}
        />
      </div>
    </div>
  )
}

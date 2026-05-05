import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function PatternPhonicsPage() {
  const navigate = useNavigate()

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data === 'pattern-phonics:back') {
        navigate('/')
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [navigate])

  return (
    <div className="min-h-screen bg-[#faf7f4] flex flex-col">
      {/* Embedded Pattern Phonics (full screen, back button is inside iframe) */}
      <div className="flex-1 relative w-full h-full">
        <iframe
          src="/pattern-phonics.html"
          title="Pattern Phonics"
          className="w-full h-full border-0"
          style={{ width: '100%', height: '100%', minHeight: '100vh' }}
          allow="autoplay; microphone; speaker"
        />
      </div>
    </div>
  )
}

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { applySettingsOnMount } from './lib/settings'
import HomePage from './pages/HomePage'
import PictureStoryPage from './pages/PictureStoryPage'
import PatternPhonicsPage from './pages/PatternPhonicsPage'
import QAPage from './pages/QAPage'
import HeartInSyncPage from './pages/HeartInSyncPage'

function App() {
  useEffect(() => {
    applySettingsOnMount()
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/picture-story" element={<PictureStoryPage />} />
        <Route path="/pattern-phonics" element={<PatternPhonicsPage />} />
        <Route path="/qa-practice" element={<QAPage />} />
        <Route path="/heart-in-sync" element={<HeartInSyncPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

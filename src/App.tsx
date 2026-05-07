import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import PictureStoryPage from './pages/PictureStoryPage'
import PatternPhonicsPage from './pages/PatternPhonicsPage'
import QAPage from './pages/QAPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/picture-story" element={<PictureStoryPage />} />
        <Route path="/pattern-phonics" element={<PatternPhonicsPage />} />
        <Route path="/qa-practice" element={<QAPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

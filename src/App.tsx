import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import PictureStoryPage from './pages/PictureStoryPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/picture-story" element={<PictureStoryPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/site/Layout'
import HomePage from './pages/HomePage'
import ServicesPage from './pages/ServicesPage'
import TeamPage from './pages/TeamPage'
import GalleryPage from './pages/GalleryPage'
import AboutPage from './pages/AboutPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="team" element={<TeamPage />} />
          <Route path="gallery" element={<GalleryPage />} />
          <Route path="about" element={<AboutPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App

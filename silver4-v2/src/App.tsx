import { Route, Routes } from 'react-router-dom'
import { SiteLayout } from './layouts/SiteLayout'
import { HomePage } from './pages/HomePage'
import { ComingSoonPage } from './pages/ComingSoonPage'

function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route index element={<HomePage />} />
        <Route path="hair-services" element={<ComingSoonPage title="Hair Services" />} />
        <Route path="barber-services" element={<ComingSoonPage title="Barber Services" />} />
        <Route path="spa-services" element={<ComingSoonPage title="Spa Services" />} />
        <Route path="skin-therapy" element={<ComingSoonPage title="Skin Therapy" />} />
        <Route path="special-rituals" element={<ComingSoonPage title="Special Rituals" />} />
      </Route>
    </Routes>
  )
}

export default App

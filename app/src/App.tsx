import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Carreras from './pages/Carreras'
import IngenieriaInformatica from './features/carreras/pages/IngenieriaInformatica'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/carreras" element={<Carreras />} />
      <Route path="/carreras/ingenieria-informatica" element={<IngenieriaInformatica />} />
    </Routes>
  )
}

export default App

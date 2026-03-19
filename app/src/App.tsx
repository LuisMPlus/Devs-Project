import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Carreras from './pages/Carreras'
import IngenieriaInformatica from './features/careers/pages/IngenieriaInformatica'
import Header from './shared/components/Header'
import Footer from './shared/components/Footer'

function App() {
  return (
    <div className="flex flex-col min-h-screen relative w-full" style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}>
      <Header />
      <main className="flex-1 w-full flex flex-col items-center">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/carreras" element={<Carreras />} />
          <Route path="/carreras/ingenieria-informatica" element={<IngenieriaInformatica />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
